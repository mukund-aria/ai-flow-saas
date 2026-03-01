/**
 * Template Folders API Routes
 *
 * CRUD operations for organizing workflow templates into folders.
 */

import { Router } from 'express';
import { db, templateFolders, templates } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/folders - List all folders for org
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId as string;
    const folders = await db
      .select()
      .from(templateFolders)
      .where(eq(templateFolders.organizationId, orgId))
      .orderBy(templateFolders.name);

    // Get template counts per folder
    const allTemplates = await db
      .select({ id: templates.id, folderId: templates.folderId })
      .from(templates)
      .where(eq(templates.organizationId, orgId));

    const foldersWithCounts = folders.map((f) => ({
      ...f,
      templateCount: allTemplates.filter((t) => t.folderId === f.id).length,
    }));

    res.json({ success: true, data: foldersWithCounts });
  })
);

// ============================================================================
// POST /api/folders - Create folder
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name is required' },
      });
      return;
    }

    const [folder] = await db
      .insert(templateFolders)
      .values({
        name: name.trim(),
        organizationId: req.organizationId as string,
      })
      .returning();

    res.json({ success: true, data: { ...folder, templateCount: 0 } });
  })
);

// ============================================================================
// PUT /api/folders/:id - Rename folder
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId as string;
    const { name } = req.body;
    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Name is required' },
      });
      return;
    }

    const [updated] = await db
      .update(templateFolders)
      .set({ name: name.trim(), updatedAt: new Date() })
      .where(
        and(
          eq(templateFolders.id, id),
          eq(templateFolders.organizationId, orgId)
        )
      )
      .returning();

    if (!updated) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Folder not found' },
      });
      return;
    }

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// DELETE /api/folders/:id - Delete folder (moves templates to root)
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId as string;

    // Move all templates in this folder to root (null folderId)
    await db
      .update(templates)
      .set({ folderId: null })
      .where(eq(templates.folderId, id));

    // Delete the folder
    await db
      .delete(templateFolders)
      .where(
        and(
          eq(templateFolders.id, id),
          eq(templateFolders.organizationId, orgId)
        )
      );

    res.json({ success: true, data: { message: 'Folder deleted' } });
  })
);

export default router;
