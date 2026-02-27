/**
 * Schedules API Routes
 *
 * CRUD operations for scheduled workflow triggers.
 * Uses an in-memory store so the UI works without Redis,
 * and delegates to flow-scheduler for BullMQ cron jobs when available.
 */

import { Router } from 'express';
import { db, flows } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { scheduleFlowStart, cancelFlowSchedule } from '../services/flow-scheduler.js';

const router = Router();

// ============================================================================
// In-memory schedule store (persists across requests, lost on restart)
// ============================================================================

interface ScheduleRecord {
  id: string;
  flowId: string;
  flowName: string;
  organizationId: string;
  scheduleName: string;
  cronPattern: string;
  roleAssignments?: Record<string, string>;
  kickoffData?: Record<string, unknown>;
  createdAt: string;
  nextRun?: string;
}

const scheduleStore: Map<string, ScheduleRecord> = new Map();

/**
 * Compute the next occurrence of a cron pattern (simple heuristic).
 * Returns an ISO string for the next approximate run.
 */
function computeNextRun(cronPattern: string): string | undefined {
  // Simple cron parsing for common patterns
  // Format: minute hour dayOfMonth month dayOfWeek
  const parts = cronPattern.trim().split(/\s+/);
  if (parts.length !== 5) return undefined;

  const [minute, hour] = parts;
  const now = new Date();
  const next = new Date(now);

  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  if (isNaN(h) || isNaN(m)) return undefined;

  next.setHours(h, m, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return next.toISOString();
}

// ============================================================================
// GET /api/schedules - List all schedules for the org
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    const schedules = Array.from(scheduleStore.values())
      .filter((s) => !orgId || s.organizationId === orgId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: schedules,
    });
  })
);

// ============================================================================
// POST /api/schedules - Create a new schedule
// ============================================================================

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { flowId, scheduleName, cronPattern, roleAssignments, kickoffData } = req.body;

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

    // Validate cron pattern format (5 fields)
    const cronParts = cronPattern.trim().split(/\s+/);
    if (cronParts.length !== 5) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'cronPattern must have 5 fields (minute hour dayOfMonth month dayOfWeek)' },
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

    // Register with BullMQ (no-op without Redis)
    const scheduleId = await scheduleFlowStart({
      flowId,
      organizationId: orgId || flow.organizationId,
      scheduleName,
      cronPattern,
      roleAssignments,
      kickoffData,
    });

    // Store in memory
    const record: ScheduleRecord = {
      id: scheduleId,
      flowId,
      flowName: flow.name,
      organizationId: orgId || flow.organizationId,
      scheduleName,
      cronPattern,
      roleAssignments,
      kickoffData,
      createdAt: new Date().toISOString(),
      nextRun: computeNextRun(cronPattern),
    };

    scheduleStore.set(scheduleId, record);

    res.status(201).json({
      success: true,
      data: record,
    });
  })
);

// ============================================================================
// DELETE /api/schedules/:id - Cancel a schedule
// ============================================================================

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const existing = scheduleStore.get(id);
    if (!existing || (orgId && existing.organizationId !== orgId)) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Schedule not found' },
      });
      return;
    }

    // Cancel in BullMQ (no-op without Redis)
    await cancelFlowSchedule(id);

    // Remove from store
    scheduleStore.delete(id);

    res.json({
      success: true,
      data: { id, deleted: true },
    });
  })
);

export default router;
