/**
 * Public Task Routes
 *
 * Handles magic link task completion for external assignees.
 * No authentication required - access is via token.
 */

import { Router } from 'express';
import { db, magicLinks, stepExecutions, flowRuns } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateMagicLink } from '../services/magic-link.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onStepCompleted, onFlowCompleted, updateFlowActivity } from '../services/execution.js';

const router = Router();

// ============================================================================
// GET /api/public/task/:token - Get task context
// ============================================================================

router.get(
  '/:token',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;

    const taskContext = await validateMagicLink(token);

    if (!taskContext) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' },
      });
      return;
    }

    if (taskContext.expired) {
      res.status(410).json({
        success: false,
        error: { code: 'EXPIRED', message: 'This task link has expired' },
      });
      return;
    }

    if (taskContext.completed) {
      res.status(200).json({
        success: true,
        data: { ...taskContext, alreadyCompleted: true },
      });
      return;
    }

    res.json({
      success: true,
      data: taskContext,
    });
  })
);

// ============================================================================
// POST /api/public/task/:token/complete - Submit task completion
// ============================================================================

router.post(
  '/:token/complete',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;
    const { resultData } = req.body;

    // Validate the magic link
    const link = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.token, token),
      with: { stepExecution: true },
    });

    if (!link) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' },
      });
      return;
    }

    if (link.usedAt) {
      res.status(400).json({
        success: false,
        error: { code: 'ALREADY_COMPLETED', message: 'This task has already been completed' },
      });
      return;
    }

    if (new Date() > link.expiresAt) {
      res.status(410).json({
        success: false,
        error: { code: 'EXPIRED', message: 'This task link has expired' },
      });
      return;
    }

    const stepExec = link.stepExecution;
    if (!stepExec || stepExec.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Step is not in a completable state' },
      });
      return;
    }

    // Mark the step as completed
    await db.update(stepExecutions)
      .set({
        status: 'COMPLETED',
        resultData: resultData || {},
        completedAt: new Date(),
      })
      .where(eq(stepExecutions.id, stepExec.id));

    // Mark magic link as used
    await db.update(magicLinks)
      .set({ usedAt: new Date() })
      .where(eq(magicLinks.id, link.id));

    // Advance the flow run to the next step
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, stepExec.flowRunId),
      with: {
        flow: true,
        stepExecutions: {
          orderBy: (se, { asc }) => [asc(se.stepIndex)],
        },
      },
    });

    if (run) {
      // Notify: step completed (cancel jobs, notify coordinator)
      await onStepCompleted(stepExec, run);
      await updateFlowActivity(run.id);

      const nextStep = run.stepExecutions.find(
        se => se.stepIndex === stepExec.stepIndex + 1
      );

      if (nextStep) {
        // Start the next step
        await db.update(stepExecutions)
          .set({ status: 'IN_PROGRESS', startedAt: new Date() })
          .where(eq(stepExecutions.id, nextStep.id));

        // Schedule notification jobs for the next step
        const definition = run.flow?.definition as { steps?: Array<{ id: string; due?: { value: number; unit: string } }> } | null;
        const nextStepDef = definition?.steps?.find(s => s.id === nextStep.stepId);
        await onStepActivated(nextStep.id, nextStepDef?.due, run.flow?.definition as Record<string, unknown>);

        await db.update(flowRuns)
          .set({ currentStepIndex: stepExec.stepIndex + 1 })
          .where(eq(flowRuns.id, run.id));

        // TODO: If next step has a contact assignee, create magic link and send email
      } else {
        // No more steps - mark run as completed
        await db.update(flowRuns)
          .set({ status: 'COMPLETED', completedAt: new Date() })
          .where(eq(flowRuns.id, run.id));

        // Notify: flow completed
        await onFlowCompleted(run);
      }
    }

    // Audit: assignee completed task via magic link
    logAction({
      flowRunId: stepExec.flowRunId,
      action: 'ASSIGNEE_TASK_COMPLETED',
      details: { stepId: stepExec.stepId, stepIndex: stepExec.stepIndex },
    });

    res.json({
      success: true,
      data: { message: 'Task completed successfully' },
    });
  })
);

export default router;
