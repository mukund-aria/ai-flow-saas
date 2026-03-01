/**
 * Templates API Routes
 *
 * CRUD operations for workflow templates.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { db, templates, users, organizations, templateFolders, webhookEndpoints } from '../db/index.js';
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
    const allTemplates = await db.query.templates.findMany({
      ...(orgId ? { where: eq(templates.organizationId, orgId) } : {}),
      orderBy: [desc(templates.updatedAt)],
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
    const response = allTemplates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      version: template.version,
      status: template.status,
      isDefault: template.isDefault,
      folderId: template.folderId,
      templateCoordinatorIds: template.templateCoordinatorIds || [],
      stepCount: (template.definition as any)?.steps?.length || 0,
      createdBy: template.createdBy,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
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

    const template = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
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

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: template,
    });
  })
);

// ============================================================================
// POST /api/templates - Create new template
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description, definition, status = 'DRAFT', templateCoordinatorIds } = req.body;

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

    // Create the template
    const [newTemplate] = await db
      .insert(templates)
      .values({
        name,
        description,
        definition: definition || {},
        status,
        templateCoordinatorIds: templateCoordinatorIds || [],
        createdById: userId,
        organizationId: orgId,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newTemplate,
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
    const { name, description, definition, status, version, templateCoordinatorIds } = req.body;

    // Check if template exists (scoped to org)
    const existing = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
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
    if (templateCoordinatorIds !== undefined) updates.templateCoordinatorIds = templateCoordinatorIds;

    // Update the template
    const [updatedTemplate] = await db
      .update(templates)
      .set(updates)
      .where(eq(templates.id, id))
      .returning();

    res.json({
      success: true,
      data: updatedTemplate,
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

    // Check if template exists (scoped to org)
    const existing = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Soft delete by setting status to ARCHIVED
    const [archivedTemplate] = await db
      .update(templates)
      .set({ status: 'ARCHIVED', updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();

    res.json({
      success: true,
      data: archivedTemplate,
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

    // Check if template exists (scoped to org)
    const existing = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Update status to ACTIVE
    const [publishedTemplate] = await db
      .update(templates)
      .set({ status: 'ACTIVE', updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();

    res.json({
      success: true,
      data: publishedTemplate,
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

    const existing = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Create a copy with DRAFT status
    const [duplicate] = await db
      .insert(templates)
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
    const existing = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, id), eq(templates.organizationId, orgId))
        : eq(templates.id, id),
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
      .update(templates)
      .set({ folderId: folderId || null, updatedAt: new Date() })
      .where(eq(templates.id, id))
      .returning();

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// GET /api/templates/:id/webhook-config - Get or create webhook endpoint config
// ============================================================================

router.get(
  '/:id/webhook-config',
  asyncHandler(async (req, res) => {
    const templateId = req.params.id as string;
    const orgId = req.organizationId;

    // Verify the template exists and belongs to this org
    const template = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, templateId), eq(templates.organizationId, orgId))
        : eq(templates.id, templateId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Look for existing webhook endpoint
    let endpoint = await db.query.webhookEndpoints.findFirst({
      where: and(
        eq(webhookEndpoints.templateId, templateId),
        eq(webhookEndpoints.type, 'INCOMING')
      ),
    });

    // Create one if it doesn't exist
    if (!endpoint) {
      const [newEndpoint] = await db
        .insert(webhookEndpoints)
        .values({
          templateId,
          organizationId: template.organizationId,
          type: 'INCOMING',
          secret: crypto.randomUUID(),
          enabled: true,
        })
        .returning();
      endpoint = newEndpoint;
    }

    // Build the webhook URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const webhookUrl = `${baseUrl}/api/webhooks/flows/incoming/${templateId}`;

    res.json({
      success: true,
      data: {
        webhookUrl,
        secret: endpoint.secret,
        enabled: endpoint.enabled,
      },
    });
  })
);

// ============================================================================
// POST /api/templates/:id/webhook-config/regenerate - Regenerate webhook secret
// ============================================================================

router.post(
  '/:id/webhook-config/regenerate',
  asyncHandler(async (req, res) => {
    const templateId = req.params.id as string;
    const orgId = req.organizationId;

    // Verify the template exists and belongs to this org
    const template = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, templateId), eq(templates.organizationId, orgId))
        : eq(templates.id, templateId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Find existing endpoint
    let endpoint = await db.query.webhookEndpoints.findFirst({
      where: and(
        eq(webhookEndpoints.templateId, templateId),
        eq(webhookEndpoints.type, 'INCOMING')
      ),
    });

    const newSecret = crypto.randomUUID();

    if (endpoint) {
      // Update existing
      [endpoint] = await db
        .update(webhookEndpoints)
        .set({ secret: newSecret })
        .where(eq(webhookEndpoints.id, endpoint.id))
        .returning();
    } else {
      // Create new
      [endpoint] = await db
        .insert(webhookEndpoints)
        .values({
          templateId,
          organizationId: template.organizationId,
          type: 'INCOMING',
          secret: newSecret,
          enabled: true,
        })
        .returning();
    }

    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
    const webhookUrl = `${baseUrl}/api/webhooks/flows/incoming/${templateId}`;

    res.json({
      success: true,
      data: {
        webhookUrl,
        secret: endpoint.secret,
        enabled: endpoint.enabled,
      },
    });
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

    // Get the template for context
    const orgId = req.organizationId;
    const template = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, templateId), eq(templates.organizationId, orgId))
        : eq(templates.id, templateId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Build a test payload
    const { sendWebhook } = await import('../services/webhook.js');
    const payload = {
      event: 'flow.started' as const,
      timestamp: new Date().toISOString(),
      template: { id: template.id, name: template.name },
      flow: { id: 'test-flow-id', name: `${template.name} - Test`, status: 'IN_PROGRESS' },
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
