/**
 * Job Scheduler Service
 *
 * Uses BullMQ + Redis for scheduling delayed jobs (reminders, overdue checks,
 * escalations) and cron jobs (stalled flow checks, daily digests).
 *
 * If REDIS_URL is not set, all functions are no-ops (graceful dev degradation).
 */

import { Queue, Worker, type Job } from 'bullmq';

// ============================================================================
// Job Types
// ============================================================================

export type NotificationJobType =
  | 'send-reminder'
  | 'check-overdue'
  | 'escalation'
  | 'check-stalled'
  | 'daily-digest'
  | 'send-webhook'
  | 'scheduled-flow-start';

export interface NotificationJobData {
  type: NotificationJobType;
  stepExecutionId?: string;
  flowId?: string;
  userId?: string;
  organizationId?: string;
  webhookData?: import('./webhook.js').WebhookJobData;
}

// ============================================================================
// Module State
// ============================================================================

let notificationQueue: Queue<NotificationJobData> | null = null;
let notificationWorker: Worker<NotificationJobData> | null = null;
let isInitialized = false;

// ============================================================================
// Job ID Helpers (for dedup and cancellation)
// ============================================================================

function jobId(stepExecutionId: string, jobType: NotificationJobType): string {
  return `${jobType}:${stepExecutionId}`;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Schedule a reminder email for a step execution.
 * @param stepExecutionId The step execution to remind about
 * @param sendAt When to send the reminder
 */
export async function scheduleReminder(stepExecutionId: string, sendAt: Date): Promise<void> {
  if (!notificationQueue) return;

  const delay = Math.max(0, sendAt.getTime() - Date.now());
  await notificationQueue.add(
    'send-reminder',
    { type: 'send-reminder', stepExecutionId },
    {
      jobId: jobId(stepExecutionId, 'send-reminder'),
      delay,
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}

/**
 * Schedule an overdue check for a step execution.
 * @param stepExecutionId The step execution to check
 * @param checkAt When to run the check (typically the due date)
 */
export async function scheduleOverdueCheck(stepExecutionId: string, checkAt: Date): Promise<void> {
  if (!notificationQueue) return;

  const delay = Math.max(0, checkAt.getTime() - Date.now());
  await notificationQueue.add(
    'check-overdue',
    { type: 'check-overdue', stepExecutionId },
    {
      jobId: jobId(stepExecutionId, 'check-overdue'),
      delay,
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}

/**
 * Schedule an escalation for a step execution.
 * @param stepExecutionId The step execution to escalate
 * @param escalateAt When to trigger escalation
 */
export async function scheduleEscalation(stepExecutionId: string, escalateAt: Date): Promise<void> {
  if (!notificationQueue) return;

  const delay = Math.max(0, escalateAt.getTime() - Date.now());
  await notificationQueue.add(
    'escalation',
    { type: 'escalation', stepExecutionId },
    {
      jobId: jobId(stepExecutionId, 'escalation'),
      delay,
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}

/**
 * Cancel all pending notification jobs for a step execution.
 * Called when a step is completed or skipped.
 */
export async function cancelStepJobs(stepExecutionId: string): Promise<void> {
  if (!notificationQueue) return;

  const jobTypes: NotificationJobType[] = ['send-reminder', 'check-overdue', 'escalation'];
  for (const type of jobTypes) {
    try {
      const job = await notificationQueue.getJob(jobId(stepExecutionId, type));
      if (job) {
        await job.remove();
      }
    } catch {
      // Job may have already been processed or removed
    }
  }
}

/**
 * Enqueue a webhook delivery job.
 * Falls back to synchronous dispatch if Redis/BullMQ is unavailable.
 */
export async function addWebhookJob(data: import('./webhook.js').WebhookJobData): Promise<void> {
  if (!notificationQueue) {
    // No Redis — caller should handle sync fallback
    throw new Error('Queue not available');
  }

  await notificationQueue.add(
    'send-webhook',
    { type: 'send-webhook', webhookData: data, organizationId: data.organizationId },
    {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}

/**
 * Initialize the scheduler — creates queue, worker, and cron jobs.
 * Must be called after Redis is available.
 */
export async function initScheduler(): Promise<void> {
  if (isInitialized) return;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[Scheduler] REDIS_URL not set — scheduler disabled (dev mode)');
    return;
  }

  try {
    // Dynamic import ioredis to share connection config
    const { Redis } = await import('ioredis');
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

    // Create the queue
    // BullMQ accepts ioredis instances directly
    const conn = connection as never;

    notificationQueue = new Queue<NotificationJobData>('notifications', {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });

    // Create the worker
    notificationWorker = new Worker<NotificationJobData>(
      'notifications',
      async (job: Job<NotificationJobData>) => {
        await processNotificationJob(job);
      },
      { connection: conn, concurrency: 5 }
    );

    notificationWorker.on('failed', (job, err) => {
      console.error(`[Scheduler] Job ${job?.id} failed:`, err.message);
    });

    // Register cron jobs
    // Check for stalled flows every 6 hours
    await notificationQueue.add(
      'check-stalled',
      { type: 'check-stalled' },
      {
        jobId: 'cron:check-stalled',
        repeat: { pattern: '0 */6 * * *' }, // Every 6 hours
        removeOnComplete: true,
      }
    );

    // Daily digest at 8 AM UTC
    await notificationQueue.add(
      'daily-digest',
      { type: 'daily-digest' },
      {
        jobId: 'cron:daily-digest',
        repeat: { pattern: '0 8 * * *' }, // 8 AM UTC daily
        removeOnComplete: true,
      }
    );

    isInitialized = true;
    console.log('[Scheduler] Initialized with BullMQ');

    // Load persistent schedules from DB
    await initSchedules();
  } catch (err) {
    console.error('[Scheduler] Failed to initialize:', err);
  }
}

// ============================================================================
// Schedule Management (DB-backed schedules)
// ============================================================================

/**
 * Load all enabled schedules from the database and register them as
 * repeatable BullMQ jobs. Called on server start.
 */
export async function initSchedules(): Promise<void> {
  if (!notificationQueue) {
    console.log('[Scheduler] No queue available — skipping schedule initialization');
    return;
  }

  try {
    const { db, schedules: schedulesTable } = await import('../db/index.js');
    const { eq } = await import('drizzle-orm');

    const enabledSchedules = await db.query.schedules.findMany({
      where: eq(schedulesTable.enabled, true),
    });

    console.log(`[Scheduler] Loading ${enabledSchedules.length} enabled schedules from DB`);

    for (const schedule of enabledSchedules) {
      try {
        await registerSchedule(schedule);
      } catch (err) {
        console.error(`[Scheduler] Failed to register schedule ${schedule.id}:`, err);
      }
    }

    console.log('[Scheduler] All schedules loaded');
  } catch (err) {
    console.error('[Scheduler] Failed to load schedules from DB:', err);
  }
}

/**
 * Register a single schedule as a repeatable BullMQ job.
 */
export async function registerSchedule(schedule: {
  id: string;
  templateId: string;
  organizationId: string;
  scheduleName: string;
  cronPattern: string;
  roleAssignments?: Record<string, unknown> | null;
  kickoffData?: Record<string, unknown> | null;
}): Promise<void> {
  if (!notificationQueue) return;

  await notificationQueue.add(
    'scheduled-flow-start',
    {
      type: 'scheduled-flow-start' as NotificationJobType,
      organizationId: schedule.organizationId,
    },
    {
      jobId: `schedule:${schedule.id}`,
      repeat: { pattern: schedule.cronPattern },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );

  console.log(`[Scheduler] Registered schedule "${schedule.scheduleName}" (${schedule.id})`);
}

/**
 * Cancel/remove a repeatable schedule job.
 */
export async function cancelSchedule(scheduleId: string): Promise<void> {
  if (!notificationQueue) return;

  try {
    const repeatableJobs = await notificationQueue.getRepeatableJobs();
    const match = repeatableJobs.find((j) => j.id === `schedule:${scheduleId}`);
    if (match) {
      await notificationQueue.removeRepeatableByKey(match.key);
      console.log(`[Scheduler] Cancelled schedule: ${scheduleId}`);
    }
  } catch (err) {
    console.error(`[Scheduler] Failed to cancel schedule ${scheduleId}:`, err);
  }
}

// ============================================================================
// Job Processor (dispatches to notification service)
// ============================================================================

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { type, stepExecutionId, flowId } = job.data;

  // Lazy import to avoid circular dependencies
  const {
    handleReminderJob,
    handleOverdueJob,
    handleEscalationJob,
    handleStalledCheck,
    handleDailyDigest,
  } = await import('./notification.js');

  switch (type) {
    case 'send-reminder':
      if (stepExecutionId) await handleReminderJob(stepExecutionId);
      break;
    case 'check-overdue':
      if (stepExecutionId) await handleOverdueJob(stepExecutionId);
      break;
    case 'escalation':
      if (stepExecutionId) await handleEscalationJob(stepExecutionId);
      break;
    case 'check-stalled':
      await handleStalledCheck();
      break;
    case 'daily-digest':
      await handleDailyDigest();
      break;
    case 'send-webhook': {
      const { handleWebhookJob } = await import('./webhook.js');
      if (job.data.webhookData) await handleWebhookJob(job.data.webhookData);
      break;
    }
    case 'scheduled-flow-start': {
      // Find the schedule from the job ID and trigger the flow start
      const scheduleId = job.opts?.jobId?.replace('schedule:', '') || '';
      if (scheduleId) {
        const { db, schedules: schedulesTable } = await import('../db/index.js');
        const { eq } = await import('drizzle-orm');
        const schedule = await db.query.schedules.findFirst({
          where: eq(schedulesTable.id, scheduleId),
        });
        if (schedule) {
          const { processScheduledFlowStart } = await import('./flow-scheduler.js');
          await processScheduledFlowStart({
            type: 'scheduled-flow-start',
            templateId: schedule.templateId,
            organizationId: schedule.organizationId,
            scheduleName: schedule.scheduleName,
            roleAssignments: schedule.roleAssignments as Record<string, string> | undefined,
            kickoffData: schedule.kickoffData as Record<string, unknown> | undefined,
          });
          // Update lastRunAt and nextRunAt
          const { CronExpressionParser } = await import('cron-parser');
          let nextRunAt: Date | null = null;
          try {
            const expr = CronExpressionParser.parse(schedule.cronPattern, { tz: schedule.timezone });
            nextRunAt = expr.next().toDate();
          } catch {}
          await db.update(schedulesTable)
            .set({ lastRunAt: new Date(), nextRunAt })
            .where(eq(schedulesTable.id, scheduleId));
        }
      }
      break;
    }
    default:
      console.warn(`[Scheduler] Unknown job type: ${type}`);
  }
}
