/**
 * API Client for AI Flow Copilot Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Default fetch options for authenticated API calls */
const fetchOpts: RequestInit = { credentials: 'include' };

export interface ChatRequest {
  message: string;
  sessionId?: string;
  stream?: boolean;
  preview?: boolean;
}

export interface UploadRequest {
  file: File;
  sessionId?: string;
  prompt?: string;
}

export interface PublishRequest {
  planId: string;
}

/**
 * Create a new session
 */
export async function createSession(): Promise<{ sessionId: string }> {
  const res = await fetch(`${API_BASE}/sessions`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  return { sessionId: data.session.id };
}

/**
 * Get session details
 */
export async function getSession(sessionId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, fetchOpts);
  const data = await res.json();
  return data.session;
}

/**
 * List all sessions
 */
export async function listSessions() {
  const res = await fetch(`${API_BASE}/sessions`, fetchOpts);
  const data = await res.json();
  return data.sessions;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionId}`, { ...fetchOpts, method: 'DELETE' });
}

/**
 * Send a chat message (non-streaming)
 */
export async function sendMessage(request: ChatRequest) {
  const res = await fetch(`${API_BASE}/chat`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: false }),
  });
  return res.json();
}

/**
 * Parse SSE stream from a fetch response into stream events
 */
async function* parseSSEStream(res: Response): AsyncGenerator<StreamEvent> {
  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = '';
    let currentData = '';

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent = line.slice(7);
      } else if (line.startsWith('data: ')) {
        currentData = line.slice(6);
      } else if (line === '' && currentEvent && currentData) {
        try {
          const data = JSON.parse(currentData);
          yield { type: currentEvent as StreamEventType, data };
        } catch (e) {
          console.error('Failed to parse SSE data:', currentData);
        }
        currentEvent = '';
        currentData = '';
      }
    }
  }
}

/**
 * Send a chat message with SSE streaming
 * Returns an async generator that yields stream events
 */
export async function* streamMessage(request: ChatRequest): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  yield* parseSSEStream(res);
}

/**
 * Send a chat message to the public (unauthenticated) chat endpoint
 * Used for the landing page preview experience
 */
export async function* streamPublicMessage(request: { message: string; sessionId?: string }): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_BASE}/public/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limit reached. Sign up for unlimited access.');
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  yield* parseSSEStream(res);
}

/**
 * Upload a file (document/diagram)
 */
export async function uploadFile(request: UploadRequest) {
  const formData = new FormData();
  formData.append('file', request.file);
  if (request.sessionId) formData.append('sessionId', request.sessionId);
  if (request.prompt) formData.append('prompt', request.prompt);

  const res = await fetch(`${API_BASE}/chat/upload`, {
    ...fetchOpts,
    method: 'POST',
    body: formData,
  });
  return res.json();
}

/**
 * Publish a pending plan
 */
export async function publishPlan(sessionId: string, planId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/publish`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });
  return res.json();
}

/**
 * Discard a pending plan
 */
export async function discardPlan(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionId}/plan`, { ...fetchOpts, method: 'DELETE' });
}

/**
 * Get workflow from session
 */
export async function getWorkflow(sessionId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/workflow`, fetchOpts);
  return res.json();
}

// ============================================================================
// Templates API (workflow blueprints)
// ============================================================================

export interface Template {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  isDefault?: boolean;
  definition?: Record<string, unknown>;
  stepCount?: number;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  definition?: Record<string, unknown>;
  status?: 'DRAFT' | 'ACTIVE';
}

/**
 * List all templates
 */
export async function listTemplates(): Promise<Template[]> {
  const res = await fetch(`${API_BASE}/templates`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list templates');
  return data.data;
}

/**
 * Get a single template by ID
 */
export async function getTemplate(id: string): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates/${id}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Template not found');
  return data.data;
}

/**
 * Create a new template
 */
export async function createTemplate(request: CreateTemplateRequest): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create template');
  return data.data;
}

/**
 * Update a template
 */
export async function updateTemplate(id: string, updates: Partial<CreateTemplateRequest>): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update template');
  return data.data;
}

/**
 * Delete (archive) a template
 */
export async function deleteTemplate(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/templates/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete template');
}

/**
 * Publish a draft template (set status to ACTIVE)
 */
export async function publishTemplate(id: string): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates/${id}/publish`, { ...fetchOpts, method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to publish template');
  return data.data;
}

// ============================================================================
// Flows API (active workflow instances)
// ============================================================================

export interface Flow {
  id: string;
  flowId: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  isSample?: boolean;
  currentStepIndex: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  flow?: { id: string; name: string };
  startedBy?: { id: string; name: string; email: string };
  stepExecutions?: Array<{
    id: string;
    stepId: string;
    stepIndex: number;
    status: string;
    resultData?: Record<string, unknown>;
    startedAt?: string;
    completedAt?: string;
    dueAt?: string;
    reminderCount?: number;
    assignedToUser?: { id: string; name: string; email: string };
    assignedToContact?: { id: string; name: string; email: string };
  }>;
}

export interface StartFlowRequest {
  templateId: string;
  name: string;
  roleAssignments?: Record<string, string>;
  kickoffData?: Record<string, unknown>;
  isTest?: boolean;
}

/**
 * List all flows (active instances)
 */
export async function listFlows(): Promise<Flow[]> {
  const res = await fetch(`${API_BASE}/flows`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list flows');
  return data.data;
}

/**
 * Get a single flow by ID
 */
export async function getFlow(id: string): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${id}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Flow not found');
  return data.data;
}

/**
 * Start a new flow from a template
 */
export async function startFlow(
  templateId: string,
  name: string,
  options?: { roleAssignments?: Record<string, string>; kickoffData?: Record<string, unknown> }
): Promise<Flow> {
  const res = await fetch(`${API_BASE}/templates/${templateId}/flows`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...options }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to start flow');
  return data.data;
}

/**
 * Start a test flow run from a template (works on DRAFT templates too)
 */
export async function startTestFlow(templateId: string, name: string): Promise<Flow> {
  const res = await fetch(`${API_BASE}/templates/${templateId}/flows`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, isTest: true }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to start test flow');
  return data.data;
}

/**
 * Cancel a flow run
 */
export async function cancelFlow(id: string): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${id}/cancel`, { ...fetchOpts, method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to cancel flow');
  return data.data;
}

/**
 * Complete a step in a flow run
 */
export async function completeStep(runId: string, stepId: string, resultData?: Record<string, unknown>): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${runId}/steps/${stepId}/complete`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resultData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to complete step');
  return data.data;
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(id: string): Promise<Template> {
  const res = await fetch(`${API_BASE}/templates/${id}/duplicate`, { ...fetchOpts, method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to duplicate template');
  return data.data;
}

// ============================================================================
// Notifications API
// ============================================================================

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  flowRunId?: string;
  stepExecutionId?: string;
  readAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export async function listNotifications(params?: { unreadOnly?: boolean }): Promise<AppNotification[]> {
  const query = params?.unreadOnly ? '?unreadOnly=true' : '';
  const res = await fetch(`${API_BASE}/notifications${query}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list notifications');
  return data.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, fetchOpts);
  const data = await res.json();
  if (!data.success) return 0;
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/read`, { ...fetchOpts, method: 'PATCH' });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE}/notifications/read-all`, { ...fetchOpts, method: 'POST' });
}

export async function dismissNotification(id: string): Promise<void> {
  await fetch(`${API_BASE}/notifications/${id}/dismiss`, { ...fetchOpts, method: 'PATCH' });
}

// ============================================================================
// Contacts API
// ============================================================================

export interface Contact {
  id: string;
  name: string;
  email: string;
  type: 'ADMIN' | 'ASSIGNEE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

export async function listContacts(): Promise<Contact[]> {
  const res = await fetch(`${API_BASE}/contacts`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list contacts');
  return data.data;
}

export async function createContact(contact: { name: string; email: string; type?: string; status?: string }): Promise<Contact> {
  const res = await fetch(`${API_BASE}/contacts`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create contact');
  return data.data;
}

export async function updateContact(id: string, updates: Partial<{ name: string; email: string; type: string; status: string }>): Promise<Contact> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update contact');
  return data.data;
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/contacts/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete contact');
}

export async function toggleContactStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Contact> {
  const res = await fetch(`${API_BASE}/contacts/${id}/status`, {
    ...fetchOpts,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update contact status');
  return data.data;
}

// ============================================================================
// Stream Event Types
// ============================================================================

// Stream event types
export type StreamEventType =
  | 'session'
  | 'thinking'
  | 'content'
  | 'mode'
  | 'workflow'
  | 'clarify'
  | 'reject'
  | 'respond'
  | 'done'
  | 'error';

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
}
