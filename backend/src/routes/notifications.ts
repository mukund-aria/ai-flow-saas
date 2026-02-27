/**
 * Notifications API Routes
 *
 * Endpoints for managing in-app notifications.
 */

import { Router } from 'express';
import { db, notifications, userNotificationPrefs } from '../db/index.js';
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
// GET /api/notifications/preferences - Get notification preferences
// ============================================================================

router.get(
  '/preferences',
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

    const prefs = await db.query.userNotificationPrefs.findFirst({
      where: and(
        eq(userNotificationPrefs.userId, userId),
        eq(userNotificationPrefs.organizationId, orgId)
      ),
    });

    // Return existing prefs or defaults
    res.json({
      success: true,
      data: prefs || {
        emailEnabled: true,
        inAppEnabled: true,
        digestFrequency: 'NONE',
        mutedEventTypes: [],
      },
    });
  })
);

// ============================================================================
// PUT /api/notifications/preferences - Update notification preferences
// ============================================================================

router.put(
  '/preferences',
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

    const { emailEnabled, inAppEnabled, digestFrequency } = req.body;

    // Try to find existing prefs
    const existing = await db.query.userNotificationPrefs.findFirst({
      where: and(
        eq(userNotificationPrefs.userId, userId),
        eq(userNotificationPrefs.organizationId, orgId)
      ),
    });

    const updates: Record<string, unknown> = {};
    if (typeof emailEnabled === 'boolean') updates.emailEnabled = emailEnabled;
    if (typeof inAppEnabled === 'boolean') updates.inAppEnabled = inAppEnabled;
    if (digestFrequency && ['NONE', 'DAILY', 'WEEKLY'].includes(digestFrequency)) {
      updates.digestFrequency = digestFrequency;
    }

    let result;
    if (existing) {
      [result] = await db.update(userNotificationPrefs)
        .set(updates)
        .where(eq(userNotificationPrefs.id, existing.id))
        .returning();
    } else {
      [result] = await db.insert(userNotificationPrefs)
        .values({
          userId,
          organizationId: orgId,
          emailEnabled: typeof emailEnabled === 'boolean' ? emailEnabled : true,
          inAppEnabled: typeof inAppEnabled === 'boolean' ? inAppEnabled : true,
          digestFrequency: digestFrequency || 'NONE',
        })
        .returning();
    }

    res.json({ success: true, data: result });
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
