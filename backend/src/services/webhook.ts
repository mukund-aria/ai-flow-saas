/**
 * Outgoing Webhook Service
 *
 * Dispatches signed HTTP POST payloads to configured webhook endpoints
 * when flow lifecycle events occur (flow started, step completed, etc.).
 *
 * Endpoints are configured per-flow-template in notification settings.
 * Each payload is HMAC-SHA256 signed with the endpoint's secret.
 */

import crypto from 'node:crypto';
import { db, flows, notificationLog } from '../db/index.js';
import { eq } from 'drizzle-orm';
import type {
  WebhookEndpointConfig,
  WebhookEventType,
  WebhookEventConfig,
  FlowNotificationSettings,
} from '../models/workflow.js';
import { defaultFlowNotificationSettings, migrateNotificationSettings } from '../models/workflow.js';

// ============================================================================
// Payload Types
// ============================================================================

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  flow: { id: string; name: string };
  flowRun?: { id: string; name: string; status: string };
  step?: { id: string; name: string; index: number };
  metadata: Record<string, unknown>;
}

export interface WebhookJobData {
  endpoint: WebhookEndpointConfig;
  payload: WebhookPayload;
  organizationId: string;
  flowRunId?: string;
  stepExecutionId?: string;
}

// ============================================================================
// Signature
// ============================================================================

export function signPayload(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

// ============================================================================
// HTTP Sender
// ============================================================================

export async function sendWebhook(
  endpoint: WebhookEndpointConfig,
  payload: WebhookPayload
): Promise<{ status: number; body: string }> {
  const body = JSON.stringify(payload);
  const signature = signPayload(body, endpoint.secret);
  const webhookId = crypto.randomUUID();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-Id': webhookId,
      },
      body,
      signal: controller.signal,
    });

    const responseBody = await response.text().catch(() => '');
    return { status: response.status, body: responseBody };
  } finally {
    clearTimeout(timeout);
  }
}

// ============================================================================
// Event → Config Key Mapping
// ============================================================================

const EVENT_CONFIG_MAP: Record<WebhookEventType, keyof WebhookEventConfig> = {
  'flow.started': 'flowStarted',
  'step.completed': 'stepCompleted',
  'flow.completed': 'flowCompleted',
  'flow.cancelled': 'flowCancelled',
  'step.overdue': 'stepOverdue',
  'step.escalated': 'stepEscalated',
  'chat.message': 'chatMessage',
};

// ============================================================================
// Dispatch (enqueue or sync send)
// ============================================================================

export async function dispatchWebhooks(params: {
  flowId: string;
  event: WebhookEventType;
  payload: WebhookPayload;
  orgId: string;
  flowRunId?: string;
  stepExecId?: string;
}): Promise<void> {
  const { flowId, event, payload, orgId, flowRunId, stepExecId } = params;

  // Load the flow template to get webhook settings
  const flow = await db.query.flows.findFirst({
    where: eq(flows.id, flowId),
  });

  if (!flow) return;

  const definition = flow.definition as { settings?: { notifications?: Record<string, unknown> } } | null;
  const rawSettings = definition?.settings?.notifications;
  const settings: FlowNotificationSettings = rawSettings
    ? migrateNotificationSettings(rawSettings)
    : defaultFlowNotificationSettings();

  const endpoints = settings.channelIntegrations?.webhooks?.endpoints || [];
  if (endpoints.length === 0) return;

  const configKey = EVENT_CONFIG_MAP[event];

  // Filter to enabled endpoints that subscribe to this event
  const matchingEndpoints = endpoints.filter(
    (ep) => ep.enabled && ep.events[configKey]
  );

  if (matchingEndpoints.length === 0) return;

  // Try to enqueue via BullMQ, fall back to synchronous dispatch
  for (const endpoint of matchingEndpoints) {
    try {
      const { addWebhookJob } = await import('./scheduler.js');
      await addWebhookJob({
        endpoint,
        payload,
        organizationId: orgId,
        flowRunId,
        stepExecutionId: stepExecId,
      });
    } catch {
      // BullMQ not available (dev mode) — send synchronously
      try {
        await handleWebhookJob({
          endpoint,
          payload,
          organizationId: orgId,
          flowRunId,
          stepExecutionId: stepExecId,
        });
      } catch (err) {
        console.error(`[Webhook] Sync dispatch failed for ${endpoint.label}:`, (err as Error).message);
      }
    }
  }
}

// ============================================================================
// Job Handler (called by scheduler worker or sync fallback)
// ============================================================================

export async function handleWebhookJob(data: WebhookJobData): Promise<void> {
  const { endpoint, payload, organizationId, flowRunId, stepExecutionId } = data;

  try {
    const result = await sendWebhook(endpoint, payload);
    const success = result.status >= 200 && result.status < 300;

    await db.insert(notificationLog).values({
      organizationId,
      channel: 'WEBHOOK',
      eventType: payload.event,
      flowRunId: flowRunId || null,
      stepExecutionId: stepExecutionId || null,
      recipientEmail: endpoint.url,
      status: success ? 'SENT' : 'FAILED',
      errorMessage: success ? null : `HTTP ${result.status}: ${result.body.slice(0, 200)}`,
    });

    if (!success) {
      throw new Error(`Webhook returned HTTP ${result.status}`);
    }
  } catch (err) {
    // Log failure if not already logged (e.g., network error before response)
    if ((err as Error).message && !(err as Error).message.startsWith('Webhook returned HTTP')) {
      await db.insert(notificationLog).values({
        organizationId,
        channel: 'WEBHOOK',
        eventType: payload.event,
        flowRunId: flowRunId || null,
        stepExecutionId: stepExecutionId || null,
        recipientEmail: endpoint.url,
        status: 'FAILED',
        errorMessage: (err as Error).message.slice(0, 200),
      }).catch(() => {}); // Don't let logging failure mask the original error
    }

    // Re-throw so BullMQ can retry
    throw err;
  }
}
