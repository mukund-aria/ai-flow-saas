/**
 * Files API Routes
 *
 * Handles file upload, download, listing, and deletion for flow runs.
 * Uses the file storage service (Supabase or local fallback).
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { db, files, flows, stepExecutions } from '../db/index.js';
import { eq, and, isNull } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { fileStorage, UPLOADS_DIR } from '../services/file-storage.js';

const router = Router();

// ============================================================================
// Multer Configuration
// ============================================================================

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

// ============================================================================
// POST /api/files/upload - Upload a file
// ============================================================================

router.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Organization context required' },
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' },
      });
      return;
    }

    const { flowId, stepExecutionId } = req.body;
    const user = req.user as any;

    // Verify the flow run belongs to this org (if provided)
    if (flowId) {
      const run = await db.query.flows.findFirst({
        where: and(eq(flows.id, flowId), eq(flows.organizationId, orgId)),
      });
      if (!run) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Flow not found' },
        });
        return;
      }
    }

    // Upload to storage
    const { storageKey } = await fileStorage.upload(file.buffer, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      orgId,
      flowId,
      stepId: stepExecutionId,
    });

    // Save metadata to database
    const [fileRecord] = await db.insert(files).values({
      organizationId: orgId,
      flowId: flowId || null,
      stepExecutionId: stepExecutionId || null,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageKey,
      uploadedByUserId: user?.id || null,
    }).returning();

    res.status(201).json({
      success: true,
      data: fileRecord,
    });
  })
);

// ============================================================================
// GET /api/files/:id/download - Get download URL / stream file
// ============================================================================

router.get(
  '/:id/download',
  asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const fileId = req.params.id as string;

    const fileRecord = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        isNull(files.deletedAt),
        ...(orgId ? [eq(files.organizationId, orgId)] : []),
      ),
    });

    if (!fileRecord) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    const signedUrl = await fileStorage.getSignedUrl(fileRecord.storageKey);

    // If the URL is a local API path, stream the file directly
    if (signedUrl.startsWith('/api/files/local/')) {
      const filePath = path.join(UPLOADS_DIR, fileRecord.storageKey);
      res.setHeader('Content-Type', fileRecord.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.fileName}"`);
      const fileBuffer = await fs.readFile(filePath);
      res.send(fileBuffer);
      return;
    }

    // Redirect to signed URL for cloud storage
    res.redirect(signedUrl);
  })
);

// ============================================================================
// GET /api/files/local/:storageKey - Serve local files (fallback storage)
// ============================================================================

router.get(
  '/local/{*storageKey}',
  asyncHandler(async (req: Request, res: Response) => {
    const storageKey = decodeURIComponent((req.params as any).storageKey || '');
    if (!storageKey) {
      res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing storage key' } });
      return;
    }

    const filePath = path.join(UPLOADS_DIR, storageKey);

    // Prevent directory traversal
    const resolved = path.resolve(filePath);
    if (!resolved.startsWith(path.resolve(UPLOADS_DIR))) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Invalid path' } });
      return;
    }

    try {
      const stat = await fs.stat(filePath);
      const fileBuffer = await fs.readFile(filePath);
      const fileName = path.basename(storageKey);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stat.size.toString());
      res.send(fileBuffer);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'File not found' } });
        return;
      }
      throw err;
    }
  })
);

// ============================================================================
// GET /api/runs/:runId/steps/:stepId/files - List files for a step
// ============================================================================

router.get(
  '/runs/:runId/steps/:stepId/files',
  asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const { runId, stepId } = req.params;

    // Verify the run belongs to this org
    if (orgId) {
      const run = await db.query.flows.findFirst({
        where: and(eq(flows.id, runId as string), eq(flows.organizationId, orgId)),
      });
      if (!run) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Flow not found' },
        });
        return;
      }
    }

    const stepFiles = await db.query.files.findMany({
      where: and(
        eq(files.flowId, runId as string),
        eq(files.stepExecutionId, stepId as string),
        isNull(files.deletedAt),
      ),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
    });

    res.json({
      success: true,
      data: stepFiles,
    });
  })
);

// ============================================================================
// DELETE /api/files/:id - Soft delete a file
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const orgId = req.organizationId;
    const fileId = req.params.id as string;

    const fileRecord = await db.query.files.findFirst({
      where: and(
        eq(files.id, fileId),
        isNull(files.deletedAt),
        ...(orgId ? [eq(files.organizationId, orgId)] : []),
      ),
    });

    if (!fileRecord) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'File not found' },
      });
      return;
    }

    // Soft delete
    await db.update(files)
      .set({ deletedAt: new Date() })
      .where(eq(files.id, fileId));

    res.json({
      success: true,
      data: { id: fileId, deleted: true },
    });
  })
);

// ============================================================================
// Multer error handler
// ============================================================================

router.use((err: Error, _req: Request, res: Response, next: (err?: Error) => void) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds limit. Maximum allowed: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: { code: 'UPLOAD_ERROR', message: err.message },
    });
  }
  next(err);
});

export default router;
