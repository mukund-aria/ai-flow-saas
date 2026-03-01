/**
 * Notification Service
 *
 * Central dispatcher for all notifications — checks preferences, prevents
 * duplicates via the notification log, routes to the correct channel
 * (email / in-app), and logs everything.
 */

import { db, notifications, notificationLog, userNotificationPrefs, stepExecutions, flows, users, templates, contacts, magicLinks, integrations } from '../db/index.js';
import { eq, and, gte, desc } from 'drizzle-orm';
import * as email from './email.js';
import { dispatchWebhooks } from './webhook.js';

const EMAIL_FREQUENCY_CAP_MS = 12 * 60 * 60 * 1000; // 12 hours
const STALLED_THRESHOLD_MS = 72 * 60 * 60 * 1000; // 72 hours

// ============================================================================
// In-App Notification Creation
// ============================================================================

export async function createInAppNotification(params: {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  flowId?: string;
  stepExecutionId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    // Check user preferences
    const prefs = await db.query.userNotificationPrefs.findFirst({
      where: and(
        eq(userNotificationPrefs.userId, params.userId),
        eq(userNotificationPrefs.organizationId, params.organizationId)
      ),
    });

    if (prefs && !prefs.inAppEnabled) return;
    if (prefs?.mutedEventTypes && (prefs.mutedEventTypes as string[]).includes(params.type)) return;

    await db.insert(notifications).values({
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      flowId: params.flowId,
      stepExecutionId: params.stepExecutionId,
      metadata: params.metadata,
    });
  } catch (err) {
    console.error('[Notification] Failed to create in-app notification:', err);
  }
}

// ============================================================================
// Email Frequency Cap Check
// ============================================================================

async function canSendEmail(
  stepExecutionId: string,
  eventType: string,
  recipientEmail: string
): Promise<boolean> {
  const cutoff = new Date(Date.now() - EMAIL_FREQUENCY_CAP_MS);

  const recent = await db.query.notificationLog.findFirst({
    where: and(
      eq(notificationLog.stepExecutionId, stepExecutionId),
      eq(notificationLog.eventType, eventType),
      eq(notificationLog.recipientEmail, recipientEmail),
      eq(notificationLog.channel, 'EMAIL'),
      gte(notificationLog.sentAt, cutoff)
    ),
  });

  return !recent;
}

async function logNotification(params: {
  organizationId: string;
  recipientEmail?: string;
  recipientUserId?: string;
  channel: 'EMAIL' | 'IN_APP';
  eventType: string;
  flowId?: string;
  stepExecutionId?: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  errorMessage?: string;
}): Promise<void> {
  try {
    await db.insert(notificationLog).values(params);
  } catch (err) {
    console.error('[Notification] Failed to log notification:', err);
  }
}

// ============================================================================
// Event Handlers — Called from route handlers and scheduler jobs
// ============================================================================

/**
 * Notify coordinator when a step is completed.
 */
export async function notifyStepCompleted(
  stepExec: { id: string; stepId: string; flowId: string },
  run: { id: string; name: string; organizationId: string; startedById: string; flow?: { name: string } | null }
): Promise<void> {
  const stepName = stepExec.stepId;

  await createInAppNotification({
    organizationId: run.organizationId,
    userId: run.startedById,
    type: 'STEP_COMPLETED',
    title: 'Step completed',
    body: `"${stepName}" was completed in ${run.name}`,
    flowId: run.id,
    stepExecutionId: stepExec.id,
  });

  await logNotification({
    organizationId: run.organizationId,
    recipientUserId: run.startedById,
    channel: 'IN_APP',
    eventType: 'STEP_COMPLETED',
    flowId: run.id,
    stepExecutionId: stepExec.id,
    status: 'SENT',
  });
}

/**
 * Notify coordinator (email + in-app) and assignee when a flow completes.
 */
export async function notifyFlowCompleted(
  run: { id: string; name: string; organizationId: string; startedById: string; templateId: string }
): Promise<void> {
  // Get coordinator info
  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  const template = await db.query.templates.findFirst({
    where: eq(templates.id, run.templateId),
  });

  if (coordinator) {
    // In-app notification
    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'FLOW_COMPLETED',
      title: 'Flow completed',
      body: `${run.name} has been completed successfully`,
      flowId: run.id,
    });

    // Email notification
    await email.sendFlowCompleted({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: template?.name || 'Unknown Flow',
      runName: run.name,
    });

    await logNotification({
      organizationId: run.organizationId,
      recipientEmail: coordinator.email,
      recipientUserId: coordinator.id,
      channel: 'EMAIL',
      eventType: 'FLOW_COMPLETED',
      flowId: run.id,
      status: 'SENT',
    });
  }
}

/**
 * Notify all active assignees when a flow is cancelled.
 */
export async function notifyFlowCancelled(
  run: { id: string; name: string; organizationId: string; templateId: string }
): Promise<void> {
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, run.templateId),
  });

  // Find all step executions that were in progress or waiting
  const activeSteps = await db.query.stepExecutions.findMany({
    where: and(
      eq(stepExecutions.flowId, run.id)
    ),
    with: {
      assignedToUser: true,
      assignedToContact: true,
    },
  });

  const notifiedEmails = new Set<string>();

  for (const step of activeSteps) {
    const assigneeEmail = step.assignedToUser?.email || step.assignedToContact?.email;
    const assigneeName = step.assignedToUser?.name || step.assignedToContact?.name;

    if (assigneeEmail && assigneeName && !notifiedEmails.has(assigneeEmail)) {
      notifiedEmails.add(assigneeEmail);

      await email.sendFlowCancelled({
        to: assigneeEmail,
        contactName: assigneeName,
        flowName: template?.name || run.name,
      });

      await logNotification({
        organizationId: run.organizationId,
        recipientEmail: assigneeEmail,
        channel: 'EMAIL',
        eventType: 'FLOW_CANCELLED',
        flowId: run.id,
        status: 'SENT',
      });
    }
  }
}

/**
 * Send a reminder to the assignee of a step.
 */
export async function notifyReminder(
  stepExec: { id: string; stepId: string; flowId: string; assignedToUserId?: string | null; assignedToContactId?: string | null }
): Promise<void> {
  const run = await db.query.flows.findFirst({
    where: eq(flows.id, stepExec.flowId),
    with: { template: true },
  });

  if (!run) return;

  // Get assignee info
  if (stepExec.assignedToContactId) {
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, stepExec.assignedToContactId),
    });

    if (contact) {
      // Check email frequency cap
      const canSend = await canSendEmail(stepExec.id, 'REMINDER', contact.email);
      if (!canSend) return;

      // Find existing magic link for re-sending
      const link = await db.query.magicLinks.findFirst({
        where: eq(magicLinks.stepExecutionId, stepExec.id),
      });

      await email.sendReminder({
        to: contact.email,
        contactName: contact.name,
        flowName: run.template?.name || run.name,
        stepName: stepExec.stepId,
        token: link?.token,
        dueAt: null, // Will be enriched by caller
      });

      await logNotification({
        organizationId: run.organizationId,
        recipientEmail: contact.email,
        channel: 'EMAIL',
        eventType: 'REMINDER',
        flowId: run.id,
        stepExecutionId: stepExec.id,
        status: 'SENT',
      });
    }
  }

  if (stepExec.assignedToUserId) {
    // In-app notification for internal users
    await createInAppNotification({
      organizationId: run.organizationId,
      userId: stepExec.assignedToUserId,
      type: 'REMINDER',
      title: 'Task reminder',
      body: `"${stepExec.stepId}" in ${run.name} is due soon`,
      flowId: run.id,
      stepExecutionId: stepExec.id,
    });
  }

  // Update reminder tracking
  await db.update(stepExecutions)
    .set({
      lastReminderSentAt: new Date(),
      reminderCount: (await db.query.stepExecutions.findFirst({ where: eq(stepExecutions.id, stepExec.id) }))?.reminderCount
        ? (await db.query.stepExecutions.findFirst({ where: eq(stepExecutions.id, stepExec.id) }))!.reminderCount + 1
        : 1,
    })
    .where(eq(stepExecutions.id, stepExec.id));
}

/**
 * Notify when a step becomes overdue (assignee email + coordinator in-app).
 */
export async function notifyStepOverdue(
  stepExec: { id: string; stepId: string; flowId: string; assignedToUserId?: string | null; assignedToContactId?: string | null }
): Promise<void> {
  const run = await db.query.flows.findFirst({
    where: eq(flows.id, stepExec.flowId),
    with: { template: true },
  });

  if (!run) return;

  // Notify assignee
  if (stepExec.assignedToContactId) {
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, stepExec.assignedToContactId),
    });

    if (contact) {
      const canSend = await canSendEmail(stepExec.id, 'STEP_OVERDUE', contact.email);
      if (canSend) {
        const link = await db.query.magicLinks.findFirst({
          where: eq(magicLinks.stepExecutionId, stepExec.id),
        });

        await email.sendOverdueNotice({
          to: contact.email,
          contactName: contact.name,
          flowName: run.template?.name || run.name,
          stepName: stepExec.stepId,
          token: link?.token,
        });

        await logNotification({
          organizationId: run.organizationId,
          recipientEmail: contact.email,
          channel: 'EMAIL',
          eventType: 'STEP_OVERDUE',
          flowId: run.id,
          stepExecutionId: stepExec.id,
          status: 'SENT',
        });
      }
    }
  }

  // Notify coordinator (in-app)
  await createInAppNotification({
    organizationId: run.organizationId,
    userId: run.startedById,
    type: 'STEP_OVERDUE',
    title: 'Step overdue',
    body: `"${stepExec.stepId}" in ${run.name} is overdue`,
    flowId: run.id,
    stepExecutionId: stepExec.id,
  });

  // Dispatch webhook
  dispatchWebhooks({
    templateId: run.templateId,
    event: 'step.overdue',
    payload: {
      event: 'step.overdue',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      step: { id: stepExec.stepId, name: stepExec.stepId, index: 0 },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
    stepExecId: stepExec.id,
  }).catch((err) => console.error('[Webhook] step.overdue dispatch error:', err));
}

/**
 * Notify escalation target when a step is overdue past the escalation threshold.
 */
export async function notifyEscalation(
  stepExec: { id: string; stepId: string; flowId: string }
): Promise<void> {
  const run = await db.query.flows.findFirst({
    where: eq(flows.id, stepExec.flowId),
    with: { template: true },
  });

  if (!run) return;

  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  if (coordinator) {
    await email.sendEscalation({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: run.template?.name || run.name,
      stepName: stepExec.stepId,
      runName: run.name,
    });

    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'ESCALATION',
      title: 'Task escalated',
      body: `"${stepExec.stepId}" in ${run.name} has been escalated — overdue past threshold`,
      flowId: run.id,
      stepExecutionId: stepExec.id,
    });

    // Mark step as escalated
    await db.update(stepExecutions)
      .set({ escalatedAt: new Date() })
      .where(eq(stepExecutions.id, stepExec.id));

    await logNotification({
      organizationId: run.organizationId,
      recipientEmail: coordinator.email,
      recipientUserId: coordinator.id,
      channel: 'EMAIL',
      eventType: 'ESCALATION',
      flowId: run.id,
      stepExecutionId: stepExec.id,
      status: 'SENT',
    });
  }

  // Dispatch webhook
  dispatchWebhooks({
    templateId: run.templateId,
    event: 'step.escalated',
    payload: {
      event: 'step.escalated',
      timestamp: new Date().toISOString(),
      template: { id: run.templateId, name: run.template?.name || run.name },
      flow: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      step: { id: stepExec.stepId, name: stepExec.stepId, index: 0 },
      metadata: {},
    },
    orgId: run.organizationId,
    flowId: run.id,
    stepExecId: stepExec.id,
  }).catch((err) => console.error('[Webhook] step.escalated dispatch error:', err));
}

/**
 * Notify coordinator when a flow has had no progress for 72 hours.
 */
export async function notifyFlowStalled(
  run: { id: string; name: string; organizationId: string; startedById: string; templateId: string }
): Promise<void> {
  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  const template = await db.query.templates.findFirst({
    where: eq(templates.id, run.templateId),
  });

  if (coordinator) {
    await email.sendFlowStalled({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: template?.name || run.name,
      runName: run.name,
    });

    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'FLOW_STALLED',
      title: 'Flow stalled',
      body: `${run.name} has had no progress for 72 hours`,
      flowId: run.id,
    });

    await logNotification({
      organizationId: run.organizationId,
      recipientEmail: coordinator.email,
      recipientUserId: coordinator.id,
      channel: 'EMAIL',
      eventType: 'FLOW_STALLED',
      flowId: run.id,
      status: 'SENT',
    });
  }
}

// ============================================================================
// Chat Notifications
// ============================================================================

/**
 * Notify coordinator when an assignee sends a chat message.
 */
export async function notifyChatMessage(
  run: { id: string; name: string; organizationId: string; startedById: string; templateId: string },
  senderName: string,
  messagePreview: string
): Promise<void> {
  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  if (coordinator) {
    // In-app notification
    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'CHAT_MESSAGE',
      title: `New message from ${senderName}`,
      body: messagePreview.length > 100 ? messagePreview.slice(0, 100) + '...' : messagePreview,
      flowId: run.id,
      metadata: { senderName },
    });

    // Check email frequency cap (batch messages within 5 minutes)
    const canSend = await canSendChatEmail(run.id, coordinator.email);
    if (canSend) {
      await email.sendChatNotification({
        to: coordinator.email,
        userName: coordinator.name,
        senderName,
        flowName: run.name,
        messagePreview,
      });

      await logNotification({
        organizationId: run.organizationId,
        recipientEmail: coordinator.email,
        recipientUserId: coordinator.id,
        channel: 'EMAIL',
        eventType: 'CHAT_MESSAGE',
        flowId: run.id,
        status: 'SENT',
      });
    }
  }
}

/**
 * Chat email frequency cap — batch rapid-fire messages (5 minute window).
 */
async function canSendChatEmail(flowId: string, recipientEmail: string): Promise<boolean> {
  const chatCapMs = 5 * 60 * 1000; // 5 minutes
  const cutoff = new Date(Date.now() - chatCapMs);

  const recent = await db.query.notificationLog.findFirst({
    where: and(
      eq(notificationLog.flowId, flowId),
      eq(notificationLog.eventType, 'CHAT_MESSAGE'),
      eq(notificationLog.recipientEmail, recipientEmail),
      eq(notificationLog.channel, 'EMAIL'),
      gte(notificationLog.sentAt, cutoff)
    ),
  });

  return !recent;
}

// ============================================================================
// Job Handlers (called from scheduler.ts worker)
// ============================================================================

/**
 * Handle a reminder job — look up the step execution and send reminder.
 */
export async function handleReminderJob(stepExecutionId: string): Promise<void> {
  const stepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, stepExecutionId),
  });

  if (!stepExec || stepExec.status === 'COMPLETED' || stepExec.status === 'SKIPPED') return;

  await notifyReminder(stepExec);
}

/**
 * Handle an overdue check — look up the step and send overdue notice.
 */
export async function handleOverdueJob(stepExecutionId: string): Promise<void> {
  const stepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, stepExecutionId),
  });

  if (!stepExec || stepExec.status === 'COMPLETED' || stepExec.status === 'SKIPPED') return;

  // Mark SLA breach timestamp if not already set
  if (!stepExec.slaBreachedAt) {
    await db.update(stepExecutions)
      .set({ slaBreachedAt: new Date() })
      .where(eq(stepExecutions.id, stepExecutionId));
  }

  await notifyStepOverdue(stepExec);
}

/**
 * Handle an escalation — look up the step and escalate if still overdue.
 */
export async function handleEscalationJob(stepExecutionId: string): Promise<void> {
  const stepExec = await db.query.stepExecutions.findFirst({
    where: eq(stepExecutions.id, stepExecutionId),
  });

  if (!stepExec || stepExec.status === 'COMPLETED' || stepExec.status === 'SKIPPED') return;
  if (stepExec.escalatedAt) return; // Already escalated

  await notifyEscalation(stepExec);
}

/**
 * Check for stalled flows (no activity for 72 hours).
 */
export async function handleStalledCheck(): Promise<void> {
  const cutoff = new Date(Date.now() - STALLED_THRESHOLD_MS);

  const stalledRuns = await db.query.flows.findMany({
    where: and(
      eq(flows.status, 'IN_PROGRESS'),
      // lastActivityAt is null or before cutoff
    ),
  });

  for (const run of stalledRuns) {
    const lastActivity = run.lastActivityAt || run.startedAt;
    if (lastActivity < cutoff) {
      // Check if we already sent a stalled notification recently
      const recentNotif = await db.query.notificationLog.findFirst({
        where: and(
          eq(notificationLog.flowId, run.id),
          eq(notificationLog.eventType, 'FLOW_STALLED'),
          gte(notificationLog.sentAt, cutoff)
        ),
      });

      if (!recentNotif) {
        await notifyFlowStalled(run);
      }
    }
  }
}

/**
 * Handle daily digest — aggregate overdue/upcoming across all active flows
 * and send summary email to coordinators who opted in.
 */
export async function handleDailyDigest(): Promise<void> {
  // Find users who have daily digest enabled
  const prefsWithDigest = await db.query.userNotificationPrefs.findMany({
    where: eq(userNotificationPrefs.digestFrequency, 'DAILY'),
    with: { user: true },
  });

  for (const pref of prefsWithDigest) {
    if (!pref.user) continue;

    // Find overdue steps in active runs for this user's org
    const overdueSteps = await db.query.stepExecutions.findMany({
      where: and(
        eq(stepExecutions.status, 'IN_PROGRESS')
      ),
    });

    const overdueItems = overdueSteps.filter(
      (s) => s.dueAt && s.dueAt < new Date()
    );

    if (overdueItems.length > 0) {
      await email.sendDailyDigest({
        to: pref.user.email,
        userName: pref.user.name,
        overdueCount: overdueItems.length,
        activeFlowCount: 0, // Could be enriched
      });

      await logNotification({
        organizationId: pref.organizationId,
        recipientEmail: pref.user.email,
        recipientUserId: pref.userId,
        channel: 'EMAIL',
        eventType: 'DAILY_DIGEST',
        status: 'SENT',
      });
    }
  }
}

// ============================================================================
// Integration Notifications (Slack/Teams/Custom Webhook)
// ============================================================================

/**
 * Dispatch notifications to enabled org-level integrations (Slack, Teams, Custom).
 * Called from execution lifecycle events.
 */
export async function dispatchIntegrationNotifications(orgId: string, event: {
  type: string;
  flowName: string;
  stepName?: string;
  completedBy?: string;
  flowId: string;
}): Promise<void> {
  try {
    const orgIntegrations = await db.query.integrations.findMany({
      where: and(
        eq(integrations.organizationId, orgId),
        eq(integrations.enabled, true)
      ),
    });

    if (orgIntegrations.length === 0) return;

    for (const integration of orgIntegrations) {
      const config = integration.config as { webhookUrl?: string; events?: string[] };
      if (!config?.webhookUrl) continue;

      // Check if integration subscribes to this event type
      if (config.events && config.events.length > 0 && !config.events.includes(event.type)) {
        continue;
      }

      let payload: unknown;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };

      switch (integration.type) {
        case 'SLACK_WEBHOOK': {
          const lines = [`*${event.type}* in *${event.flowName}*`];
          if (event.stepName) lines.push(`Step: ${event.stepName}`);
          if (event.completedBy) lines.push(`By: ${event.completedBy}`);
          payload = {
            blocks: [{
              type: 'section',
              text: { type: 'mrkdwn', text: lines.join('\n') },
            }],
          };
          break;
        }
        case 'TEAMS_WEBHOOK': {
          const facts: { name: string; value: string }[] = [];
          if (event.stepName) facts.push({ name: 'Step', value: event.stepName });
          if (event.completedBy) facts.push({ name: 'Completed By', value: event.completedBy });
          payload = {
            '@type': 'MessageCard',
            summary: `${event.type}: ${event.flowName}`,
            sections: [{
              activityTitle: `${event.type}: ${event.flowName}`,
              facts,
            }],
          };
          break;
        }
        case 'CUSTOM_WEBHOOK':
        default: {
          payload = {
            event: event.type,
            flowName: event.flowName,
            flowId: event.flowId,
            stepName: event.stepName,
            completedBy: event.completedBy,
            timestamp: new Date().toISOString(),
          };
          break;
        }
      }

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10_000);

        const response = await fetch(config.webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const success = response.status >= 200 && response.status < 300;

        // Update delivery status
        await db.update(integrations)
          .set({
            lastDeliveryAt: new Date(),
            lastDeliveryStatus: success ? 'SUCCESS' : `FAILED (HTTP ${response.status})`,
          })
          .where(eq(integrations.id, integration.id));

        // Log
        await db.insert(notificationLog).values({
          organizationId: orgId,
          channel: 'WEBHOOK',
          eventType: event.type,
          flowId: event.flowId,
          recipientEmail: config.webhookUrl,
          status: success ? 'SENT' : 'FAILED',
          errorMessage: success ? null : `HTTP ${response.status}`,
        });
      } catch (err) {
        await db.update(integrations)
          .set({
            lastDeliveryAt: new Date(),
            lastDeliveryStatus: `FAILED (${(err as Error).message})`,
          })
          .where(eq(integrations.id, integration.id));

        console.error(`[Integration] Failed to dispatch to ${integration.name}:`, (err as Error).message);
      }
    }
  } catch (err) {
    console.error('[Integration] dispatchIntegrationNotifications error:', err);
  }
}
