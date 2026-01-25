/**
 * Patch Operation Types
 *
 * Defines the operations used to edit workflows.
 * Edits are expressed as a series of deterministic operations.
 */

import type { Step, BranchPath, DecisionOutcome, BranchCondition, TerminateStatus } from './steps.js';

// ============================================================================
// Operation Types
// ============================================================================

export type OperationType =
  // Main path operations
  | 'ADD_STEP_AFTER'
  | 'ADD_STEP_BEFORE'
  | 'REMOVE_STEP'
  | 'UPDATE_STEP'
  | 'MOVE_STEP'
  // Branch path operations
  | 'ADD_PATH_STEP_AFTER'
  | 'ADD_PATH_STEP_BEFORE'
  | 'REMOVE_PATH_STEP'
  | 'UPDATE_PATH_STEP'
  | 'MOVE_PATH_STEP'
  // Branch structure operations
  | 'ADD_BRANCH_PATH'
  | 'REMOVE_BRANCH_PATH'
  | 'UPDATE_BRANCH_PATH_CONDITION'
  // Decision operations
  | 'ADD_DECISION_OUTCOME'
  | 'REMOVE_DECISION_OUTCOME'
  | 'UPDATE_DECISION_OUTCOME_LABEL'
  | 'ADD_OUTCOME_STEP_AFTER'
  | 'ADD_OUTCOME_STEP_BEFORE'
  | 'REMOVE_OUTCOME_STEP'
  // Special operations
  | 'UPDATE_TERMINATE_STATUS'
  | 'UPDATE_GOTO_TARGET'
  // Workflow metadata operations
  | 'UPDATE_FLOW_NAME'
  | 'UPDATE_FLOW_SETTINGS'
  | 'ADD_MILESTONE'
  | 'REMOVE_MILESTONE'
  | 'UPDATE_MILESTONE'
  | 'ADD_ASSIGNEE_PLACEHOLDER'
  | 'REMOVE_ASSIGNEE_PLACEHOLDER'
  | 'UPDATE_ASSIGNEE_PLACEHOLDER';

// ============================================================================
// Main Path Operations
// ============================================================================

export interface AddStepAfterOperation {
  op: 'ADD_STEP_AFTER';
  afterStepId: string;
  step: Step;
}

export interface AddStepBeforeOperation {
  op: 'ADD_STEP_BEFORE';
  beforeStepId: string;
  step: Step;
}

export interface RemoveStepOperation {
  op: 'REMOVE_STEP';
  stepId: string;
}

export interface UpdateStepOperation {
  op: 'UPDATE_STEP';
  stepId: string;
  updates: Partial<Step>;
}

export interface MoveStepOperation {
  op: 'MOVE_STEP';
  stepId: string;
  afterStepId: string | null;  // null = move to beginning
}

// ============================================================================
// Branch Path Operations
// ============================================================================

export interface AddPathStepAfterOperation {
  op: 'ADD_PATH_STEP_AFTER';
  branchStepId: string;
  pathId: string;
  afterStepId: string | null;  // null = add as first step in path
  step: Step;
}

export interface AddPathStepBeforeOperation {
  op: 'ADD_PATH_STEP_BEFORE';
  branchStepId: string;
  pathId: string;
  beforeStepId: string;
  step: Step;
}

export interface RemovePathStepOperation {
  op: 'REMOVE_PATH_STEP';
  branchStepId: string;
  pathId: string;
  stepId: string;
}

export interface UpdatePathStepOperation {
  op: 'UPDATE_PATH_STEP';
  branchStepId: string;
  pathId: string;
  stepId: string;
  updates: Partial<Step>;
}

export interface MovePathStepOperation {
  op: 'MOVE_PATH_STEP';
  branchStepId: string;
  pathId: string;
  stepId: string;
  afterStepId: string | null;
}

// ============================================================================
// Branch Structure Operations
// ============================================================================

export interface AddBranchPathOperation {
  op: 'ADD_BRANCH_PATH';
  branchStepId: string;
  path: BranchPath;
}

export interface RemoveBranchPathOperation {
  op: 'REMOVE_BRANCH_PATH';
  branchStepId: string;
  pathId: string;
}

export interface UpdateBranchPathConditionOperation {
  op: 'UPDATE_BRANCH_PATH_CONDITION';
  branchStepId: string;
  pathId: string;
  condition: BranchCondition;
}

// ============================================================================
// Decision Operations
// ============================================================================

export interface AddDecisionOutcomeOperation {
  op: 'ADD_DECISION_OUTCOME';
  decisionStepId: string;
  outcome: DecisionOutcome;
}

export interface RemoveDecisionOutcomeOperation {
  op: 'REMOVE_DECISION_OUTCOME';
  decisionStepId: string;
  outcomeId: string;
}

export interface UpdateDecisionOutcomeLabelOperation {
  op: 'UPDATE_DECISION_OUTCOME_LABEL';
  decisionStepId: string;
  outcomeId: string;
  label: string;
}

export interface AddOutcomeStepAfterOperation {
  op: 'ADD_OUTCOME_STEP_AFTER';
  decisionStepId: string;
  outcomeId: string;
  afterStepId: string | null;
  step: Step;
}

export interface AddOutcomeStepBeforeOperation {
  op: 'ADD_OUTCOME_STEP_BEFORE';
  decisionStepId: string;
  outcomeId: string;
  beforeStepId: string;
  step: Step;
}

export interface RemoveOutcomeStepOperation {
  op: 'REMOVE_OUTCOME_STEP';
  decisionStepId: string;
  outcomeId: string;
  stepId: string;
}

// ============================================================================
// Special Operations
// ============================================================================

export interface UpdateTerminateStatusOperation {
  op: 'UPDATE_TERMINATE_STATUS';
  stepId: string;
  status: TerminateStatus;
}

export interface UpdateGotoTargetOperation {
  op: 'UPDATE_GOTO_TARGET';
  stepId: string;
  targetGotoDestinationId: string;
}

// ============================================================================
// Milestone Operations
// ============================================================================

export interface AddMilestoneOperation {
  op: 'ADD_MILESTONE';
  milestone: {
    milestoneId: string;
    name: string;
    sequence: number;
  };
}

export interface RemoveMilestoneOperation {
  op: 'REMOVE_MILESTONE';
  milestoneId: string;
}

export interface UpdateMilestoneOperation {
  op: 'UPDATE_MILESTONE';
  milestoneId: string;
  updates: {
    name?: string;
    sequence?: number;
  };
}

// ============================================================================
// Flow Metadata Operations
// ============================================================================

export interface UpdateFlowNameOperation {
  op: 'UPDATE_FLOW_NAME';
  name: string;
}

// ============================================================================
// Union Type for All Operations
// ============================================================================

export type Operation =
  // Main path
  | AddStepAfterOperation
  | AddStepBeforeOperation
  | RemoveStepOperation
  | UpdateStepOperation
  | MoveStepOperation
  // Branch path
  | AddPathStepAfterOperation
  | AddPathStepBeforeOperation
  | RemovePathStepOperation
  | UpdatePathStepOperation
  | MovePathStepOperation
  // Branch structure
  | AddBranchPathOperation
  | RemoveBranchPathOperation
  | UpdateBranchPathConditionOperation
  // Decision
  | AddDecisionOutcomeOperation
  | RemoveDecisionOutcomeOperation
  | UpdateDecisionOutcomeLabelOperation
  | AddOutcomeStepAfterOperation
  | AddOutcomeStepBeforeOperation
  | RemoveOutcomeStepOperation
  // Special
  | UpdateTerminateStatusOperation
  | UpdateGotoTargetOperation
  // Milestone
  | AddMilestoneOperation
  | RemoveMilestoneOperation
  | UpdateMilestoneOperation
  // Flow metadata
  | UpdateFlowNameOperation;

// ============================================================================
// Operation Result
// ============================================================================

export interface OperationResult {
  success: boolean;
  operation: Operation;
  error?: string;
}

export interface ApplyOperationsResult {
  success: boolean;
  results: OperationResult[];
  finalWorkflow?: unknown;  // The workflow after all operations
}

// ============================================================================
// AI Response Types
// ============================================================================

export interface CreateResponse {
  mode: 'create';
  workflow: unknown;  // Full workflow IR
}

export interface EditResponse {
  mode: 'edit';
  operations: Operation[];
}

export interface ClarifyQuestion {
  id: string;
  text: string;
}

export interface ClarifyResponse {
  mode: 'clarify';
  questions: ClarifyQuestion[];
}

export interface RejectResponse {
  mode: 'reject';
  reason: string;
  suggestion?: string;
}

export type AIResponse =
  | CreateResponse
  | EditResponse
  | ClarifyResponse
  | RejectResponse;

// ============================================================================
// Type Guards
// ============================================================================

export function isCreateResponse(response: AIResponse): response is CreateResponse {
  return response.mode === 'create';
}

export function isEditResponse(response: AIResponse): response is EditResponse {
  return response.mode === 'edit';
}

export function isClarifyResponse(response: AIResponse): response is ClarifyResponse {
  return response.mode === 'clarify';
}

export function isRejectResponse(response: AIResponse): response is RejectResponse {
  return response.mode === 'reject';
}
