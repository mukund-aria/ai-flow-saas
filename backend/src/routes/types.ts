/**
 * API Route Types
 *
 * Request and response types for all API endpoints.
 */

import type { Flow } from '../models/workflow.js';
import type { ResponseMode } from '../llm/types.js';

// ============================================================================
// Chat Endpoint Types
// ============================================================================

export interface ChatRequest {
  message: string;
  sessionId?: string;  // Optional - creates new session if not provided
  stream?: boolean;    // Enable SSE streaming (default: true)
  preview?: boolean;   // Show workflow as preview first (default: true)
}

/**
 * Non-streaming chat response (when stream=false)
 */
export interface ChatResponse {
  success: boolean;
  sessionId: string;
  response: {
    mode: ResponseMode;
    message: string;
    workflow?: Flow | null;
    isPreview?: boolean;       // True if workflow is a preview (not yet published)
    planId?: string;           // ID of the pending plan (if preview)
    clarifications?: Array<{ id: string; text: string }>;
    errors?: string[];
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * SSE streaming events (when stream=true)
 * Frontend receives these as Server-Sent Events
 */
export type StreamEventType =
  | 'session'       // Session created/found
  | 'thinking'      // AI is processing
  | 'content'       // Partial content chunk
  | 'mode'          // Response mode determined
  | 'workflow'      // Workflow created/updated
  | 'clarify'       // Clarification questions
  | 'reject'        // Request rejected
  | 'done'          // Stream complete
  | 'error';        // Error occurred

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
}

export interface SessionStreamEvent extends StreamEvent {
  type: 'session';
  data: { sessionId: string; isNew: boolean };
}

export interface ThinkingStreamEvent extends StreamEvent {
  type: 'thinking';
  data: { status: string };
}

export interface ContentStreamEvent extends StreamEvent {
  type: 'content';
  data: { chunk: string };
}

export interface ModeStreamEvent extends StreamEvent {
  type: 'mode';
  data: { mode: ResponseMode };
}

export interface WorkflowStreamEvent extends StreamEvent {
  type: 'workflow';
  data: {
    workflow: Flow;
    message: string;
    isPreview: boolean;  // True if this is a preview (requires approval to publish)
    planId?: string;     // ID of the pending plan (if preview)
  };
}

export interface ClarifyStreamEvent extends StreamEvent {
  type: 'clarify';
  data: {
    questions: Array<{ id: string; text: string }>;
    context: string;
  };
}

export interface RejectStreamEvent extends StreamEvent {
  type: 'reject';
  data: { reason: string; suggestion: string };
}

export interface DoneStreamEvent extends StreamEvent {
  type: 'done';
  data: {
    success: boolean;
    usage?: { inputTokens: number; outputTokens: number };
  };
}

export interface ErrorStreamEvent extends StreamEvent {
  type: 'error';
  data: { code: string; message: string };
}

// ============================================================================
// Session Endpoint Types
// ============================================================================

export interface SessionSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  workflowName: string | null;
}

export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: ResponseMode;  // For assistant messages
  clarifications?: Array<{ id: string; text: string; inputType?: string; placeholder?: string; options?: unknown[] }>;
  clarificationsLocked?: boolean;
}

export interface SessionDetail extends SessionSummary {
  workflow: Flow | null;
  messages: SessionMessage[];
}

export interface CreateSessionRequest {
  workflow?: Flow;  // Optional initial workflow to edit
}

export interface CreateSessionResponse {
  success: boolean;
  session: SessionSummary;
}

export interface ListSessionsResponse {
  success: boolean;
  sessions: SessionSummary[];
}

export interface GetSessionResponse {
  success: boolean;
  session: SessionDetail;
}

export interface DeleteSessionResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Workflow Export Types
// ============================================================================

export interface ExportWorkflowResponse {
  success: boolean;
  workflow: Flow | null;
  sessionId: string;
}

export interface ImportWorkflowRequest {
  workflow: Flow;
}

export interface ImportWorkflowResponse {
  success: boolean;
  message: string;
  sessionId: string;
}

// ============================================================================
// Plan/Preview Types
// ============================================================================

/**
 * Request to approve and publish a preview workflow
 */
export interface PublishPlanRequest {
  planId: string;  // ID of the pending plan to publish
}

export interface PublishPlanResponse {
  success: boolean;
  message: string;
  workflow: Flow;
  sessionId: string;
}
