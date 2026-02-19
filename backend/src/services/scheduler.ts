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
  | 'daily-digest';

export interface NotificationJobData {
  type: NotificationJobType;
  stepExecutionId?: string;
  flowRunId?: string;
  userId?: string;
  organizationId?: string;
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
  } catch (err) {
    console.error('[Scheduler] Failed to initialize:', err);
  }
}

// ============================================================================
// Job Processor (dispatches to notification service)
// ============================================================================

async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { type, stepExecutionId, flowRunId } = job.data;

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
    default:
      console.warn(`[Scheduler] Unknown job type: ${type}`);
  }
}
