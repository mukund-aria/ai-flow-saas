/**
 * Schedules API Routes
 *
 * Database-backed CRUD operations for scheduled workflow triggers.
 * Uses the `schedules` table for persistence and delegates to
 * flow-scheduler for BullMQ cron jobs when Redis is available.
 */

import { Router } from 'express';
import { db, flows, schedules } from '../db/index.js';
import { eq, and, desc } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { scheduleFlowStart, cancelFlowSchedule } from '../services/flow-scheduler.js';
import { CronExpressionParser } from 'cron-parser';
import { processScheduledFlowStart } from '../services/flow-scheduler.js';

const router = Router();

/**
 * Compute the next run time for a cron pattern in a given timezone.
 */
function computeNextRun(cronPattern: string, timezone: string = 'UTC'): Date | null {
  try {
    const expr = CronExpressionParser.parse(cronPattern, { tz: timezone });
    return expr.next().toDate();
  } catch {
    return null;
  }
}

// ============================================================================
// GET /api/schedules - List all schedules for the org
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    const results = await db.query.schedules.findMany({
      where: orgId ? eq(schedules.organizationId, orgId) : undefined,
      with: {
        flow: { columns: { id: true, name: true } },
      },
      orderBy: [desc(schedules.createdAt)],
    });

    const data = results.map((s) => ({
      id: s.id,
      flowId: s.flowId,
      flowName: s.flow?.name || 'Unknown',
      scheduleName: s.scheduleName,
      cronPattern: s.cronPattern,
      timezone: s.timezone,
      enabled: s.enabled,
      lastRunAt: s.lastRunAt?.toISOString() || null,
      nextRun: s.nextRunAt?.toISOString() || computeNextRun(s.cronPattern, s.timezone)?.toISOString() || null,
      createdAt: s.createdAt.toISOString(),
    }));

    res.json({ success: true, data });
  })
);

// ============================================================================
// POST /api/schedules - Create a new schedule
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { flowId, scheduleName, cronPattern, timezone, roleAssignments, kickoffData } = req.body;

    // Validate required fields
    if (!flowId) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'flowId is required' },
      });
      return;
    }

    if (!scheduleName) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'scheduleName is required' },
      });
      return;
    }

    if (!cronPattern) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'cronPattern is required' },
      });
      return;
    }

    // Validate cron pattern using cron-parser
    try {
      CronExpressionParser.parse(cronPattern);
    } catch {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid cron pattern. Use 5-field format: minute hour dayOfMonth month dayOfWeek' },
      });
      return;
    }

    // Validate the flow exists
    const orgId = req.organizationId;
    const flow = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, flowId), eq(flows.organizationId, orgId))
        : eq(flows.id, flowId),
    });

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    const tz = timezone || 'UTC';
    const nextRun = computeNextRun(cronPattern, tz);

    // Insert into the database
    const userId = req.user?.id || 'system';
    const [record] = await db
      .insert(schedules)
      .values({
        organizationId: orgId || flow.organizationId,
        flowId,
        scheduleName,
        cronPattern,
        timezone: tz,
        roleAssignments: roleAssignments || null,
        kickoffData: kickoffData || null,
        enabled: true,
        nextRunAt: nextRun,
        createdByUserId: userId,
      })
      .returning();

    // Register with BullMQ (no-op without Redis)
    try {
      await scheduleFlowStart({
        flowId,
        organizationId: orgId || flow.organizationId,
        scheduleName,
        cronPattern,
        roleAssignments,
        kickoffData,
      });
    } catch {
      // Redis not available — schedule saved to DB, will be loaded on next restart
    }

    res.status(201).json({
      success: true,
      data: {
        id: record.id,
        flowId: record.flowId,
        flowName: flow.name,
        scheduleName: record.scheduleName,
        cronPattern: record.cronPattern,
        timezone: record.timezone,
        enabled: record.enabled,
        lastRunAt: null,
        nextRun: record.nextRunAt?.toISOString() || null,
        createdAt: record.createdAt.toISOString(),
      },
    });
  })
);

// ============================================================================
// PUT /api/schedules/:id - Update a schedule
// ============================================================================

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const existing = await db.query.schedules.findFirst({
      where: orgId
        ? and(eq(schedules.id, id), eq(schedules.organizationId, orgId))
        : eq(schedules.id, id),
      with: { flow: { columns: { id: true, name: true } } },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
      return;
    }

    const { scheduleName, cronPattern, timezone, enabled, roleAssignments, kickoffData } = req.body;

    // Validate cron pattern if provided
    const newCron = cronPattern || existing.cronPattern;
    if (cronPattern) {
      try {
        CronExpressionParser.parse(cronPattern);
      } catch {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid cron pattern' },
        });
        return;
      }
    }

    const newTz = timezone || existing.timezone;
    const nextRun = computeNextRun(newCron, newTz);

    const [updated] = await db
      .update(schedules)
      .set({
        ...(scheduleName !== undefined ? { scheduleName } : {}),
        ...(cronPattern !== undefined ? { cronPattern } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
        ...(enabled !== undefined ? { enabled } : {}),
        ...(roleAssignments !== undefined ? { roleAssignments } : {}),
        ...(kickoffData !== undefined ? { kickoffData } : {}),
        nextRunAt: nextRun,
        updatedAt: new Date(),
      })
      .where(eq(schedules.id, id))
      .returning();

    // Re-register with BullMQ if cron or enabled status changed
    try {
      await cancelFlowSchedule(id);
      if (updated.enabled) {
        await scheduleFlowStart({
          flowId: updated.flowId,
          organizationId: updated.organizationId,
          scheduleName: updated.scheduleName,
          cronPattern: updated.cronPattern,
          roleAssignments: updated.roleAssignments as Record<string, string> | undefined,
          kickoffData: updated.kickoffData as Record<string, unknown> | undefined,
        });
      }
    } catch {
      // Redis not available
    }

    res.json({
      success: true,
      data: {
        id: updated.id,
        flowId: updated.flowId,
        flowName: existing.flow?.name || 'Unknown',
        scheduleName: updated.scheduleName,
        cronPattern: updated.cronPattern,
        timezone: updated.timezone,
        enabled: updated.enabled,
        lastRunAt: updated.lastRunAt?.toISOString() || null,
        nextRun: updated.nextRunAt?.toISOString() || null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  })
);

// ============================================================================
// DELETE /api/schedules/:id - Delete a schedule
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const existing = await db.query.schedules.findFirst({
      where: orgId
        ? and(eq(schedules.id, id), eq(schedules.organizationId, orgId))
        : eq(schedules.id, id),
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
      return;
    }

    // Cancel in BullMQ (no-op without Redis)
    try {
      await cancelFlowSchedule(id);
    } catch {
      // Redis not available
    }

    // Delete from DB
    await db.delete(schedules).where(eq(schedules.id, id));

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  })
);

// ============================================================================
// POST /api/schedules/:id/trigger - Manual trigger: start flow run immediately
// ============================================================================

router.post(
  '/:id/trigger',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const schedule = await db.query.schedules.findFirst({
      where: orgId
        ? and(eq(schedules.id, id), eq(schedules.organizationId, orgId))
        : eq(schedules.id, id),
      with: { flow: { columns: { id: true, name: true } } },
    });

    if (!schedule) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
      return;
    }

    // Use the same logic as the scheduled flow start
    await processScheduledFlowStart({
      type: 'scheduled-flow-start',
      flowId: schedule.flowId,
      organizationId: schedule.organizationId,
      scheduleName: schedule.scheduleName,
      roleAssignments: schedule.roleAssignments as Record<string, string> | undefined,
      kickoffData: schedule.kickoffData as Record<string, unknown> | undefined,
    });

    // Update lastRunAt
    const nextRun = computeNextRun(schedule.cronPattern, schedule.timezone);
    await db
      .update(schedules)
      .set({ lastRunAt: new Date(), nextRunAt: nextRun })
      .where(eq(schedules.id, id));

    res.json({
      success: true,
      data: { message: 'Flow run triggered successfully' },
    });
  })
);

export default router;
