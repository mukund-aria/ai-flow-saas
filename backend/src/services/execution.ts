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

import { db, stepExecutions, flows, templates, contacts } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { scheduleReminder, scheduleOverdueCheck, scheduleEscalation, cancelStepJobs } from './scheduler.js';
import { notifyStepCompleted, notifyFlowCompleted, notifyFlowCancelled, dispatchIntegrationNotifications } from './notification.js';
import { dispatchWebhooks } from './webhook.js';
import { sseManager } from './sse-manager.js';
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
 * Compute the flow-level dueAt from a FlowDue config and the flow's start time.
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

  // Trigger AI Prepare and AI Advise (fire-and-forget)
  try {
    if (flowDefinition) {
      const stepDefs = (flowDefinition as any)?.steps || [];
      const stepExec = await db.query.stepExecutions.findFirst({
        where: eq(stepExecutions.id, stepExecutionId),
      });
      if (stepExec) {
        const stepDef = stepDefs.find((s: any) => (s.stepId || s.id) === stepExec.stepId);
        if (stepDef) {
          const { runAIPrepare, runAIAdvise } = await import('./ai-assignee.js');
          // AI Prepare for FORM steps
          if (stepDef.config?.aiPrepare?.enabled && stepDef.type === 'FORM') {
            runAIPrepare(stepExecutionId, stepDef, stepExec.flowId).catch(err =>
              console.error('[AI Prepare] Error:', err)
            );
          }
          // AI Advise for applicable step types
          if (stepDef.config?.aiAdvise?.enabled) {
            const adviseTypes = ['DECISION', 'APPROVAL', 'FORM', 'FILE_REQUEST'];
            if (adviseTypes.includes(stepDef.type)) {
              runAIAdvise(stepExecutionId, stepDef, stepExec.flowId).catch(err =>
                console.error('[AI Advise] Error:', err)
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[AI Assignee] Failed to trigger AI agents:', err);
  }
}

// ============================================================================
// Step Completion
// ============================================================================

/**
 * Called when a step is completed.
 * Cancels pending jobs, calculates SLA metrics, and sends notifications.
 */
export async function onStepCompleted(
  stepExec: { id: string; stepId: string; flowId: string },
  run: { id: string; name: string; organizationId: string; startedById: string; templateId: string; template?: { name: string } | null }
): Promise<void> {
  // Cancel all pending notification jobs for this step
  await cancelStepJobs(stepExec.id);

  // Calculate timeToComplete (ms from startedAt to completedAt)
  const fullStepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, stepExec.id),
  });
  if (fullStepExec?.startedAt && fullStepExec?.completedAt) {
    const timeToComplete = new Date(fullStepExec.completedAt).getTime() - new Date(fullStepExec.startedAt).getTime();
    await db.update(stepExecutions)
      .set({ timeToComplete })
      .where(eq(stepExecutions.id, stepExec.id));
  }

  // Notify coordinator that step was completed
  await notifyStepCompleted(stepExec, run);

  // Emit SSE event
  sseManager.emit(run.organizationId, {
    type: 'step.completed',
    data: {
      flowId: run.id,
      templateId: run.templateId,
      stepId: stepExec.stepId,
      stepExecId: stepExec.id,
      runName: run.name,
      timestamp: new Date().toISOString(),
    },
  });

  // Dispatch webhook
  dispatchWebhooks({
    templateId: run.templateId,
    event: 'step.completed',
    payload: {
      event: 'step.completed',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      step: { id: stepExec.stepId, name: stepExec.stepId, index: 0 },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
    stepExecId: stepExec.id,
  }).catch((err) => console.error('[Webhook] step.completed dispatch error:', err));

  // Dispatch to org-level integrations (Slack/Teams/Custom)
  dispatchIntegrationNotifications(run.organizationId, {
    type: 'step.completed',
    flowName: run.name,
    stepName: stepExec.stepId,
    flowId: run.id,
  }).catch((err) => console.error('[Integration] step.completed dispatch error:', err));
}

// ============================================================================
// Flow Completion
// ============================================================================

/**
 * Called when a flow is completed (all steps done).
 */
export async function onFlowCompleted(
  run: { id: string; name: string; organizationId: string; startedById: string; templateId: string; template?: { name: string } | null }
): Promise<void> {
  await notifyFlowCompleted(run);

  // Emit SSE event
  sseManager.emit(run.organizationId, {
    type: 'run.completed',
    data: {
      flowId: run.id,
      templateId: run.templateId,
      runName: run.name,
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
    },
  });

  dispatchWebhooks({
    templateId: run.templateId,
    event: 'flow.completed',
    payload: {
      event: 'flow.completed',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'COMPLETED' },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
  }).catch((err) => console.error('[Webhook] flow.completed dispatch error:', err));

  // Dispatch to org-level integrations (Slack/Teams/Custom)
  dispatchIntegrationNotifications(run.organizationId, {
    type: 'flow.completed',
    flowName: run.name,
    flowId: run.id,
  }).catch((err) => console.error('[Integration] flow.completed dispatch error:', err));

  // Invoke callback URL if one was stored at flow creation (e.g., from webhook trigger)
  try {
    const fullFlow = await db.query.flows.findFirst({ where: eq(flows.id, run.id) });
    const callbackUrl = (fullFlow?.kickoffData as any)?._callbackUrl;
    if (callbackUrl && typeof callbackUrl === 'string') {
      fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'flow.completed', flowId: run.id, templateId: run.templateId, name: run.name, status: 'COMPLETED', completedAt: new Date().toISOString() }),
      }).catch((err) => console.error('[Callback] Failed to invoke callbackUrl:', err));
    }

    // If this is a sub-flow, propagate completion to parent
    if (fullFlow?.parentFlowId) {
      propagateSubFlowCompletion(run.id).catch((err) =>
        console.error('[SubFlow] Failed to propagate completion:', err)
      );
    }
  } catch {}

  // Trigger AI Summary generation (fire-and-forget)
  try {
    const { generateFlowSummary } = await import('./ai-assignee.js');
    generateFlowSummary(run.id).catch(err =>
      console.error('[AI Summary] Error:', err)
    );
  } catch {}
}

// ============================================================================
// Flow Cancellation
// ============================================================================

/**
 * Called when a flow is cancelled.
 * Cancels all pending jobs and notifies assignees.
 */
export async function onFlowCancelled(
  run: { id: string; name: string; organizationId: string; templateId: string; template?: { name: string } | null },
  stepExecIds: string[]
): Promise<void> {
  // Cancel all pending jobs for all steps
  for (const stepExecId of stepExecIds) {
    await cancelStepJobs(stepExecId);
  }

  // Notify all active assignees
  await notifyFlowCancelled(run);

  dispatchWebhooks({
    templateId: run.templateId,
    event: 'flow.cancelled',
    payload: {
      event: 'flow.cancelled',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'CANCELLED' },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
  }).catch((err) => console.error('[Webhook] flow.cancelled dispatch error:', err));
}

// ============================================================================
// Flow Started (webhook-only — email/in-app handled elsewhere)
// ============================================================================

/**
 * Called when a flow is started.
 * Dispatches the flow.started webhook event.
 */
export async function onFlowStarted(
  run: { id: string; name: string; organizationId: string; templateId: string; template?: { name: string } | null }
): Promise<void> {
  // Emit SSE event
  sseManager.emit(run.organizationId, {
    type: 'run.started',
    data: {
      flowId: run.id,
      templateId: run.templateId,
      runName: run.name,
      status: 'IN_PROGRESS',
      timestamp: new Date().toISOString(),
    },
  });

  dispatchWebhooks({
    templateId: run.templateId,
    event: 'flow.started',
    payload: {
      event: 'flow.started',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
  }).catch((err) => console.error('[Webhook] flow.started dispatch error:', err));

  // Dispatch to org-level integrations (Slack/Teams/Custom)
  dispatchIntegrationNotifications(run.organizationId, {
    type: 'flow.started',
    flowName: run.name,
    flowId: run.id,
  }).catch((err) => console.error('[Integration] flow.started dispatch error:', err));
}

// ============================================================================
// Activity Tracking
// ============================================================================

/**
 * Update lastActivityAt on a flow.
 */
export async function updateFlowActivity(flowId: string): Promise<void> {
  await db.update(flows)
    .set({ lastActivityAt: new Date() })
    .where(eq(flows.id, flowId));
}

// ============================================================================
// Sub-Flow Handling
// ============================================================================

/**
 * Resolve a DDR token from parent flow context.
 * Simplified version: looks up kickoff data and step output data.
 */
function resolveParentDDR(token: string, kickoffData: Record<string, unknown>, stepOutputs: Record<string, Record<string, unknown>>): unknown {
  // Format: "{StepName / FieldName}" or "{Kickoff / FieldName}"
  const match = token.match(/^\{(.+?)\s*\/\s*(.+?)\}$/);
  if (!match) return token;

  const [, source, field] = match;
  if (source.trim().toLowerCase() === 'kickoff') {
    return kickoffData[field.trim()] ?? token;
  }
  // Check step outputs
  const stepOutput = stepOutputs[source.trim()];
  if (stepOutput) {
    return stepOutput[field.trim()] ?? token;
  }
  return token;
}

/**
 * Called when a SUB_FLOW step is activated.
 * Starts a child flow and links it to the parent step execution.
 */
export async function handleSubFlowStep(
  stepExecutionId: string,
  stepDef: Record<string, unknown>,
  parentFlow: { id: string; organizationId: string; startedById: string; templateId: string; name: string }
): Promise<void> {
  const config = (stepDef.config || stepDef) as Record<string, unknown>;
  const subFlowObj = config.subFlow as Record<string, unknown> | undefined;
  const subFlowTemplateId = (subFlowObj?.flowTemplateId || config.subFlowId || config.flowRef) as string | undefined;

  if (!subFlowTemplateId) {
    console.error('[SubFlow] No subFlowTemplateId configured for step execution:', stepExecutionId);
    // Mark step as completed with error
    await db.update(stepExecutions)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        resultData: { error: 'No sub-flow template configured', 'subFlow.status': 'FAILED' },
      })
      .where(eq(stepExecutions.id, stepExecutionId));
    return;
  }

  // Look up the child flow template
  const childTemplate = await db.query.templates.findFirst({
    where: eq(templates.id, subFlowTemplateId),
  });

  if (!childTemplate) {
    console.error('[SubFlow] Child flow template not found:', subFlowTemplateId);
    await db.update(stepExecutions)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        resultData: { error: 'Sub-flow template not found', 'subFlow.status': 'FAILED' },
      })
      .where(eq(stepExecutions.id, stepExecutionId));
    return;
  }

  // Resolve input mappings to build kickoff data for child flow
  const inputMappings = (subFlowObj?.inputMappings || config.inputMappings || config.inputMapping || []) as Array<{ parentRef: string; subFlowField: string }>;

  // Get parent context for DDR resolution
  const fullParentFlow = await db.query.flows.findFirst({
    where: eq(flows.id, parentFlow.id),
    with: { stepExecutions: true },
  });

  const parentKickoff = (fullParentFlow?.kickoffData as Record<string, unknown>) || {};

  // Build step outputs from parent's completed steps
  const parentTemplate = await db.query.templates.findFirst({ where: eq(templates.id, parentFlow.templateId) });
  const parentDef = (parentTemplate?.definition as any) || {};
  const parentStepDefs = parentDef.steps || [];
  const parentStepOutputs: Record<string, Record<string, unknown>> = {};
  for (const se of fullParentFlow?.stepExecutions || []) {
    if (se.status === 'COMPLETED' && se.resultData) {
      const defStep = parentStepDefs.find((s: any) => (s.stepId || s.id) === se.stepId);
      const name = defStep?.config?.name;
      if (name) {
        parentStepOutputs[name] = se.resultData as Record<string, unknown>;
      }
    }
  }

  // Resolve input mappings
  const childKickoffData: Record<string, unknown> = {};
  for (const mapping of inputMappings) {
    childKickoffData[mapping.subFlowField] = resolveParentDDR(mapping.parentRef, parentKickoff, parentStepOutputs);
  }

  // Get child flow definition
  const childDefinition = childTemplate.definition as { steps?: Array<Record<string, unknown>> } | null;
  const childSteps = childDefinition?.steps || [];

  if (childSteps.length === 0) {
    await db.update(stepExecutions)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        resultData: { error: 'Sub-flow has no steps', 'subFlow.status': 'FAILED' },
      })
      .where(eq(stepExecutions.id, stepExecutionId));
    return;
  }

  // Create child flow
  const flowName = `${childTemplate.name} (sub-flow of ${parentFlow.name})`;
  const [childFlow] = await db
    .insert(flows)
    .values({
      templateId: childTemplate.id,
      name: flowName,
      status: 'IN_PROGRESS',
      isSample: false,
      currentStepIndex: 0,
      startedById: parentFlow.startedById,
      organizationId: parentFlow.organizationId,
      kickoffData: Object.keys(childKickoffData).length > 0 ? childKickoffData : null,
      parentFlowId: parentFlow.id,
      parentStepExecutionId: stepExecutionId,
    })
    .returning();

  // Create step executions for child flow
  const childStepExecValues = childSteps.map((step, index) => {
    const s = step as any;
    return {
      flowId: childFlow.id,
      stepId: s.stepId || s.id || `step-${index}`,
      stepIndex: index,
      status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
      startedAt: index === 0 ? new Date() : null,
    };
  });

  await db.insert(stepExecutions).values(childStepExecValues);

  // Schedule jobs for first child step
  const firstChildStep = childSteps[0] as any;
  const firstChildStepExec = await db.query.stepExecutions.findFirst({
    where: and(
      eq(stepExecutions.flowId, childFlow.id),
      eq(stepExecutions.stepIndex, 0)
    ),
  });
  if (firstChildStepExec) {
    await onStepActivated(firstChildStepExec.id, firstChildStep.due || firstChildStep.config?.due, childTemplate.definition as Record<string, unknown>);
  }

  await updateFlowActivity(childFlow.id);

  // Store childFlowId in parent step's resultData for tracking
  await db.update(stepExecutions)
    .set({
      resultData: { 'subFlow.flowId': childFlow.id, 'subFlow.status': 'IN_PROGRESS' },
    })
    .where(eq(stepExecutions.id, stepExecutionId));

  // Dispatch flow.started for child
  await onFlowStarted({
    id: childFlow.id,
    name: flowName,
    organizationId: parentFlow.organizationId,
    templateId: childTemplate.id,
    template: { name: childTemplate.name },
  });

  console.log(`[SubFlow] Started child flow ${childFlow.id} for parent step ${stepExecutionId}`);
}

/**
 * Called when a child flow completes to propagate completion back to the parent.
 * Applies output mapping and advances the parent flow.
 */
export async function propagateSubFlowCompletion(childFlowId: string): Promise<void> {
  // Get the child flow with parent info
  const childFlow = await db.query.flows.findFirst({
    where: eq(flows.id, childFlowId),
    with: {
      template: true,
      stepExecutions: true,
    },
  });

  if (!childFlow?.parentFlowId || !childFlow?.parentStepExecutionId) {
    return; // Not a sub-flow, nothing to propagate
  }

  // Get the parent step execution
  const parentStepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, childFlow.parentStepExecutionId),
  });

  if (!parentStepExec || parentStepExec.status === 'COMPLETED') {
    return; // Already completed or not found
  }

  // Get the parent flow with its template for step defs
  const parentFlow = await db.query.flows.findFirst({
    where: eq(flows.id, childFlow.parentFlowId),
    with: {
      template: true,
      stepExecutions: {
        orderBy: (se, { asc }) => [asc(se.stepIndex)],
      },
    },
  });

  if (!parentFlow) return;

  // Get the parent step definition to find output mappings
  const parentDef = (parentFlow.template?.definition as any) || {};
  const parentStepDefs = parentDef.steps || [];
  const parentStepDef = parentStepDefs.find((s: any) => (s.stepId || s.id) === parentStepExec.stepId);
  const subFlowCfg = parentStepDef?.config?.subFlow as Record<string, unknown> | undefined;
  const outputMappings = (subFlowCfg?.outputMappings || parentStepDef?.config?.outputMappings || parentStepDef?.config?.outputMapping || []) as Array<{
    subFlowOutputRef: string;
    parentOutputKey: string;
  }>;

  // Build child flow's step outputs
  const childDef = (childFlow.template?.definition as any) || {};
  const childStepDefs = childDef.steps || [];
  const childStepOutputs: Record<string, Record<string, unknown>> = {};
  for (const se of childFlow.stepExecutions) {
    if (se.status === 'COMPLETED' && se.resultData) {
      const defStep = childStepDefs.find((s: any) => (s.stepId || s.id) === se.stepId);
      const name = defStep?.config?.name;
      if (name) {
        childStepOutputs[name] = se.resultData as Record<string, unknown>;
      }
    }
  }

  // Apply output mapping
  const resultData: Record<string, unknown> = {
    ...(parentStepExec.resultData as Record<string, unknown> || {}),
    'subFlow.status': 'COMPLETED',
    'subFlow.flowId': childFlowId,
  };

  for (const mapping of outputMappings) {
    // subFlowOutputRef format: "StepName / FieldName"
    const resolved = resolveParentDDR(`{${mapping.subFlowOutputRef}}`, {}, childStepOutputs);
    resultData[mapping.parentOutputKey] = resolved;
  }

  // Complete the parent step and advance using shared helper
  const { completeStepAndAdvance } = await import('./step-completion.js');
  await completeStepAndAdvance({
    stepExecutionId: parentStepExec.id,
    resultData,
    run: parentFlow as any,
    stepDefs: parentStepDefs,
    skipAIReview: true,
  });

  console.log(`[SubFlow] Propagated completion of child flow ${childFlowId} to parent step ${parentStepExec.id}`);
}
