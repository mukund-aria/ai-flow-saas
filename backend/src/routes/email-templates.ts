/**
 * Email Templates API Routes
 *
 * Admin routes for email template customization.
 * All routes are org-scoped (orgScope middleware runs before these routes).
 */

import { Router } from 'express';
import { db, emailTemplates, userOrganizations } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import type { EmailTemplateType } from '../db/index.js';

const router = Router();

// ============================================================================
// System defaults for each template type
// ============================================================================

const SYSTEM_DEFAULTS: Record<EmailTemplateType, {
  subject: string;
  heading: string;
  body: string;
  buttonLabel: string;
}> = {
  TASK_ASSIGNED: {
    subject: 'Action required: {{stepName}}',
    heading: 'You have a new task',
    body: 'Hi {{contactName}}, you\'ve been assigned a task in {{flowName}}.',
    buttonLabel: 'Complete Task',
  },
  TASK_REMINDER: {
    subject: 'Reminder: {{stepName}} is due',
    heading: 'Friendly Reminder',
    body: 'Hi {{contactName}}, your task in {{flowName}} is {{dueDate}}.',
    buttonLabel: 'Complete Task',
  },
  FLOW_COMPLETED: {
    subject: 'Flow completed: {{flowName}}',
    heading: 'Flow Completed',
    body: 'Hi {{contactName}}, the flow {{flowName}} has been completed.',
    buttonLabel: 'View Details',
  },
};

const VALID_TYPES: EmailTemplateType[] = ['TASK_ASSIGNED', 'TASK_REMINDER', 'FLOW_COMPLETED'];

// ============================================================================
// Helper: check admin role
// ============================================================================

async function isAdmin(userId: string, orgId: string): Promise<boolean> {
  const membership = await db.query.userOrganizations.findFirst({
    where: and(
      eq(userOrganizations.userId, userId),
      eq(userOrganizations.organizationId, orgId),
    ),
  });
  return membership?.role === 'ADMIN';
}

// ============================================================================
// GET /api/email-templates - List all templates (with defaults for missing)
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;

    const customTemplates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.organizationId, orgId));

    // Build a map of existing custom templates by type
    const customByType = new Map<string, typeof customTemplates[number]>();
    for (const t of customTemplates) {
      customByType.set(t.templateType, t);
    }

    // Return all 3 types, using custom if available, otherwise system default
    const result = VALID_TYPES.map((type) => {
      const custom = customByType.get(type);
      if (custom) {
        return { ...custom, isCustom: true };
      }
      return {
        id: null,
        organizationId: orgId,
        portalId: null,
        templateType: type,
        subject: SYSTEM_DEFAULTS[type].subject,
        heading: SYSTEM_DEFAULTS[type].heading,
        body: SYSTEM_DEFAULTS[type].body,
        buttonLabel: SYSTEM_DEFAULTS[type].buttonLabel,
        enabled: true,
        createdAt: null,
        updatedAt: null,
        isCustom: false,
      };
    });

    res.json({ success: true, data: result });
  })
);

// ============================================================================
// PUT /api/email-templates/:type - Upsert template by type (admin only)
// ============================================================================

router.put(
  '/:type',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const templateType = req.params.type as string as EmailTemplateType;

    if (!VALID_TYPES.includes(templateType)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid template type. Must be one of: ${VALID_TYPES.join(', ')}` },
      });
      return;
    }

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can manage email templates' },
      });
      return;
    }

    const { subject, heading, body, buttonLabel, portalId, enabled } = req.body;

    if (!subject || !heading || !body) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'subject, heading, and body are required' },
      });
      return;
    }

    // Check if custom template already exists
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.organizationId, orgId),
          eq(emailTemplates.templateType, templateType),
        )
      );

    let result;
    if (existing.length > 0) {
      // Update
      [result] = await db
        .update(emailTemplates)
        .set({
          subject,
          heading,
          body,
          buttonLabel: buttonLabel || null,
          portalId: portalId || null,
          enabled: enabled !== undefined ? enabled : true,
          updatedAt: new Date(),
        })
        .where(eq(emailTemplates.id, existing[0].id))
        .returning();
    } else {
      // Insert
      [result] = await db.insert(emailTemplates).values({
        organizationId: orgId,
        templateType,
        subject,
        heading,
        body,
        buttonLabel: buttonLabel || null,
        portalId: portalId || null,
        enabled: enabled !== undefined ? enabled : true,
      }).returning();
    }

    res.json({ success: true, data: result });
  })
);

// ============================================================================
// POST /api/email-templates/:type/preview - Render preview HTML
// ============================================================================

router.post(
  '/:type/preview',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const templateType = req.params.type as string as EmailTemplateType;

    if (!VALID_TYPES.includes(templateType)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid template type. Must be one of: ${VALID_TYPES.join(', ')}` },
      });
      return;
    }

    const { sampleData } = req.body;

    // Get custom template or fall back to defaults
    const custom = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.organizationId, orgId),
          eq(emailTemplates.templateType, templateType),
        )
      );

    const template = custom.length > 0
      ? { subject: custom[0].subject, heading: custom[0].heading, body: custom[0].body, buttonLabel: custom[0].buttonLabel }
      : SYSTEM_DEFAULTS[templateType];

    // Sample data with defaults
    const data = {
      contactName: sampleData?.contactName || 'Jane Smith',
      flowName: sampleData?.flowName || 'Client Onboarding',
      stepName: sampleData?.stepName || 'Submit Documents',
      taskUrl: sampleData?.taskUrl || 'https://app.example.com/task/abc123',
      dueDate: sampleData?.dueDate || 'March 15, 2026',
      companyName: sampleData?.companyName || 'Acme Corp',
    };

    // Replace template variables
    const replaceVars = (text: string): string =>
      text
        .replace(/\{\{contactName\}\}/g, data.contactName)
        .replace(/\{\{flowName\}\}/g, data.flowName)
        .replace(/\{\{stepName\}\}/g, data.stepName)
        .replace(/\{\{taskUrl\}\}/g, data.taskUrl)
        .replace(/\{\{dueDate\}\}/g, data.dueDate)
        .replace(/\{\{companyName\}\}/g, data.companyName);

    const renderedSubject = replaceVars(template.subject);
    const renderedHeading = replaceVars(template.heading);
    const renderedBody = replaceVars(template.body);
    const renderedButton = replaceVars(template.buttonLabel || 'Open');

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#7c3aed;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">${renderedHeading}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">${renderedBody}</p>
              <a href="${data.taskUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;">${renderedButton}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">${data.companyName}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    res.json({
      success: true,
      data: {
        subject: renderedSubject,
        html,
      },
    });
  })
);

// ============================================================================
// DELETE /api/email-templates/:type - Reset to system default (admin only)
// ============================================================================

router.delete(
  '/:type',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const templateType = req.params.type as string as EmailTemplateType;

    if (!VALID_TYPES.includes(templateType)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid template type. Must be one of: ${VALID_TYPES.join(', ')}` },
      });
      return;
    }

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can manage email templates' },
      });
      return;
    }

    await db
      .delete(emailTemplates)
      .where(
        and(
          eq(emailTemplates.organizationId, orgId),
          eq(emailTemplates.templateType, templateType),
        )
      );

    res.json({ success: true, data: SYSTEM_DEFAULTS[templateType] });
  })
);

export default router;
