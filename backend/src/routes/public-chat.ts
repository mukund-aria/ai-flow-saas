/**
 * Public Chat Routes
 *
 * Unauthenticated chat endpoint for the landing page preview experience.
 * Uses the same LLM infrastructure as the main chat but with:
 * - In-memory sessions only (no DB writes)
 * - 30-minute TTL on sessions
 * - System prompt bias toward creating with assumptions
 */

import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import {
  getLLMService,
  getOrCreateSession,
  addUserMessage,
  addAssistantMessage,
  getMessageHistory,
  handleAIResponse,
  extractConversationalMessage,
  type LLMResult,
} from '../llm/index.js';
import { getUserFriendlyError } from '../middleware/index.js';

const router = Router();

// ============================================================================
// Rate Limiter: 3 requests per IP per hour
// ============================================================================

export const publicChatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please sign up for unlimited access.',
    },
  },
});

// ============================================================================
// SSE Helper
// ============================================================================

function sendSSE(res: Response, eventType: string, data: unknown): void {
  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ============================================================================
// Public Chat Endpoint
// ============================================================================

router.post('/', publicChatLimiter, async (req: Request, res: Response) => {
  const { message, sessionId } = req.body as { message?: string; sessionId?: string };

  if (!message || typeof message !== 'string' || message.length < 1 || message.length > 5000) {
    res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Message is required (1-5000 characters).' },
    });
    return;
  }

  // Use the existing session management (in-memory)
  const session = getOrCreateSession(sessionId);
  const isNewSession = !sessionId || sessionId !== session.id;

  // Add user message to history
  addUserMessage(session, message);

  // Get conversation history
  const history = getMessageHistory(session);
  const historyForLLM = history.slice(0, -1);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send session info
  sendSSE(res, 'session', { sessionId: session.id, isNew: isNewSession });

  try {
    const llmService = getLLMService();

    // Stream the response with bias toward creating
    const streamGenerator = llmService.chatStream(
      message,
      historyForLLM,
      session.workflow,
      {
        hasPendingPlan: false,
      }
    );

    let result: LLMResult | undefined;

    while (true) {
      const iterResult = await streamGenerator.next();

      if (iterResult.done) {
        result = iterResult.value as LLMResult;
        break;
      }

      const event = iterResult.value;
      if (event.type === 'thinking') {
        sendSSE(res, 'thinking', { status: event.status });
      } else if (event.type === 'content') {
        sendSSE(res, 'content', { chunk: event.chunk });
      }
    }

    if (!result || !result.success || !result.response) {
      const technicalError = result?.error || 'Failed to process message';
      addAssistantMessage(session, result?.rawContent || '', undefined, technicalError);
      sendSSE(res, 'error', {
        code: 'LLM_ERROR',
        message: 'Failed to generate workflow. Please try again.',
        friendlyMessage: getUserFriendlyError(technicalError),
      });
      sendSSE(res, 'done', { success: false });
      res.end();
      return;
    }

    // Process the AI response (don't apply to session, treat as direct)
    const handlerResult = await handleAIResponse(result.response, session, true);

    // Store assistant message
    addAssistantMessage(
      session,
      result.rawContent || '',
      result.response,
      handlerResult.success ? undefined : handlerResult.errors?.join('; ')
    );

    const friendlyMessage = extractConversationalMessage(result.rawContent || '') || handlerResult.message;

    // Send mode event
    sendSSE(res, 'mode', { mode: result.response.mode, friendlyMessage });

    // Handle response based on mode
    switch (result.response.mode) {
      case 'create':
      case 'edit': {
        if (handlerResult.workflow) {
          const assumptions = 'assumptions' in result.response
            ? (result.response as { assumptions?: string[] }).assumptions
            : undefined;
          sendSSE(res, 'workflow', {
            workflow: handlerResult.workflow,
            message: friendlyMessage,
            isPreview: false,
            assumptions,
          });
        }
        break;
      }
      case 'clarify':
        sendSSE(res, 'clarify', {
          questions: handlerResult.clarifications,
          context: friendlyMessage,
        });
        break;
      case 'reject':
        sendSSE(res, 'reject', {
          reason: result.response.reason,
          suggestion: result.response.suggestion,
          message: friendlyMessage,
        });
        break;
      case 'respond':
        sendSSE(res, 'respond', {
          message: result.response.message,
        });
        break;
    }

    sendSSE(res, 'done', { success: handlerResult.success });
    res.end();
  } catch (error) {
    console.error('[PublicChat] Error:', error);
    sendSSE(res, 'error', {
      code: 'STREAM_ERROR',
      message: 'Something went wrong. Please try again.',
    });
    sendSSE(res, 'done', { success: false });
    res.end();
  }
});

export default router;
