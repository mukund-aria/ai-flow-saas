/**
 * API Client for AI Flow Copilot Backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  const data = await res.json();
  return data.session;
}

/**
 * List all sessions
 */
export async function listSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  const data = await res.json();
  return data.sessions;
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
}

/**
 * Send a chat message (non-streaming)
 */
export async function sendMessage(request: ChatRequest) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: false }),
  });
  return res.json();
}

/**
 * Send a chat message with SSE streaming
 * Returns an async generator that yields stream events
 */
export async function* streamMessage(request: ChatRequest): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

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
 * Upload a file (document/diagram)
 */
export async function uploadFile(request: UploadRequest) {
  const formData = new FormData();
  formData.append('file', request.file);
  if (request.sessionId) formData.append('sessionId', request.sessionId);
  if (request.prompt) formData.append('prompt', request.prompt);

  const res = await fetch(`${API_BASE}/chat/upload`, {
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
  await fetch(`${API_BASE}/sessions/${sessionId}/plan`, { method: 'DELETE' });
}

/**
 * Get workflow from session
 */
export async function getWorkflow(sessionId: string) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/workflow`);
  return res.json();
}

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
