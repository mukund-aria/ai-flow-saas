/**
 * Templates API Routes
 *
 * CRUD operations for workflow templates.
 */

import { Router } from 'express';
import { db, flows, users, organizations, templateFolders } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/templates - List all templates
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Filter by organization if available (production with orgScope middleware)
    const orgId = req.organizationId;
    const allFlows = await db.query.flows.findMany({
      ...(orgId ? { where: eq(flows.organizationId, orgId) } : {}),
      orderBy: [desc(flows.updatedAt)],
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform to API response format
    const response = allFlows.map((flow) => ({
      id: flow.id,
      name: flow.name,
      description: flow.description,
      version: flow.version,
      status: flow.status,
      isDefault: flow.isDefault,
      folderId: flow.folderId,
      stepCount: (flow.definition as any)?.steps?.length || 0,
      createdBy: flow.createdBy,
      createdAt: flow.createdAt,
      updatedAt: flow.updatedAt,
    }));

    res.json({
      success: true,
      data: response,
    });
  })
);

// ============================================================================
// GET /api/templates/:id - Get single template
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const flow = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
      with: {
        createdBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: flow,
    });
  })
);

// ============================================================================
// POST /api/templates - Create new template
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, definition, status = 'DRAFT' } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
      return;
    }

    // Use authenticated user context (set by requireAuth + orgScope middleware in production)
    let userId = req.user?.id;
    let orgId = req.organizationId;

    // Dev fallback: create default user/org if not authenticated
    if (!userId || !orgId) {
      let defaultOrg = await db.query.organizations.findFirst();
      if (!defaultOrg) {
        const [newOrg] = await db
          .insert(organizations)
          .values({ name: 'Default Organization', slug: 'default' })
          .returning();
        defaultOrg = newOrg;
      }
      let defaultUser = await db.query.users.findFirst();
      if (!defaultUser) {
        const [newUser] = await db
          .insert(users)
          .values({ email: 'dev@localhost', name: 'Developer', activeOrganizationId: defaultOrg.id })
          .returning();
        defaultUser = newUser;
      }
      userId = defaultUser.id;
      orgId = defaultOrg.id;
    }

    // Create the flow
    const [newFlow] = await db
      .insert(flows)
      .values({
        name,
        description,
        definition: definition || {},
        status,
        createdById: userId,
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newFlow,
    });
  })
);

// ============================================================================
// PUT /api/templates/:id - Update template
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;
    const { name, description, definition, status, version } = req.body;

    // Check if flow exists (scoped to org)
    const existing = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (definition !== undefined) updates.definition = definition;
    if (status !== undefined) updates.status = status;
    if (version !== undefined) updates.version = version;

    // Update the flow
    const [updatedFlow] = await db
      .update(flows)
      .set(updates)
      .where(eq(flows.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedFlow,
    });
  })
);

// ============================================================================
// DELETE /api/templates/:id - Delete (archive) template
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Check if flow exists (scoped to org)
    const existing = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Soft delete by setting status to ARCHIVED
    const [archivedFlow] = await db
      .update(flows)
      .set({ status: 'ARCHIVED', updatedAt: new Date() })
      .where(eq(flows.id, id))
      .returning();

    res.json({
      success: true,
      data: archivedFlow,
    });
  })
);

// ============================================================================
// POST /api/templates/:id/publish - Publish a draft template
// ============================================================================

router.post(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Check if flow exists (scoped to org)
    const existing = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Update status to ACTIVE
    const [publishedFlow] = await db
      .update(flows)
      .set({ status: 'ACTIVE', updatedAt: new Date() })
      .where(eq(flows.id, id))
      .returning();

    res.json({
      success: true,
      data: publishedFlow,
    });
  })
);

// ============================================================================
// POST /api/templates/:id/duplicate - Duplicate a template
// ============================================================================

router.post(
  '/:id/duplicate',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const existing = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Create a copy with DRAFT status
    const [duplicate] = await db
      .insert(flows)
      .values({
        name: `${existing.name} (Copy)`,
        description: existing.description,
        definition: existing.definition,
        status: 'DRAFT',
        createdById: existing.createdById,
        organizationId: existing.organizationId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: duplicate,
    });
  })
);

// ============================================================================
// PUT /api/templates/:id/folder - Move template to folder
// ============================================================================

router.put(
  '/:id/folder',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;
    const { folderId } = req.body; // string | null

    // Verify the template exists and belongs to this org
    const existing = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, id), eq(flows.organizationId, orgId))
        : eq(flows.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // If folderId is provided, verify the folder exists and belongs to this org
    if (folderId) {
      const folder = await db.query.templateFolders.findFirst({
        where: orgId
          ? and(eq(templateFolders.id, folderId), eq(templateFolders.organizationId, orgId))
          : eq(templateFolders.id, folderId),
      });
      if (!folder) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Folder not found' },
        });
        return;
      }
    }

    const [updated] = await db
      .update(flows)
      .set({ folderId: folderId || null, updatedAt: new Date() })
      .where(eq(flows.id, id))
      .returning();

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// POST /api/templates/:id/test-webhook - Send a test webhook payload
// ============================================================================

router.post(
  '/:id/test-webhook',
  asyncHandler(async (req, res) => {
    const templateId = req.params.id as string;
    const { url, secret } = req.body as { url?: string; secret?: string };

    if (!url || !secret) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'url and secret are required' },
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid URL format' },
      });
      return;
    }

    // Get the flow template for context
    const orgId = req.organizationId;
    const flow = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, templateId), eq(flows.organizationId, orgId))
        : eq(flows.id, templateId),
    });

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Build a test payload
    const { sendWebhook } = await import('../services/webhook.js');
    const payload = {
      event: 'flow.started' as const,
      timestamp: new Date().toISOString(),
      flow: { id: flow.id, name: flow.name },
      flowRun: { id: 'test-run-id', name: `${flow.name} - Test`, status: 'IN_PROGRESS' },
      metadata: { test: true },
    };

    try {
      const result = await sendWebhook(
        { id: 'test', label: 'Test', url, secret, enabled: true, events: {} as any, createdAt: new Date().toISOString() },
        payload
      );

      const success = result.status >= 200 && result.status < 300;

      res.json({
        success,
        data: {
          status: result.status,
          body: result.body.slice(0, 500),
          payload,
        },
      });
    } catch (err) {
      res.json({
        success: false,
        data: {
          status: 0,
          body: (err as Error).message,
          payload,
        },
      });
    }
  })
);

export default router;
