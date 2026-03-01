/**
 * Proposal Utilities
 *
 * Shared helpers for AI proposal display — extracted from PlanPreviewCard.
 * Used by PlanSummaryCard, ProposalBanner, WorkflowPanel, and useChat.
 */

import { COPILOT_SETTINGS } from '@/config/copilot-settings';
import type { EditOperation, Step, PendingPlan } from '@/types';

// ============================================================================
// Types
// ============================================================================

export type StepChangeStatus = 'added' | 'modified' | 'moved' | 'unchanged';

export interface ChangeInfo {
  status: StepChangeStatus;
  title?: string;
}

// ============================================================================
// Change Status Map
// ============================================================================

/**
 * Build a map from stepId → ChangeInfo from edit operations.
 * Used to annotate steps with change badges in proposal mode.
 */
export function buildChangeStatusMap(operations: EditOperation[]): Map<string, ChangeInfo> {
  const statusMap = new Map<string, ChangeInfo>();

  for (const op of operations) {
    const opType = op.op as string;

    let stepId: string | undefined;
    let stepTitle: string | undefined;

    if (opType.includes('ADD_STEP') || opType.includes('ADD_PATH_STEP') || opType.includes('ADD_OUTCOME_STEP')) {
      stepId = op.step?.stepId;
      stepTitle = (op.step as unknown as { title?: string })?.title || op.step?.config?.name;
    } else {
      stepId = op.stepId || op.step?.stepId;
      const updatesTitle = (op.updates as { title?: string } | undefined)?.title;
      stepTitle = updatesTitle || (op.step as unknown as { title?: string })?.title || op.step?.config?.name;
    }

    if (!stepId) continue;

    if (opType.includes('ADD_STEP') || opType.includes('ADD_PATH_STEP') || opType.includes('ADD_OUTCOME_STEP')) {
      statusMap.set(stepId, { status: 'added', title: stepTitle });
    } else if (opType.includes('UPDATE_STEP') || opType.includes('UPDATE_PATH_STEP')) {
      statusMap.set(stepId, { status: 'modified', title: stepTitle });
    } else if (opType.includes('MOVE_STEP') || opType.includes('MOVE_PATH_STEP')) {
      statusMap.set(stepId, { status: 'moved', title: stepTitle });
    }
  }

  return statusMap;
}

/**
 * Look up a step's change status from the change map.
 */
export function getStepChangeStatus(
  step: Step,
  changeStatusMap: Map<string, ChangeInfo>
): StepChangeStatus {
  const changeInfo = changeStatusMap.get(step.stepId);
  if (!changeInfo) return 'unchanged';

  if (changeInfo.status === 'added' && changeInfo.title) {
    const stepTitle = (step as unknown as { title?: string }).title || step.config?.name;
    if (stepTitle && changeInfo.title !== stepTitle) {
      return 'unchanged';
    }
  }

  return changeInfo.status;
}

/**
 * CSS class string for a given change status.
 */
export function getChangeStatusStyles(status: StepChangeStatus, isProposalMode: boolean): string {
  if (!isProposalMode) return '';

  switch (status) {
    case 'added':
      return 'border-l-4 border-green-500 bg-green-50 ring-1 ring-green-200';
    case 'modified':
      return 'border-l-4 border-amber-500 bg-amber-50/50';
    case 'moved':
      return 'border-l-4 border-blue-500 bg-blue-50/50';
    case 'unchanged':
      return 'opacity-60';
    default:
      return '';
  }
}

// ============================================================================
// Summarize Operations
// ============================================================================

/**
 * Convert raw EditOperations into human-readable summary lines.
 */
export function summarizeOperations(operations: EditOperation[], workflowSteps: Step[]): string[] {
  const summary: string[] = [];

  // Build a lookup map for step titles by stepId
  const stepTitleMap = new Map<string, string>();
  const addStepTitles = (steps: Step[]) => {
    for (const step of steps) {
      const title = (step as unknown as { title?: string }).title || step.config?.name;
      if (step.stepId && title) {
        stepTitleMap.set(step.stepId, title);
      }
      const paths = step.config?.paths || step.config?.outcomes || [];
      for (const path of paths) {
        if (path.steps) {
          addStepTitles(path.steps);
        }
      }
    }
  };
  addStepTitles(workflowSteps);

  // Group operations by type
  const addedSteps: string[] = [];
  const removedSteps: string[] = [];
  const updatedSteps: string[] = [];
  const movedSteps: string[] = [];
  const addedRoles: string[] = [];
  const removedRoles: string[] = [];
  let hasMetadataUpdate = false;
  let hasMilestoneChanges = false;
  const addedMilestones: string[] = [];

  for (const op of operations) {
    const opStepId = op.stepId || op.step?.stepId;
    const stepName =
      (op.step as unknown as { title?: string })?.title ||
      op.step?.config?.name ||
      (opStepId ? stepTitleMap.get(opStepId) : null) ||
      'a step';

    if (op.op === 'UPDATE_FLOW_METADATA' || op.op === 'UPDATE_FLOW_NAME') {
      hasMetadataUpdate = true;
      if (op.updates?.milestones) {
        hasMilestoneChanges = true;
        const milestones = op.updates.milestones as Array<{ name: string }>;
        milestones.forEach((m) => {
          if (m.name) addedMilestones.push(m.name);
        });
      }
    } else if (op.op === 'ADD_MILESTONE') {
      hasMilestoneChanges = true;
      if (op.milestone?.name) addedMilestones.push(op.milestone.name);
    } else if (op.op === 'REMOVE_MILESTONE' || op.op === 'UPDATE_MILESTONE') {
      hasMilestoneChanges = true;
    } else if (op.op === 'ADD_ROLE') {
      if (op.placeholder?.name) addedRoles.push(op.placeholder.name);
    } else if (op.op === 'REMOVE_ROLE') {
      removedRoles.push(op.roleId || 'role');
    } else if (
      op.op === 'ADD_STEP_AFTER' ||
      op.op === 'ADD_STEP_BEFORE' ||
      op.op === 'ADD_PATH_STEP_AFTER' ||
      op.op === 'ADD_PATH_STEP_BEFORE'
    ) {
      addedSteps.push(stepName);
    } else if (op.op === 'REMOVE_STEP') {
      removedSteps.push(stepName);
    } else if (op.op === 'UPDATE_STEP') {
      updatedSteps.push(stepName);
    } else if (op.op === 'MOVE_STEP') {
      movedSteps.push(stepName);
    }
  }

  if (addedRoles.length > 0) {
    summary.push(`Added roles: ${addedRoles.join(', ')}`);
  }
  if (removedRoles.length > 0) {
    summary.push(`Removed ${removedRoles.length} role(s)`);
  }

  if (addedMilestones.length > 0) {
    summary.push(`Added milestones: ${addedMilestones.join(', ')}`);
  } else if (hasMilestoneChanges) {
    summary.push('Updated milestones');
  }

  if (hasMetadataUpdate && !hasMilestoneChanges) {
    summary.push('Updated workflow settings');
  }

  if (addedSteps.length > 0) {
    if (addedSteps.length <= 3) {
      summary.push(`Added steps: ${addedSteps.join(', ')}`);
    } else {
      summary.push(`Added ${addedSteps.length} steps`);
    }
  }

  if (removedSteps.length > 0) {
    if (removedSteps.length <= 3) {
      summary.push(`Removed steps: ${removedSteps.join(', ')}`);
    } else {
      summary.push(`Removed ${removedSteps.length} steps`);
    }
  }

  if (updatedSteps.length > 0) {
    if (updatedSteps.length <= 3) {
      summary.push(`Updated steps: ${updatedSteps.join(', ')}`);
    } else {
      summary.push(`Updated ${updatedSteps.length} steps`);
    }
  }

  if (movedSteps.length > 0) {
    if (movedSteps.length <= 3) {
      summary.push(`Reordered steps: ${movedSteps.join(', ')}`);
    } else {
      summary.push(`Reordered ${movedSteps.length} steps`);
    }
  }

  return summary.length > 0 ? summary : ['Made changes to workflow'];
}

// ============================================================================
// Small Edit Detection
// ============================================================================

/**
 * Determine if a plan qualifies as a "small edit" — too minor to take over the right panel.
 * Small edits show only a chat card; large edits/creates get the full ProposalBanner.
 */
export function isSmallEdit(plan: PendingPlan): boolean {
  if (plan.mode !== 'edit') return false;
  const ops = plan.operations || [];
  const { smallEditMaxOps, alwaysFullPreviewOps } = COPILOT_SETTINGS.proposal;
  if (ops.length > smallEditMaxOps) return false;
  return !ops.some((op) => alwaysFullPreviewOps.some((t) => (op.op as string).includes(t)));
}
