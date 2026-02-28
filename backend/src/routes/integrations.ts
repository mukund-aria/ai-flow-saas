/**
 * Integrations API Routes
 *
 * CRUD + test for org-level integrations (Slack, Teams, Custom Webhooks).
 */

import { Router } from 'express';
import { db, integrations, notificationLog } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import type { IntegrationType } from '../db/schema.js';

const router = Router();

const VALID_TYPES: IntegrationType[] = ['SLACK_WEBHOOK', 'TEAMS_WEBHOOK', 'CUSTOM_WEBHOOK'];

// ============================================================================
// GET /api/integrations - List all integrations for the org
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const items = await db.query.integrations.findMany({
      where: eq(integrations.organizationId, orgId),
      orderBy: (i, { desc }) => [desc(i.createdAt)],
    });

    res.json({ success: true, data: items });
  })
);

// ============================================================================
// POST /api/integrations - Create integration
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const { type, name, config } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
      });
      return;
    }

    if (!name?.trim()) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name is required' },
      });
      return;
    }

    if (!config?.webhookUrl) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Webhook URL is required in config' },
      });
      return;
    }

    const [created] = await db.insert(integrations).values({
      organizationId: orgId,
      type,
      name: name.trim(),
      config,
    }).returning();

    res.status(201).json({ success: true, data: created });
  })
);

// ============================================================================
// PUT /api/integrations/:id - Update integration
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const integrationId = req.params.id as string;
    const { name, config, enabled } = req.body;

    // Verify ownership
    const existing = await db.query.integrations.findFirst({
      where: and(eq(integrations.id, integrationId), eq(integrations.organizationId, orgId)),
    });

    if (!existing) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name.trim();
    if (config !== undefined) updates.config = config;
    if (enabled !== undefined) updates.enabled = enabled;

    const [updated] = await db.update(integrations)
      .set(updates)
      .where(eq(integrations.id, integrationId))
      .returning();

    res.json({ success: true, data: updated });
  })
);

// ============================================================================
// DELETE /api/integrations/:id - Delete integration
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const integrationId = req.params.id as string;

    const existing = await db.query.integrations.findFirst({
      where: and(eq(integrations.id, integrationId), eq(integrations.organizationId, orgId)),
    });

    if (!existing) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
      return;
    }

    await db.delete(integrations).where(eq(integrations.id, integrationId));

    res.json({ success: true, data: { deleted: true } });
  })
);

// ============================================================================
// POST /api/integrations/:id/test - Send test message
// ============================================================================

router.post(
  '/:id/test',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    if (!orgId) {
      res.status(403).json({ success: false, error: { code: 'NO_ORGANIZATION' } });
      return;
    }

    const integrationId = req.params.id as string;

    const integration = await db.query.integrations.findFirst({
      where: and(eq(integrations.id, integrationId), eq(integrations.organizationId, orgId)),
    });

    if (!integration) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Integration not found' } });
      return;
    }

    const webhookUrl = (integration.config as any)?.webhookUrl;
    if (!webhookUrl) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No webhook URL configured' },
      });
      return;
    }

    let payload: unknown;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    switch (integration.type) {
      case 'SLACK_WEBHOOK':
        payload = {
          blocks: [{
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Test from AI Flow* \u2705\nYour Slack integration is working!',
            },
          }],
        };
        break;
      case 'TEAMS_WEBHOOK':
        payload = {
          '@type': 'MessageCard',
          summary: 'Test',
          sections: [{
            activityTitle: 'Test from AI Flow \u2705',
            text: 'Your Teams integration is working!',
          }],
        };
        break;
      case 'CUSTOM_WEBHOOK':
      default:
        payload = { event: 'test', message: 'Integration test' };
        break;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const success = response.status >= 200 && response.status < 300;

      // Update delivery status
      await db.update(integrations)
        .set({
          lastDeliveryAt: new Date(),
          lastDeliveryStatus: success ? 'SUCCESS' : `FAILED (HTTP ${response.status})`,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integrationId));

      // Log to notification log
      await db.insert(notificationLog).values({
        organizationId: orgId,
        channel: 'WEBHOOK',
        eventType: 'integration.test',
        recipientEmail: webhookUrl,
        status: success ? 'SENT' : 'FAILED',
        errorMessage: success ? null : `HTTP ${response.status}`,
      });

      if (success) {
        res.json({ success: true, data: { message: 'Test message sent successfully' } });
      } else {
        res.status(502).json({
          success: false,
          error: { code: 'WEBHOOK_FAILED', message: `Webhook returned HTTP ${response.status}` },
        });
      }
    } catch (err) {
      // Update delivery status on error
      await db.update(integrations)
        .set({
          lastDeliveryAt: new Date(),
          lastDeliveryStatus: `FAILED (${(err as Error).message})`,
          updatedAt: new Date(),
        })
        .where(eq(integrations.id, integrationId));

      res.status(502).json({
        success: false,
        error: { code: 'WEBHOOK_ERROR', message: (err as Error).message },
      });
    }
  })
);

export default router;
