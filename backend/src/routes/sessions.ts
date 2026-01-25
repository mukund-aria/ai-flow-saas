/**
 * Sessions Routes
 *
 * CRUD operations for conversation sessions.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, validateBody, validateParams, Errors } from '../middleware/index.js';
import {
  createSession,
  getSession,
  listSessions,
  deleteSession,
  updateSessionWorkflow,
  publishPendingPlan,
  discardPendingPlan,
  getSessionPendingPlan,
  type ConversationSession,
} from '../llm/index.js';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  ListSessionsResponse,
  GetSessionResponse,
  DeleteSessionResponse,
  ExportWorkflowResponse,
  ImportWorkflowRequest,
  ImportWorkflowResponse,
  PublishPlanRequest,
  PublishPlanResponse,
  SessionSummary,
  SessionDetail,
  SessionMessage,
} from './types.js';

const router = Router();

// ============================================================================
// Helpers
// ============================================================================

function toSessionSummary(session: ConversationSession): SessionSummary {
  return {
    id: session.id,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messageCount: session.messages.length,
    workflowName: session.workflow?.name || null,
  };
}

function toSessionDetail(session: ConversationSession): SessionDetail {
  return {
    ...toSessionSummary(session),
    workflow: session.workflow,
    messages: session.messages.map((m): SessionMessage => ({
      id: m.id,
      role: m.role,
      content: m.parsedResponse?.mode === 'clarify'
        ? (m.parsedResponse.context || 'I have a few questions to make sure I design this right for you:')
        : m.content,
      timestamp: m.timestamp.toISOString(),
      mode: m.parsedResponse?.mode,
      // Include clarification data for history restoration
      clarifications: m.parsedResponse?.mode === 'clarify' ? m.parsedResponse.questions : undefined,
      clarificationsLocked: m.parsedResponse?.mode === 'clarify' ? true : undefined, // Assume locked if loading from history
    })),
  };
}

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/sessions
 * List all active sessions
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const sessions = listSessions();

    const response: ListSessionsResponse = {
      success: true,
      sessions: sessions.map(toSessionSummary),
    };

    res.status(200).json(response);
  })
);

/**
 * POST /api/sessions
 * Create a new session
 */
router.post(
  '/',
  validateBody([
    { field: 'workflow', required: false, type: 'object' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { workflow } = req.body as CreateSessionRequest;

    const session = createSession(workflow || null);

    const response: CreateSessionResponse = {
      success: true,
      session: toSessionSummary(session),
    };

    res.status(201).json(response);
  })
);

/**
 * GET /api/sessions/:id
 * Get session details including messages and workflow
 */
router.get(
  '/:id',
  validateParams('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const session = getSession(id);

    if (!session) {
      throw Errors.sessionNotFound();
    }

    const response: GetSessionResponse = {
      success: true,
      session: toSessionDetail(session),
    };

    res.status(200).json(response);
  })
);

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete(
  '/:id',
  validateParams('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const deleted = deleteSession(id);

    if (!deleted) {
      throw Errors.sessionNotFound();
    }

    const response: DeleteSessionResponse = {
      success: true,
      message: 'Session deleted successfully',
    };

    res.status(200).json(response);
  })
);

/**
 * GET /api/sessions/:id/workflow
 * Export workflow JSON from session
 */
router.get(
  '/:id/workflow',
  validateParams('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const session = getSession(id);

    if (!session) {
      throw Errors.sessionNotFound();
    }

    const response: ExportWorkflowResponse = {
      success: true,
      workflow: session.workflow,
      sessionId: session.id,
    };

    res.status(200).json(response);
  })
);

/**
 * POST /api/sessions/:id/workflow
 * Import/replace workflow in session
 */
router.post(
  '/:id/workflow',
  validateParams('id'),
  validateBody([
    { field: 'workflow', required: true, type: 'object' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const session = getSession(id);

    if (!session) {
      throw Errors.sessionNotFound();
    }

    const { workflow } = req.body as ImportWorkflowRequest;

    updateSessionWorkflow(session, workflow);

    const response: ImportWorkflowResponse = {
      success: true,
      message: 'Workflow imported successfully',
      sessionId: session.id,
    };

    res.status(200).json(response);
  })
);

// ============================================================================
// Plan/Preview Endpoints
// ============================================================================

/**
 * POST /api/sessions/:id/publish
 * Publish a pending plan (approve the preview)
 */
router.post(
  '/:id/publish',
  validateParams('id'),
  validateBody([
    { field: 'planId', required: true, type: 'string' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { planId } = req.body as PublishPlanRequest;

    const session = getSession(sessionId);
    if (!session) {
      throw Errors.sessionNotFound();
    }

    // Verify the plan belongs to this session
    const pendingPlan = getSessionPendingPlan(sessionId);
    if (!pendingPlan || pendingPlan.id !== planId) {
      throw Errors.badRequest('Plan not found or does not belong to this session');
    }

    // Publish the plan
    const result = publishPendingPlan(planId);

    if (!result.success) {
      throw Errors.badRequest(result.error || 'Failed to publish plan');
    }

    const response: PublishPlanResponse = {
      success: true,
      message: 'Plan published successfully',
      workflow: result.workflow!,
      sessionId: session.id,
    };

    res.status(200).json(response);
  })
);

/**
 * DELETE /api/sessions/:id/plan
 * Discard the pending plan
 */
router.delete(
  '/:id/plan',
  validateParams('id'),
  asyncHandler(async (req: Request, res: Response) => {
    const rawId = req.params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;

    const session = getSession(sessionId);
    if (!session) {
      throw Errors.sessionNotFound();
    }

    // Find and discard the pending plan
    const pendingPlan = getSessionPendingPlan(sessionId);
    if (!pendingPlan) {
      throw Errors.badRequest('No pending plan found');
    }

    discardPendingPlan(pendingPlan.id);

    res.status(200).json({
      success: true,
      message: 'Plan discarded',
    });
  })
);

export default router;
