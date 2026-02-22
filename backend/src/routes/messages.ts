/**
 * Flow Run Message Routes (Coordinator-facing)
 *
 * Handles in-flow chat conversations between coordinators and assignees.
 * All routes require authentication and org-scope.
 */

import { Router } from 'express';
import { db, flowRunConversations, flowRunMessages, flowRuns, users } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/flows/:flowRunId/conversations — List conversations
// ============================================================================

router.get(
  '/:flowRunId/conversations',
  asyncHandler(async (req, res) => {
    const flowRunId = req.params.flowRunId as string;

    // Verify the flow run belongs to the user's org
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, flowRunId),
    });

    if (!run || run.organizationId !== (req as any).organizationId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Flow run not found' } });
      return;
    }

    const conversations = await db.query.flowRunConversations.findMany({
      where: eq(flowRunConversations.flowRunId, flowRunId),
      with: {
        contact: true,
        messages: {
          orderBy: (m, { desc }) => [desc(m.createdAt)],
          limit: 1,
        },
      },
      orderBy: (c, { desc }) => [desc(c.lastMessageAt)],
    });

    const result = conversations.map((conv) => {
      const lastMessage = conv.messages[0];
      return {
        id: conv.id,
        contact: {
          id: conv.contact.id,
          name: conv.contact.name,
          email: conv.contact.email,
        },
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderName: lastMessage.senderName,
          senderType: lastMessage.senderType,
          createdAt: lastMessage.createdAt,
        } : null,
        resolvedAt: conv.resolvedAt,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      };
    });

    res.json({ success: true, data: result });
  })
);

// ============================================================================
// GET /api/flows/:flowRunId/conversations/:conversationId/messages
// ============================================================================

router.get(
  '/:flowRunId/conversations/:conversationId/messages',
  asyncHandler(async (req, res) => {
    const flowRunId = req.params.flowRunId as string;
    const conversationId = req.params.conversationId as string;

    // Verify access
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, flowRunId),
    });

    if (!run || run.organizationId !== (req as any).organizationId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Flow run not found' } });
      return;
    }

    const messages = await db.query.flowRunMessages.findMany({
      where: and(
        eq(flowRunMessages.conversationId, conversationId),
        eq(flowRunMessages.flowRunId, flowRunId)
      ),
      with: {
        attachments: true,
      },
      orderBy: (m, { asc }) => [asc(m.createdAt)],
    });

    res.json({
      success: true,
      data: messages.map((m) => ({
        id: m.id,
        senderType: m.senderType,
        senderName: m.senderName,
        senderUserId: m.senderUserId,
        senderContactId: m.senderContactId,
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
// POST /api/flows/:flowRunId/conversations/:conversationId/messages
// ============================================================================

router.post(
  '/:flowRunId/conversations/:conversationId/messages',
  asyncHandler(async (req, res) => {
    const flowRunId = req.params.flowRunId as string;
    const conversationId = req.params.conversationId as string;
    const { content } = req.body;
    const userId = (req as any).userId as string;

    if (!content?.trim()) {
      res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Message content is required' } });
      return;
    }

    // Verify access
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, flowRunId),
    });

    if (!run || run.organizationId !== (req as any).organizationId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Flow run not found' } });
      return;
    }

    // Get sender info
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
      return;
    }

    // Create message
    const [message] = await db.insert(flowRunMessages).values({
      conversationId,
      flowRunId,
      senderUserId: userId,
      senderType: 'user',
      senderName: user.name,
      content: content.trim(),
    }).returning();

    // Update conversation lastMessageAt
    await db.update(flowRunConversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(flowRunConversations.id, conversationId));

    res.json({
      success: true,
      data: {
        id: message.id,
        senderType: message.senderType,
        senderName: message.senderName,
        senderUserId: message.senderUserId,
        content: message.content,
        attachments: [],
        createdAt: message.createdAt,
      },
    });
  })
);

// ============================================================================
// PATCH /api/flows/:flowRunId/conversations/:conversationId/resolve
// ============================================================================

router.patch(
  '/:flowRunId/conversations/:conversationId/resolve',
  asyncHandler(async (req, res) => {
    const flowRunId = req.params.flowRunId as string;
    const conversationId = req.params.conversationId as string;
    const { resolved } = req.body;
    const userId = (req as any).userId as string;

    // Verify access
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, flowRunId),
    });

    if (!run || run.organizationId !== (req as any).organizationId) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Flow run not found' } });
      return;
    }

    await db.update(flowRunConversations)
      .set({
        resolvedAt: resolved ? new Date() : null,
        resolvedByUserId: resolved ? userId : null,
      })
      .where(eq(flowRunConversations.id, conversationId));

    res.json({ success: true });
  })
);

export default router;
