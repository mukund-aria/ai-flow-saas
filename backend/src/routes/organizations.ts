/**
 * Organizations API Routes
 *
 * Create, list, and switch organizations.
 */

import { Router } from 'express';
import { db, organizations, users, userOrganizations } from '../db/index.js';
import { eq } from 'drizzle-orm';
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

export default router;
