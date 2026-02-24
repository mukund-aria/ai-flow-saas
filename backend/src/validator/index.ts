/**
 * Workflow Validator
 *
 * Validates workflows against all platform constraints.
 * Supports two modes:
 * - STRICT: Fails on unknown step types (for our generated output)
 * - LENIENT: Warns on unknown step types (for incoming Moxo data)
 */

import type { Flow, ValidationError, ValidationResult } from '../models/workflow.js';
import type { Step } from '../models/steps.js';
import { isBranchStep, isDecisionStep, hasNestedSteps } from '../models/steps.js';
import { isKnownStepType } from '../config/step-registry.js';
import {
  getMaxParallelPaths,
  getMaxDecisionOutcomes,
  getMaxBranchNestingDepth,
  isGotoAllowedIn,
  isTerminateAllowedIn,
  mustBranchFitSingleMilestone,
  areMilestonesAllowedInBranches,
  mustGotoTargetMainPath,
  isValidTerminateStatus,
} from '../config/constraints.js';

// ============================================================================
// Validation Mode
// ============================================================================

export type ValidationMode = 'STRICT' | 'LENIENT';

export interface ValidateOptions {
  mode: ValidationMode;
}

const DEFAULT_OPTIONS: ValidateOptions = {
  mode: 'STRICT',
};

// ============================================================================
// Main Validator
// ============================================================================

/**
 * Validate a workflow against all constraints
 */
export function validateWorkflow(
  flow: Flow,
  options: ValidateOptions = DEFAULT_OPTIONS
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Helper to add error/warning based on mode
  const addIssue = (
    error: ValidationError,
    treatAsWarning = false
  ): void => {
    if (treatAsWarning || options.mode === 'LENIENT') {
      warnings.push({ ...error, severity: 'warning' });
    } else {
      errors.push({ ...error, severity: 'error' });
    }
  };

  // Run all validation rules
  validateFlowStructure(flow, addIssue);
  validateMilestones(flow, addIssue);
  validateStepIds(flow, addIssue);
  validateStepTypes(flow, addIssue, options.mode);
  validateMainPathSteps(flow, addIssue);
  validateBranching(flow, addIssue);
  validateBranchConditions(flow, addIssue);
  validateDecisions(flow, addIssue);
  validateGotoDestinations(flow, addIssue);
  validateTerminateSteps(flow, addIssue);
  validateAssignees(flow, addIssue);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// Validation Rules
// ============================================================================

type IssueAdder = (error: ValidationError, treatAsWarning?: boolean) => void;

/**
 * Validate basic flow structure
 */
function validateFlowStructure(flow: Flow, addIssue: IssueAdder): void {
  if (!flow.flowId) {
    addIssue({
      path: 'flowId',
      rule: 'REQUIRED_FIELD',
      message: 'Flow must have a flowId',
      severity: 'error',
    });
  }

  if (!flow.name) {
    addIssue({
      path: 'name',
      rule: 'REQUIRED_FIELD',
      message: 'Flow must have a name',
      severity: 'error',
    });
  }

  if (!flow.steps || !Array.isArray(flow.steps)) {
    addIssue({
      path: 'steps',
      rule: 'REQUIRED_FIELD',
      message: 'Flow must have a steps array',
      severity: 'error',
    });
  }

  // Milestones are optional - but if present, they must be valid
  // The milestoneId requirement on steps is enforced only when milestones exist
}

/**
 * Validate milestones
 */
function validateMilestones(flow: Flow, addIssue: IssueAdder): void {
  const milestoneIds = new Set<string>();

  for (let i = 0; i < flow.milestones.length; i++) {
    const milestone = flow.milestones[i];

    if (!milestone.milestoneId) {
      addIssue({
        path: `milestones[${i}].milestoneId`,
        rule: 'REQUIRED_FIELD',
        message: 'Milestone must have a milestoneId',
        severity: 'error',
      });
      continue;
    }

    if (milestoneIds.has(milestone.milestoneId)) {
      addIssue({
        path: `milestones[${i}].milestoneId`,
        rule: 'UNIQUE_ID',
        message: `Duplicate milestone ID: ${milestone.milestoneId}`,
        severity: 'error',
      });
    }
    milestoneIds.add(milestone.milestoneId);
  }
}

/**
 * Validate all step IDs are unique
 */
function validateStepIds(flow: Flow, addIssue: IssueAdder): void {
  const allStepIds = new Set<string>();

  function collectStepIds(steps: Step[], path: string): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${path}[${i}]`;

      if (!step.stepId) {
        addIssue({
          path: `${stepPath}.stepId`,
          rule: 'REQUIRED_FIELD',
          message: 'Step must have a stepId',
          severity: 'error',
        });
        continue;
      }

      if (allStepIds.has(step.stepId)) {
        addIssue({
          path: `${stepPath}.stepId`,
          rule: 'UNIQUE_ID',
          message: `Duplicate step ID: ${step.stepId}`,
          severity: 'error',
        });
      }
      allStepIds.add(step.stepId);

      // Collect IDs from nested steps
      if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          collectStepIds(branchPath.steps, `${stepPath}.paths[${branchPath.pathId}].steps`);
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          collectStepIds(outcome.steps, `${stepPath}.outcomes[${outcome.outcomeId}].steps`);
        }
      }
    }
  }

  collectStepIds(flow.steps, 'steps');
}

/**
 * Validate step types are known
 */
function validateStepTypes(
  flow: Flow,
  addIssue: IssueAdder,
  mode: ValidationMode
): void {
  function checkStepTypes(steps: Step[], path: string): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${path}[${i}]`;

      if (!isKnownStepType(step.type)) {
        addIssue(
          {
            path: `${stepPath}.type`,
            rule: 'UNKNOWN_STEP_TYPE',
            message: `Unknown step type: ${step.type}`,
            severity: mode === 'STRICT' ? 'error' : 'warning',
          },
          mode === 'LENIENT'
        );
      }

      // Check nested steps
      if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          checkStepTypes(branchPath.steps, `${stepPath}.paths[${branchPath.pathId}].steps`);
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          checkStepTypes(outcome.steps, `${stepPath}.outcomes[${outcome.outcomeId}].steps`);
        }
      }
    }
  }

  checkStepTypes(flow.steps, 'steps');
}

/**
 * Validate main path steps have valid milestone IDs
 * Note: milestoneId is only required if the flow has milestones defined
 */
function validateMainPathSteps(flow: Flow, addIssue: IssueAdder): void {
  // If no milestones, steps don't need milestoneId
  if (!flow.milestones || flow.milestones.length === 0) {
    return;
  }

  const validMilestoneIds = new Set(flow.milestones.map(m => m.milestoneId));

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    const stepPath = `steps[${i}]`;

    // GOTO doesn't need milestoneId
    if (step.type === 'GOTO') continue;

    if (!step.milestoneId) {
      addIssue({
        path: `${stepPath}.milestoneId`,
        rule: 'REQUIRED_FIELD',
        message: `Step must have a milestoneId when milestones are defined`,
        severity: 'error',
      });
    } else if (!validMilestoneIds.has(step.milestoneId)) {
      addIssue({
        path: `${stepPath}.milestoneId`,
        rule: 'INVALID_REFERENCE',
        message: `Invalid milestoneId: ${step.milestoneId}`,
        severity: 'error',
      });
    }
  }
}

/**
 * Validate branching constraints
 */
function validateBranching(flow: Flow, addIssue: IssueAdder): void {
  const maxPaths = getMaxParallelPaths();
  const maxDepth = getMaxBranchNestingDepth();

  function validateBranchStep(
    step: Step,
    path: string,
    currentDepth: number,
    parentMilestoneId?: string
  ): void {
    if (!isBranchStep(step)) return;

    // Check nesting depth
    if (currentDepth > maxDepth) {
      addIssue({
        path,
        rule: 'MAX_NESTING_DEPTH',
        message: `Branch nesting depth ${currentDepth} exceeds maximum ${maxDepth}`,
        severity: 'error',
      });
    }

    // Check path count
    if (step.paths.length > maxPaths) {
      addIssue({
        path: `${path}.paths`,
        rule: 'MAX_PARALLEL_PATHS',
        message: `Branch has ${step.paths.length} paths, maximum is ${maxPaths}`,
        severity: 'error',
      });
    }

    // Check paths have minimum count
    if (step.paths.length < 2) {
      addIssue({
        path: `${path}.paths`,
        rule: 'MIN_PATHS',
        message: `Branch must have at least 2 paths`,
        severity: 'error',
      });
    }

    // Check milestone consistency within branch
    if (mustBranchFitSingleMilestone()) {
      for (const branchPath of step.paths) {
        for (const nestedStep of branchPath.steps) {
          if (nestedStep.milestoneId && nestedStep.milestoneId !== step.milestoneId) {
            addIssue({
              path: `${path}.paths[${branchPath.pathId}]`,
              rule: 'BRANCH_MILESTONE_CONSISTENCY',
              message: `All steps in branch must have same milestoneId as branch (${step.milestoneId})`,
              severity: 'error',
            });
            break;
          }
        }
      }
    }

    // Recursively validate nested branches
    for (const branchPath of step.paths) {
      for (let i = 0; i < branchPath.steps.length; i++) {
        const nestedStep = branchPath.steps[i];
        if (isBranchStep(nestedStep)) {
          validateBranchStep(
            nestedStep,
            `${path}.paths[${branchPath.pathId}].steps[${i}]`,
            currentDepth + 1,
            step.milestoneId
          );
        }
      }
    }
  }

  // Validate all branches in main path
  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    if (isBranchStep(step)) {
      validateBranchStep(step, `steps[${i}]`, 1);
    }
  }
}

/**
 * Valid condition types for branch paths
 */
const VALID_CONDITION_TYPES = ['EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'NOT_EMPTY', 'ELSE'];
const VALID_CONDITION_LOGIC = ['ALL', 'ANY'];
const MAX_CONDITIONS_PER_PATH = 10;

/**
 * Validate branch path conditions (condition types, multiple conditions, conditionLogic)
 */
function validateBranchConditions(flow: Flow, addIssue: IssueAdder): void {
  function validatePathConditions(
    branchPath: { pathId: string; condition?: { type: string }; conditions?: Array<{ type: string }>; conditionLogic?: string; steps: Step[] },
    stepPath: string,
    pathIndex: number
  ): void {
    const pathPath = `${stepPath}.paths[${pathIndex}]`;

    // Validate single condition type
    if (branchPath.condition) {
      if (!VALID_CONDITION_TYPES.includes(branchPath.condition.type)) {
        addIssue({
          path: `${pathPath}.condition.type`,
          rule: 'INVALID_CONDITION_TYPE',
          message: `Invalid condition type: ${branchPath.condition.type}. Valid types: ${VALID_CONDITION_TYPES.join(', ')}`,
          severity: 'error',
        });
      }
    }

    // Validate multiple conditions
    if (branchPath.conditions && Array.isArray(branchPath.conditions)) {
      if (branchPath.conditions.length > MAX_CONDITIONS_PER_PATH) {
        addIssue({
          path: `${pathPath}.conditions`,
          rule: 'MAX_CONDITIONS_PER_PATH',
          message: `Path has ${branchPath.conditions.length} conditions, maximum is ${MAX_CONDITIONS_PER_PATH}`,
          severity: 'error',
        });
      }

      for (let ci = 0; ci < branchPath.conditions.length; ci++) {
        const cond = branchPath.conditions[ci];
        if (!VALID_CONDITION_TYPES.includes(cond.type)) {
          addIssue({
            path: `${pathPath}.conditions[${ci}].type`,
            rule: 'INVALID_CONDITION_TYPE',
            message: `Invalid condition type: ${cond.type}. Valid types: ${VALID_CONDITION_TYPES.join(', ')}`,
            severity: 'error',
          });
        }
      }

      // conditionLogic is required when multiple conditions are present
      if (branchPath.conditions.length > 1) {
        if (!branchPath.conditionLogic) {
          addIssue({
            path: `${pathPath}.conditionLogic`,
            rule: 'REQUIRED_FIELD',
            message: `conditionLogic is required when multiple conditions are specified (use 'ALL' or 'ANY')`,
            severity: 'error',
          });
        } else if (!VALID_CONDITION_LOGIC.includes(branchPath.conditionLogic)) {
          addIssue({
            path: `${pathPath}.conditionLogic`,
            rule: 'INVALID_CONDITION_LOGIC',
            message: `Invalid conditionLogic: ${branchPath.conditionLogic}. Valid values: ${VALID_CONDITION_LOGIC.join(', ')}`,
            severity: 'error',
          });
        }
      }
    }

    // Validate conditionLogic value if present
    if (branchPath.conditionLogic && !VALID_CONDITION_LOGIC.includes(branchPath.conditionLogic)) {
      addIssue({
        path: `${pathPath}.conditionLogic`,
        rule: 'INVALID_CONDITION_LOGIC',
        message: `Invalid conditionLogic: ${branchPath.conditionLogic}. Valid values: ${VALID_CONDITION_LOGIC.join(', ')}`,
        severity: 'error',
      });
    }
  }

  function findBranchSteps(steps: Step[], basePath: string): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${basePath}[${i}]`;

      if (isBranchStep(step)) {
        for (let pi = 0; pi < step.paths.length; pi++) {
          const branchPath = step.paths[pi] as unknown as {
            pathId: string;
            condition?: { type: string };
            conditions?: Array<{ type: string }>;
            conditionLogic?: string;
            steps: Step[];
          };
          validatePathConditions(branchPath, stepPath, pi);

          // Recurse into nested steps
          findBranchSteps(branchPath.steps, `${stepPath}.paths[${pi}].steps`);
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          findBranchSteps(outcome.steps, `${stepPath}.outcomes[${outcome.outcomeId}].steps`);
        }
      }
    }
  }

  findBranchSteps(flow.steps, 'steps');
}

/**
 * Validate decision constraints
 */
function validateDecisions(flow: Flow, addIssue: IssueAdder): void {
  const maxOutcomes = getMaxDecisionOutcomes();

  function validateDecisionStep(step: Step, path: string): void {
    if (!isDecisionStep(step)) return;

    // Check single assignee
    if (Array.isArray(step.assignee)) {
      addIssue({
        path: `${path}.assignee`,
        rule: 'DECISION_SINGLE_ASSIGNEE',
        message: 'Decision must have exactly one assignee (not an array)',
        severity: 'error',
      });
    }

    // Check outcome count
    if (step.outcomes.length > maxOutcomes) {
      addIssue({
        path: `${path}.outcomes`,
        rule: 'MAX_DECISION_OUTCOMES',
        message: `Decision has ${step.outcomes.length} outcomes, maximum is ${maxOutcomes}`,
        severity: 'error',
      });
    }

    if (step.outcomes.length < 2) {
      addIssue({
        path: `${path}.outcomes`,
        rule: 'MIN_OUTCOMES',
        message: `Decision must have at least 2 outcomes`,
        severity: 'error',
      });
    }

    // Check unique outcome IDs
    const outcomeIds = new Set<string>();
    for (const outcome of step.outcomes) {
      if (outcomeIds.has(outcome.outcomeId)) {
        addIssue({
          path: `${path}.outcomes`,
          rule: 'UNIQUE_ID',
          message: `Duplicate outcome ID: ${outcome.outcomeId}`,
          severity: 'error',
        });
      }
      outcomeIds.add(outcome.outcomeId);
    }
  }

  // Find all decisions (including nested)
  function findDecisions(steps: Step[], basePath: string): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${basePath}[${i}]`;

      if (isDecisionStep(step)) {
        validateDecisionStep(step, stepPath);
        // Also check nested steps in decision outcomes
        for (const outcome of step.outcomes) {
          findDecisions(outcome.steps, `${stepPath}.outcomes[${outcome.outcomeId}].steps`);
        }
      } else if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          findDecisions(branchPath.steps, `${stepPath}.paths[${branchPath.pathId}].steps`);
        }
      }
    }
  }

  findDecisions(flow.steps, 'steps');
}

/**
 * Validate GOTO and GOTO_DESTINATION constraints
 */
function validateGotoDestinations(flow: Flow, addIssue: IssueAdder): void {
  // Collect all GOTO_DESTINATION IDs on main path
  const mainPathDestinations = new Set<string>();
  for (const step of flow.steps) {
    if (step.type === 'GOTO_DESTINATION') {
      mainPathDestinations.add(step.stepId);
    }
  }

  // Find all GOTO steps and validate
  function findGotoSteps(
    steps: Step[],
    basePath: string,
    allowedContainer: string | null
  ): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${basePath}[${i}]`;

      if (step.type === 'GOTO') {
        // Check if GOTO is in allowed container
        if (!allowedContainer || !isGotoAllowedIn(allowedContainer)) {
          addIssue({
            path: stepPath,
            rule: 'GOTO_PLACEMENT',
            message: `GOTO can only be placed inside DECISION or SINGLE_CHOICE_BRANCH paths`,
            severity: 'error',
          });
        }

        // Check target exists on main path
        const gotoStep = step as { targetGotoDestinationId: string };
        if (mustGotoTargetMainPath() && !mainPathDestinations.has(gotoStep.targetGotoDestinationId)) {
          addIssue({
            path: `${stepPath}.targetGotoDestinationId`,
            rule: 'GOTO_TARGET_MAIN_PATH',
            message: `GOTO target ${gotoStep.targetGotoDestinationId} must be on main path`,
            severity: 'error',
          });
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          findGotoSteps(
            outcome.steps,
            `${stepPath}.outcomes[${outcome.outcomeId}].steps`,
            'DECISION'
          );
        }
      } else if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          findGotoSteps(
            branchPath.steps,
            `${stepPath}.paths[${branchPath.pathId}].steps`,
            step.type
          );
        }
      }
    }
  }

  findGotoSteps(flow.steps, 'steps', null);
}

/**
 * Validate TERMINATE constraints
 */
function validateTerminateSteps(flow: Flow, addIssue: IssueAdder): void {
  function findTerminateSteps(
    steps: Step[],
    basePath: string,
    allowedContainer: string | null
  ): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${basePath}[${i}]`;

      if (step.type === 'TERMINATE') {
        // Check if TERMINATE is in allowed container
        if (!allowedContainer || !isTerminateAllowedIn(allowedContainer)) {
          addIssue({
            path: stepPath,
            rule: 'TERMINATE_PLACEMENT',
            message: `TERMINATE can only be placed inside DECISION or SINGLE_CHOICE_BRANCH paths`,
            severity: 'error',
          });
        }

        // Check valid status
        const terminateStep = step as { status: string };
        if (!isValidTerminateStatus(terminateStep.status)) {
          addIssue({
            path: `${stepPath}.status`,
            rule: 'TERMINATE_STATUS',
            message: `Invalid terminate status: ${terminateStep.status}`,
            severity: 'error',
          });
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          findTerminateSteps(
            outcome.steps,
            `${stepPath}.outcomes[${outcome.outcomeId}].steps`,
            'DECISION'
          );
        }
      } else if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          findTerminateSteps(
            branchPath.steps,
            `${stepPath}.paths[${branchPath.pathId}].steps`,
            step.type
          );
        }
      }
    }
  }

  findTerminateSteps(flow.steps, 'steps', null);
}

/**
 * Validate assignee references
 */
function validateAssignees(flow: Flow, addIssue: IssueAdder): void {
  const validPlaceholderIds = new Set(
    flow.assigneePlaceholders?.map(p => p.placeholderId) ?? []
  );

  function validateAssigneeRef(
    ref: { mode: string; placeholderId: string } | unknown,
    path: string
  ): void {
    if (!ref || typeof ref !== 'object') return;

    const assigneeRef = ref as { mode?: string; placeholderId?: string };
    if (assigneeRef.mode === 'PLACEHOLDER' && assigneeRef.placeholderId) {
      if (!validPlaceholderIds.has(assigneeRef.placeholderId)) {
        addIssue({
          path,
          rule: 'INVALID_REFERENCE',
          message: `Invalid assignee placeholder: ${assigneeRef.placeholderId}`,
          severity: 'error',
        });
      }
    }
  }

  function validateStepAssignees(step: Step, path: string): void {
    const stepAny = step as unknown as Record<string, unknown>;

    // Check assignee field
    if ('assignee' in stepAny) {
      validateAssigneeRef(stepAny.assignee, `${path}.assignee`);
    }

    // Check assignees array
    if ('assignees' in stepAny) {
      const assignees = stepAny.assignees;
      if (Array.isArray(assignees)) {
        for (let i = 0; i < assignees.length; i++) {
          validateAssigneeRef(assignees[i], `${path}.assignees[${i}]`);
        }
      } else {
        validateAssigneeRef(assignees, `${path}.assignees`);
      }
    }

    // Check reviewer
    if ('reviewer' in stepAny) {
      validateAssigneeRef(stepAny.reviewer, `${path}.reviewer`);
    }

    // Check signers
    if ('signers' in stepAny && Array.isArray(stepAny.signers)) {
      for (let i = 0; i < stepAny.signers.length; i++) {
        validateAssigneeRef(stepAny.signers[i], `${path}.signers[${i}]`);
      }
    }
  }

  function validateAllSteps(steps: Step[], basePath: string): void {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const stepPath = `${basePath}[${i}]`;

      validateStepAssignees(step, stepPath);

      if (isBranchStep(step)) {
        for (const branchPath of step.paths) {
          validateAllSteps(branchPath.steps, `${stepPath}.paths[${branchPath.pathId}].steps`);
        }
      } else if (isDecisionStep(step)) {
        for (const outcome of step.outcomes) {
          validateAllSteps(outcome.steps, `${stepPath}.outcomes[${outcome.outcomeId}].steps`);
        }
      }
    }
  }

  validateAllSteps(flow.steps, 'steps');
}

