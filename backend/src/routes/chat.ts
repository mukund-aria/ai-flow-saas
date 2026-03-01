/**
 * Chat Routes
 *
 * Main chat endpoint with optional SSE streaming for real-time responses.
 * Provides a "live chat" feel similar to Claude Code.
 */

import { Router, Request, Response } from 'express';
import { asyncHandler, validateBody, Errors, getUserFriendlyError } from '../middleware/index.js';
import {
  getLLMService,
  getOrCreateSession,
  addUserMessage,
  addAssistantMessage,
  getMessageHistory,
  handleAIResponse,
  storePendingPlan,
  updateSessionWorkflow,
  extractConversationalMessage,
  getSessionPendingPlan,
  type LLMResult,
} from '../llm/index.js';
import type { ChatRequest, ChatResponse } from './types.js';

const router = Router();

// ============================================================================
// SSE Helper
// ============================================================================

/**
 * Send an SSE event to the client
 */
function sendSSE(res: Response, eventType: string, data: unknown): void {
  res.write(`event: ${eventType}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

// ============================================================================
// Routes
// ============================================================================

/**
 * POST /api/chat
 *
 * Main chat endpoint. Supports two modes:
 * - stream=true (default): Returns Server-Sent Events for real-time updates
 * - stream=false: Returns a single JSON response after completion
 */
router.post(
  '/',
  validateBody([
    { field: 'message', required: true, type: 'string', minLength: 1, maxLength: 50000 },
    { field: 'sessionId', required: false, type: 'string' },
    { field: 'stream', required: false, type: 'boolean' },
    { field: 'preview', required: false, type: 'boolean' },
  ]),
  asyncHandler(async (req: Request, res: Response) => {
    const { message, sessionId, stream = true, preview = true } = req.body as ChatRequest;

    // Get or create session
    const session = getOrCreateSession(sessionId);
    const isNewSession = !sessionId || sessionId !== session.id;

    // Add user message to history
    addUserMessage(session, message);

    // Get conversation history (excluding the message we just added)
    const history = getMessageHistory(session);
    const historyForLLM = history.slice(0, -1);

    // Get LLM service
    const llmService = getLLMService();

    if (stream) {
      // ========================================
      // Streaming mode (SSE)
      // ========================================

      // Set up SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
      res.flushHeaders();

      // Send session info
      sendSSE(res, 'session', { sessionId: session.id, isNew: isNewSession });

      // Check for pending plan
      const pendingPlan = getSessionPendingPlan(session.id);

      console.log('[Chat] Processing message:', {
        sessionId: session.id,
        messagePreview: message.substring(0, 200),
        historyLength: historyForLLM.length,
        hasWorkflow: !!session.workflow,
        hasPendingPlan: !!pendingPlan,
      });

      // Track client disconnect to abort streaming
      let clientDisconnected = false;
      req.on('close', () => {
        clientDisconnected = true;
      });

      try {
        // Stream the response, passing pending plan info and clarification context
        const streamGenerator = llmService.chatStream(
          message,
          historyForLLM,
          session.workflow,
          {
            hasPendingPlan: !!pendingPlan,
            pendingPlanName: pendingPlan?.workflow?.name,
            clarificationsPending: session.metadata?.clarificationsPending,
          }
        );

        // Send periodic heartbeat comments to keep SSE connection alive
        // Railway and proxies drop idle connections after ~30s
        const heartbeat = setInterval(() => {
          if (!res.writableEnded) {
            res.write(':heartbeat\n\n');
          }
        }, 15000);

        // Consume stream events and collect the final result
        let result: LLMResult | undefined;

        try {
        while (true) {
          // Check if client disconnected (stop button pressed)
          if (clientDisconnected) {
            await streamGenerator.return(undefined as unknown as LLMResult);
            break;
          }

          const iterResult = await streamGenerator.next();

          if (iterResult.done) {
            // Generator finished - value is the LLMResult
            result = iterResult.value as LLMResult;
            break;
          }

          // iterResult.value is a StreamEvent
          const event = iterResult.value;
          if (event.type === 'thinking') {
            sendSSE(res, 'thinking', { status: event.status, step: event.step });
          } else if (event.type === 'content') {
            sendSSE(res, 'content', { chunk: event.chunk });
          }
        }
        } finally {
          clearInterval(heartbeat);
        }

        // Handle result
        if (!result || !result.success || !result.response) {
          const technicalError = result?.error || 'Failed to process message';
          console.error('[Chat] LLM Error:', {
            error: technicalError,
            rawContentPreview: result?.rawContent?.substring(0, 500),
          });
          addAssistantMessage(session, result?.rawContent || '', undefined, technicalError);
          sendSSE(res, 'error', {
            code: 'LLM_ERROR',
            message: technicalError,
            friendlyMessage: getUserFriendlyError(technicalError),
          });
          sendSSE(res, 'done', { success: false });
          res.end();
          return;
        }

        // If this is an edit request but session has no workflow, check for pending plan
        // This allows users to request changes to a preview workflow before publishing
        if (result.response.mode === 'edit' && !session.workflow && pendingPlan) {
          // Temporarily apply the pending plan's workflow so edits can be made
          session.workflow = pendingPlan.workflow;
        }

        // Process the AI response (validate, apply operations, etc.)
        // If preview mode, don't apply to session yet
        const handlerResult = await handleAIResponse(result.response, session, !preview);

        // Add assistant message
        addAssistantMessage(
          session,
          result.rawContent || '',
          result.response,
          handlerResult.success ? undefined : handlerResult.errors?.join('; ')
        );

        // Extract conversational message (text before JSON code block)
        const friendlyMessage = extractConversationalMessage(result.rawContent || '') || handlerResult.message;

        // Send mode-specific event with friendly message
        sendSSE(res, 'mode', {
          mode: result.response.mode,
          friendlyMessage, // Include conversational text for display
        });

        switch (result.response.mode) {
          case 'create':
          case 'edit': {
            // Get assumptions from response
            const assumptions = 'assumptions' in result.response
              ? (result.response as { assumptions?: string[] }).assumptions
              : undefined;

            // Get operations for edit mode (for frontend display)
            const operations = 'operations' in result.response
              ? (result.response as { operations?: unknown[] }).operations
              : undefined;

            if (handlerResult.workflow) {
              if (preview) {
                // Store as pending plan
                const plan = storePendingPlan(session, handlerResult.workflow, handlerResult.message);
                sendSSE(res, 'workflow', {
                  workflow: handlerResult.workflow,
                  message: friendlyMessage,
                  isPreview: true,
                  planId: plan.id,
                  assumptions,
                  operations, // Include edit operations for frontend display
                });
              } else {
                // Already applied to session
                sendSSE(res, 'workflow', {
                  workflow: handlerResult.workflow,
                  message: friendlyMessage,
                  isPreview: false,
                  assumptions,
                  operations, // Include edit operations for frontend display
                });
              }
            } else if (!handlerResult.success) {
              // Workflow creation/edit failed - send error event
              console.error('[Chat] Handler Error:', {
                mode: result.response.mode,
                errors: handlerResult.errors,
                message: handlerResult.message,
              });
              sendSSE(res, 'error', {
                code: 'WORKFLOW_ERROR',
                message: handlerResult.message,
                friendlyMessage: 'I had trouble creating that workflow. Let me try again with some adjustments.',
                errors: handlerResult.errors,
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
            // Conversational response - include suggested actions
            sendSSE(res, 'respond', {
              message: result.response.message,
              suggestedActions: result.response.suggestedActions,
            });
            break;
        }

        // Send completion with friendly message
        sendSSE(res, 'done', {
          success: handlerResult.success,
          errors: handlerResult.errors,
          usage: result.usage,
          friendlyMessage, // Include for final message update
        });

        res.end();
      } catch (error) {
        const technicalMessage = error instanceof Error ? error.message : 'Unknown error';
        sendSSE(res, 'error', {
          code: 'STREAM_ERROR',
          message: technicalMessage,
          friendlyMessage: getUserFriendlyError(technicalMessage),
        });
        sendSSE(res, 'done', { success: false });
        res.end();
      }
    } else {
      // ========================================
      // Non-streaming mode (JSON response)
      // ========================================

      const llmResult = await llmService.chat(
        message,
        historyForLLM,
        session.workflow,
        {
          clarificationsPending: session.metadata?.clarificationsPending,
        }
      );

      // Handle LLM failure
      if (!llmResult.success || !llmResult.response) {
        addAssistantMessage(session, llmResult.rawContent || '', undefined, llmResult.error);
        throw Errors.llmError(llmResult.error || 'Failed to process message');
      }

      // Process AI response (don't apply if preview mode)
      const handlerResult = await handleAIResponse(llmResult.response, session, !preview);

      // Add assistant message
      addAssistantMessage(
        session,
        llmResult.rawContent || '',
        llmResult.response,
        handlerResult.success ? undefined : handlerResult.errors?.join('; ')
      );

      // If preview mode and we have a workflow, store as pending plan
      let planId: string | undefined;
      if (preview && handlerResult.workflow) {
        const plan = storePendingPlan(session, handlerResult.workflow, handlerResult.message);
        planId = plan.id;
      }

      // Build response
      const response: ChatResponse = {
        success: handlerResult.success,
        sessionId: session.id,
        response: {
          mode: llmResult.response.mode,
          message: handlerResult.message,
          workflow: handlerResult.workflow,
          isPreview: preview && !!handlerResult.workflow,
          planId,
          clarifications: handlerResult.clarifications,
          errors: handlerResult.errors,
        },
        usage: llmResult.usage,
      };

      res.status(200).json(response);
    }
  })
);

export default router;
