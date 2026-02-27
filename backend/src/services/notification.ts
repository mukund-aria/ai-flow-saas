/**
 * Notification Service
 *
 * Central dispatcher for all notifications — checks preferences, prevents
 * duplicates via the notification log, routes to the correct channel
 * (email / in-app), and logs everything.
 */

import { db, notifications, notificationLog, userNotificationPrefs, stepExecutions, flowRuns, users, flows, contacts, magicLinks } from '../db/index.js';
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
  flowRunId?: string;
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
      flowRunId: params.flowRunId,
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
  flowRunId?: string;
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
  stepExec: { id: string; stepId: string; flowRunId: string },
  run: { id: string; name: string; organizationId: string; startedById: string; flow?: { name: string } | null }
): Promise<void> {
  const stepName = stepExec.stepId;

  await createInAppNotification({
    organizationId: run.organizationId,
    userId: run.startedById,
    type: 'STEP_COMPLETED',
    title: 'Step completed',
    body: `"${stepName}" was completed in ${run.name}`,
    flowRunId: run.id,
    stepExecutionId: stepExec.id,
  });

  await logNotification({
    organizationId: run.organizationId,
    recipientUserId: run.startedById,
    channel: 'IN_APP',
    eventType: 'STEP_COMPLETED',
    flowRunId: run.id,
    stepExecutionId: stepExec.id,
    status: 'SENT',
  });
}

/**
 * Notify coordinator (email + in-app) and assignee when a flow completes.
 */
export async function notifyFlowCompleted(
  run: { id: string; name: string; organizationId: string; startedById: string; flowId: string }
): Promise<void> {
  // Get coordinator info
  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  const flow = await db.query.flows.findFirst({
    where: eq(flows.id, run.flowId),
  });

  if (coordinator) {
    // In-app notification
    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'FLOW_COMPLETED',
      title: 'Flow completed',
      body: `${run.name} has been completed successfully`,
      flowRunId: run.id,
    });

    // Email notification
    await email.sendFlowCompleted({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: flow?.name || 'Unknown Flow',
      runName: run.name,
    });

    await logNotification({
      organizationId: run.organizationId,
      recipientEmail: coordinator.email,
      recipientUserId: coordinator.id,
      channel: 'EMAIL',
      eventType: 'FLOW_COMPLETED',
      flowRunId: run.id,
      status: 'SENT',
    });
  }
}

/**
 * Notify all active assignees when a flow is cancelled.
 */
export async function notifyFlowCancelled(
  run: { id: string; name: string; organizationId: string; flowId: string }
): Promise<void> {
  const flow = await db.query.flows.findFirst({
    where: eq(flows.id, run.flowId),
  });

  // Find all step executions that were in progress or waiting
  const activeSteps = await db.query.stepExecutions.findMany({
    where: and(
      eq(stepExecutions.flowRunId, run.id)
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
        flowName: flow?.name || run.name,
      });

      await logNotification({
        organizationId: run.organizationId,
        recipientEmail: assigneeEmail,
        channel: 'EMAIL',
        eventType: 'FLOW_CANCELLED',
        flowRunId: run.id,
        status: 'SENT',
      });
    }
  }
}

/**
 * Send a reminder to the assignee of a step.
 */
export async function notifyReminder(
  stepExec: { id: string; stepId: string; flowRunId: string; assignedToUserId?: string | null; assignedToContactId?: string | null }
): Promise<void> {
  const run = await db.query.flowRuns.findFirst({
    where: eq(flowRuns.id, stepExec.flowRunId),
    with: { flow: true },
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
        flowName: run.flow?.name || run.name,
        stepName: stepExec.stepId,
        token: link?.token,
        dueAt: null, // Will be enriched by caller
      });

      await logNotification({
        organizationId: run.organizationId,
        recipientEmail: contact.email,
        channel: 'EMAIL',
        eventType: 'REMINDER',
        flowRunId: run.id,
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
      flowRunId: run.id,
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
  stepExec: { id: string; stepId: string; flowRunId: string; assignedToUserId?: string | null; assignedToContactId?: string | null }
): Promise<void> {
  const run = await db.query.flowRuns.findFirst({
    where: eq(flowRuns.id, stepExec.flowRunId),
    with: { flow: true },
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
          flowName: run.flow?.name || run.name,
          stepName: stepExec.stepId,
          token: link?.token,
        });

        await logNotification({
          organizationId: run.organizationId,
          recipientEmail: contact.email,
          channel: 'EMAIL',
          eventType: 'STEP_OVERDUE',
          flowRunId: run.id,
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
    flowRunId: run.id,
    stepExecutionId: stepExec.id,
  });

  // Dispatch webhook
  dispatchWebhooks({
    flowId: run.flowId,
    event: 'step.overdue',
    payload: {
      event: 'step.overdue',
      timestamp: new Date().toISOString(),
      flow: { id: run.flowId, name: run.flow?.name || run.name },
      flowRun: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      step: { id: stepExec.stepId, name: stepExec.stepId, index: 0 },
      metadata: {},
    },
    orgId: run.organizationId,
    flowRunId: run.id,
    stepExecId: stepExec.id,
  }).catch((err) => console.error('[Webhook] step.overdue dispatch error:', err));
}

/**
 * Notify escalation target when a step is overdue past the escalation threshold.
 */
export async function notifyEscalation(
  stepExec: { id: string; stepId: string; flowRunId: string }
): Promise<void> {
  const run = await db.query.flowRuns.findFirst({
    where: eq(flowRuns.id, stepExec.flowRunId),
    with: { flow: true },
  });

  if (!run) return;

  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  if (coordinator) {
    await email.sendEscalation({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: run.flow?.name || run.name,
      stepName: stepExec.stepId,
      runName: run.name,
    });

    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'ESCALATION',
      title: 'Task escalated',
      body: `"${stepExec.stepId}" in ${run.name} has been escalated — overdue past threshold`,
      flowRunId: run.id,
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
      flowRunId: run.id,
      stepExecutionId: stepExec.id,
      status: 'SENT',
    });
  }

  // Dispatch webhook
  dispatchWebhooks({
    flowId: run.flowId,
    event: 'step.escalated',
    payload: {
      event: 'step.escalated',
      timestamp: new Date().toISOString(),
      flow: { id: run.flowId, name: run.flow?.name || run.name },
      flowRun: { id: run.id, name: run.name, status: 'IN_PROGRESS' },
      step: { id: stepExec.stepId, name: stepExec.stepId, index: 0 },
      metadata: {},
    },
    orgId: run.organizationId,
    flowRunId: run.id,
    stepExecId: stepExec.id,
  }).catch((err) => console.error('[Webhook] step.escalated dispatch error:', err));
}

/**
 * Notify coordinator when a flow has had no progress for 72 hours.
 */
export async function notifyFlowStalled(
  run: { id: string; name: string; organizationId: string; startedById: string; flowId: string }
): Promise<void> {
  const coordinator = await db.query.users.findFirst({
    where: eq(users.id, run.startedById),
  });

  const flow = await db.query.flows.findFirst({
    where: eq(flows.id, run.flowId),
  });

  if (coordinator) {
    await email.sendFlowStalled({
      to: coordinator.email,
      userName: coordinator.name,
      flowName: flow?.name || run.name,
      runName: run.name,
    });

    await createInAppNotification({
      organizationId: run.organizationId,
      userId: coordinator.id,
      type: 'FLOW_STALLED',
      title: 'Flow stalled',
      body: `${run.name} has had no progress for 72 hours`,
      flowRunId: run.id,
    });

    await logNotification({
      organizationId: run.organizationId,
      recipientEmail: coordinator.email,
      recipientUserId: coordinator.id,
      channel: 'EMAIL',
      eventType: 'FLOW_STALLED',
      flowRunId: run.id,
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
  run: { id: string; name: string; organizationId: string; startedById: string; flowId: string },
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
      flowRunId: run.id,
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
        flowRunId: run.id,
        status: 'SENT',
      });
    }
  }
}

/**
 * Chat email frequency cap — batch rapid-fire messages (5 minute window).
 */
async function canSendChatEmail(flowRunId: string, recipientEmail: string): Promise<boolean> {
  const chatCapMs = 5 * 60 * 1000; // 5 minutes
  const cutoff = new Date(Date.now() - chatCapMs);

  const recent = await db.query.notificationLog.findFirst({
    where: and(
      eq(notificationLog.flowRunId, flowRunId),
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

  const stalledRuns = await db.query.flowRuns.findMany({
    where: and(
      eq(flowRuns.status, 'IN_PROGRESS'),
      // lastActivityAt is null or before cutoff
    ),
  });

  for (const run of stalledRuns) {
    const lastActivity = run.lastActivityAt || run.startedAt;
    if (lastActivity < cutoff) {
      // Check if we already sent a stalled notification recently
      const recentNotif = await db.query.notificationLog.findFirst({
        where: and(
          eq(notificationLog.flowRunId, run.id),
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
