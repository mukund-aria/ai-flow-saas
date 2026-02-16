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
// Flows API
// ============================================================================

export interface Flow {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
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

export interface CreateFlowRequest {
  name: string;
  description?: string;
  definition?: Record<string, unknown>;
  status?: 'DRAFT' | 'ACTIVE';
}

/**
 * List all flows
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
 * Create a new flow
 */
export async function createFlow(request: CreateFlowRequest): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create flow');
  return data.data;
}

/**
 * Update a flow
 */
export async function updateFlow(id: string, updates: Partial<CreateFlowRequest>): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update flow');
  return data.data;
}

/**
 * Delete (archive) a flow
 */
export async function deleteFlow(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/flows/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete flow');
}

/**
 * Publish a draft flow (set status to ACTIVE)
 */
export async function publishFlow(id: string): Promise<Flow> {
  const res = await fetch(`${API_BASE}/flows/${id}/publish`, { ...fetchOpts, method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to publish flow');
  return data.data;
}

// ============================================================================
// Flow Runs API
// ============================================================================

export interface FlowRun {
  id: string;
  flowId: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  currentStepIndex: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  flow?: { id: string; name: string };
}

export interface StartFlowRunRequest {
  flowId: string;
  name: string;
}

/**
 * List all flow runs
 */
export async function listFlowRuns(): Promise<FlowRun[]> {
  const res = await fetch(`${API_BASE}/runs`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list flow runs');
  return data.data;
}

/**
 * Get a single flow run by ID
 */
export async function getFlowRun(id: string): Promise<FlowRun> {
  const res = await fetch(`${API_BASE}/runs/${id}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Flow run not found');
  return data.data;
}

/**
 * Start a new flow run
 */
export async function startFlowRun(flowId: string, name: string): Promise<FlowRun> {
  const res = await fetch(`${API_BASE}/flows/${flowId}/runs`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to start flow run');
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
