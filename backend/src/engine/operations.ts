/**
 * Patch Operations Engine
 *
 * Applies edit operations to workflows deterministically.
 * Each operation is atomic - if it fails, the workflow is unchanged.
 */

import type { Flow } from '../models/workflow.js';
import type { Step, BranchPath, DecisionOutcome, TerminateStatus } from '../models/steps.js';
import type {
  Operation,
  OperationResult,
  ApplyOperationsResult,
  AddStepAfterOperation,
  AddStepBeforeOperation,
  RemoveStepOperation,
  UpdateStepOperation,
  MoveStepOperation,
  AddPathStepAfterOperation,
  AddPathStepBeforeOperation,
  RemovePathStepOperation,
  UpdatePathStepOperation,
  MovePathStepOperation,
  AddBranchPathOperation,
  RemoveBranchPathOperation,
  UpdateBranchPathConditionOperation,
  AddDecisionOutcomeOperation,
  RemoveDecisionOutcomeOperation,
  UpdateDecisionOutcomeLabelOperation,
  AddOutcomeStepAfterOperation,
  AddOutcomeStepBeforeOperation,
  RemoveOutcomeStepOperation,
  UpdateTerminateStatusOperation,
  UpdateGotoTargetOperation,
  AddMilestoneOperation,
  RemoveMilestoneOperation,
  UpdateMilestoneOperation,
  UpdateFlowNameOperation,
} from '../models/operations.js';
import { isBranchStep, isDecisionStep } from '../models/steps.js';
import {
  cloneFlow,
  findStepById,
  findStepInMainPath,
  findBranchStep,
  findDecisionStep,
  findBranchPath,
  findDecisionOutcome,
  insertStepAfter,
  insertStepBefore,
  insertStepAtStart,
  removeStepById,
  moveStepInArray,
  mergeStepUpdates,
} from './utils.js';

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Apply a list of operations to a workflow.
 * Operations are applied in order. If any fails, stops and returns partial results.
 */
export function applyOperations(
  flow: Flow,
  operations: Operation[]
): ApplyOperationsResult {
  // Clone to avoid mutating original
  const workingFlow = cloneFlow(flow);
  const results: OperationResult[] = [];

  for (const operation of operations) {
    const result = applyOperation(workingFlow, operation);
    results.push(result);

    if (!result.success) {
      return {
        success: false,
        results,
        finalWorkflow: undefined,
      };
    }
  }

  return {
    success: true,
    results,
    finalWorkflow: workingFlow,
  };
}

/**
 * Apply a single operation to a workflow (mutates the flow)
 */
function applyOperation(flow: Flow, operation: Operation): OperationResult {
  try {
    switch (operation.op) {
      // Main path operations
      case 'ADD_STEP_AFTER':
        return applyAddStepAfter(flow, operation);
      case 'ADD_STEP_BEFORE':
        return applyAddStepBefore(flow, operation);
      case 'REMOVE_STEP':
        return applyRemoveStep(flow, operation);
      case 'UPDATE_STEP':
        return applyUpdateStep(flow, operation);
      case 'MOVE_STEP':
        return applyMoveStep(flow, operation);

      // Branch path operations
      case 'ADD_PATH_STEP_AFTER':
        return applyAddPathStepAfter(flow, operation);
      case 'ADD_PATH_STEP_BEFORE':
        return applyAddPathStepBefore(flow, operation);
      case 'REMOVE_PATH_STEP':
        return applyRemovePathStep(flow, operation);
      case 'UPDATE_PATH_STEP':
        return applyUpdatePathStep(flow, operation);
      case 'MOVE_PATH_STEP':
        return applyMovePathStep(flow, operation);

      // Branch structure operations
      case 'ADD_BRANCH_PATH':
        return applyAddBranchPath(flow, operation);
      case 'REMOVE_BRANCH_PATH':
        return applyRemoveBranchPath(flow, operation);
      case 'UPDATE_BRANCH_PATH_CONDITION':
        return applyUpdateBranchPathCondition(flow, operation);

      // Decision operations
      case 'ADD_DECISION_OUTCOME':
        return applyAddDecisionOutcome(flow, operation);
      case 'REMOVE_DECISION_OUTCOME':
        return applyRemoveDecisionOutcome(flow, operation);
      case 'UPDATE_DECISION_OUTCOME_LABEL':
        return applyUpdateDecisionOutcomeLabel(flow, operation);
      case 'ADD_OUTCOME_STEP_AFTER':
        return applyAddOutcomeStepAfter(flow, operation);
      case 'ADD_OUTCOME_STEP_BEFORE':
        return applyAddOutcomeStepBefore(flow, operation);
      case 'REMOVE_OUTCOME_STEP':
        return applyRemoveOutcomeStep(flow, operation);

      // Special operations
      case 'UPDATE_TERMINATE_STATUS':
        return applyUpdateTerminateStatus(flow, operation);
      case 'UPDATE_GOTO_TARGET':
        return applyUpdateGotoTarget(flow, operation);

      // Milestone operations
      case 'ADD_MILESTONE':
        return applyAddMilestone(flow, operation);
      case 'REMOVE_MILESTONE':
        return applyRemoveMilestone(flow, operation);
      case 'UPDATE_MILESTONE':
        return applyUpdateMilestone(flow, operation);

      // Flow metadata operations
      case 'UPDATE_FLOW_NAME':
        return applyUpdateFlowName(flow, operation);

      default:
        return {
          success: false,
          operation,
          error: `Unknown operation type: ${(operation as { op: string }).op}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Main Path Operations
// ============================================================================

function applyAddStepAfter(
  flow: Flow,
  op: AddStepAfterOperation
): OperationResult {
  const success = insertStepAfter(flow.steps, op.afterStepId, op.step);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.afterStepId}`,
    };
  }
  return { success: true, operation: op };
}

function applyAddStepBefore(
  flow: Flow,
  op: AddStepBeforeOperation
): OperationResult {
  const success = insertStepBefore(flow.steps, op.beforeStepId, op.step);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.beforeStepId}`,
    };
  }
  return { success: true, operation: op };
}

function applyRemoveStep(flow: Flow, op: RemoveStepOperation): OperationResult {
  const removed = removeStepById(flow.steps, op.stepId);
  if (!removed) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.stepId}`,
    };
  }
  return { success: true, operation: op };
}

function applyUpdateStep(flow: Flow, op: UpdateStepOperation): OperationResult {
  const location = findStepById(flow, op.stepId);
  if (!location.found || !location.step || location.index === undefined) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.stepId}`,
    };
  }

  const parent = location.parent as Step[];
  parent[location.index] = mergeStepUpdates(location.step, op.updates);
  return { success: true, operation: op };
}

function applyMoveStep(flow: Flow, op: MoveStepOperation): OperationResult {
  const success = moveStepInArray(flow.steps, op.stepId, op.afterStepId);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Failed to move step: ${op.stepId}`,
    };
  }
  return { success: true, operation: op };
}

// ============================================================================
// Branch Path Operations
// ============================================================================

function applyAddPathStepAfter(
  flow: Flow,
  op: AddPathStepAfterOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  if (op.afterStepId === null) {
    insertStepAtStart(path.steps, op.step);
  } else {
    const success = insertStepAfter(path.steps, op.afterStepId, op.step);
    if (!success) {
      return {
        success: false,
        operation: op,
        error: `Step not found in path: ${op.afterStepId}`,
      };
    }
  }

  return { success: true, operation: op };
}

function applyAddPathStepBefore(
  flow: Flow,
  op: AddPathStepBeforeOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  const success = insertStepBefore(path.steps, op.beforeStepId, op.step);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Step not found in path: ${op.beforeStepId}`,
    };
  }

  return { success: true, operation: op };
}

function applyRemovePathStep(
  flow: Flow,
  op: RemovePathStepOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  const removed = removeStepById(path.steps, op.stepId);
  if (!removed) {
    return {
      success: false,
      operation: op,
      error: `Step not found in path: ${op.stepId}`,
    };
  }

  return { success: true, operation: op };
}

function applyUpdatePathStep(
  flow: Flow,
  op: UpdatePathStepOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  const index = path.steps.findIndex(s => s.stepId === op.stepId);
  if (index === -1) {
    return {
      success: false,
      operation: op,
      error: `Step not found in path: ${op.stepId}`,
    };
  }

  path.steps[index] = mergeStepUpdates(path.steps[index], op.updates);
  return { success: true, operation: op };
}

function applyMovePathStep(
  flow: Flow,
  op: MovePathStepOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  const success = moveStepInArray(path.steps, op.stepId, op.afterStepId);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Failed to move step: ${op.stepId}`,
    };
  }

  return { success: true, operation: op };
}

// ============================================================================
// Branch Structure Operations
// ============================================================================

function applyAddBranchPath(
  flow: Flow,
  op: AddBranchPathOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const branch = branchLocation.branchStep as { paths: BranchPath[] };
  branch.paths.push(op.path);

  return { success: true, operation: op };
}

function applyRemoveBranchPath(
  flow: Flow,
  op: RemoveBranchPathOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const branch = branchLocation.branchStep as { paths: BranchPath[] };
  const index = branch.paths.findIndex(p => p.pathId === op.pathId);
  if (index === -1) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  branch.paths.splice(index, 1);
  return { success: true, operation: op };
}

function applyUpdateBranchPathCondition(
  flow: Flow,
  op: UpdateBranchPathConditionOperation
): OperationResult {
  const branchLocation = findBranchStep(flow, op.branchStepId);
  if (!branchLocation.found || !branchLocation.branchStep) {
    return {
      success: false,
      operation: op,
      error: `Branch step not found: ${op.branchStepId}`,
    };
  }

  const path = findBranchPath(branchLocation.branchStep, op.pathId);
  if (!path) {
    return {
      success: false,
      operation: op,
      error: `Path not found: ${op.pathId}`,
    };
  }

  path.condition = op.condition;
  return { success: true, operation: op };
}

// ============================================================================
// Decision Operations
// ============================================================================

function applyAddDecisionOutcome(
  flow: Flow,
  op: AddDecisionOutcomeOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const decision = decisionLocation.decisionStep as { outcomes: DecisionOutcome[] };
  decision.outcomes.push(op.outcome);

  return { success: true, operation: op };
}

function applyRemoveDecisionOutcome(
  flow: Flow,
  op: RemoveDecisionOutcomeOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const decision = decisionLocation.decisionStep as { outcomes: DecisionOutcome[] };
  const index = decision.outcomes.findIndex(o => o.outcomeId === op.outcomeId);
  if (index === -1) {
    return {
      success: false,
      operation: op,
      error: `Outcome not found: ${op.outcomeId}`,
    };
  }

  decision.outcomes.splice(index, 1);
  return { success: true, operation: op };
}

function applyUpdateDecisionOutcomeLabel(
  flow: Flow,
  op: UpdateDecisionOutcomeLabelOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const outcome = findDecisionOutcome(decisionLocation.decisionStep, op.outcomeId);
  if (!outcome) {
    return {
      success: false,
      operation: op,
      error: `Outcome not found: ${op.outcomeId}`,
    };
  }

  outcome.label = op.label;
  return { success: true, operation: op };
}

function applyAddOutcomeStepAfter(
  flow: Flow,
  op: AddOutcomeStepAfterOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const outcome = findDecisionOutcome(decisionLocation.decisionStep, op.outcomeId);
  if (!outcome) {
    return {
      success: false,
      operation: op,
      error: `Outcome not found: ${op.outcomeId}`,
    };
  }

  if (op.afterStepId === null) {
    insertStepAtStart(outcome.steps, op.step);
  } else {
    const success = insertStepAfter(outcome.steps, op.afterStepId, op.step);
    if (!success) {
      return {
        success: false,
        operation: op,
        error: `Step not found in outcome: ${op.afterStepId}`,
      };
    }
  }

  return { success: true, operation: op };
}

function applyAddOutcomeStepBefore(
  flow: Flow,
  op: AddOutcomeStepBeforeOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const outcome = findDecisionOutcome(decisionLocation.decisionStep, op.outcomeId);
  if (!outcome) {
    return {
      success: false,
      operation: op,
      error: `Outcome not found: ${op.outcomeId}`,
    };
  }

  const success = insertStepBefore(outcome.steps, op.beforeStepId, op.step);
  if (!success) {
    return {
      success: false,
      operation: op,
      error: `Step not found in outcome: ${op.beforeStepId}`,
    };
  }

  return { success: true, operation: op };
}

function applyRemoveOutcomeStep(
  flow: Flow,
  op: RemoveOutcomeStepOperation
): OperationResult {
  const decisionLocation = findDecisionStep(flow, op.decisionStepId);
  if (!decisionLocation.found || !decisionLocation.decisionStep) {
    return {
      success: false,
      operation: op,
      error: `Decision step not found: ${op.decisionStepId}`,
    };
  }

  const outcome = findDecisionOutcome(decisionLocation.decisionStep, op.outcomeId);
  if (!outcome) {
    return {
      success: false,
      operation: op,
      error: `Outcome not found: ${op.outcomeId}`,
    };
  }

  const removed = removeStepById(outcome.steps, op.stepId);
  if (!removed) {
    return {
      success: false,
      operation: op,
      error: `Step not found in outcome: ${op.stepId}`,
    };
  }

  return { success: true, operation: op };
}

// ============================================================================
// Special Operations
// ============================================================================

function applyUpdateTerminateStatus(
  flow: Flow,
  op: UpdateTerminateStatusOperation
): OperationResult {
  const location = findStepById(flow, op.stepId);
  if (!location.found || !location.step) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.stepId}`,
    };
  }

  if (location.step.type !== 'TERMINATE') {
    return {
      success: false,
      operation: op,
      error: `Step is not a TERMINATE step: ${op.stepId}`,
    };
  }

  (location.step as { status: TerminateStatus }).status = op.status;
  return { success: true, operation: op };
}

function applyUpdateGotoTarget(
  flow: Flow,
  op: UpdateGotoTargetOperation
): OperationResult {
  const location = findStepById(flow, op.stepId);
  if (!location.found || !location.step) {
    return {
      success: false,
      operation: op,
      error: `Step not found: ${op.stepId}`,
    };
  }

  if (location.step.type !== 'GOTO') {
    return {
      success: false,
      operation: op,
      error: `Step is not a GOTO step: ${op.stepId}`,
    };
  }

  (location.step as { targetGotoDestinationId: string }).targetGotoDestinationId =
    op.targetGotoDestinationId;
  return { success: true, operation: op };
}

// ============================================================================
// Milestone Operations
// ============================================================================

function applyAddMilestone(
  flow: Flow,
  op: AddMilestoneOperation
): OperationResult {
  // Check for duplicate milestone ID
  if (flow.milestones.some(m => m.milestoneId === op.milestone.milestoneId)) {
    return {
      success: false,
      operation: op,
      error: `Milestone already exists: ${op.milestone.milestoneId}`,
    };
  }

  // Add the milestone
  flow.milestones.push(op.milestone);

  // Sort by sequence to maintain order
  flow.milestones.sort((a, b) => a.sequence - b.sequence);

  return { success: true, operation: op };
}

function applyRemoveMilestone(
  flow: Flow,
  op: RemoveMilestoneOperation
): OperationResult {
  const index = flow.milestones.findIndex(m => m.milestoneId === op.milestoneId);
  if (index === -1) {
    return {
      success: false,
      operation: op,
      error: `Milestone not found: ${op.milestoneId}`,
    };
  }

  // Check if any steps use this milestone
  const stepsUsingMilestone = flow.steps.filter(s => s.milestoneId === op.milestoneId);
  if (stepsUsingMilestone.length > 0) {
    return {
      success: false,
      operation: op,
      error: `Cannot remove milestone ${op.milestoneId}: ${stepsUsingMilestone.length} steps are assigned to it`,
    };
  }

  flow.milestones.splice(index, 1);
  return { success: true, operation: op };
}

function applyUpdateMilestone(
  flow: Flow,
  op: UpdateMilestoneOperation
): OperationResult {
  const milestone = flow.milestones.find(m => m.milestoneId === op.milestoneId);
  if (!milestone) {
    return {
      success: false,
      operation: op,
      error: `Milestone not found: ${op.milestoneId}`,
    };
  }

  // Apply updates
  if (op.updates.name !== undefined) {
    milestone.name = op.updates.name;
  }
  if (op.updates.sequence !== undefined) {
    milestone.sequence = op.updates.sequence;
    // Re-sort by sequence
    flow.milestones.sort((a, b) => a.sequence - b.sequence);
  }

  return { success: true, operation: op };
}

// ============================================================================
// Flow Metadata Operations
// ============================================================================

function applyUpdateFlowName(
  flow: Flow,
  op: UpdateFlowNameOperation
): OperationResult {
  flow.name = op.name;
  return { success: true, operation: op };
}
