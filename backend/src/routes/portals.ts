/**
 * Portals API Routes
 *
 * Admin CRUD for portals and portal flow catalog management.
 * All routes are org-scoped (orgScope middleware runs before these routes).
 */

import { Router } from 'express';
import { db, portals, portalTemplates, templates, userOrganizations } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

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
// Helper: generate slug from name
// ============================================================================

function generateSlug(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

// ============================================================================
// GET /api/portals - List org's portals
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

    const result = await db
      .select()
      .from(portals)
      .where(eq(portals.organizationId, orgId));

    res.json({ success: true, data: result });
  })
);

// ============================================================================
// POST /api/portals - Create portal (admin only)
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can create portals' },
      });
      return;
    }

    const { name, description, settings, brandingOverrides } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Portal name is required' },
      });
      return;
    }

    // Generate slug and ensure uniqueness within org
    let slug = generateSlug(name);
    const existing = await db
      .select()
      .from(portals)
      .where(and(eq(portals.organizationId, orgId), eq(portals.slug, slug)));

    if (existing.length > 0) {
      slug = generateSlug(name); // Regenerate with new random suffix
    }

    const [portal] = await db.insert(portals).values({
      organizationId: orgId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      settings: settings || null,
      brandingOverrides: brandingOverrides || null,
    }).returning();

    res.status(201).json({ success: true, data: portal });
  })
);

// ============================================================================
// GET /api/portals/:id - Get portal with settings
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;

    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    res.json({ success: true, data: portal });
  })
);

// ============================================================================
// PUT /api/portals/:id - Update portal (admin only)
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can update portals' },
      });
      return;
    }

    // Verify portal belongs to org
    const existing = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    const { name, description, settings, brandingOverrides } = req.body;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (settings !== undefined) updates.settings = settings;
    if (brandingOverrides !== undefined) updates.brandingOverrides = brandingOverrides;

    const [updated] = await db
      .update(portals)
      .set(updates)
      .where(and(eq(portals.id, portalId), eq(portals.organizationId, orgId)))
      .returning();

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// DELETE /api/portals/:id - Delete portal (admin only, block if default)
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can delete portals' },
      });
      return;
    }

    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    if (portal.isDefault) {
      res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_DEFAULT', message: 'Cannot delete the default portal' },
      });
      return;
    }

    await db.delete(portals).where(eq(portals.id, portalId));

    res.json({ success: true, data: { id: portalId } });
  })
);

// ============================================================================
// GET /api/portals/:id/flows - List portal's flow catalog with flow details
// ============================================================================

router.get(
  '/:id/flows',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;

    // Verify portal belongs to org
    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    const result = await db
      .select({
        id: portalTemplates.id,
        portalId: portalTemplates.portalId,
        templateId: portalTemplates.templateId,
        displayTitle: portalTemplates.displayTitle,
        displayDescription: portalTemplates.displayDescription,
        sortOrder: portalTemplates.sortOrder,
        enabled: portalTemplates.enabled,
        templateName: templates.name,
        templateDescription: templates.description,
        templateStatus: templates.status,
      })
      .from(portalTemplates)
      .innerJoin(templates, eq(portalTemplates.templateId, templates.id))
      .where(eq(portalTemplates.portalId, portalId));

    res.json({ success: true, data: result });
  })
);

// ============================================================================
// POST /api/portals/:id/flows - Add flow to catalog (admin only)
// ============================================================================

router.post(
  '/:id/flows',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can manage portal flows' },
      });
      return;
    }

    // Verify portal belongs to org
    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    const { templateId, displayTitle, displayDescription, sortOrder } = req.body;

    if (!templateId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'templateId is required' },
      });
      return;
    }

    // Verify flow belongs to the same org
    const template = await db.query.templates.findFirst({
      where: and(eq(templates.id, templateId), eq(templates.organizationId, orgId)),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found in this organization' },
      });
      return;
    }

    const [portalTemplate] = await db.insert(portalTemplates).values({
      portalId,
      templateId,
      displayTitle: displayTitle || null,
      displayDescription: displayDescription || null,
      sortOrder: sortOrder ?? 0,
    }).returning();

    res.status(201).json({ success: true, data: portalTemplate });
  })
);

// ============================================================================
// PUT /api/portals/:id/flows/:pfId - Update portal flow entry (admin only)
// ============================================================================

router.put(
  '/:id/flows/:pfId',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;
    const pfId = req.params.pfId as string;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can manage portal flows' },
      });
      return;
    }

    // Verify portal belongs to org
    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    const existing = await db.query.portalTemplates.findFirst({
      where: and(eq(portalTemplates.id, pfId), eq(portalTemplates.portalId, portalId)),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal template entry not found' },
      });
      return;
    }

    const { displayTitle, displayDescription, sortOrder, enabled } = req.body;

    const updates: Record<string, unknown> = {};
    if (displayTitle !== undefined) updates.displayTitle = displayTitle;
    if (displayDescription !== undefined) updates.displayDescription = displayDescription;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (enabled !== undefined) updates.enabled = enabled;

    const [updated] = await db
      .update(portalTemplates)
      .set(updates)
      .where(eq(portalTemplates.id, pfId))
      .returning();

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// DELETE /api/portals/:id/flows/:pfId - Remove flow from catalog (admin only)
// ============================================================================

router.delete(
  '/:id/flows/:pfId',
  asyncHandler(async (req, res) => {
    const user = req.user as any;
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
      return;
    }

    const orgId = req.organizationId!;
    const portalId = req.params.id as string;
    const pfId = req.params.pfId as string;

    if (!(await isAdmin(user.id, orgId))) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only admins can manage portal flows' },
      });
      return;
    }

    // Verify portal belongs to org
    const portal = await db.query.portals.findFirst({
      where: and(eq(portals.id, portalId), eq(portals.organizationId, orgId)),
    });

    if (!portal) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal not found' },
      });
      return;
    }

    const existing = await db.query.portalTemplates.findFirst({
      where: and(eq(portalTemplates.id, pfId), eq(portalTemplates.portalId, portalId)),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Portal template entry not found' },
      });
      return;
    }

    await db.delete(portalTemplates).where(eq(portalTemplates.id, pfId));

    res.json({ success: true, data: { id: pfId } });
  })
);

export default router;
