/**
 * Conversation Context Manager
 *
 * Manages conversation sessions, message history, and workflow state.
 * Handles session creation, message tracking, and context summarization.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ConversationSession,
  ConversationMessage,
  AIResponse,
  MessageRole,
} from './types.js';
import type { Flow } from '../models/workflow.js';

// ============================================================================
// Session Storage (In-memory for MVP)
// ============================================================================

const sessions = new Map<string, ConversationSession>();

// ============================================================================
// Pending Plan Storage
// ============================================================================

/**
 * A pending plan is a workflow preview that awaits user approval
 */
export interface PendingPlan {
  id: string;
  sessionId: string;
  workflow: Flow;
  createdAt: Date;
  message: string;  // AI's explanation of the plan
}

const pendingPlans = new Map<string, PendingPlan>();

// ============================================================================
// Session Management
// ============================================================================

/**
 * Create a new conversation session
 */
export function createSession(initialWorkflow?: Flow | null): ConversationSession {
  const session: ConversationSession = {
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),
    workflow: initialWorkflow || null,
    messages: [],
    metadata: {},
  };

  sessions.set(session.id, session);
  return session;
}

/**
 * Get an existing session by ID
 */
export function getSession(sessionId: string): ConversationSession | null {
  return sessions.get(sessionId) || null;
}

/**
 * Get or create a session
 */
export function getOrCreateSession(
  sessionId?: string,
  initialWorkflow?: Flow | null
): ConversationSession {
  if (sessionId) {
    const existing = getSession(sessionId);
    if (existing) {
      return existing;
    }
  }
  return createSession(initialWorkflow);
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

/**
 * List all active sessions
 */
export function listSessions(): ConversationSession[] {
  return Array.from(sessions.values());
}

/**
 * Clear all sessions (useful for testing)
 */
export function clearAllSessions(): void {
  sessions.clear();
}

// ============================================================================
// Message Management
// ============================================================================

/**
 * Add a message to a session
 */
export function addMessage(
  session: ConversationSession,
  role: MessageRole,
  content: string,
  parsedResponse?: AIResponse,
  error?: string
): ConversationMessage {
  const message: ConversationMessage = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
    parsedResponse,
    error,
  };

  session.messages.push(message);
  session.updatedAt = new Date();

  return message;
}

/**
 * Add a user message to a session
 */
export function addUserMessage(
  session: ConversationSession,
  content: string
): ConversationMessage {
  return addMessage(session, 'user', content);
}

/**
 * Add an assistant message to a session
 */
export function addAssistantMessage(
  session: ConversationSession,
  content: string,
  parsedResponse?: AIResponse,
  error?: string
): ConversationMessage {
  return addMessage(session, 'assistant', content, parsedResponse, error);
}

/**
 * Get message history for a session (for LLM context)
 */
export function getMessageHistory(
  session: ConversationSession,
  maxMessages?: number
): ConversationMessage[] {
  if (!maxMessages || maxMessages >= session.messages.length) {
    return [...session.messages];
  }

  // Return last N messages, but always include the first message for context
  const firstMessage = session.messages[0];
  const recentMessages = session.messages.slice(-maxMessages + 1);

  // Avoid duplicating the first message
  if (recentMessages.includes(firstMessage)) {
    return recentMessages;
  }

  return [firstMessage, ...recentMessages];
}

// ============================================================================
// Workflow State Management
// ============================================================================

/**
 * Update session workflow
 */
export function updateSessionWorkflow(
  session: ConversationSession,
  workflow: Flow | null
): void {
  session.workflow = workflow;
  session.updatedAt = new Date();

  if (workflow) {
    session.metadata = {
      ...session.metadata,
      workflowName: workflow.name,
    };
  }
}

/**
 * Get current workflow from session
 */
export function getSessionWorkflow(session: ConversationSession): Flow | null {
  return session.workflow;
}

// ============================================================================
// Context Summarization
// ============================================================================

/**
 * Generate a summary of the conversation for context
 * Used when conversation is too long
 */
export function summarizeConversation(session: ConversationSession): string {
  const workflow = session.workflow;
  const messageCount = session.messages.length;

  let summary = '';

  if (workflow) {
    summary += `Current workflow: "${workflow.name}" with ${workflow.steps.length} steps.\n`;

    // List step types for context
    const stepTypes = workflow.steps.map(s => s.type);
    const typeCounts = stepTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    summary += `Step types: ${Object.entries(typeCounts)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ')}.\n`;

    // Note assignees
    if (workflow.assigneePlaceholders.length > 0) {
      summary += `Assignees: ${workflow.assigneePlaceholders
        .map(a => a.name)
        .join(', ')}.\n`;
    }
  } else {
    summary += 'No workflow created yet.\n';
  }

  summary += `Conversation: ${messageCount} messages exchanged.\n`;

  // Get last few user requests for context
  const recentUserMessages = session.messages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content.substring(0, 100));

  if (recentUserMessages.length > 0) {
    summary += `Recent requests: ${recentUserMessages.join('; ')}`;
  }

  return summary;
}

// ============================================================================
// Session Metadata
// ============================================================================

/**
 * Update session metadata
 */
export function updateSessionMetadata(
  session: ConversationSession,
  metadata: Partial<ConversationSession['metadata']>
): void {
  session.metadata = {
    ...session.metadata,
    ...metadata,
  };
  session.updatedAt = new Date();
}

/**
 * Get session stats
 */
export function getSessionStats(session: ConversationSession): {
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  workflowStepCount: number;
  durationMinutes: number;
} {
  const userMessages = session.messages.filter(m => m.role === 'user');
  const assistantMessages = session.messages.filter(m => m.role === 'assistant');
  const duration = (Date.now() - session.createdAt.getTime()) / 60000;

  return {
    messageCount: session.messages.length,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    workflowStepCount: session.workflow?.steps.length || 0,
    durationMinutes: Math.round(duration),
  };
}

// ============================================================================
// Pending Plan Management
// ============================================================================

/**
 * Store a pending plan for user review
 */
export function storePendingPlan(
  session: ConversationSession,
  workflow: Flow,
  message: string
): PendingPlan {
  // Clear any existing pending plan for this session
  const existingPlan = Array.from(pendingPlans.values())
    .find(p => p.sessionId === session.id);
  if (existingPlan) {
    pendingPlans.delete(existingPlan.id);
  }

  const plan: PendingPlan = {
    id: uuidv4(),
    sessionId: session.id,
    workflow,
    createdAt: new Date(),
    message,
  };

  pendingPlans.set(plan.id, plan);
  return plan;
}

/**
 * Get a pending plan by ID
 */
export function getPendingPlan(planId: string): PendingPlan | null {
  return pendingPlans.get(planId) || null;
}

/**
 * Get pending plan for a session
 */
export function getSessionPendingPlan(sessionId: string): PendingPlan | null {
  return Array.from(pendingPlans.values())
    .find(p => p.sessionId === sessionId) || null;
}

/**
 * Publish a pending plan - moves it to the session's official workflow
 */
export function publishPendingPlan(planId: string): {
  success: boolean;
  session?: ConversationSession;
  workflow?: Flow;
  error?: string;
} {
  const plan = pendingPlans.get(planId);
  if (!plan) {
    return { success: false, error: 'Plan not found' };
  }

  const session = getSession(plan.sessionId);
  if (!session) {
    pendingPlans.delete(planId);
    return { success: false, error: 'Session not found' };
  }

  // Apply the plan to the session's workflow
  updateSessionWorkflow(session, plan.workflow);

  // Remove the pending plan
  pendingPlans.delete(planId);

  return { success: true, session, workflow: plan.workflow };
}

/**
 * Discard a pending plan without publishing
 */
export function discardPendingPlan(planId: string): boolean {
  return pendingPlans.delete(planId);
}

/**
 * Clear all pending plans for a session
 */
export function clearSessionPendingPlans(sessionId: string): void {
  for (const [id, plan] of pendingPlans) {
    if (plan.sessionId === sessionId) {
      pendingPlans.delete(id);
    }
  }
}

// ============================================================================
// Export Session
// ============================================================================

/**
 * Export session to JSON (for debugging or storage)
 */
export function exportSession(session: ConversationSession): string {
  return JSON.stringify(
    {
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      workflow: session.workflow,
      messages: session.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        error: m.error,
      })),
      metadata: session.metadata,
    },
    null,
    2
  );
}

/**
 * Import session from JSON
 */
export function importSession(json: string): ConversationSession | null {
  try {
    const data = JSON.parse(json);

    const session: ConversationSession = {
      id: data.id || uuidv4(),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      workflow: data.workflow,
      messages: data.messages.map((m: Record<string, unknown>) => ({
        id: m.id,
        role: m.role as MessageRole,
        content: m.content as string,
        timestamp: new Date(m.timestamp as string),
        error: m.error as string | undefined,
      })),
      metadata: data.metadata || {},
    };

    sessions.set(session.id, session);
    return session;
  } catch {
    return null;
  }
}
