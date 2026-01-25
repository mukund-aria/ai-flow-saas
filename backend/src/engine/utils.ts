/**
 * Engine Utilities
 *
 * Helper functions for manipulating workflow structures.
 */

import type { Flow } from '../models/workflow.js';
import type { Step, BranchPath, DecisionOutcome } from '../models/steps.js';
import { isBranchStep, isDecisionStep } from '../models/steps.js';

// ============================================================================
// Step Finding
// ============================================================================

export interface StepLocation {
  found: boolean;
  step?: Step;
  parent?: Step[] | BranchPath | DecisionOutcome;
  index?: number;
  path?: string;
}

/**
 * Find a step by ID anywhere in the workflow
 */
export function findStepById(flow: Flow, stepId: string): StepLocation {
  // Search main path
  const mainResult = findStepInArray(flow.steps, stepId, 'steps');
  if (mainResult.found) return mainResult;

  // Search nested paths
  return findStepInNestedPaths(flow.steps, stepId, 'steps');
}

/**
 * Find a step in a flat array
 */
function findStepInArray(
  steps: Step[],
  stepId: string,
  path: string
): StepLocation {
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].stepId === stepId) {
      return {
        found: true,
        step: steps[i],
        parent: steps,
        index: i,
        path: `${path}[${i}]`,
      };
    }
  }
  return { found: false };
}

/**
 * Recursively search nested paths (branches and decisions)
 */
function findStepInNestedPaths(
  steps: Step[],
  stepId: string,
  basePath: string
): StepLocation {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const stepPath = `${basePath}[${i}]`;

    if (isBranchStep(step)) {
      for (const branchPath of step.paths) {
        // Check in this path
        const result = findStepInArray(
          branchPath.steps,
          stepId,
          `${stepPath}.paths[${branchPath.pathId}].steps`
        );
        if (result.found) return result;

        // Check nested paths within
        const nestedResult = findStepInNestedPaths(
          branchPath.steps,
          stepId,
          `${stepPath}.paths[${branchPath.pathId}].steps`
        );
        if (nestedResult.found) return nestedResult;
      }
    } else if (isDecisionStep(step)) {
      for (const outcome of step.outcomes) {
        // Check in this outcome
        const result = findStepInArray(
          outcome.steps,
          stepId,
          `${stepPath}.outcomes[${outcome.outcomeId}].steps`
        );
        if (result.found) return result;

        // Check nested paths within
        const nestedResult = findStepInNestedPaths(
          outcome.steps,
          stepId,
          `${stepPath}.outcomes[${outcome.outcomeId}].steps`
        );
        if (nestedResult.found) return nestedResult;
      }
    }
  }
  return { found: false };
}

/**
 * Find a step in the main path only
 */
export function findStepInMainPath(flow: Flow, stepId: string): StepLocation {
  return findStepInArray(flow.steps, stepId, 'steps');
}

/**
 * Find a branch step by ID
 */
export function findBranchStep(
  flow: Flow,
  branchStepId: string
): StepLocation & { branchStep?: Step } {
  const location = findStepById(flow, branchStepId);
  if (!location.found || !location.step) {
    return { found: false };
  }
  if (!isBranchStep(location.step)) {
    return { found: false };
  }
  return { ...location, branchStep: location.step };
}

/**
 * Find a decision step by ID
 */
export function findDecisionStep(
  flow: Flow,
  decisionStepId: string
): StepLocation & { decisionStep?: Step } {
  const location = findStepById(flow, decisionStepId);
  if (!location.found || !location.step) {
    return { found: false };
  }
  if (!isDecisionStep(location.step)) {
    return { found: false };
  }
  return { ...location, decisionStep: location.step };
}

/**
 * Find a path within a branch step
 */
export function findBranchPath(
  step: Step,
  pathId: string
): BranchPath | undefined {
  if (!isBranchStep(step)) return undefined;
  return step.paths.find(p => p.pathId === pathId);
}

/**
 * Find an outcome within a decision step
 */
export function findDecisionOutcome(
  step: Step,
  outcomeId: string
): DecisionOutcome | undefined {
  if (!isDecisionStep(step)) return undefined;
  return step.outcomes.find(o => o.outcomeId === outcomeId);
}

// ============================================================================
// Array Manipulation
// ============================================================================

/**
 * Insert a step after a given step ID in an array
 * Returns true if successful
 */
export function insertStepAfter(
  steps: Step[],
  afterStepId: string,
  newStep: Step
): boolean {
  const index = steps.findIndex(s => s.stepId === afterStepId);
  if (index === -1) return false;
  steps.splice(index + 1, 0, newStep);
  return true;
}

/**
 * Insert a step before a given step ID in an array
 * Returns true if successful
 */
export function insertStepBefore(
  steps: Step[],
  beforeStepId: string,
  newStep: Step
): boolean {
  const index = steps.findIndex(s => s.stepId === beforeStepId);
  if (index === -1) return false;
  steps.splice(index, 0, newStep);
  return true;
}

/**
 * Insert a step at the beginning of an array
 */
export function insertStepAtStart(steps: Step[], newStep: Step): void {
  steps.unshift(newStep);
}

/**
 * Remove a step by ID from an array
 * Returns the removed step or undefined
 */
export function removeStepById(steps: Step[], stepId: string): Step | undefined {
  const index = steps.findIndex(s => s.stepId === stepId);
  if (index === -1) return undefined;
  return steps.splice(index, 1)[0];
}

/**
 * Move a step within an array
 * Returns true if successful
 */
export function moveStepInArray(
  steps: Step[],
  stepId: string,
  afterStepId: string | null
): boolean {
  const currentIndex = steps.findIndex(s => s.stepId === stepId);
  if (currentIndex === -1) return false;

  const step = steps.splice(currentIndex, 1)[0];

  if (afterStepId === null) {
    steps.unshift(step);
    return true;
  }

  const newIndex = steps.findIndex(s => s.stepId === afterStepId);
  if (newIndex === -1) {
    // Restore original position
    steps.splice(currentIndex, 0, step);
    return false;
  }

  steps.splice(newIndex + 1, 0, step);
  return true;
}

// ============================================================================
// Deep Clone
// ============================================================================

/**
 * Deep clone a workflow (to avoid mutating the original)
 */
export function cloneFlow(flow: Flow): Flow {
  return JSON.parse(JSON.stringify(flow));
}

/**
 * Deep clone a step
 */
export function cloneStep(step: Step): Step {
  return JSON.parse(JSON.stringify(step));
}

// ============================================================================
// Merge Updates
// ============================================================================

/**
 * Merge partial updates into a step (shallow merge at top level)
 */
export function mergeStepUpdates(step: Step, updates: Partial<Step>): Step {
  return { ...step, ...updates } as Step;
}
