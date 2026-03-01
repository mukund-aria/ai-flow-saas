/**
 * Flow Scheduler Service
 *
 * Uses BullMQ + Redis to register and manage scheduled flow starts via cron patterns.
 * Creates a separate 'flow-schedules' queue (independent of the 'notifications' queue
 * in scheduler.ts).
 *
 * If REDIS_URL is not set, all functions are no-ops (graceful dev degradation).
 */

import { Queue, Worker, type Job } from 'bullmq';

// ============================================================================
// Job Types
// ============================================================================

export interface FlowScheduleJobData {
  type: 'scheduled-flow-start';
  templateId: string;
  organizationId: string;
  scheduleName: string;
  roleAssignments?: Record<string, string>;
  kickoffData?: Record<string, unknown>;
}

// ============================================================================
// Module State
// ============================================================================

let scheduleQueue: Queue<FlowScheduleJobData> | null = null;
let scheduleWorker: Worker<FlowScheduleJobData> | null = null;
let isInitialized = false;

// ============================================================================
// Public API
// ============================================================================

/**
 * Schedule a recurring flow start using a cron pattern.
 * Returns a schedule ID that can be used for cancellation.
 */
export async function scheduleFlowStart(config: {
  templateId: string;
  organizationId: string;
  scheduleName: string;
  cronPattern: string;
  roleAssignments?: Record<string, string>;
  kickoffData?: Record<string, unknown>;
}): Promise<string> {
  const scheduleId = `schedule:${config.templateId}:${Date.now()}`;

  if (!scheduleQueue) {
    console.warn('[FlowScheduler] Redis not available — returning dummy schedule ID');
    return scheduleId;
  }

  await scheduleQueue.add(
    'scheduled-flow-start',
    {
      type: 'scheduled-flow-start',
      templateId: config.templateId,
      organizationId: config.organizationId,
      scheduleName: config.scheduleName,
      roleAssignments: config.roleAssignments,
      kickoffData: config.kickoffData,
    },
    {
      jobId: scheduleId,
      repeat: { pattern: config.cronPattern },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );

  console.log(`[FlowScheduler] Registered schedule "${config.scheduleName}" (${scheduleId}) with cron: ${config.cronPattern}`);
  return scheduleId;
}

/**
 * Cancel a previously registered flow schedule by its ID.
 * No-op if Redis is not available.
 */
export async function cancelFlowSchedule(scheduleId: string): Promise<void> {
  if (!scheduleQueue) return;

  try {
    // Remove the repeatable job by key
    const repeatableJobs = await scheduleQueue.getRepeatableJobs();
    const match = repeatableJobs.find((j) => j.id === scheduleId);
    if (match) {
      await scheduleQueue.removeRepeatableByKey(match.key);
      console.log(`[FlowScheduler] Cancelled schedule: ${scheduleId}`);
    }
  } catch (err) {
    console.error(`[FlowScheduler] Failed to cancel schedule ${scheduleId}:`, err);
  }
}

/**
 * List all active schedules for a given flow.
 * Returns an empty array if Redis is not available.
 */
export async function listFlowSchedules(
  flowId: string
): Promise<Array<{ id: string; cronPattern: string; scheduleName: string; nextRun?: Date }>> {
  if (!scheduleQueue) return [];

  try {
    const repeatableJobs = await scheduleQueue.getRepeatableJobs();

    // Filter to jobs whose ID matches the flow
    const flowJobs = repeatableJobs.filter((j) => j.id?.startsWith(`schedule:${flowId}:`));

    return flowJobs.map((j) => ({
      id: j.id || j.key,
      cronPattern: j.pattern || '',
      scheduleName: j.name || 'scheduled-flow-start',
      nextRun: j.next ? new Date(j.next) : undefined,
    }));
  } catch (err) {
    console.error(`[FlowScheduler] Failed to list schedules for flow ${flowId}:`, err);
    return [];
  }
}

// ============================================================================
// Job Processor
// ============================================================================

/**
 * Process a scheduled flow start job.
 * Looks up the flow, creates a run, creates step executions,
 * activates the first step, and writes an audit log.
 */
export async function processScheduledFlowStart(data: FlowScheduleJobData): Promise<void> {
  const { templateId, organizationId, scheduleName, roleAssignments, kickoffData } = data;

  // Lazy imports to avoid circular dependencies
  const { db, templates, flows, stepExecutions, users } = await import('../db/index.js');
  const { eq } = await import('drizzle-orm');
  const { onStepActivated, updateFlowActivity } = await import('./execution.js');
  const { logAction } = await import('./audit.js');

  // Look up the flow template
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
  });

  if (!template) {
    console.error(`[FlowScheduler] Template ${templateId} not found — skipping scheduled run`);
    return;
  }

  if (template.status === 'DRAFT') {
    console.warn(`[FlowScheduler] Template ${templateId} is DRAFT — skipping scheduled run`);
    return;
  }

  // Extract steps from flow definition
  const definition = template.definition as { steps?: Array<{ id: string; name?: string; type?: string; due?: { value: number; unit: string } }> } | null;
  const steps = definition?.steps || [];

  if (steps.length === 0) {
    console.warn(`[FlowScheduler] Template ${templateId} has no steps — skipping scheduled run`);
    return;
  }

  // Find a user in the organization to attribute the run to
  const orgUser = await db.query.users.findFirst({
    where: eq(users.activeOrganizationId, organizationId),
  });

  if (!orgUser) {
    console.error(`[FlowScheduler] No user found in organization ${organizationId} — skipping scheduled run`);
    return;
  }

  // Create the flow run
  const runName = `${template.name} - Scheduled (${scheduleName}) ${new Date().toISOString().split('T')[0]}`;

  const [newRun] = await db
    .insert(flows)
    .values({
      templateId: template.id,
      name: runName,
      status: 'IN_PROGRESS',
      isSample: false,
      currentStepIndex: 0,
      startedById: orgUser.id,
      organizationId,
      roleAssignments: roleAssignments || null,
      kickoffData: kickoffData || null,
    })
    .returning();

  // Create step executions for each step in the flow
  const stepExecutionValues = steps.map((step, index) => ({
    flowId: newRun.id,
    stepId: step.id,
    stepIndex: index,
    status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
    startedAt: index === 0 ? new Date() : null,
  }));

  await db.insert(stepExecutions).values(stepExecutionValues);

  // Activate the first step (schedule reminders, overdue checks, etc.)
  const firstStepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.flowId, newRun.id),
  });

  if (firstStepExec) {
    const firstStepDef = steps[0];
    await onStepActivated(firstStepExec.id, firstStepDef?.due, template.definition);
  }

  // Set initial activity timestamp
  await updateFlowActivity(newRun.id);

  // Audit log
  await logAction({
    flowId: newRun.id,
    action: 'SCHEDULED_FLOW_STARTED',
    actorId: orgUser.id,
    details: {
      templateId: template.id,
      flowName: template.name,
      scheduleName,
      runName,
    },
  });

  console.log(`[FlowScheduler] Started scheduled run "${runName}" (${newRun.id}) for template ${templateId}`);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the flow scheduler — creates queue, worker, and connects to Redis.
 * Must be called after Redis is available.
 */
export async function initFlowScheduler(): Promise<void> {
  if (isInitialized) return;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[FlowScheduler] REDIS_URL not set — flow scheduler disabled (dev mode)');
    return;
  }

  try {
    const { Redis } = await import('ioredis');
    const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

    // BullMQ accepts ioredis instances directly
    const conn = connection as never;

    // Create the queue
    scheduleQueue = new Queue<FlowScheduleJobData>('flow-schedules', {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    });

    // Create the worker
    scheduleWorker = new Worker<FlowScheduleJobData>(
      'flow-schedules',
      async (job: Job<FlowScheduleJobData>) => {
        await processScheduledFlowStart(job.data);
      },
      { connection: conn, concurrency: 3 }
    );

    scheduleWorker.on('failed', (job, err) => {
      console.error(`[FlowScheduler] Job ${job?.id} failed:`, err.message);
    });

    scheduleWorker.on('completed', (job) => {
      console.log(`[FlowScheduler] Job ${job?.id} completed successfully`);
    });

    isInitialized = true;
    console.log('[FlowScheduler] Initialized with BullMQ (queue: flow-schedules)');
  } catch (err) {
    console.error('[FlowScheduler] Failed to initialize:', err);
  }
}
