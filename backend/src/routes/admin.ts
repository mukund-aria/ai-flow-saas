/**
 * Admin API Routes
 *
 * Platform-level administration endpoints for sysadmins.
 * All routes require sysadmin authentication.
 */

import { Router } from 'express';
import { db } from '../db/client.js';
import {
  organizations,
  users,
  userOrganizations,
  templates,
  flows,
  contacts,
  portals,
  systemConfig,
} from '../db/schema.js';
import { eq, count, sql, like, and, isNull, desc } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { invalidateEmailWhitelistCache } from '../auth/email-whitelist.js';

const router = Router();

// ============================================================================
// GET /api/admin/me — Verify sysadmin access
// ============================================================================

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        email: req.user!.email,
        name: req.user!.name,
        isSysadmin: true,
      },
    });
  }),
);

// ============================================================================
// GET /api/admin/dashboard — Platform summary metrics
// ============================================================================

router.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [orgCount] = await db
      .select({ value: count() })
      .from(organizations)
      .where(isNull(organizations.deletedAt));

    const [userCount] = await db.select({ value: count() }).from(users);

    const [runCount] = await db.select({ value: count() }).from(flows);

    const [contactCount] = await db.select({ value: count() }).from(contacts);

    const [activeOrgCount] = await db
      .select({ value: sql<number>`count(distinct ${flows.organizationId})` })
      .from(flows)
      .where(sql`${flows.startedAt} > ${thirtyDaysAgo}`);

    res.json({
      success: true,
      data: {
        totalOrgs: orgCount.value,
        totalUsers: userCount.value,
        totalRuns: runCount.value,
        totalContacts: contactCount.value,
        activeOrgs30d: Number(activeOrgCount.value) || 0,
      },
    });
  }),
);

// ============================================================================
// GET /api/admin/organizations — List all orgs with counts
// ============================================================================

router.get(
  '/organizations',
  asyncHandler(async (req, res) => {
    const search = (req.query.search as string || '').trim().toLowerCase();

    // Get all orgs (not soft-deleted)
    let allOrgs = await db.query.organizations.findMany({
      where: isNull(organizations.deletedAt),
      orderBy: [desc(organizations.createdAt)],
    });

    if (search) {
      allOrgs = allOrgs.filter(
        o =>
          o.name.toLowerCase().includes(search) ||
          o.slug.toLowerCase().includes(search),
      );
    }

    // Gather counts per org in parallel
    const orgsWithCounts = await Promise.all(
      allOrgs.map(async org => {
        const [members] = await db
          .select({ value: count() })
          .from(userOrganizations)
          .where(eq(userOrganizations.organizationId, org.id));

        const [templateCount] = await db
          .select({ value: count() })
          .from(templates)
          .where(eq(templates.organizationId, org.id));

        const [runs] = await db
          .select({ value: count() })
          .from(flows)
          .where(eq(flows.organizationId, org.id));

        const [orgContacts] = await db
          .select({ value: count() })
          .from(contacts)
          .where(eq(contacts.organizationId, org.id));

        return {
          ...org,
          memberCount: members.value,
          templateCount: templateCount.value,
          runCount: runs.value,
          contactCount: orgContacts.value,
        };
      }),
    );

    res.json({ success: true, data: orgsWithCounts });
  }),
);

// ============================================================================
// GET /api/admin/organizations/:id — Org detail
// ============================================================================

router.get(
  '/organizations/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.params.id as string;

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Organization not found' },
      });
      return;
    }

    // Stats
    const [memberCount] = await db
      .select({ value: count() })
      .from(userOrganizations)
      .where(eq(userOrganizations.organizationId, orgId));

    const [templateCount] = await db
      .select({ value: count() })
      .from(templates)
      .where(eq(templates.organizationId, orgId));

    const [runCount] = await db
      .select({ value: count() })
      .from(flows)
      .where(eq(flows.organizationId, orgId));

    const [contactCount] = await db
      .select({ value: count() })
      .from(contacts)
      .where(eq(contacts.organizationId, orgId));

    // Run stats by status
    const runsByStatus = await db
      .select({
        status: flows.status,
        count: count(),
      })
      .from(flows)
      .where(eq(flows.organizationId, orgId))
      .groupBy(flows.status);

    // Members
    const members = await db
      .select({
        userId: userOrganizations.userId,
        role: userOrganizations.role,
        joinedAt: userOrganizations.joinedAt,
        name: users.name,
        email: users.email,
      })
      .from(userOrganizations)
      .innerJoin(users, eq(userOrganizations.userId, users.id))
      .where(eq(userOrganizations.organizationId, orgId));

    // Recent 10 runs
    const recentRuns = await db
      .select({
        id: flows.id,
        name: flows.name,
        status: flows.status,
        startedAt: flows.startedAt,
        templateId: flows.templateId,
      })
      .from(flows)
      .where(eq(flows.organizationId, orgId))
      .orderBy(desc(flows.startedAt))
      .limit(10);

    // Enrich recent runs with template name
    const enrichedRuns = await Promise.all(
      recentRuns.map(async run => {
        const flow = await db.query.templates.findFirst({
          where: eq(templates.id, run.templateId),
          columns: { name: true },
        });
        return { ...run, templateName: flow?.name || 'Unknown' };
      }),
    );

    res.json({
      success: true,
      data: {
        ...org,
        stats: {
          members: memberCount.value,
          templates: templateCount.value,
          runs: runCount.value,
          contacts: contactCount.value,
          runsByStatus: Object.fromEntries(
            runsByStatus.map(r => [r.status, r.count]),
          ),
        },
        members,
        recentRuns: enrichedRuns,
      },
    });
  }),
);

// ============================================================================
// POST /api/admin/organizations — Provision new org
// ============================================================================

router.post(
  '/organizations',
  asyncHandler(async (req, res) => {
    const { name, adminEmail } = req.body;

    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name is required' },
      });
      return;
    }

    if (!adminEmail?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'adminEmail is required' },
      });
      return;
    }

    // Generate slug
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug uniqueness
    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE', message: 'An organization with this slug already exists' },
      });
      return;
    }

    // Create org
    const [org] = await db
      .insert(organizations)
      .values({ name: name.trim(), slug })
      .returning();

    // Create default portal
    await db.insert(portals).values({
      organizationId: org.id,
      name: 'Default',
      slug: 'default',
      isDefault: true,
    });

    // Find or create user
    const normalizedEmail = adminEmail.trim().toLowerCase();
    let user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({ email: normalizedEmail, name: normalizedEmail })
        .returning();
      user = newUser;
    }

    // Create ADMIN membership
    await db.insert(userOrganizations).values({
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN',
    });

    // Set as active org if user has none
    if (!user.activeOrganizationId) {
      await db
        .update(users)
        .set({ activeOrganizationId: org.id })
        .where(eq(users.id, user.id));
    }

    res.status(201).json({
      success: true,
      data: { organization: org, adminUserId: user.id },
    });
  }),
);

// ============================================================================
// PATCH /api/admin/organizations/:id — Update org
// ============================================================================

router.patch(
  '/organizations/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.params.id as string;
    const { name, isActive } = req.body;

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Organization not found' },
      });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name.trim();
    if (isActive !== undefined) updates.isActive = isActive;

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, orgId))
      .returning();

    res.json({ success: true, data: updated });
  }),
);

// ============================================================================
// DELETE /api/admin/organizations/:id — Soft delete org
// ============================================================================

router.delete(
  '/organizations/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.params.id as string;

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if (!org) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Organization not found' },
      });
      return;
    }

    await db
      .update(organizations)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(organizations.id, orgId));

    res.json({ success: true, data: { id: orgId, deleted: true } });
  }),
);

// ============================================================================
// GET /api/admin/settings — Get system config
// ============================================================================

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const config = await db.query.systemConfig.findFirst({
      where: eq(systemConfig.id, 'global'),
    });

    res.json({
      success: true,
      data: {
        allowedEmails: config?.allowedEmails || '',
        globalFlags: config?.globalFlags || {},
        updatedAt: config?.updatedAt || null,
        updatedBy: config?.updatedBy || null,
      },
    });
  }),
);

// ============================================================================
// PUT /api/admin/settings/allowed-emails — Update allowed emails
// ============================================================================

router.put(
  '/settings/allowed-emails',
  asyncHandler(async (req, res) => {
    const { allowedEmails } = req.body;

    if (typeof allowedEmails !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'allowedEmails must be a string' },
      });
      return;
    }

    const adminEmail = req.user!.email;

    // Upsert the global config row
    const existing = await db.query.systemConfig.findFirst({
      where: eq(systemConfig.id, 'global'),
    });

    if (existing) {
      await db
        .update(systemConfig)
        .set({
          allowedEmails,
          updatedAt: new Date(),
          updatedBy: adminEmail,
        })
        .where(eq(systemConfig.id, 'global'));
    } else {
      await db.insert(systemConfig).values({
        id: 'global',
        allowedEmails,
        updatedAt: new Date(),
        updatedBy: adminEmail,
      });
    }

    invalidateEmailWhitelistCache();

    res.json({
      success: true,
      data: { allowedEmails, updatedBy: adminEmail },
    });
  }),
);

export default router;
