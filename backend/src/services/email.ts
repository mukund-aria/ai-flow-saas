/**
 * Email Service
 *
 * Sends transactional emails via SMTP (Gmail) or Resend.
 * Priority: SMTP > Resend > console logging (dev mode).
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// --- SMTP (Gmail) transport --- prioritized when configured
const smtpTransport = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || '';

// --- Resend transport --- fallback when SMTP not configured
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const resendFrom = process.env.RESEND_FROM_EMAIL || 'ServiceFlow <noreply@serviceflow.app>';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendEmail(to: string, subject: string, html: string) {
  // Priority 1: SMTP (Gmail) — can send to any address
  if (smtpTransport) {
    try {
      await smtpTransport.sendMail({
        from: smtpFrom,
        to,
        subject,
        html,
      });
      console.log(`[Email] Sent via SMTP to ${to}: ${subject}`);
      return;
    } catch (err) {
      console.error(`[Email] SMTP failed for ${to}, trying Resend fallback:`, err);
      // Fall through to Resend
    }
  }

  // Priority 2: Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: resendFrom,
        to,
        subject,
        html,
      });
      console.log(`[Email] Sent via Resend to ${to}: ${subject}`);
      return;
    } catch (err) {
      console.error(`[Email] Resend failed for ${to}:`, err);
    }
  }

  // Priority 3: Console logging (dev mode)
  console.log(`[Email] (dev mode) To: ${to}, Subject: ${subject}`);
  console.log(`[Email] HTML preview: ${html.substring(0, 200)}...`);
}

// ============================================================================
// Email Templates
// ============================================================================

export async function sendInvitation(params: {
  to: string;
  inviterName: string;
  organizationName: string;
  token: string;
  role: string;
}) {
  const inviteUrl = `${frontendUrl}/login?invite=${params.token}`;

  await sendEmail(params.to, `You've been invited to ${params.organizationName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">You've been invited!</h2>
      <p style="color: #555; line-height: 1.6;">
        <strong>${params.inviterName}</strong> has invited you to join
        <strong>${params.organizationName}</strong> on ServiceFlow as a <strong>${params.role}</strong>.
      </p>
      <a href="${inviteUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Accept Invitation
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        This invitation expires in 7 days. If you didn't expect this email, you can ignore it.
      </p>
    </div>
  `);
}

export async function sendMagicLink(params: {
  to: string;
  contactName: string;
  flowName: string;
  stepName: string;
  token: string;
}) {
  const taskUrl = `${frontendUrl}/task/${params.token}`;

  await sendEmail(params.to, `Action required: ${params.stepName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">You have a new task</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.contactName}, you've been assigned a task in <strong>${params.flowName}</strong>.
      </p>
      <div style="background: #f5f3ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="color: #7c3aed; font-weight: 600; margin: 0;">${params.stepName}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Complete Task
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        This link expires in 7 days. No account is needed to complete this task.
      </p>
    </div>
  `);
}

export async function sendTaskAssigned(params: {
  to: string;
  assigneeName: string;
  flowName: string;
  stepName: string;
}) {
  await sendEmail(params.to, `New task assigned: ${params.stepName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">New task assigned</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.assigneeName}, you've been assigned <strong>${params.stepName}</strong>
        in flow <strong>${params.flowName}</strong>.
      </p>
      <a href="${frontendUrl}/home" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Go to ServiceFlow
      </a>
    </div>
  `);
}

export async function sendFlowCompleted(params: {
  to: string;
  userName: string;
  flowName: string;
  runName: string;
}) {
  await sendEmail(params.to, `Flow completed: ${params.runName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Flow Completed</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.userName}, the flow run <strong>${params.runName}</strong>
        (${params.flowName}) has been completed successfully.
      </p>
      <a href="${frontendUrl}/runs" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Runs
      </a>
    </div>
  `);
}

// ============================================================================
// Notification Email Templates
// ============================================================================

export async function sendReminder(params: {
  to: string;
  contactName: string;
  flowName: string;
  stepName: string;
  token?: string;
  dueAt?: Date | null;
}) {
  const taskUrl = params.token ? `${frontendUrl}/task/${params.token}` : `${frontendUrl}/home`;
  const dueText = params.dueAt
    ? `due ${params.dueAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
    : 'due soon';

  await sendEmail(params.to, `Reminder: ${params.stepName} is ${dueText}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Friendly Reminder</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.contactName}, your task in <strong>${params.flowName}</strong> is ${dueText}.
      </p>
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; font-weight: 600; margin: 0;">${params.stepName}</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Complete Task
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        This is an automated reminder. No account is needed to complete this task.
      </p>
    </div>
  `);
}

export async function sendOverdueNotice(params: {
  to: string;
  contactName: string;
  flowName: string;
  stepName: string;
  token?: string;
}) {
  const taskUrl = params.token ? `${frontendUrl}/task/${params.token}` : `${frontendUrl}/home`;

  await sendEmail(params.to, `Overdue: ${params.stepName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Task Overdue</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.contactName}, your task in <strong>${params.flowName}</strong> is past due.
      </p>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #ef4444;">
        <p style="color: #991b1b; font-weight: 600; margin: 0;">${params.stepName}</p>
        <p style="color: #b91c1c; font-size: 13px; margin: 4px 0 0 0;">This task is overdue. Please complete it as soon as possible.</p>
      </div>
      <a href="${taskUrl}" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Complete Task Now
      </a>
    </div>
  `);
}

export async function sendEscalation(params: {
  to: string;
  userName: string;
  flowName: string;
  stepName: string;
  runName: string;
}) {
  await sendEmail(params.to, `Escalation: ${params.stepName} in ${params.runName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Task Escalated</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.userName}, a task in <strong>${params.runName}</strong> (${params.flowName})
        has been escalated to you because it is significantly overdue.
      </p>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #ef4444;">
        <p style="color: #991b1b; font-weight: 600; margin: 0;">${params.stepName}</p>
        <p style="color: #b91c1c; font-size: 13px; margin: 4px 0 0 0;">This task has exceeded the escalation threshold.</p>
      </div>
      <a href="${frontendUrl}/flows" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Flow
      </a>
    </div>
  `);
}

export async function sendFlowCancelled(params: {
  to: string;
  contactName: string;
  flowName: string;
}) {
  await sendEmail(params.to, `Task cancelled: ${params.flowName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Task No Longer Needed</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.contactName}, the flow <strong>${params.flowName}</strong> has been cancelled.
        Your assigned task is no longer needed.
      </p>
      <p style="color: #999; font-size: 13px; margin-top: 24px;">
        No action is required on your part.
      </p>
    </div>
  `);
}

export async function sendFlowStalled(params: {
  to: string;
  userName: string;
  flowName: string;
  runName: string;
}) {
  await sendEmail(params.to, `No progress: ${params.runName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Flow Stalled</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.userName}, the flow run <strong>${params.runName}</strong>
        (${params.flowName}) has had no progress for over 72 hours.
      </p>
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b;">
        <p style="color: #92400e; font-weight: 600; margin: 0;">No activity detected</p>
        <p style="color: #a16207; font-size: 13px; margin: 4px 0 0 0;">Consider checking in with the assignee or reassigning the task.</p>
      </div>
      <a href="${frontendUrl}/flows" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Flows
      </a>
    </div>
  `);
}

export async function sendChatNotification(params: {
  to: string;
  userName: string;
  senderName: string;
  flowName: string;
  messagePreview: string;
}) {
  await sendEmail(params.to, `New message from ${params.senderName} in ${params.flowName}`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">New Message</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.userName}, ${params.senderName} sent a message in <strong>${params.flowName}</strong>:
      </p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 3px solid #7c3aed;">
        <p style="color: #333; margin: 0; line-height: 1.5;">${params.messagePreview}</p>
      </div>
      <a href="${frontendUrl}/flows" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Conversation
      </a>
    </div>
  `);
}

export async function sendDailyDigest(params: {
  to: string;
  userName: string;
  overdueCount: number;
  activeFlowCount: number;
}) {
  await sendEmail(params.to, `Daily digest: ${params.overdueCount} overdue tasks`, `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #111; margin-bottom: 16px;">Your Daily Digest</h2>
      <p style="color: #555; line-height: 1.6;">
        Hi ${params.userName}, here's your daily summary:
      </p>
      <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #64748b;">Overdue tasks:</span>
          <strong style="color: ${params.overdueCount > 0 ? '#ef4444' : '#22c55e'};">${params.overdueCount}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #64748b;">Active flows:</span>
          <strong style="color: #111;">${params.activeFlowCount}</strong>
        </div>
      </div>
      <a href="${frontendUrl}/flows" style="display: inline-block; margin-top: 12px; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
        View Dashboard
      </a>
    </div>
  `);
}
