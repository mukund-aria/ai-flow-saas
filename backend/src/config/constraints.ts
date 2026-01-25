/**
 * Constraints Access
 *
 * Provides easy access to platform constraint values.
 * All constraints are loaded from config/constraints.yaml
 */

import { getConstraints, type ConstraintsConfig } from './loader.js';

// ============================================================================
// Constraint Accessors
// ============================================================================

/**
 * Get all constraints
 */
export function getAllConstraints(): ConstraintsConfig {
  return getConstraints();
}

// --- Branching Constraints ---

export function getMaxParallelPaths(): number {
  return getConstraints().branching.maxParallelPaths;
}

export function getMaxDecisionOutcomes(): number {
  return getConstraints().branching.maxDecisionOutcomes;
}

export function getMaxBranchNestingDepth(): number {
  return getConstraints().branching.maxNestingDepth;
}

export function areMilestonesAllowedInBranches(): boolean {
  return getConstraints().branching.milestonesInsideBranches;
}

export function mustBranchFitSingleMilestone(): boolean {
  return getConstraints().branching.branchMustFitSingleMilestone;
}

// --- Goto Constraints ---

export function getGotoAllowedContainers(): string[] {
  return getConstraints().goto.allowedInside;
}

export function isGotoAllowedIn(stepType: string): boolean {
  return getConstraints().goto.allowedInside.includes(stepType);
}

export function mustGotoTargetMainPath(): boolean {
  return getConstraints().goto.targetMustBeOnMainPath;
}

// --- Terminate Constraints ---

export function getTerminateAllowedContainers(): string[] {
  return getConstraints().terminate.allowedInside;
}

export function isTerminateAllowedIn(stepType: string): boolean {
  return getConstraints().terminate.allowedInside.includes(stepType);
}

export function getValidTerminateStatuses(): string[] {
  return getConstraints().terminate.validStatuses;
}

export function isValidTerminateStatus(status: string): boolean {
  return getConstraints().terminate.validStatuses.includes(status);
}

// --- Variable Constraints ---

export function getAllowedVariableTypes(): string[] {
  return getConstraints().variables.allowedTypes;
}

export function isValidVariableType(type: string): boolean {
  return getConstraints().variables.allowedTypes.includes(type);
}

export function areVariablesImmutable(): boolean {
  return getConstraints().variables.immutable;
}

// --- Feature Flags ---

export function isSubflowSupported(): boolean {
  return getConstraints().features.subflowSupported;
}

// --- Completion Modes ---

export function getValidCompletionModes(): string[] {
  return getConstraints().completionModes;
}

export function isValidCompletionMode(mode: string): boolean {
  return getConstraints().completionModes.includes(mode);
}

// --- Assignee Order Options ---

export function getValidAssigneeOrderOptions(): string[] {
  return getConstraints().assigneeOrderOptions;
}

export function isValidAssigneeOrder(order: string): boolean {
  return getConstraints().assigneeOrderOptions.includes(order);
}

// ============================================================================
// Constraint Validation Helpers
// ============================================================================

/**
 * Check if a number of paths is valid for a parallel branch
 */
export function isValidParallelPathCount(count: number): boolean {
  return count >= 2 && count <= getMaxParallelPaths();
}

/**
 * Check if a number of outcomes is valid for a decision
 */
export function isValidDecisionOutcomeCount(count: number): boolean {
  return count >= 2 && count <= getMaxDecisionOutcomes();
}

/**
 * Check if a nesting depth is valid
 */
export function isValidNestingDepth(depth: number): boolean {
  return depth <= getMaxBranchNestingDepth();
}
