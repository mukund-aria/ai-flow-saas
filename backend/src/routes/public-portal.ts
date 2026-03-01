/**
 * Public Portal Routes
 *
 * Assignee-facing portal API: login, dashboard, flow catalog.
 */

import { Router } from 'express';
import { db, portals, contacts, loginOtps, assigneeSessions, userOrganizations } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { assigneeAuth } from '../middleware/assignee-auth.js';
import { sendOTP as sendOTPEmail } from '../services/email.js';
import { getAssigneeDashboard, getAvailableFlows, startFlowAsAssignee } from '../services/assignee-portal.js';
import { isSsoEnforced } from '../auth/saml-service.js';

const router = Router();

// ============================================================================
// Authenticated (assignee auth required) — static paths BEFORE dynamic :slug
// ============================================================================

// GET /api/public/portal/me - Get contact profile + portal info
router.get('/me', assigneeAuth, asyncHandler(async (req, res) => {
  const portal = await db.query.portals.findFirst({
    where: eq(portals.id, req.assigneePortalId!),
    with: { organization: true },
  });

  if (!portal) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portal not found' } });
    return;
  }

  const org = portal.organization as any;
  const orgBranding = (org?.brandingConfig as any) || {};
  const portalBranding = (portal.brandingOverrides as any) || {};

  res.json({
    success: true,
    data: {
      contact: req.assigneeContact,
      portal: {
        name: portal.name,
        slug: portal.slug,
        branding: { ...orgBranding, ...portalBranding },
        settings: portal.settings,
      },
    },
  });
}));

// GET /api/public/portal/dashboard - Dashboard data
router.get('/dashboard', assigneeAuth, asyncHandler(async (req, res) => {
  const data = await getAssigneeDashboard(req.assigneeContact!.id, req.assigneeOrgId!);
  res.json({ success: true, data });
}));

// GET /api/public/portal/flows - Available flows for self-service
router.get('/flows', assigneeAuth, asyncHandler(async (req, res) => {
  const flowList = await getAvailableFlows(req.assigneePortalId!);
  res.json({ success: true, data: flowList });
}));

// POST /api/public/portal/start-flow - Start a flow
router.post('/start-flow', assigneeAuth, asyncHandler(async (req, res) => {
  const { flowId, kickoffData } = req.body;
  if (!flowId) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'flowId is required' } });
    return;
  }

  // Find an admin user in this org for startedById
  const adminMembership = await db.query.userOrganizations.findFirst({
    where: and(
      eq(userOrganizations.organizationId, req.assigneeOrgId!),
      eq(userOrganizations.role, 'ADMIN')
    ),
  });

  if (!adminMembership) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'No admin found for organization' } });
    return;
  }

  const result = await startFlowAsAssignee(
    flowId,
    req.assigneeContact!.id,
    req.assigneeOrgId!,
    req.assigneePortalId!,
    adminMembership.userId,
    kickoffData
  );

  res.json({ success: true, data: result });
}));

// ============================================================================
// Public (no auth needed) — dynamic :slug routes AFTER static paths
// ============================================================================

// GET /api/public/portal/:slug - Get portal info
router.get('/:slug', asyncHandler(async (req, res) => {
  const slug = req.params.slug as string;
  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, slug),
    with: { organization: true },
  });

  if (!portal) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portal not found' } });
    return;
  }

  const org = portal.organization as any;
  // Merge branding: portal overrides > org branding > defaults
  const orgBranding = (org?.brandingConfig as any) || {};
  const portalBranding = (portal.brandingOverrides as any) || {};
  const branding = { ...orgBranding, ...portalBranding };

  res.json({
    success: true,
    data: {
      name: portal.name,
      description: portal.description,
      branding,
      settings: portal.settings,
    },
  });
}));

// POST /api/public/portal/:slug/login - Send OTP
router.post('/:slug/login', asyncHandler(async (req, res) => {
  const slug = req.params.slug as string;
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email is required' } });
    return;
  }

  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, slug),
  });

  if (!portal) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portal not found' } });
    return;
  }

  // Check if SSO is enforced for this portal
  if (await isSsoEnforced(email, 'ASSIGNEE', portal.id)) {
    res.status(403).json({
      success: false,
      ssoRequired: true,
      ssoLoginUrl: `/auth/portal-sso/login?portalSlug=${encodeURIComponent(slug)}&email=${encodeURIComponent(email)}`,
      error: 'SSO login is required for this email domain',
    });
    return;
  }

  // Verify contact exists in this org
  const contact = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.email, email.toLowerCase().trim()),
      eq(contacts.organizationId, portal.organizationId)
    ),
  });

  if (!contact) {
    // Don't reveal whether contact exists
    res.json({ success: true });
    return;
  }

  // Generate and store OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await db.insert(loginOtps).values({
    email: email.toLowerCase().trim(),
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendOTPEmail({ to: email, code });

  res.json({ success: true });
}));

// POST /api/public/portal/:slug/verify - Verify OTP
router.post('/:slug/verify', asyncHandler(async (req, res) => {
  const slug = req.params.slug as string;
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email and code are required' } });
    return;
  }

  const portal = await db.query.portals.findFirst({
    where: eq(portals.slug, slug),
  });

  if (!portal) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Portal not found' } });
    return;
  }

  // Find valid OTP
  const otp = await db.query.loginOtps.findFirst({
    where: and(
      eq(loginOtps.email, email.toLowerCase().trim()),
      eq(loginOtps.code, code)
    ),
    orderBy: (otps, { desc }) => [desc(otps.createdAt)],
  });

  if (!otp || otp.usedAt || otp.expiresAt < new Date() || otp.attempts >= 5) {
    // Increment attempts if OTP exists
    if (otp && !otp.usedAt) {
      await db.update(loginOtps)
        .set({ attempts: otp.attempts + 1 })
        .where(eq(loginOtps.id, otp.id));
    }
    res.status(401).json({ success: false, error: { code: 'INVALID_CODE', message: 'Invalid or expired code' } });
    return;
  }

  // Mark OTP as used
  await db.update(loginOtps)
    .set({ usedAt: new Date() })
    .where(eq(loginOtps.id, otp.id));

  // Find contact
  const contact = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.email, email.toLowerCase().trim()),
      eq(contacts.organizationId, portal.organizationId)
    ),
  });

  if (!contact) {
    res.status(401).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    return;
  }

  // Create assignee session (30 days)
  const [session] = await db.insert(assigneeSessions).values({
    contactId: contact.id,
    organizationId: portal.organizationId,
    portalId: portal.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  }).returning();

  res.json({
    success: true,
    data: {
      token: session.token,
      contact: { id: contact.id, name: contact.name, email: contact.email },
    },
  });
}));

export default router;
