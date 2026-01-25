/**
 * Flows API Routes
 *
 * CRUD operations for workflow templates.
 */

import { Router } from 'express';
import { db, flows, users, organizations } from '../db/index.js';
import { eq, desc } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/flows - List all flows
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    // For now, return all flows (will add org filtering with auth later)
    const allFlows = await db.query.flows.findMany({
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
// GET /api/flows/:id - Get single flow
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const flow = await db.query.flows.findFirst({
      where: eq(flows.id, id),
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
// POST /api/flows - Create new flow
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

    // For development, create a default user and org if they don't exist
    let defaultOrg = await db.query.organizations.findFirst();
    if (!defaultOrg) {
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: 'Default Organization',
          slug: 'default',
        })
        .returning();
      defaultOrg = newOrg;
    }

    let defaultUser = await db.query.users.findFirst();
    if (!defaultUser) {
      const [newUser] = await db
        .insert(users)
        .values({
          email: 'dev@localhost',
          name: 'Developer',
          organizationId: defaultOrg.id,
        })
        .returning();
      defaultUser = newUser;
    }

    // Create the flow
    const [newFlow] = await db
      .insert(flows)
      .values({
        name,
        description,
        definition: definition || {},
        status,
        createdById: defaultUser.id,
        organizationId: defaultOrg.id,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newFlow,
    });
  })
);

// ============================================================================
// PUT /api/flows/:id - Update flow
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const { name, description, definition, status, version } = req.body;

    // Check if flow exists
    const existing = await db.query.flows.findFirst({
      where: eq(flows.id, id),
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
// DELETE /api/flows/:id - Delete (archive) flow
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    // Check if flow exists
    const existing = await db.query.flows.findFirst({
      where: eq(flows.id, id),
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
// POST /api/flows/:id/publish - Publish a draft flow
// ============================================================================

router.post(
  '/:id/publish',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    // Check if flow exists
    const existing = await db.query.flows.findFirst({
      where: eq(flows.id, id),
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

export default router;
