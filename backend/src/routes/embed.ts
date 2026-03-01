/**
 * Embed Routes
 *
 * Handles embedded flow configuration (auth required).
 * Public embed endpoints are in public-embed.ts.
 */

import { Router } from 'express';
import { db, templates } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// POST /api/templates/:id/embed-config - Generate embed configuration
// ============================================================================

router.post(
  '/:id/embed-config',
  asyncHandler(async (req, res) => {
    const flowId = req.params.id as string;
    const orgId = req.organizationId;

    // Get the flow template (scoped to org)
    const template = await db.query.templates.findFirst({
      where: orgId
        ? and(eq(templates.id, flowId), eq(templates.organizationId, orgId))
        : eq(templates.id, flowId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    // Check if an embedId already exists in the definition
    const definition = (template.definition || {}) as Record<string, unknown>;
    let embedId = definition.embedId as string | undefined;

    if (!embedId) {
      // Generate a new embedId and store it in the definition
      embedId = crypto.randomUUID();
      const updatedDefinition = { ...definition, embedId };

      await db.update(templates)
        .set({ definition: updatedDefinition, updatedAt: new Date() })
        .where(eq(templates.id, flowId));
    }

    // Build URLs
    const baseUrl = process.env.PUBLIC_URL || req.headers.origin || '';
    const embedUrl = `/embed/${embedId}`;
    const fullEmbedUrl = baseUrl ? `${baseUrl}${embedUrl}` : embedUrl;
    const startLinkUrl = fullEmbedUrl;
    const iframeHtml = `<iframe src="${fullEmbedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;

    res.json({
      success: true,
      data: {
        embedId,
        embedUrl,
        fullEmbedUrl,
        startLinkUrl,
        iframeHtml,
      },
    });
  })
);

export default router;
