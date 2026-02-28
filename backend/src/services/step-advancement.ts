/**
 * Step Advancement Service
 *
 * Determines which step(s) to activate when a step completes.
 * Handles linear steps, branching (SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH),
 * and parallel branches.
 *
 * Current model: Steps are stored in a flat array indexed by stepIndex.
 * Branch steps record their decision in resultData for DDR purposes but
 * do not yet create dynamic sub-step executions. This service provides
 * the abstraction layer so that when nested branch execution is needed,
 * only this module needs to change.
 */

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
      condition?: { field: string; operator: string; value: string };
      steps?: StepDef[];
    }>;
  };
  paths?: Array<{
    pathId: string;
    label: string;
    condition?: { field: string; operator: string; value: string };
    steps?: StepDef[];
  }>;
}

interface StepExecution {
  id: string;
  stepId: string;
  stepIndex: number;
  status: string;
}

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

  // Default: linear advancement
  return getLinearNext(currentIndex, allStepExecutions);
}

function getLinearNext(currentIndex: number, allStepExecutions: StepExecution[]): string[] {
  const next = allStepExecutions.find(
    se => se.stepIndex === currentIndex + 1 && se.status === 'PENDING'
  );
  return next ? [next.id] : [];
}

/**
 * SINGLE_CHOICE_BRANCH: The result data contains a `selectedPathId` or
 * `selectedOption`. In the current flat step model, branch steps don't
 * have nested sub-steps in stepExecutions. The branch result is stored
 * for DDR purposes.
 *
 * When nested branch execution is needed in the future, this function
 * will need to create step executions dynamically for the chosen path.
 */
function handleSingleChoiceBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef,
  _resultData?: Record<string, unknown>
): string[] {
  // In the flat model, advance linearly.
  // The branch result is stored for future DDR resolution.
  return getLinearNext(currentIndex, allStepExecutions);
}

function handleMultiChoiceBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef,
  _resultData?: Record<string, unknown>
): string[] {
  // Same as single choice in the flat model.
  return getLinearNext(currentIndex, allStepExecutions);
}

function handleParallelBranch(
  currentIndex: number,
  allStepExecutions: StepExecution[],
  _stepDef: StepDef
): string[] {
  // In the flat model, advance linearly.
  // True parallel execution would activate multiple paths simultaneously.
  return getLinearNext(currentIndex, allStepExecutions);
}
