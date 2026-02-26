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
import type { FlowNotificationSettings, StepDue, FlowDue } from '../models/workflow.js';
import { defaultFlowNotificationSettings, migrateNotificationSettings } from '../models/workflow.js';

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
 * Compute dueAt timestamp from a step's due config, start time, and optional flow deadline.
 * Supports RELATIVE, FIXED, and BEFORE_FLOW_DUE modes.
 */
function computeStepDueAt(
  dueConfig: StepDue | { value: number; unit: string } | undefined,
  stepStartedAt: Date,
  flowDueAt?: Date | null
): Date | null {
  if (!dueConfig) return null;
  // Legacy format (no type field) — treat as RELATIVE
  if (!('type' in dueConfig)) {
    return new Date(stepStartedAt.getTime() + dueUnitToMs(dueConfig.value, dueConfig.unit));
  }
  switch (dueConfig.type) {
    case 'RELATIVE':
      return new Date(stepStartedAt.getTime() + dueUnitToMs(dueConfig.value, dueConfig.unit));
    case 'FIXED':
      return new Date(dueConfig.date);
    case 'BEFORE_FLOW_DUE':
      if (!flowDueAt) return null;
      return new Date(flowDueAt.getTime() - dueUnitToMs(dueConfig.value, dueConfig.unit));
  }
}

/**
 * Compute the flow-level dueAt from a FlowDue config and the run's start time.
 */
export function computeFlowDueAt(
  flowDueConfig: FlowDue | undefined,
  flowStartedAt: Date
): Date | null {
  if (!flowDueConfig) return null;
  switch (flowDueConfig.type) {
    case 'RELATIVE':
      return new Date(flowStartedAt.getTime() + dueUnitToMs(flowDueConfig.value, flowDueConfig.unit));
    case 'FIXED':
      return new Date(flowDueConfig.date);
  }
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
  stepDueConfig?: StepDue | { value: number; unit: string },
  flowDefinition?: Record<string, unknown> | null,
  flowDueAt?: Date | null
): Promise<void> {
  const now = new Date();

  // Compute dueAt if the step has a due config
  const dueAt = computeStepDueAt(stepDueConfig, now, flowDueAt);

  if (dueAt) {
    // Update the step execution with dueAt
    await db.update(stepExecutions)
      .set({ dueAt })
      .where(eq(stepExecutions.id, stepExecutionId));

    // Get notification settings from flow definition (supports both old and new format)
    const rawSettings = (flowDefinition?.settings as { notifications?: Record<string, unknown> } | undefined)?.notifications;
    const settings: FlowNotificationSettings = rawSettings
      ? migrateNotificationSettings(rawSettings)
      : defaultFlowNotificationSettings();

    // Schedule reminder (before due) — uses assignee action alerts
    if (settings.assignee.actionAlerts.dueDateApproaching) {
      const reminderMs = dueUnitToMs(settings.assignee.actionAlerts.dueDateApproachingDays, 'DAYS');
      const reminderAt = new Date(dueAt.getTime() - reminderMs);
      if (reminderAt > now) {
        await scheduleReminder(stepExecutionId, reminderAt);
      }
    }

    // Schedule overdue check (at due date) — uses assignee actionDue flag
    if (settings.assignee.actionAlerts.actionDue) {
      await scheduleOverdueCheck(stepExecutionId, dueAt);
    }

    // Schedule escalation (after due) — uses coordinator escalation alerts
    if (settings.coordinator.escalationAlerts.assigneeNotStartedDays !== null) {
      const escalationMs = dueUnitToMs(settings.coordinator.escalationAlerts.assigneeNotStartedDays, 'DAYS');
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
