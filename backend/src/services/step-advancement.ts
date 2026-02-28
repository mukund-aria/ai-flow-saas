/**
 * Step Advancement Service
 *
 * Determines which step(s) to activate when a step completes.
 * Handles linear steps, branching (SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH),
 * and parallel branches.
 *
 * Branch steps create dynamic sub-step executions for the selected path(s).
 * The dynamicIndex column orders these sub-steps within the branch.
 * The branchPath column tags which path each sub-step belongs to.
 * The parallelGroupId column groups steps that run in parallel.
 */

import { db, stepExecutions } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { evaluateCondition, buildEvaluationContext, type Condition, type EvaluationContext } from './condition-evaluator.js';

// ============================================================================
// Types
// ============================================================================

interface StepDef {
  stepId?: string;
  id?: string;
  type: string;
  config?: {
    name?: string;
    assignee?: string;
    paths?: Array<{
      pathId: string;
      label: string;
      isDefault?: boolean;
      condition?: Condition;
      steps?: StepDef[];
    }>;
  };
  paths?: Array<{
    pathId: string;
    label: string;
    isDefault?: boolean;
    condition?: Condition;
    steps?: StepDef[];
  }>;
}

interface StepExecution {
  id: string;
  stepId: string;
  stepIndex: number;
  status: string;
  branchPath?: string | null;
  parallelGroupId?: string | null;
}

interface BranchResult {
  /** Step execution IDs to activate (set to IN_PROGRESS / WAITING_FOR_ASSIGNEE) */
  nextIds: string[];
  /** Newly created step execution IDs (for awareness, e.g. logging) */
  createdIds: string[];
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Given a completed step, determine the next step execution(s) to activate.
 * Returns an array of step execution IDs to set to IN_PROGRESS.
 * Returns empty array if the flow is complete (no more steps).
 */
export function getNextStepExecutions(
  completedStep: StepExecution,
  allStepExecutions: StepExecution[],
  stepDefs: StepDef[],
  resultData?: Record<string, unknown>
): string[] {
  const currentIndex = completedStep.stepIndex;
  const currentStepDef = stepDefs[currentIndex];

  if (!currentStepDef) {
    // No definition found - fall back to linear
    return getLinearNext(currentIndex, allStepExecutions);
  }

  const stepType = currentStepDef.type;

  if (stepType === 'SINGLE_CHOICE_BRANCH') {
    return handleSingleChoiceBranch(currentIndex, allStepExecutions, currentStepDef, resultData);
  }

  if (stepType === 'MULTI_CHOICE_BRANCH') {
    return handleMultiChoiceBranch(currentIndex, allStepExecutions, currentStepDef, resultData);
  }

  if (stepType === 'PARALLEL_BRANCH') {
    return handleParallelBranch(currentIndex, allStepExecutions, currentStepDef);
  }

  // Check if this step is part of a parallel group - handle parallel convergence
  if (completedStep.parallelGroupId) {
    return handleParallelStepCompletion(completedStep, allStepExecutions, stepDefs);
  }

  // Default: linear advancement
  return getLinearNext(currentIndex, allStepExecutions);
}

/**
 * Async version that creates dynamic step executions in the database
 * for branch steps. Call this instead of getNextStepExecutions when
 * you need branch step creation.
 */
export async function advanceStepAsync(
  completedStep: StepExecution,
  allStepExecutions: StepExecution[],
  stepDefs: StepDef[],
  flowRunId: string,
  resultData?: Record<string, unknown>,
  evaluationContext?: EvaluationContext
): Promise<BranchResult> {
  const currentIndex = completedStep.stepIndex;
  const currentStepDef = stepDefs[currentIndex];

  if (!currentStepDef) {
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  const stepType = currentStepDef.type;

  if (stepType === 'SINGLE_CHOICE_BRANCH') {
    return handleSingleChoiceBranchAsync(
      currentIndex, allStepExecutions, currentStepDef, flowRunId, resultData
    );
  }

  if (stepType === 'MULTI_CHOICE_BRANCH') {
    return handleMultiChoiceBranchAsync(
      currentIndex, allStepExecutions, currentStepDef, flowRunId, resultData, evaluationContext
    );
  }

  if (stepType === 'PARALLEL_BRANCH') {
    return handleParallelBranchAsync(
      currentIndex, allStepExecutions, currentStepDef, flowRunId
    );
  }

  // Parallel convergence check
  if (completedStep.parallelGroupId) {
    return {
      nextIds: handleParallelStepCompletion(completedStep, allStepExecutions, stepDefs),
      createdIds: [],
    };
  }

  return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
}

// ============================================================================
// Linear Advancement
// ============================================================================

function getLinearNext(currentIndex: number, allStepExecutions: StepExecution[]): string[] {
  const next = allStepExecutions.find(
    se => se.stepIndex === currentIndex + 1 && se.status === 'PENDING'
  );
  return next ? [next.id] : [];
}

// ============================================================================
// Synchronous Branch Handlers (for backward compatibility)
// ============================================================================

function handleSingleChoiceBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef,
  _resultData?: Record<string, unknown>
): string[] {
  // Sync version: fall back to linear if no dynamic steps exist yet.
  // The async version (handleSingleChoiceBranchAsync) creates them.
  return getLinearNext(currentIndex, allStepExecutions);
}

function handleMultiChoiceBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef,
  _resultData?: Record<string, unknown>
): string[] {
  return getLinearNext(currentIndex, allStepExecutions);
}

function handleParallelBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef
): string[] {
  return getLinearNext(currentIndex, allStepExecutions);
}

// ============================================================================
// Async Branch Handlers (with DB step creation)
// ============================================================================

/**
 * SINGLE_CHOICE_BRANCH: The user selects one path.
 * Reads `resultData.selectedPathId` to determine which path was chosen.
 * Creates step executions for the chosen path's nested steps.
 */
async function handleSingleChoiceBranchAsync(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  stepDef: StepDef,
  flowRunId: string,
  resultData?: Record<string, unknown>
): Promise<BranchResult> {
  const paths = stepDef.config?.paths || stepDef.paths || [];
  if (paths.length === 0) {
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  const selectedPathId = resultData?.selectedPathId as string | undefined;

  // Find the selected path, or fall back to the first path (default)
  let selectedPath = selectedPathId
    ? paths.find(p => p.pathId === selectedPathId)
    : undefined;

  if (!selectedPath) {
    console.warn(`[StepAdvancement] No matching path for selectedPathId="${selectedPathId}", using first path as default`);
    selectedPath = paths[0];
  }

  const nestedSteps = selectedPath.steps || [];
  if (nestedSteps.length === 0) {
    // Empty path - advance to next step after the branch
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  // Create step executions for the selected path's steps
  const createdIds = await createBranchStepExecutions(
    flowRunId,
    currentIndex,
    selectedPath.pathId,
    nestedSteps,
    undefined // no parallelGroupId
  );

  // Return the first created step as the next to activate
  return { nextIds: createdIds.length > 0 ? [createdIds[0]] : [], createdIds };
}

/**
 * MULTI_CHOICE_BRANCH: Conditions on each path are evaluated automatically.
 * The first path whose condition evaluates to true is selected.
 * Falls back to the default path if no conditions match.
 */
async function handleMultiChoiceBranchAsync(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  stepDef: StepDef,
  flowRunId: string,
  resultData?: Record<string, unknown>,
  evaluationContext?: EvaluationContext
): Promise<BranchResult> {
  const paths = stepDef.config?.paths || stepDef.paths || [];
  if (paths.length === 0) {
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  const ctx: EvaluationContext = evaluationContext || {
    kickoffData: {},
    stepOutputs: {},
  };

  // Evaluate each path's condition; first match wins
  let matchedPath = paths.find(p => {
    if (!p.condition) return false;
    return evaluateCondition(p.condition, ctx);
  });

  // Fall back to default path if no condition matched
  if (!matchedPath) {
    matchedPath = paths.find(p => p.isDefault) || paths[paths.length - 1];
  }

  const nestedSteps = matchedPath.steps || [];
  if (nestedSteps.length === 0) {
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  const createdIds = await createBranchStepExecutions(
    flowRunId,
    currentIndex,
    matchedPath.pathId,
    nestedSteps,
    undefined
  );

  return { nextIds: createdIds.length > 0 ? [createdIds[0]] : [], createdIds };
}

/**
 * PARALLEL_BRANCH: All paths run simultaneously.
 * Creates step executions for every path and activates the first step of each.
 */
async function handleParallelBranchAsync(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  stepDef: StepDef,
  flowRunId: string
): Promise<BranchResult> {
  const paths = stepDef.config?.paths || stepDef.paths || [];
  if (paths.length === 0) {
    return { nextIds: getLinearNext(currentIndex, allStepExecutions), createdIds: [] };
  }

  const branchStepId = stepDef.stepId || stepDef.id || `branch-${currentIndex}`;
  const parallelGroupId = `parallel-${branchStepId}`;

  const allCreatedIds: string[] = [];
  const firstStepIds: string[] = [];

  for (const path of paths) {
    const nestedSteps = path.steps || [];
    if (nestedSteps.length === 0) continue;

    const createdIds = await createBranchStepExecutions(
      flowRunId,
      currentIndex,
      path.pathId,
      nestedSteps,
      parallelGroupId
    );

    allCreatedIds.push(...createdIds);
    if (createdIds.length > 0) {
      firstStepIds.push(createdIds[0]);
    }
  }

  return { nextIds: firstStepIds, createdIds: allCreatedIds };
}

// ============================================================================
// Parallel Convergence
// ============================================================================

/**
 * When a step in a parallel group completes, check if all steps in the
 * parallel group are complete. If so, advance past the branch step.
 */
function handleParallelStepCompletion(
  completedStep: StepExecution,
  allStepExecutions: StepExecution[],
  stepDefs: StepDef[]
): string[] {
  const groupId = completedStep.parallelGroupId;
  if (!groupId) return [];

  // Find all steps in this parallel group
  const groupSteps = allStepExecutions.filter(se => se.parallelGroupId === groupId);

  // Check if all group steps are COMPLETED (excluding the one we just completed,
  // which may not yet be updated in the allStepExecutions array)
  const allComplete = groupSteps.every(
    se => se.id === completedStep.id || se.status === 'COMPLETED'
  );

  if (!allComplete) {
    // Not all parallel paths are done yet - within the same path,
    // advance to the next step in this path
    const samePath = groupSteps
      .filter(se => se.branchPath === completedStep.branchPath)
      .sort((a, b) => (a.stepIndex !== b.stepIndex ? a.stepIndex - b.stepIndex : 0));

    const currentIdx = samePath.findIndex(se => se.id === completedStep.id);
    if (currentIdx >= 0 && currentIdx < samePath.length - 1) {
      const nextInPath = samePath[currentIdx + 1];
      if (nextInPath.status === 'PENDING') {
        return [nextInPath.id];
      }
    }

    return [];
  }

  // All parallel paths are complete - advance past the branch
  // Find the branch step that started this parallel group
  // The parallelGroupId format is `parallel-{branchStepId}`
  const branchStepId = groupId.replace('parallel-', '');
  const branchExec = allStepExecutions.find(
    se => (se.stepId === branchStepId) && !se.parallelGroupId
  );

  if (branchExec) {
    return getLinearNext(branchExec.stepIndex, allStepExecutions);
  }

  return [];
}

// ============================================================================
// Conditional Step Skip Logic
// ============================================================================

export interface SkipCondition {
  source: string;
  operator: string;
  value?: any;
}

/**
 * Evaluate whether a step should be skipped based on its skipCondition config.
 * Returns true if the step should be skipped.
 */
export function shouldSkipStep(
  stepDef: StepDef,
  evaluationContext: EvaluationContext
): boolean {
  const skipCondition = (stepDef.config as any)?.skipCondition as SkipCondition | undefined;
  if (!skipCondition || !skipCondition.source) return false;

  return evaluateCondition(
    { source: skipCondition.source, operator: skipCondition.operator, value: skipCondition.value },
    evaluationContext
  );
}

/**
 * Check if a step should be skipped and find the next non-skipped step.
 * Returns the IDs of steps to skip and the first non-skipped step to activate.
 * Handles chained skips (if multiple consecutive steps should be skipped).
 */
export function evaluateSkipChain(
  stepExecId: string,
  allStepExecutions: StepExecution[],
  stepDefs: StepDef[],
  evaluationContext: EvaluationContext
): { skipIds: string[]; nextId: string | null } {
  const skipIds: string[] = [];
  let currentExec = allStepExecutions.find(se => se.id === stepExecId);

  while (currentExec) {
    const stepDef = stepDefs[currentExec.stepIndex];
    if (!stepDef || !shouldSkipStep(stepDef, evaluationContext)) {
      // This step should not be skipped — activate it
      return { skipIds, nextId: skipIds.length > 0 ? currentExec.id : null };
    }

    // This step should be skipped
    skipIds.push(currentExec.id);

    // Find the next step
    const nextIds = getLinearNext(currentExec.stepIndex, allStepExecutions);
    if (nextIds.length === 0) {
      // No more steps — flow is done
      return { skipIds, nextId: null };
    }

    currentExec = allStepExecutions.find(se => se.id === nextIds[0]);
  }

  return { skipIds, nextId: null };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create step execution records for a branch path's nested steps.
 * Returns the IDs of all created step executions in order.
 */
async function createBranchStepExecutions(
  flowRunId: string,
  branchStepIndex: number,
  pathId: string,
  nestedSteps: StepDef[],
  parallelGroupId?: string
): Promise<string[]> {
  const createdIds: string[] = [];

  for (let i = 0; i < nestedSteps.length; i++) {
    const nestedStep = nestedSteps[i];
    const stepId = nestedStep.stepId || nestedStep.id || `${pathId}-step-${i}`;

    const [inserted] = await db.insert(stepExecutions)
      .values({
        flowRunId,
        stepId,
        stepIndex: branchStepIndex,
        status: 'PENDING',
        branchPath: pathId,
        parallelGroupId: parallelGroupId || null,
        dynamicIndex: i,
      })
      .returning({ id: stepExecutions.id });

    if (inserted) {
      createdIds.push(inserted.id);
    }
  }

  return createdIds;
}
