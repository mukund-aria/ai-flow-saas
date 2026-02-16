/**
 * Email Service
 *
 * Sends transactional emails via Resend.
 * Falls back to console logging when RESEND_API_KEY is not set.
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail = process.env.RESEND_FROM_EMAIL || 'AI Flow <noreply@aiflow.app>';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[Email] (dev mode) To: ${to}, Subject: ${subject}`);
    console.log(`[Email] HTML preview: ${html.substring(0, 200)}...`);
    return;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err);
  }
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
        <strong>${params.organizationName}</strong> on AI Flow as a <strong>${params.role}</strong>.
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
        Go to AI Flow
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
