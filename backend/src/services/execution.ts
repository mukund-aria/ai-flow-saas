/**
 * Execution Service
 *
 * Shared step lifecycle logic used by both the coordinator routes (runs.ts)
 * and the public task routes (public-task.ts).
 *
 * Handles:
 * - Computing dueAt for steps
 * - Scheduling reminder/overdue/escalation jobs
 * - Cancelling jobs when steps complete
 * - Sending notifications on step/flow transitions
 */

import { db, stepExecutions, flowRuns } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { scheduleReminder, scheduleOverdueCheck, scheduleEscalation, cancelStepJobs } from './scheduler.js';
import { notifyStepCompleted, notifyFlowCompleted, notifyFlowCancelled } from './notification.js';
import type { FlowNotificationSettings } from '../models/workflow.js';
import { defaultFlowNotificationSettings } from '../models/workflow.js';

// ============================================================================
// Due Date Computation
// ============================================================================

function dueUnitToMs(value: number, unit: string): number {
  switch (unit) {
    case 'HOURS': return value * 60 * 60 * 1000;
    case 'DAYS': return value * 24 * 60 * 60 * 1000;
    case 'WEEKS': return value * 7 * 24 * 60 * 60 * 1000;
    default: return value * 60 * 60 * 1000;
  }
}

/**
 * Compute dueAt timestamp from a step's due config and a start time.
 */
function computeDueAt(
  dueConfig: { value: number; unit: string } | undefined,
  startedAt: Date
): Date | null {
  if (!dueConfig) return null;
  return new Date(startedAt.getTime() + dueUnitToMs(dueConfig.value, dueConfig.unit));
}

// ============================================================================
// Step Activation (schedule jobs when a step becomes active)
// ============================================================================

/**
 * Called when a step transitions to IN_PROGRESS.
 * Computes dueAt and schedules notification jobs.
 */
export async function onStepActivated(
  stepExecutionId: string,
  stepDueConfig?: { value: number; unit: string },
  flowDefinition?: Record<string, unknown> | null
): Promise<void> {
  const now = new Date();

  // Compute dueAt if the step has a due config
  const dueAt = computeDueAt(stepDueConfig, now);

  if (dueAt) {
    // Update the step execution with dueAt
    await db.update(stepExecutions)
      .set({ dueAt })
      .where(eq(stepExecutions.id, stepExecutionId));

    // Get notification settings from flow definition
    const settings: FlowNotificationSettings =
      (flowDefinition?.settings as { notifications?: FlowNotificationSettings } | undefined)?.notifications
      || defaultFlowNotificationSettings();

    // Schedule reminder (before due)
    if (settings.defaultReminder.enabled) {
      const reminderMs = dueUnitToMs(
        settings.defaultReminder.firstReminderBefore.value,
        settings.defaultReminder.firstReminderBefore.unit
      );
      const reminderAt = new Date(dueAt.getTime() - reminderMs);
      if (reminderAt > now) {
        await scheduleReminder(stepExecutionId, reminderAt);
      }
    }

    // Schedule overdue check (at due date)
    await scheduleOverdueCheck(stepExecutionId, dueAt);

    // Schedule escalation (after due)
    if (settings.escalation.enabled) {
      const escalationMs = dueUnitToMs(
        settings.escalation.escalateAfter.value,
        settings.escalation.escalateAfter.unit
      );
      const escalationAt = new Date(dueAt.getTime() + escalationMs);
      await scheduleEscalation(stepExecutionId, escalationAt);
    }
  }
}

// ============================================================================
// Step Completion
// ============================================================================

/**
 * Called when a step is completed.
 * Cancels pending jobs and sends notifications.
 */
export async function onStepCompleted(
  stepExec: { id: string; stepId: string; flowRunId: string },
  run: { id: string; name: string; organizationId: string; startedById: string; flowId: string; flow?: { name: string } | null }
): Promise<void> {
  // Cancel all pending notification jobs for this step
  await cancelStepJobs(stepExec.id);

  // Notify coordinator that step was completed
  await notifyStepCompleted(stepExec, run);
}

// ============================================================================
// Flow Completion
// ============================================================================

/**
 * Called when a flow run is completed (all steps done).
 */
export async function onFlowCompleted(
  run: { id: string; name: string; organizationId: string; startedById: string; flowId: string }
): Promise<void> {
  await notifyFlowCompleted(run);
}

// ============================================================================
// Flow Cancellation
// ============================================================================

/**
 * Called when a flow run is cancelled.
 * Cancels all pending jobs and notifies assignees.
 */
export async function onFlowCancelled(
  run: { id: string; name: string; organizationId: string; flowId: string },
  stepExecIds: string[]
): Promise<void> {
  // Cancel all pending jobs for all steps
  for (const stepExecId of stepExecIds) {
    await cancelStepJobs(stepExecId);
  }

  // Notify all active assignees
  await notifyFlowCancelled(run);
}

// ============================================================================
// Activity Tracking
// ============================================================================

/**
 * Update lastActivityAt on a flow run.
 */
export async function updateFlowActivity(flowRunId: string): Promise<void> {
  await db.update(flowRuns)
    .set({ lastActivityAt: new Date() })
    .where(eq(flowRuns.id, flowRunId));
}
