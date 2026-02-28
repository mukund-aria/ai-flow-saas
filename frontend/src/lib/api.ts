/**
 * API Client for ServiceFlow Backend
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
export async function* streamMessage(request: ChatRequest, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${API_BASE}/chat`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
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
  folderId?: string | null;
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
  templateCoordinatorIds?: string[];
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
// Template Folders API
// ============================================================================

export interface Folder {
  id: string;
  name: string;
  organizationId: string;
  templateCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function listFolders(): Promise<Folder[]> {
  const res = await fetch(`${API_BASE}/folders`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch folders');
  return data.data;
}

export async function createFolder(name: string): Promise<Folder> {
  const res = await fetch(`${API_BASE}/folders`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create folder');
  return data.data;
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const res = await fetch(`${API_BASE}/folders/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to rename folder');
  return data.data;
}

export async function deleteFolder(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/folders/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete folder');
}

export async function moveTemplateToFolder(templateId: string, folderId: string | null): Promise<void> {
  const res = await fetch(`${API_BASE}/templates/${templateId}/folder`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderId }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to move template');
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
  portalName?: string;
  startedByContactName?: string;
  currentStepAssignee?: { id: string; name: string; type: 'user' | 'contact' } | null;
  currentStep?: { stepId: string; stepIndex: number; hasAssignee: boolean } | null;
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

/**
 * Send reminder for a specific step in a flow run
 */
export async function remindStep(runId: string, stepId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/flows/${runId}/steps/${stepId}/remind`, {
    ...fetchOpts,
    method: 'POST',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to send reminder');
}

/**
 * Send reminders for multiple overdue runs at once
 */
export async function bulkRemind(runIds: string[]): Promise<{ remindedCount: number }> {
  const res = await fetch(`${API_BASE}/flows/bulk-remind`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runIds }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to send reminders');
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
// Attention API (coordinator attention needed)
// ============================================================================

export type AttentionReasonType =
  | 'YOUR_TURN'
  | 'UNREAD_CHAT'
  | 'STEP_OVERDUE'
  | 'FLOW_OVERDUE'
  | 'ESCALATED'
  | 'STALLED'
  | 'AUTOMATION_FAILED';

export type TrackingStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

export interface AttentionReason {
  type: AttentionReasonType;
  stepId?: string;
  detail?: string;
}

export interface AttentionItem {
  flowRun: {
    id: string;
    name: string;
    status: string;
    dueAt: string | null;
    startedAt: string;
    currentStepIndex: number;
  };
  flow: {
    id: string;
    name: string;
  };
  reasons: AttentionReason[];
  trackingStatus: TrackingStatus;
  totalSteps: number;
  completedSteps: number;
  currentStepAssignee?: { id: string; name: string; type: 'user' | 'contact' } | null;
}

/**
 * Get items needing coordinator attention
 */
export async function getAttentionItems(): Promise<AttentionItem[]> {
  const res = await fetch(`${API_BASE}/attention`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to get attention items');
  return data.data;
}

// ============================================================================
// Contacts API
// ============================================================================

export interface Contact {
  id: string;
  name: string;
  email: string;
  type: 'ADMIN' | 'MEMBER' | 'ASSIGNEE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get an action token for a coordinator to act on a step
 */
export async function getStepActToken(runId: string, stepId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/flows/${runId}/steps/${stepId}/act-token`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to get action token');
  return data.data.token;
}

// ============================================================================
// Team Members API
// ============================================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  picture?: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const res = await fetch(`${API_BASE}/team`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list team members');
  return data.data.members;
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

export interface ContactWorkload {
  active: number;
  completed: number;
  overdue: number;
}

export async function getContactWorkloads(): Promise<Record<string, ContactWorkload>> {
  const res = await fetch(`${API_BASE}/contacts/workload`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch workloads');
  return data.data;
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
// Reports API
// ============================================================================

export interface ReportSummary {
  workspace: { new: number; inProgress: number; completed: number; due: number };
  actions: { yourTurn: number; dueToday: number; overdue: number; dueSoon: number };
  progress: { completionRate: number; avgCompletionDays: string; activeTemplates: number; totalRuns: number; weeklyTrend: number[] };
}

export interface FlowReport {
  name: string;
  templateId: string;
  runs: number;
  completed: number;
  avgCompletionDays: string;
}

export interface AssigneeReport {
  name: string;
  contactId: string;
  tasks: number;
  completed: number;
  pending: number;
}

export interface MemberReport {
  name: string;
  userId: string;
  activeRuns: number;
  completedRuns: number;
}

export async function getReportSummary(range: string = 'week'): Promise<ReportSummary> {
  const res = await fetch(`${API_BASE}/reports/summary?range=${range}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch report summary');
  return data.data;
}

export async function getFlowReports(): Promise<FlowReport[]> {
  const res = await fetch(`${API_BASE}/reports/flows`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch flow reports');
  return data.data;
}

export async function getAssigneeReports(): Promise<AssigneeReport[]> {
  const res = await fetch(`${API_BASE}/reports/assignees`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch assignee reports');
  return data.data;
}

export async function getMemberReports(): Promise<MemberReport[]> {
  const res = await fetch(`${API_BASE}/reports/members`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch member reports');
  return data.data;
}

export interface SLAReport {
  overall: {
    totalCompleted: number;
    stepsWithDue: number;
    onTime: number;
    breached: number;
    complianceRate: number;
  };
  templateBreakdown: Array<{
    templateName: string;
    templateId: string;
    totalSteps: number;
    avgCompletionMs: number;
    avgCompletionFormatted: string;
    breachRate: number;
    bottleneckStep: string | null;
  }>;
}

export interface BottleneckReport {
  stepName: string;
  templateName: string;
  templateId: string;
  avgDurationMs: number;
  avgDurationFormatted: string;
  occurrences: number;
  breachCount: number;
  assignees: string[];
}

export async function getSLAReport(range: string = 'week'): Promise<SLAReport> {
  const res = await fetch(`${API_BASE}/reports/sla?range=${range}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch SLA report');
  return data.data;
}

export async function getBottleneckReport(range: string = 'month'): Promise<BottleneckReport[]> {
  const res = await fetch(`${API_BASE}/reports/bottlenecks?range=${range}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch bottleneck report');
  return data.data;
}

// ============================================================================
// Schedules API
// ============================================================================

export interface Schedule {
  id: string;
  flowId: string;
  flowName: string;
  scheduleName: string;
  cronPattern: string;
  timezone: string;
  enabled: boolean;
  lastRunAt: string | null;
  nextRun: string | null;
  createdAt: string;
}

export async function listSchedules(): Promise<Schedule[]> {
  const res = await fetch(`${API_BASE}/schedules`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list schedules');
  return data.data;
}

export async function createSchedule(data: {
  flowId: string;
  scheduleName: string;
  cronPattern: string;
  timezone?: string;
}): Promise<Schedule> {
  const res = await fetch(`${API_BASE}/schedules`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error?.message || 'Failed to create schedule');
  return result.data;
}

export async function updateSchedule(id: string, data: Partial<{
  scheduleName: string;
  cronPattern: string;
  timezone: string;
  enabled: boolean;
}>): Promise<Schedule> {
  const res = await fetch(`${API_BASE}/schedules/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error?.message || 'Failed to update schedule');
  return result.data;
}

export async function deleteSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/schedules/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete schedule');
}

export async function triggerSchedule(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/schedules/${id}/trigger`, { ...fetchOpts, method: 'POST' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to trigger schedule');
}

// ============================================================================
// Organization Update API
// ============================================================================

export async function updateOrganization(orgId: string, data: { name: string }): Promise<{ id: string; name: string; slug: string }> {
  const res = await fetch(`${API_BASE}/organizations/${orgId}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.error?.message || 'Failed to update organization');
  return result.data;
}

// ============================================================================
// Notification Preferences API
// ============================================================================

export interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestFrequency: 'NONE' | 'DAILY' | 'WEEKLY';
  mutedEventTypes: string[];
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const res = await fetch(`${API_BASE}/notifications/preferences`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch notification preferences');
  return data.data;
}

export async function updateNotificationPreferences(prefs: Partial<Pick<NotificationPreferences, 'emailEnabled' | 'inAppEnabled' | 'digestFrequency'>>): Promise<NotificationPreferences> {
  const res = await fetch(`${API_BASE}/notifications/preferences`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update notification preferences');
  return data.data;
}

// ============================================================================
// PDF Upload API
// ============================================================================

export interface PDFUploadResult {
  documentUrl: string;
  fileName: string;
  fileSize: number;
  pageCount: number;
  fields: Array<{
    fieldId: string;
    pdfFieldName: string;
    label: string;
    fieldType: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature';
    required: boolean;
    options?: string[];
  }>;
}

/**
 * Get or generate a sample fillable PDF for template gallery imports
 */
export async function getSamplePDF(): Promise<PDFUploadResult> {
  const res = await fetch(`${API_BASE}/pdf/sample`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to get sample PDF');
  return data.data;
}

/**
 * Upload a PDF and detect its fillable form fields
 */
export async function uploadPDF(file: File): Promise<PDFUploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/pdf/upload`, {
    ...fetchOpts,
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to upload PDF');
  return data.data;
}

// ============================================================================
// Audit Log API
// ============================================================================

export interface AuditLogEntry {
  id: string;
  action: string;
  actorName: string | null;
  actorEmail: string | null;
  details: Record<string, any> | null;
  createdAt: string;
}

export async function getFlowAuditLog(runId: string): Promise<AuditLogEntry[]> {
  const res = await fetch(`${API_BASE}/flows/${runId}/audit-log`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to fetch audit log');
  return data.data;
}

// ============================================================================
// Step Reassignment API
// ============================================================================

export async function reassignStep(runId: string, stepId: string, assignment: { assignToContactId?: string; assignToUserId?: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/flows/${runId}/steps/${stepId}/reassign`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(assignment),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to reassign step');
}

// ============================================================================
// Search API (Command Palette)
// ============================================================================

export interface SearchResults {
  runs: Array<{ id: string; name: string; status: string }>;
  templates: Array<{ id: string; name: string; status: string }>;
  contacts: Array<{ id: string; name: string; email: string }>;
}

export async function search(query: string): Promise<SearchResults> {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Search failed');
  return data.data;
}

// ============================================================================
// Files API (Cloud File Storage)
// ============================================================================

export interface FileRecord {
  id: string;
  organizationId: string;
  flowRunId?: string;
  stepExecutionId?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  uploadedByContactId?: string;
  uploadedByUserId?: string;
  deletedAt?: string;
  createdAt: string;
}

/**
 * Upload a file for a flow run step (authenticated coordinator)
 */
export async function uploadFlowFile(runId: string, stepId: string, file: File): Promise<FileRecord> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('flowRunId', runId);
  formData.append('stepExecutionId', stepId);

  const res = await fetch(`${API_BASE}/files/upload`, {
    ...fetchOpts,
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to upload file');
  return data.data;
}

/**
 * Upload a file as an assignee via magic link token
 */
export async function uploadPublicFile(token: string, file: File): Promise<FileRecord> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/public/task/${token}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to upload file');
  return data.data;
}

/**
 * List files for a specific step in a flow run
 */
export async function getStepFiles(runId: string, stepId: string): Promise<FileRecord[]> {
  const res = await fetch(`${API_BASE}/files/runs/${runId}/steps/${stepId}/files`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list files');
  return data.data;
}

/**
 * Get download URL for a file (redirects to signed URL or streams)
 */
export function getFileDownloadUrl(fileId: string): string {
  return `${API_BASE}/files/${fileId}/download`;
}

// ============================================================================
// Auth API (OTP)
// ============================================================================

export async function sendOTP(email: string): Promise<{ success: boolean; retryAfter?: number }> {
  const res = await fetch('/auth/otp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email }),
  });
  if (res.status === 429) {
    const data = await res.json();
    throw new Error(data.error || 'Please wait before requesting another code.');
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to send code.');
  }
  return res.json();
}

export async function verifyOTP(email: string, code: string): Promise<{ success: boolean; user: any; redirectTo: string }> {
  const res = await fetch('/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Verification failed.');
  }
  return res.json();
}

// ============================================================================
// Workflow Analysis
// ============================================================================

export async function analyzeWorkflow(workflow: Record<string, unknown>): Promise<{
  success: boolean;
  data?: { suggestions: Array<{ id: string; category: string; priority: string; prompt: string; hint?: string; surfaces: string[]; enhancementDefault?: boolean }>; shape: { stepCount: number; stepTypes: string[]; hasMilestones: boolean } };
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/analyze`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workflow }),
  });
  return res.json();
}

// ============================================================================
// Portals API (Admin)
// ============================================================================

export async function listPortals(): Promise<import('@/types').Portal[]> {
  const res = await fetch(`${API_BASE}/portals`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list portals');
  return data.data;
}

export async function createPortal(portal: { name: string; description?: string }): Promise<import('@/types').Portal> {
  const res = await fetch(`${API_BASE}/portals`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(portal),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create portal');
  return data.data;
}

export async function updatePortal(id: string, updates: Partial<{ name: string; description: string; settings: import('@/types').PortalSettings; brandingOverrides: import('@/types').PortalBranding }>): Promise<import('@/types').Portal> {
  const res = await fetch(`${API_BASE}/portals/${id}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update portal');
  return data.data;
}

export async function deletePortal(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/portals/${id}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete portal');
}

export async function getPortalFlows(portalId: string): Promise<import('@/types').PortalFlow[]> {
  const res = await fetch(`${API_BASE}/portals/${portalId}/flows`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list portal flows');
  return data.data;
}

export async function addPortalFlow(portalId: string, flowId: string, opts?: { displayTitle?: string; displayDescription?: string }): Promise<import('@/types').PortalFlow> {
  const res = await fetch(`${API_BASE}/portals/${portalId}/flows`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flowId, ...opts }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to add flow to portal');
  return data.data;
}

export async function updatePortalFlow(portalId: string, pfId: string, updates: Partial<{ displayTitle: string; displayDescription: string; sortOrder: number; enabled: boolean }>): Promise<import('@/types').PortalFlow> {
  const res = await fetch(`${API_BASE}/portals/${portalId}/flows/${pfId}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update portal flow');
  return data.data;
}

export async function removePortalFlow(portalId: string, pfId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/portals/${portalId}/flows/${pfId}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to remove flow from portal');
}

// ============================================================================
// Email Templates API (Admin)
// ============================================================================

export async function listEmailTemplates(): Promise<import('@/types').EmailTemplate[]> {
  const res = await fetch(`${API_BASE}/email-templates`, fetchOpts);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to list email templates');
  return data.data;
}

export async function updateEmailTemplate(type: string, template: Partial<import('@/types').EmailTemplate>): Promise<import('@/types').EmailTemplate> {
  const res = await fetch(`${API_BASE}/email-templates/${type}`, {
    ...fetchOpts,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update email template');
  return data.data;
}

export async function previewEmailTemplate(type: string, template: Partial<import('@/types').EmailTemplate>, sampleData?: Record<string, string>): Promise<string> {
  const res = await fetch(`${API_BASE}/email-templates/${type}/preview`, {
    ...fetchOpts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...template, sampleData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to preview email template');
  return data.data.html;
}

export async function deleteEmailTemplate(type: string): Promise<void> {
  const res = await fetch(`${API_BASE}/email-templates/${type}`, { ...fetchOpts, method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete email template');
}

// ============================================================================
// Assignee Portal API (Public - Bearer token auth)
// ============================================================================

export async function getPortalInfo(slug: string): Promise<{ name: string; description?: string; branding?: import('@/types').PortalBranding; settings?: import('@/types').PortalSettings }> {
  const res = await fetch(`${API_BASE}/public/portal/${slug}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Portal not found');
  return data.data;
}

export async function portalSendOTP(slug: string, email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/public/portal/${slug}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error?.message || 'Failed to send code');
  }
}

export async function portalVerifyOTP(slug: string, email: string, code: string): Promise<{ token: string; contact: { id: string; name: string; email: string } }> {
  const res = await fetch(`${API_BASE}/public/portal/${slug}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Verification failed');
  return data.data;
}

function assigneeHeaders(token: string): RequestInit {
  return { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

export async function getPortalMe(token: string): Promise<{ contact: { id: string; name: string; email: string }; portal: { name: string; slug: string; branding?: import('@/types').PortalBranding; settings?: import('@/types').PortalSettings } }> {
  const res = await fetch(`${API_BASE}/public/portal/me`, assigneeHeaders(token));
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Session invalid');
  return data.data;
}

export async function getPortalDashboard(token: string): Promise<import('@/types').PortalDashboardData> {
  const res = await fetch(`${API_BASE}/public/portal/dashboard`, assigneeHeaders(token));
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to load dashboard');
  return data.data;
}

export async function getPortalAvailableFlows(token: string): Promise<Array<{ id: string; name: string; description?: string; stepCount: number }>> {
  const res = await fetch(`${API_BASE}/public/portal/flows`, assigneeHeaders(token));
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to load flows');
  return data.data;
}

export async function startPortalFlow(token: string, flowId: string, kickoffData?: Record<string, unknown>): Promise<{ runId: string; firstTaskToken?: string }> {
  const res = await fetch(`${API_BASE}/public/portal/start-flow`, {
    ...assigneeHeaders(token),
    method: 'POST',
    body: JSON.stringify({ flowId, kickoffData }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to start flow');
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
