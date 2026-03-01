/**
 * Step Completion Service
 *
 * Shared helper that encapsulates the complete step → advance flow logic.
 * Used by coordinator routes (runs.ts), assignee routes (public-task.ts),
 * sub-flow propagation (execution.ts), and the automation executor.
 */

import { db, flowRuns, stepExecutions, stepExecutionAssignees, contacts } from '../db/index.js';
import { eq } from 'drizzle-orm';
import type { CompletionMode } from '../db/schema.js';
import {
  onStepActivated,
  onStepCompleted,
  onFlowCompleted,
  updateFlowActivity,
  handleSubFlowStep,
} from './execution.js';
import { getNextStepExecutions } from './step-advancement.js';

// ============================================================================
// Types
// ============================================================================

export interface CompleteStepOpts {
  /** The step execution ID to complete */
  stepExecutionId: string;
  /** Result data to store on the step */
  resultData: Record<string, unknown>;
  /** The run with flow and stepExecutions loaded */
  run: {
    id: string;
    name: string;
    organizationId: string;
    startedById: string;
    flowId: string;
    dueAt?: Date | string | null;
    flow?: {
      id: string;
      name: string;
      definition?: Record<string, unknown> | null;
    } | null;
    stepExecutions: Array<{
      id: string;
      stepId: string;
      stepIndex: number;
      status: string;
      flowRunId: string;
      assignedToContactId?: string | null;
      resultData?: Record<string, unknown> | null;
      parallelGroupId?: string | null;
    }>;
  };
  /** Step definitions from the flow definition */
  stepDefs: Array<Record<string, unknown>>;
  /** Skip AI review (used by automation executor) */
  skipAIReview?: boolean;
  /** Skip auto-execution trigger (used internally to prevent double-execution) */
  skipAutoExec?: boolean;
}

export interface CompleteStepResult {
  completed: boolean;
  revisionNeeded?: boolean;
  feedback?: string;
  issues?: Array<Record<string, unknown>>;
  nextStepId?: string;
  flowCompleted?: boolean;
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Complete a step and advance the flow to the next step.
 *
 * This is the single source of truth for step completion logic.
 * It handles:
 * 1. Marking step as COMPLETED with resultData
 * 2. Calling onStepCompleted() + updateFlowActivity()
 * 3. Determining the next step via getNextStepExecutions()
 * 4. Activating next step (IN_PROGRESS, onStepActivated())
 * 5. SUB_FLOW auto-start
 * 6. Contact assignee magic link creation
 * 7. Updating currentStepIndex on the run
 * 8. If no next step, marking run COMPLETED + calling onFlowCompleted()
 * 9. Triggering maybeAutoExecute() on the next step if it auto-completes
 */
export async function completeStepAndAdvance(
  opts: CompleteStepOpts
): Promise<CompleteStepResult> {
  const { stepExecutionId, resultData, run, stepDefs, skipAIReview, skipAutoExec } = opts;

  // Find the step execution
  const stepExecution = run.stepExecutions.find(
    (se) => se.id === stepExecutionId
  );
  if (!stepExecution) {
    return { completed: false };
  }

  // Mark the step as completed
  await db
    .update(stepExecutions)
    .set({
      status: 'COMPLETED',
      resultData: resultData || {},
      completedAt: new Date(),
    })
    .where(eq(stepExecutions.id, stepExecutionId));

  // Notify: step completed (cancel jobs, notify coordinator, emit SSE)
  await onStepCompleted(stepExecution, run);
  await updateFlowActivity(run.id);

  // Determine the next step(s)
  const nextStepIds = getNextStepExecutions(
    stepExecution as any,
    run.stepExecutions as any[],
    stepDefs as any[],
    resultData
  );

  const nextStep = nextStepIds.length > 0
    ? run.stepExecutions.find((se) => se.id === nextStepIds[0])
    : undefined;

  if (nextStep) {
    // Start the next step
    await db
      .update(stepExecutions)
      .set({
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      })
      .where(eq(stepExecutions.id, nextStep.id));

    // Schedule notification jobs for the next step
    const nextStepDef = stepDefs.find(
      (s: any) => (s.stepId || s.id) === nextStep.stepId
    ) as Record<string, unknown> | undefined;
    const nextStepDue =
      (nextStepDef as any)?.due || (nextStepDef as any)?.config?.due;
    const runDueAt = run.dueAt ? new Date(run.dueAt as string) : null;
    await onStepActivated(
      nextStep.id,
      nextStepDue,
      run.flow?.definition as Record<string, unknown>,
      runDueAt
    );

    // If next step is a SUB_FLOW, start the child flow automatically
    if ((nextStepDef as any)?.type === 'SUB_FLOW') {
      await handleSubFlowStep(
        nextStep.id,
        nextStepDef as Record<string, unknown>,
        {
          id: run.id,
          organizationId: run.organizationId,
          startedById: run.startedById,
          flowId: run.flowId,
          name: run.name,
        }
      );
    }

    // If next step is a group assignment, create magic links for all assignees
    if ((nextStep as any).isGroupAssignment) {
      try {
        const { createMagicLink } = await import('./magic-link.js');
        const { sendMagicLink } = await import('./email.js');
        const assignees = await db.query.stepExecutionAssignees.findMany({
          where: eq(stepExecutionAssignees.stepExecutionId, nextStep.id),
        });
        for (const assignee of assignees) {
          if (assignee.contactId) {
            const token = await createMagicLink(nextStep.id, 168, assignee.id);
            const contact = await db.query.contacts.findFirst({
              where: eq(contacts.id, assignee.contactId),
            });
            if (contact) {
              await sendMagicLink({
                to: contact.email,
                contactName: contact.name,
                stepName: `Step ${nextStep.stepIndex + 1}`,
                flowName: run.flow?.name || 'Flow',
                token,
              });
            }
          }
        }
      } catch (err) {
        console.error('[StepCompletion] Failed to send group magic links:', err);
      }
    } else if (nextStep.assignedToContactId) {
      // Single assignee - create one magic link
      try {
        const { createMagicLink } = await import('./magic-link.js');
        const { sendMagicLink } = await import('./email.js');
        const token = await createMagicLink(nextStep.id);
        const contact = await db.query.contacts.findFirst({
          where: eq(contacts.id, nextStep.assignedToContactId),
        });
        if (contact) {
          await sendMagicLink({
            to: contact.email,
            contactName: contact.name,
            stepName: `Step ${nextStep.stepIndex + 1}`,
            flowName: run.flow?.name || 'Flow',
            token,
          });
        }
      } catch (err) {
        console.error('[StepCompletion] Failed to send magic link:', err);
      }
    }

    // Update current step index on the run
    await db
      .update(flowRuns)
      .set({ currentStepIndex: nextStep.stepIndex })
      .where(eq(flowRuns.id, run.id));

    // Trigger auto-execution if the next step auto-completes
    // Skip if called from within the automation executor's own loop
    if (!skipAutoExec) {
      try {
        const { maybeAutoExecute } = await import('./automation-executor.js');
        await maybeAutoExecute(nextStep.id, nextStepDef as any, run);
      } catch (err) {
        console.error('[StepCompletion] Auto-execute check failed:', err);
      }
    }

    return { completed: true, nextStepId: nextStep.id };
  } else {
    // No more steps - mark run as completed
    await db
      .update(flowRuns)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
      })
      .where(eq(flowRuns.id, run.id));

    // Notify: flow completed
    await onFlowCompleted(run);

    return { completed: true, flowCompleted: true };
  }
}

// ============================================================================
// Group Assignment Completion
// ============================================================================

export interface GroupCompletionResult {
  advanced: boolean;
  completedCount: number;
  totalCount: number;
}

/**
 * Evaluate whether a group-assigned step should advance based on completion mode.
 *
 * This is called when an individual assignee completes their portion of a
 * group-assigned step. It:
 * 1. Marks the individual assignee row as COMPLETED
 * 2. Queries all assignees for this step execution
 * 3. Applies the completion mode (ANY_ONE / ALL / MAJORITY)
 * 4. If the step should complete, calls completeStepAndAdvance()
 */
export async function evaluateGroupCompletion(
  stepExecutionId: string,
  assigneeId: string,
  resultData: Record<string, unknown>,
  run: CompleteStepOpts['run'],
  stepDefs: CompleteStepOpts['stepDefs']
): Promise<GroupCompletionResult> {
  // 1. Mark the individual assignee as COMPLETED
  await db
    .update(stepExecutionAssignees)
    .set({
      status: 'COMPLETED',
      resultData,
      completedAt: new Date(),
    })
    .where(eq(stepExecutionAssignees.id, assigneeId));

  // 2. Get the step execution to read completionMode
  const stepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, stepExecutionId),
  });

  if (!stepExec) {
    return { advanced: false, completedCount: 0, totalCount: 0 };
  }

  // 3. Query all assignees for this step
  const allAssignees = await db.query.stepExecutionAssignees.findMany({
    where: eq(stepExecutionAssignees.stepExecutionId, stepExecutionId),
  });

  const totalCount = allAssignees.length;
  const completedCount = allAssignees.filter((a) => a.status === 'COMPLETED').length;
  const completionMode = (stepExec.completionMode || 'ANY_ONE') as CompletionMode;

  // 4. Evaluate completion mode
  let shouldAdvance = false;

  switch (completionMode) {
    case 'ANY_ONE':
      shouldAdvance = completedCount >= 1;
      break;
    case 'ALL':
      shouldAdvance = completedCount >= totalCount;
      break;
    case 'MAJORITY':
      shouldAdvance = completedCount > totalCount / 2;
      break;
  }

  // 5. If step should complete, call the main completion flow
  if (shouldAdvance && stepExec.status !== 'COMPLETED') {
    // Aggregate result data from all completed assignees
    const aggregatedResult: Record<string, unknown> = {
      _groupCompletion: {
        mode: completionMode,
        totalAssignees: totalCount,
        completedAssignees: completedCount,
        submissions: allAssignees
          .filter((a) => a.status === 'COMPLETED')
          .map((a) => ({
            assigneeId: a.id,
            contactId: a.contactId,
            userId: a.userId,
            resultData: a.resultData,
            completedAt: a.completedAt,
          })),
      },
      // Use the triggering assignee's data as the primary result
      ...resultData,
    };

    await completeStepAndAdvance({
      stepExecutionId,
      resultData: aggregatedResult,
      run,
      stepDefs,
    });

    return { advanced: true, completedCount, totalCount };
  }

  return { advanced: false, completedCount, totalCount };
}
