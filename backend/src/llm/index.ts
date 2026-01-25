/**
 * LLM Integration Module
 *
 * Provides AI-powered workflow generation and editing capabilities.
 *
 * Main exports:
 * - LLMService: The main service for AI interactions
 * - Session management: Create and manage conversation sessions
 * - Response handling: Process AI responses and apply to workflows
 */

// ============================================================================
// Service
// ============================================================================

export {
  LLMService,
  getLLMService,
  createLLMService,
  resetLLMService,
} from './service.js';

// ============================================================================
// Types
// ============================================================================

export type {
  AIResponse,
  CreateResponse,
  EditResponse,
  ClarifyResponse,
  RejectResponse,
  RespondResponse,
  SuggestedAction,
  ResponseMode,
  ClarifyQuestion,
  ConversationMessage,
  ConversationSession,
  LLMRequestOptions,
  LLMResult,
  ChatCompletionRequest,
  ParseResult,
  ResponseValidationError,
  ResponseValidationResult,
  MessageRole,
  StreamEvent,
  StreamEventType,
} from './types.js';

export {
  isCreateResponse,
  isEditResponse,
  isClarifyResponse,
  isRejectResponse,
  isRespondResponse,
} from './types.js';

// ============================================================================
// Prompt Generation
// ============================================================================

export {
  generateSystemPrompt,
  generateWorkflowContext,
  generateStepTypeGuidance,
} from './prompt-generator.js';

// ============================================================================
// Response Parsing
// ============================================================================

export {
  parseAIResponse,
  extractJSON,
  extractConversationalMessage,
  stringifyResponse,
  getResponseSummary,
} from './parser.js';

// ============================================================================
// Response Handlers
// ============================================================================

export type { HandlerResult } from './handlers.js';

export {
  handleAIResponse,
  handleCreateResponse,
  handleEditResponse,
  handleClarifyResponse,
  handleRejectResponse,
  handleRespondResponse,
  createErrorResult,
  createSuccessResult,
} from './handlers.js';

// ============================================================================
// Context Management
// ============================================================================

export type { PendingPlan } from './context.js';

export {
  createSession,
  getSession,
  getOrCreateSession,
  deleteSession,
  listSessions,
  clearAllSessions,
  addMessage,
  addUserMessage,
  addAssistantMessage,
  getMessageHistory,
  updateSessionWorkflow,
  getSessionWorkflow,
  summarizeConversation,
  updateSessionMetadata,
  getSessionStats,
  exportSession,
  importSession,
  // Pending plan management
  storePendingPlan,
  getPendingPlan,
  getSessionPendingPlan,
  publishPendingPlan,
  discardPendingPlan,
  clearSessionPendingPlans,
} from './context.js';
