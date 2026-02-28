/**
 * Organizations API Routes
 *
 * Create, list, and switch organizations.
 */

import { Router } from 'express';
import { db, organizations, users, userOrganizations, flows, flowRuns, stepExecutions, portals } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// POST /api/organizations - Create a new organization
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const { name } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Organization name is required' },
      });
      return;
    }

    // Generate slug from name
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now().toString(36);

    // Create org
    const [org] = await db.insert(organizations).values({
      name: name.trim(),
      slug,
    }).returning();

    // Create admin membership
    await db.insert(userOrganizations).values({
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN',
    });

    // Create default portal
    await db.insert(portals).values({
      organizationId: org.id,
      name: 'Client Portal',
      slug: 'client',
      description: 'Default portal for clients',
      isDefault: true,
    });

    // Seed default "Onboarding (Sample)" flow template
    const [defaultFlow] = await db.insert(flows).values({
      name: 'Onboarding (Sample)',
      description: 'A standard client onboarding workflow with intake, document collection, review, agreement, and completion steps.',
      version: '1.0',
      status: 'ACTIVE',
      isDefault: true,
      definition: {
        name: 'Onboarding (Sample)',
        description: 'A standard client onboarding workflow with intake, document collection, review, agreement, and completion steps.',
        steps: [
          {
            id: 'kickoff',
            name: 'Client Intake',
            type: 'FORM',
            description: 'Collect client name, email, company, and project details.',
            config: {
              fields: [
                { id: 'client_name', label: 'Client Name', type: 'text', required: true },
                { id: 'client_email', label: 'Client Email', type: 'email', required: true },
                { id: 'company', label: 'Company Name', type: 'text', required: true },
                { id: 'project_type', label: 'Project Type', type: 'text', required: false },
              ],
            },
          },
          {
            id: 'collect_docs',
            name: 'Collect Documents',
            type: 'FILE_REQUEST',
            description: 'Request required documents from the client (ID, contracts, etc.).',
            config: {
              instructions: 'Please upload the following documents: government-issued ID, signed NDA, and any relevant project briefs.',
              allowedTypes: ['pdf', 'doc', 'docx', 'png', 'jpg'],
            },
          },
          {
            id: 'review',
            name: 'Review Application',
            type: 'APPROVAL',
            description: 'Internal review of the client application and submitted documents.',
            config: {
              approvalType: 'single',
              instructions: 'Review the client information and uploaded documents. Approve to proceed or reject with feedback.',
            },
          },
          {
            id: 'sign_agreement',
            name: 'Sign Agreement',
            type: 'ACKNOWLEDGEMENT',
            description: 'Client acknowledges and agrees to the terms of service.',
            config: {
              acknowledgementText: 'I have read and agree to the Terms of Service and Privacy Policy.',
            },
          },
          {
            id: 'welcome_complete',
            name: 'Welcome Complete',
            type: 'TODO',
            description: 'Final checklist to complete the onboarding process.',
            config: {
              items: [
                { id: 'send_welcome', label: 'Send welcome email', completed: false },
                { id: 'setup_account', label: 'Set up client account', completed: false },
                { id: 'schedule_kickoff', label: 'Schedule kickoff meeting', completed: false },
              ],
            },
          },
        ],
      },
      createdById: user.id,
      organizationId: org.id,
    }).returning();

    // Seed a sample flow run with first step assigned to the creating user
    const [sampleRun] = await db.insert(flowRuns).values({
      flowId: defaultFlow.id,
      name: 'Onboarding (Sample)',
      status: 'IN_PROGRESS',
      isSample: true,
      currentStepIndex: 0,
      startedById: user.id,
      organizationId: org.id,
    }).returning();

    // Create step executions — first step assigned to the user and in progress
    const sampleSteps = [
      { stepId: 'kickoff', stepIndex: 0, status: 'IN_PROGRESS' as const, assignedToUserId: user.id, startedAt: new Date() },
      { stepId: 'collect_docs', stepIndex: 1, status: 'PENDING' as const, assignedToUserId: null, startedAt: null },
      { stepId: 'review', stepIndex: 2, status: 'PENDING' as const, assignedToUserId: null, startedAt: null },
      { stepId: 'sign_agreement', stepIndex: 3, status: 'PENDING' as const, assignedToUserId: null, startedAt: null },
      { stepId: 'welcome_complete', stepIndex: 4, status: 'PENDING' as const, assignedToUserId: null, startedAt: null },
    ];

    await db.insert(stepExecutions).values(
      sampleSteps.map((step) => ({
        flowRunId: sampleRun.id,
        stepId: step.stepId,
        stepIndex: step.stepIndex,
        status: step.status,
        assignedToUserId: step.assignedToUserId,
        startedAt: step.startedAt,
      }))
    );

    // Set as active org
    await db.update(users)
      .set({ activeOrganizationId: org.id })
      .where(eq(users.id, user.id));

    res.status(201).json({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: 'ADMIN',
      },
    });
  })
);

// ============================================================================
// GET /api/organizations - List user's organizations
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const memberships = await db.query.userOrganizations.findMany({
      where: eq(userOrganizations.userId, user.id),
      with: { organization: true },
    });

    const orgs = memberships.map(m => ({
      id: m.organizationId,
      name: (m as any).organization?.name,
      slug: (m as any).organization?.slug,
      role: m.role,
      isActive: m.organizationId === user.activeOrganizationId,
    }));

    res.json({ success: true, data: orgs });
  })
);

// ============================================================================
// POST /api/organizations/switch - Switch active organization
// ============================================================================

router.post(
  '/switch',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const { organizationId } = req.body;

    // Verify membership
    const membership = await db.query.userOrganizations.findFirst({
      where: (uo, { and, eq: eqFn }) => and(
        eqFn(uo.userId, user.id),
        eqFn(uo.organizationId, organizationId)
      ),
      with: { organization: true },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this organization' },
      });
      return;
    }

    // Switch active org
    await db.update(users)
      .set({ activeOrganizationId: organizationId })
      .where(eq(users.id, user.id));

    res.json({
      success: true,
      data: {
        organizationId,
        name: (membership as any).organization?.name,
        role: membership.role,
      },
    });
  })
);

// ============================================================================
// PUT /api/organizations/:id - Update organization (admin only)
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.params.id as string;
    const { name } = req.body;

    // Verify admin membership
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, orgId)
      ),
    });

    if (!membership || membership.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can update organization settings' },
      });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Organization name is required' },
      });
      return;
    }

    const [updated] = await db.update(organizations)
      .set({ name: name.trim() })
      .where(eq(organizations.id, orgId))
      .returning();

    res.json({
      success: true,
      data: { id: updated.id, name: updated.name, slug: updated.slug },
    });
  })
);

// ============================================================================
// GET /api/organizations/:id/branding - Get branding config
// ============================================================================

router.get(
  '/:id/branding',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.params.id as string;

    // Verify membership
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, orgId)
      ),
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this organization' },
      });
      return;
    }

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    res.json({
      success: true,
      data: (org?.brandingConfig as Record<string, unknown>) || {},
    });
  })
);

// ============================================================================
// PUT /api/organizations/:id/branding - Update branding config (admin only)
// ============================================================================

router.put(
  '/:id/branding',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.params.id as string;
    const { logoUrl, primaryColor, accentColor, companyName, faviconUrl, emailFooter } = req.body;

    // Verify admin membership
    const membership = await db.query.userOrganizations.findFirst({
      where: and(
        eq(userOrganizations.userId, user.id),
        eq(userOrganizations.organizationId, orgId)
      ),
    });

    if (!membership || membership.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can update branding settings' },
      });
      return;
    }

    // Validate hex colors if provided
    const hexColorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid primary color. Must be a valid hex color (e.g., #7c3aed)' },
      });
      return;
    }
    if (accentColor && !hexColorRegex.test(accentColor)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid accent color. Must be a valid hex color (e.g., #6366f1)' },
      });
      return;
    }

    const brandingConfig: Record<string, unknown> = {};
    if (logoUrl !== undefined) brandingConfig.logoUrl = logoUrl;
    if (primaryColor !== undefined) brandingConfig.primaryColor = primaryColor;
    if (accentColor !== undefined) brandingConfig.accentColor = accentColor;
    if (companyName !== undefined) brandingConfig.companyName = companyName;
    if (faviconUrl !== undefined) brandingConfig.faviconUrl = faviconUrl;
    if (emailFooter !== undefined) brandingConfig.emailFooter = emailFooter;

    const [updated] = await db.update(organizations)
      .set({ brandingConfig })
      .where(eq(organizations.id, orgId))
      .returning();

    res.json({
      success: true,
      data: (updated.brandingConfig as Record<string, unknown>) || {},
    });
  })
);

export default router;
