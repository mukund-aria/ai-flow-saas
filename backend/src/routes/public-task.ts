/**
 * Public Task Routes
 *
 * Handles magic link task completion for external assignees.
 * No authentication required - access is via token.
 */

import { Router } from 'express';
import { db, magicLinks, stepExecutions, flowRuns, contacts, flowRunConversations, flowRunMessages, auditLogs } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
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

    // Trigger AI review if configured
    let aiReviewPending = false;
    const run0 = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, stepExec.flowRunId),
      with: { flow: true },
    });
    if (run0) {
      const def = run0.flow?.definition as any;
      const stepDef = def?.steps?.find((s: any) => s.stepId === stepExec.stepId);
      if (stepDef?.config?.fileRequest?.aiReview?.enabled && resultData?.fileNames?.length) {
        aiReviewPending = true;
        // Fire and forget - don't block step completion
        import('../services/ai-review.js').then(({ reviewFiles }) => {
          reviewFiles(
            stepExec.id,
            resultData.fileNames as string[],
            stepDef.config.fileRequest.aiReview.criteria
          ).catch(err => console.error('AI review error:', err));
        });
      }
    }

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

        // If next step has a contact assignee, create magic link and send email
        if (nextStep.assignedToContactId) {
          const { createMagicLink } = await import('../services/magic-link.js');
          const { sendMagicLink } = await import('../services/email.js');
          const mlToken = await createMagicLink(nextStep.id);
          const contact = await db.query.contacts.findFirst({
            where: eq(contacts.id, nextStep.assignedToContactId),
          });
          if (contact) {
            await sendMagicLink({
              to: contact.email,
              contactName: contact.name,
              stepName: `Step ${nextStep.stepIndex + 1}`,
              flowName: run.flow?.name || 'Flow',
              token: mlToken,
            });
          }
        }
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

    // Check if the next step is assigned to the same contact - return its magic link token
    let nextTaskToken: string | null = null;
    if (run) {
      const nextStep = run.stepExecutions.find(
        se => se.stepIndex === stepExec.stepIndex + 1
      );
      if (nextStep && nextStep.assignedToContactId === stepExec.assignedToContactId) {
        // Find or create magic link for the next step
        const existingLink = await db.query.magicLinks.findFirst({
          where: eq(magicLinks.stepExecutionId, nextStep.id),
        });
        if (existingLink && !existingLink.usedAt && new Date() < existingLink.expiresAt) {
          nextTaskToken = existingLink.token;
        }
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Task completed successfully',
        nextTaskToken,
        aiReviewPending,
      },
    });
  })
);

// ============================================================================
// GET /api/public/task/:token/ai-review - Get AI review status
// ============================================================================

router.get(
  '/:token/ai-review',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;

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

    const stepExec = link.stepExecution;
    if (!stepExec) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Step not found' },
      });
      return;
    }

    const resultData = (stepExec.resultData as Record<string, unknown>) || {};
    const aiReview = resultData._aiReview as { status: string; feedback: string; issues?: string[]; reviewedAt: string } | undefined;

    if (!aiReview) {
      res.json({
        success: true,
        data: { status: 'PENDING' },
      });
      return;
    }

    res.json({
      success: true,
      data: aiReview,
    });
  })
);

// ============================================================================
// GET /api/public/task/:token/activity - Get activity events for this flow run
// ============================================================================

router.get(
  '/:token/activity',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;

    const link = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.token, token),
      with: { stepExecution: true },
    });

    if (!link || new Date() > link.expiresAt) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Invalid or expired link' },
      });
      return;
    }

    const stepExec = link.stepExecution;
    if (!stepExec) {
      res.json({ success: true, data: [] });
      return;
    }

    // Query audit logs for this flow run
    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.flowRunId, stepExec.flowRunId),
      orderBy: (log, { desc }) => [desc(log.createdAt)],
      limit: 50,
    });

    // Map audit log actions to activity event types and descriptions
    const events = logs.map(log => {
      const details = (log.details || {}) as Record<string, unknown>;
      let type = 'step_completed';
      let description = log.action;

      switch (log.action) {
        case 'STEP_STARTED':
          type = 'step_started';
          description = `Step ${(details.stepIndex as number ?? 0) + 1} started`;
          break;
        case 'ASSIGNEE_TASK_COMPLETED':
          type = 'step_completed';
          description = `Step ${(details.stepIndex as number ?? 0) + 1} completed`;
          break;
        case 'REMINDER_SENT':
          type = 'reminder_sent';
          description = 'Reminder sent';
          break;
        case 'FLOW_STARTED':
          type = 'step_started';
          description = 'Flow started';
          break;
        case 'FLOW_COMPLETED':
          type = 'step_completed';
          description = 'Flow completed';
          break;
        default:
          description = log.action.replace(/_/g, ' ').toLowerCase();
      }

      return {
        id: log.id,
        type,
        description,
        timestamp: log.createdAt.toISOString(),
      };
    });

    res.json({
      success: true,
      data: events,
    });
  })
);

// ============================================================================
// GET /api/public/task/:token/messages - Get messages for assignee's conversation
// ============================================================================

router.get(
  '/:token/messages',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;

    // Validate magic link and get context
    const link = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.token, token),
      with: { stepExecution: true },
    });

    if (!link || new Date() > link.expiresAt) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
      return;
    }

    const stepExec = link.stepExecution;
    if (!stepExec?.assignedToContactId) {
      res.json({ success: true, data: [] });
      return;
    }

    // Find or create conversation for this contact + flow run
    let conversation = await db.query.flowRunConversations.findFirst({
      where: and(
        eq(flowRunConversations.flowRunId, stepExec.flowRunId),
        eq(flowRunConversations.contactId, stepExec.assignedToContactId)
      ),
    });

    if (!conversation) {
      // No conversation yet, return empty
      res.json({ success: true, data: [] });
      return;
    }

    const messages = await db.query.flowRunMessages.findMany({
      where: eq(flowRunMessages.conversationId, conversation.id),
      with: { attachments: true },
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    res.json({
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        senderType: m.senderType,
        senderName: m.senderName,
        content: m.content,
        attachments: m.attachments.map((a) => ({
          id: a.id,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: a.fileSize,
        })),
        createdAt: m.createdAt,
      })),
    });
  })
);

// ============================================================================
// POST /api/public/task/:token/messages - Send message as assignee
// ============================================================================

router.post(
  '/:token/messages',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;
    const { content } = req.body;

    if (!content?.trim()) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Message content is required' } });
      return;
    }

    // Validate magic link
    const link = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.token, token),
      with: { stepExecution: true },
    });

    if (!link || new Date() > link.expiresAt) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
      return;
    }

    const stepExec = link.stepExecution;
    if (!stepExec?.assignedToContactId) {
      res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'No contact assigned' } });
      return;
    }

    // Get contact info
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, stepExec.assignedToContactId),
    });

    if (!contact) {
      res.status(400).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
      return;
    }

    // Find or create conversation
    let conversation = await db.query.flowRunConversations.findFirst({
      where: and(
        eq(flowRunConversations.flowRunId, stepExec.flowRunId),
        eq(flowRunConversations.contactId, contact.id)
      ),
    });

    if (!conversation) {
      const [newConv] = await db.insert(flowRunConversations).values({
        flowRunId: stepExec.flowRunId,
        contactId: contact.id,
        lastMessageAt: new Date(),
      }).returning();
      conversation = newConv;
    }

    // Create the message
    const [message] = await db.insert(flowRunMessages).values({
      conversationId: conversation.id,
      flowRunId: stepExec.flowRunId,
      senderContactId: contact.id,
      senderType: 'contact',
      senderName: contact.name,
      content: content.trim(),
    }).returning();

    // Update conversation lastMessageAt
    await db.update(flowRunConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(flowRunConversations.id, conversation.id));

    res.json({
      success: true,
      data: {
        id: message.id,
        senderType: message.senderType,
        senderName: message.senderName,
        content: message.content,
        attachments: [],
        createdAt: message.createdAt,
      },
    });
  })
);

export default router;
