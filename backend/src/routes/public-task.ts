/**
 * Public Task Routes
 *
 * Handles magic link task completion for external assignees.
 * No authentication required - access is via token.
 */

import { Router } from 'express';
import multer from 'multer';
import { db, magicLinks, stepExecutions, flows, contacts, flowConversations, flowMessages, auditLogs, files } from '../db/index.js';
import { eq, and, isNull } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateMagicLink } from '../services/magic-link.js';
import { logAction } from '../services/audit.js';
import { completeStepAndAdvance, evaluateGroupCompletion } from '../services/step-completion.js';
import { fileStorage } from '../services/file-storage.js';

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

    // Include files for this step if available
    let stepFiles: any[] = [];
    const linkForFiles = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.token, token),
    });
    if (linkForFiles?.stepExecutionId) {
      stepFiles = await db.query.files.findMany({
        where: and(
          eq(files.stepExecutionId, linkForFiles.stepExecutionId),
          isNull(files.deletedAt),
        ),
        orderBy: (f, { desc }) => [desc(f.createdAt)],
      });
    }

    res.json({
      success: true,
      data: { ...taskContext, files: stepFiles },
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

    // Check for AI Review before completing step
    let aiReviewPending = false;
    const flow0 = await db.query.flows.findFirst({
      where: eq(flows.id, stepExec.flowId),
      with: { template: true },
    });
    if (flow0) {
      const def = flow0.template?.definition as any;
      const stepDef = def?.steps?.find((s: any) => s.stepId === stepExec.stepId);

      // New AI Review system (synchronous, works on FORM/FILE_REQUEST/QUESTIONNAIRE)
      if (stepDef?.config?.aiReview?.enabled) {
        const { runAIReview } = await import('../services/ai-assignee.js');
        const reviewResult = await runAIReview(stepExec.id, stepDef, resultData || {});
        if (reviewResult.status === 'REVISION_NEEDED') {
          res.json({
            success: true,
            data: { revisionNeeded: true, feedback: reviewResult.feedback, issues: reviewResult.issues },
          });
          return;
        }
      }

      // Legacy file-request AI review (fire and forget)
      if (stepDef?.config?.fileRequest?.aiReview?.enabled && resultData?.fileNames?.length) {
        aiReviewPending = true;
        import('../services/ai-review.js').then(({ reviewFiles }) => {
          reviewFiles(
            stepExec.id,
            resultData.fileNames as string[],
            stepDef.config.fileRequest.aiReview.criteria
          ).catch(err => console.error('AI review error:', err));
        });
      }
    }

    // Mark magic link as used
    await db.update(magicLinks)
      .set({ usedAt: new Date() })
      .where(eq(magicLinks.id, link.id));

    // Advance the flow to the next step
    const flow = await db.query.flows.findFirst({
      where: eq(flows.id, stepExec.flowId),
      with: {
        template: true,
        stepExecutions: {
          orderBy: (se, { asc }) => [asc(se.stepIndex)],
        },
      },
    });

    // Track the next step ID for the "next task token" logic below
    let resolvedNextStep: { id: string; assignedToContactId: string | null; stepIndex: number } | undefined;
    let groupResult: { advanced: boolean; completedCount: number; totalCount: number } | undefined;

    if (flow) {
      const definition = flow.template?.definition as { steps?: Array<Record<string, unknown>> } | null;
      const stepDefs = (definition?.steps || []) as any[];

      // Check if this is a group assignment
      if (stepExec.isGroupAssignment && link.stepExecutionAssigneeId) {
        // Route through group completion evaluation
        groupResult = await evaluateGroupCompletion(
          stepExec.id,
          link.stepExecutionAssigneeId,
          resultData || {},
          flow as any,
          stepDefs
        );
      } else {
        // Standard single-assignee completion
        const result = await completeStepAndAdvance({
          stepExecutionId: stepExec.id,
          resultData: resultData || {},
          run: flow as any,
          stepDefs,
        });

        if (result.nextStepId) {
          resolvedNextStep = flow.stepExecutions.find(se => se.id === result.nextStepId) as any;
        }
      }
    }

    // Audit: assignee completed task via magic link
    logAction({
      flowId: stepExec.flowId,
      action: 'ASSIGNEE_TASK_COMPLETED',
      details: { stepId: stepExec.stepId, stepIndex: stepExec.stepIndex },
    });

    // Check if the next step is assigned to the same contact - return its magic link token
    let nextTaskToken: string | null = null;
    if (resolvedNextStep && resolvedNextStep.assignedToContactId === stepExec.assignedToContactId) {
      // Find or create magic link for the next step
      const existingLink = await db.query.magicLinks.findFirst({
        where: eq(magicLinks.stepExecutionId, resolvedNextStep.id),
      });
      if (existingLink && !existingLink.usedAt && new Date() < existingLink.expiresAt) {
        nextTaskToken = existingLink.token;
      }
    }

    res.json({
      success: true,
      data: {
        message: 'Task completed successfully',
        nextTaskToken,
        aiReviewPending,
        ...(groupResult && {
          groupCompletion: {
            advanced: groupResult.advanced,
            completedCount: groupResult.completedCount,
            totalCount: groupResult.totalCount,
          },
        }),
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
// GET /api/public/task/:token/activity - Get activity events for this flow
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

    // Query audit logs for this flow
    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.flowId, stepExec.flowId),
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

    // Find or create conversation for this contact + flow
    let conversation = await db.query.flowConversations.findFirst({
      where: and(
        eq(flowConversations.flowId, stepExec.flowId),
        eq(flowConversations.contactId, stepExec.assignedToContactId)
      ),
    });

    if (!conversation) {
      // No conversation yet, return empty
      res.json({ success: true, data: [] });
      return;
    }

    const messages = await db.query.flowMessages.findMany({
      where: eq(flowMessages.conversationId, conversation.id),
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
    let conversation = await db.query.flowConversations.findFirst({
      where: and(
        eq(flowConversations.flowId, stepExec.flowId),
        eq(flowConversations.contactId, contact.id)
      ),
    });

    if (!conversation) {
      const [newConv] = await db.insert(flowConversations).values({
        flowId: stepExec.flowId,
        contactId: contact.id,
        lastMessageAt: new Date(),
      }).returning();
      conversation = newConv;
    }

    // Create the message
    const [message] = await db.insert(flowMessages).values({
      conversationId: conversation.id,
      flowId: stepExec.flowId,
      senderContactId: contact.id,
      senderType: 'contact',
      senderName: contact.name,
      content: content.trim(),
    }).returning();

    // Update conversation lastMessageAt
    await db.update(flowConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(flowConversations.id, conversation.id));

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

// ============================================================================
// POST /api/public/task/:token/upload - File upload for assignees
// ============================================================================

const uploadStorage = multer.memoryStorage();
const publicUpload = multer({
  storage: uploadStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

router.post(
  '/:token/upload',
  publicUpload.single('file'),
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;

    // Validate magic link
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
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Step not found' },
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' },
      });
      return;
    }

    // Get the flow to find the org ID
    const flowInstance = await db.query.flows.findFirst({
      where: eq(flows.id, stepExec.flowId),
    });

    if (!flowInstance) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Upload to storage
    const { storageKey } = await fileStorage.upload(file.buffer, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      orgId: flowInstance.organizationId,
      flowId: flowInstance.id,
      stepId: stepExec.id,
    });

    // Save metadata to database
    const [fileRecord] = await db.insert(files).values({
      organizationId: flowInstance.organizationId,
      flowId: flowInstance.id,
      stepExecutionId: stepExec.id,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageKey,
      uploadedByContactId: stepExec.assignedToContactId || null,
    }).returning();

    res.status(201).json({
      success: true,
      data: fileRecord,
    });
  })
);

// ============================================================================
// GET /api/public/task/:token/ai-results - Get AI results for a step
// ============================================================================

router.get(
  '/:token/ai-results',
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

    const resultData = (link.stepExecution?.resultData as Record<string, unknown>) || {};
    res.json({
      success: true,
      data: {
        aiPrepare: resultData._aiPrepare || null,
        aiAdvise: resultData._aiAdvise || null,
        aiReview: resultData._aiReview || null,
      },
    });
  })
);

// ============================================================================
// POST /api/public/task/:token/form-chat - AI form chat (SSE)
// ============================================================================

// Simple in-memory rate limiter for form chat
const formChatRateLimit = new Map<string, { count: number; resetAt: number }>();

router.post(
  '/:token/form-chat',
  asyncHandler(async (req, res) => {
    const token = req.params.token as string;
    const { message, history } = req.body;

    // Rate limiting: 20 requests per minute per token
    const now = Date.now();
    const rateEntry = formChatRateLimit.get(token);
    if (rateEntry && rateEntry.resetAt > now) {
      if (rateEntry.count >= 20) {
        res.status(429).json({
          success: false,
          error: { code: 'RATE_LIMITED', message: 'Too many requests. Please wait a moment.' },
        });
        return;
      }
      rateEntry.count++;
    } else {
      formChatRateLimit.set(token, { count: 1, resetAt: now + 60000 });
    }

    // Validate magic link
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
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Step not found' },
      });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message is required' },
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const { handleFormChat } = await import('../services/ai-assignee.js');
    await handleFormChat(stepExec.id, message, history || [], stepExec.flowId, res);
  })
);

export default router;
