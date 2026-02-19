/**
 * Notifications API Routes
 *
 * Endpoints for managing in-app notifications.
 */

import { Router } from 'express';
import { db, notifications } from '../db/index.js';
import { eq, and, desc, isNull } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// GET /api/notifications - List notifications for current user
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.organizationId;
    const { unreadOnly } = req.query;

    if (!userId || !orgId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.organizationId, orgId),
      isNull(notifications.dismissedAt),
    ];

    if (unreadOnly === 'true') {
      conditions.push(isNull(notifications.readAt));
    }

    const userNotifications = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: [desc(notifications.createdAt)],
      limit: 50,
    });

    res.json({
      success: true,
      data: userNotifications,
    });
  })
);

// ============================================================================
// GET /api/notifications/unread-count - Get unread notification count
// ============================================================================

router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.organizationId;

    if (!userId || !orgId) {
      res.json({ success: true, data: { count: 0 } });
      return;
    }

    const unread = await db.query.notifications.findMany({
      where: and(
        eq(notifications.userId, userId),
        eq(notifications.organizationId, orgId),
        isNull(notifications.readAt),
        isNull(notifications.dismissedAt)
      ),
      columns: { id: true },
    });

    res.json({
      success: true,
      data: { count: unread.length },
    });
  })
);

// ============================================================================
// PATCH /api/notifications/:id/read - Mark notification as read
// ============================================================================

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await db.update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.id, id as string),
        eq(notifications.userId, userId)
      ));

    res.json({ success: true });
  })
);

// ============================================================================
// POST /api/notifications/read-all - Mark all notifications as read
// ============================================================================

router.post(
  '/read-all',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const orgId = req.organizationId;

    if (!userId || !orgId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await db.update(notifications)
      .set({ readAt: new Date() })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.organizationId, orgId),
        isNull(notifications.readAt)
      ));

    res.json({ success: true });
  })
);

// ============================================================================
// PATCH /api/notifications/:id/dismiss - Dismiss notification
// ============================================================================

router.patch(
  '/:id/dismiss',
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    await db.update(notifications)
      .set({ dismissedAt: new Date() })
      .where(and(
        eq(notifications.id, id as string),
        eq(notifications.userId, userId)
      ));

    res.json({ success: true });
  })
);

export default router;
