/**
 * LLM Integration Types
 *
 * Defines the structured response formats from the AI
 * and conversation management types.
 */

import type { Flow } from '../models/workflow.js';
import type { Operation } from '../models/operations.js';

// ============================================================================
// AI Response Types
// ============================================================================

/**
 * Create mode - AI generates a new workflow
 */
export interface CreateResponse {
  mode: 'create';
  workflow: Flow;
  message: string;
  assumptions?: string[];  // What the AI assumed/inferred
}

/**
 * Edit mode - AI generates patch operations
 */
export interface EditResponse {
  mode: 'edit';
  operations: Operation[];
  message: string;
  assumptions?: string[];  // What the AI assumed about the changes
}

/**
 * Clarify mode - AI needs more information
 */

/** Input type for clarification questions */
export type ClarificationInputType = 'text' | 'text_with_file' | 'selection';

/** File upload configuration */
export interface FileUploadConfig {
  placeholder: string;
  acceptedTypes?: string[];
  helpText?: string;
}

/** Conditional field shown when a selection option is chosen */
export interface ConditionalField {
  fieldId: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder?: string;
  required?: boolean;
}

/** Selection option for selection input type */
export interface SelectionOption {
  optionId: string;
  label: string;
  description?: string;
  icon?: string;
  conditionalFields?: ConditionalField[];
}

export interface ClarifyQuestion {
  id: string;
  text: string;
  /** Input type - defaults to 'text' for backward compatibility */
  inputType?: ClarificationInputType;
  /** Placeholder for text input */
  placeholder?: string;
  /** File upload config for text_with_file type */
  fileUpload?: FileUploadConfig;
  /** Selection options for selection type */
  options?: SelectionOption[];
}

export interface ClarifyResponse {
  mode: 'clarify';
  questions: ClarifyQuestion[];
  context: string;
}

/**
 * Reject mode - Request violates constraints
 */
export interface RejectResponse {
  mode: 'reject';
  reason: string;
  suggestion: string;
}

/**
 * Respond mode - Conversational response without workflow changes
 * Used for answering questions, providing information, general conversation
 */
export interface SuggestedAction {
  label: string;
  /** For 'prompt' type - the message to send */
  prompt?: string;
  /** Action type determines frontend behavior:
   * - 'approve_plan': Trigger plan approval (no scroll needed)
   * - 'discard_plan': Discard the pending plan
   * - 'edit_plan': Open edit input for the plan
   * - 'prompt': Send the prompt as a new message (default)
   */
  actionType?: 'approve_plan' | 'discard_plan' | 'edit_plan' | 'prompt';
}

export interface RespondResponse {
  mode: 'respond';
  message: string;
  suggestedActions?: SuggestedAction[];
}

/**
 * Union of all AI response types
 */
export type AIResponse = CreateResponse | EditResponse | ClarifyResponse | RejectResponse | RespondResponse;

/**
 * Response mode enum for type guards
 */
export type ResponseMode = 'create' | 'edit' | 'clarify' | 'reject' | 'respond';

// ============================================================================
// Type Guards
// ============================================================================

export function isCreateResponse(response: AIResponse): response is CreateResponse {
  return response.mode === 'create';
}

export function isEditResponse(response: AIResponse): response is EditResponse {
  return response.mode === 'edit';
}

export function isClarifyResponse(response: AIResponse): response is ClarifyResponse {
  return response.mode === 'clarify';
}

export function isRejectResponse(response: AIResponse): response is RejectResponse {
  return response.mode === 'reject';
}

export function isRespondResponse(response: AIResponse): response is RespondResponse {
  return response.mode === 'respond';
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * Message role in conversation
 */
export type MessageRole = 'user' | 'assistant';

/**
 * A single message in the conversation
 */
export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;

  // If assistant message, the parsed response
  parsedResponse?: AIResponse;

  // If there was an error parsing/processing
  error?: string;
}

/**
 * Conversation session state
 */
export interface ConversationSession {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Current workflow state (null if not yet created)
  workflow: Flow | null;

  // Message history
  messages: ConversationMessage[];

  // Session metadata
  metadata?: {
    workflowName?: string;
    lastMode?: ResponseMode;
    clarificationsPending?: boolean;
  };
}

// ============================================================================
// LLM Service Types
// ============================================================================

/**
 * Options for LLM request
 */
export interface LLMRequestOptions {
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
}

/**
 * Result from LLM service
 */
export interface LLMResult {
  success: boolean;
  response?: AIResponse;
  rawContent?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Chat completion request for the LLM
 */
export interface ChatCompletionRequest {
  sessionId: string;
  userMessage: string;
  currentWorkflow?: Flow | null;
  options?: LLMRequestOptions;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of parsing AI response
 */
export interface ParseResult {
  success: boolean;
  response?: AIResponse;
  errors?: string[];
  rawContent?: string;
}

/**
 * Validation error for AI response
 */
export interface ResponseValidationError {
  field: string;
  message: string;
}

/**
 * Result of validating AI response
 */
export interface ResponseValidationResult {
  valid: boolean;
  errors: ResponseValidationError[];
}

// ============================================================================
// Streaming Types
// ============================================================================

/**
 * Stream event types for real-time chat updates
 */
export type StreamEventType = 'thinking' | 'content';

/**
 * Stream event emitted during LLM streaming
 */
export interface StreamEvent {
  type: StreamEventType;
  status?: string;  // For 'thinking' events
  chunk?: string;   // For 'content' events
}
