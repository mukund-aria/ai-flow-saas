/**
 * Reports API Routes
 *
 * Analytics endpoints for dashboard metrics, flow performance,
 * assignee performance, and member activity reports.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, contacts, users } from '../db/index.js';
import { eq, and, gte, lte, sql, count, desc } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// Helpers
// ============================================================================

function getDateRangeCutoff(range: string): Date {
  const now = new Date();
  switch (range) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return start;
    }
    case 'month': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      return start;
    }
    case 'quarter': {
      const start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      return start;
    }
    case 'year': {
      const start = new Date(now);
      start.setFullYear(start.getFullYear() - 1);
      return start;
    }
    default: {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return start;
    }
  }
}

// ============================================================================
// GET /api/reports/summary - Dashboard summary metrics
// ============================================================================

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const cutoff = getDateRangeCutoff(range);
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Build org filter
    const orgFilter = orgId ? eq(flowRuns.organizationId, orgId) : undefined;

    // Fetch all flow runs in org
    const allRuns = await db.query.flowRuns.findMany({
      ...(orgFilter ? { where: orgFilter } : {}),
    });

    // Workspace metrics
    const newRuns = allRuns.filter(
      (r) => r.startedAt && new Date(r.startedAt) >= cutoff
    ).length;
    const inProgressRuns = allRuns.filter((r) => r.status === 'IN_PROGRESS').length;
    const completedRuns = allRuns.filter(
      (r) => r.status === 'COMPLETED' && r.completedAt && new Date(r.completedAt) >= cutoff
    ).length;
    const dueRuns = allRuns.filter(
      (r) => r.dueAt && new Date(r.dueAt) <= sevenDaysFromNow && new Date(r.dueAt) >= now && r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
    ).length;

    // Fetch step executions for action metrics
    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT ${flowRuns.id} FROM ${flowRuns} WHERE ${flowRuns.organizationId} = ${orgId})`
        : undefined,
    });

    const userId = (req.user as any)?.id;
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Action metrics
    const yourTurn = userId
      ? allSteps.filter(
          (s) => s.status === 'IN_PROGRESS' && s.assignedToUserId === userId
        ).length
      : 0;
    const dueToday = allSteps.filter(
      (s) =>
        s.dueAt &&
        new Date(s.dueAt) >= todayStart &&
        new Date(s.dueAt) <= todayEnd &&
        s.status !== 'COMPLETED' &&
        s.status !== 'SKIPPED'
    ).length;
    const overdue = allSteps.filter(
      (s) =>
        s.dueAt &&
        new Date(s.dueAt) < now &&
        s.status !== 'COMPLETED' &&
        s.status !== 'SKIPPED'
    ).length;
    const dueSoon = allSteps.filter(
      (s) =>
        s.dueAt &&
        new Date(s.dueAt) >= now &&
        new Date(s.dueAt) <= sevenDaysFromNow &&
        s.status !== 'COMPLETED' &&
        s.status !== 'SKIPPED'
    ).length;

    // Progress metrics
    const totalRuns = allRuns.length;
    const totalCompleted = allRuns.filter((r) => r.status === 'COMPLETED').length;
    const completionRate = totalRuns > 0 ? Math.round((totalCompleted / totalRuns) * 100) : 0;

    // Average completion days
    const completedWithTimes = allRuns.filter(
      (r) => r.status === 'COMPLETED' && r.startedAt && r.completedAt
    );
    let avgCompletionDays = '0';
    if (completedWithTimes.length > 0) {
      const totalDays = completedWithTimes.reduce((sum, r) => {
        const start = new Date(r.startedAt!).getTime();
        const end = new Date(r.completedAt!).getTime();
        return sum + (end - start) / (1000 * 60 * 60 * 24);
      }, 0);
      const avg = totalDays / completedWithTimes.length;
      avgCompletionDays = avg < 1 ? `${Math.round(avg * 24)} hrs` : `${avg.toFixed(1)} days`;
    }

    // Active templates count
    const activeTemplatesResult = await db
      .select({ count: count() })
      .from(flows)
      .where(
        orgId
          ? and(eq(flows.status, 'ACTIVE'), eq(flows.organizationId, orgId))
          : eq(flows.status, 'ACTIVE')
      );
    const activeTemplates = activeTemplatesResult[0]?.count ?? 0;

    // Weekly trend (completed runs per day for last 7 days)
    const weeklyTrend: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayCount = allRuns.filter(
        (r) =>
          r.status === 'COMPLETED' &&
          r.completedAt &&
          new Date(r.completedAt) >= dayStart &&
          new Date(r.completedAt) <= dayEnd
      ).length;
      weeklyTrend.push(dayCount);
    }

    res.json({
      success: true,
      data: {
        workspace: {
          new: newRuns,
          inProgress: inProgressRuns,
          completed: completedRuns,
          due: dueRuns,
        },
        actions: {
          yourTurn,
          dueToday,
          overdue,
          dueSoon,
        },
        progress: {
          completionRate,
          avgCompletionDays,
          activeTemplates,
          totalRuns,
          weeklyTrend,
        },
      },
    });
  })
);

// ============================================================================
// GET /api/reports/flows - Per-template performance
// ============================================================================

router.get(
  '/flows',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    // Get all flow runs with their template info
    const allRuns = await db.query.flowRuns.findMany({
      ...(orgId ? { where: eq(flowRuns.organizationId, orgId) } : {}),
      with: {
        flow: true,
      },
    });

    // Group by flowId
    const byTemplate = new Map<string, { name: string; templateId: string; runs: number; completed: number; totalDays: number; completedWithTime: number }>();

    for (const run of allRuns) {
      const templateId = run.flowId;
      const templateName = run.flow?.name || 'Unknown Template';

      if (!byTemplate.has(templateId)) {
        byTemplate.set(templateId, {
          name: templateName,
          templateId,
          runs: 0,
          completed: 0,
          totalDays: 0,
          completedWithTime: 0,
        });
      }

      const entry = byTemplate.get(templateId)!;
      entry.runs++;

      if (run.status === 'COMPLETED') {
        entry.completed++;
        if (run.startedAt && run.completedAt) {
          const days =
            (new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()) /
            (1000 * 60 * 60 * 24);
          entry.totalDays += days;
          entry.completedWithTime++;
        }
      }
    }

    const result = Array.from(byTemplate.values()).map((entry) => {
      const avg = entry.completedWithTime > 0 ? entry.totalDays / entry.completedWithTime : 0;
      return {
        name: entry.name,
        templateId: entry.templateId,
        runs: entry.runs,
        completed: entry.completed,
        avgCompletionDays: avg < 1 ? `${Math.round(avg * 24)} hrs` : `${avg.toFixed(1)} days`,
      };
    });

    // Sort by total runs descending
    result.sort((a, b) => b.runs - a.runs);

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// GET /api/reports/assignees - Per-assignee (contact) performance
// ============================================================================

router.get(
  '/assignees',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    // Get step executions that are assigned to contacts
    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT ${flowRuns.id} FROM ${flowRuns} WHERE ${flowRuns.organizationId} = ${orgId}) AND ${stepExecutions.assignedToContactId} IS NOT NULL`
        : sql`${stepExecutions.assignedToContactId} IS NOT NULL`,
      with: {
        assignedToContact: true,
      },
    });

    // Group by contactId
    const byContact = new Map<string, { name: string; contactId: string; tasks: number; completed: number; pending: number }>();

    for (const step of allSteps) {
      const contactId = step.assignedToContactId!;
      const contactName = step.assignedToContact?.name || 'Unknown Contact';

      if (!byContact.has(contactId)) {
        byContact.set(contactId, {
          name: contactName,
          contactId,
          tasks: 0,
          completed: 0,
          pending: 0,
        });
      }

      const entry = byContact.get(contactId)!;
      entry.tasks++;

      if (step.status === 'COMPLETED') {
        entry.completed++;
      } else if (step.status !== 'SKIPPED') {
        entry.pending++;
      }
    }

    const result = Array.from(byContact.values());
    result.sort((a, b) => b.tasks - a.tasks);

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// GET /api/reports/members - Per-coordinator (user) activity
// ============================================================================

router.get(
  '/members',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;

    // Get all flow runs with their starter info
    const allRuns = await db.query.flowRuns.findMany({
      ...(orgId ? { where: eq(flowRuns.organizationId, orgId) } : {}),
      with: {
        startedBy: true,
      },
    });

    // Group by startedById
    const byMember = new Map<string, { name: string; userId: string; activeRuns: number; completedRuns: number }>();

    for (const run of allRuns) {
      const userId = run.startedById;
      const userName = run.startedBy?.name || 'Unknown User';

      if (!byMember.has(userId)) {
        byMember.set(userId, {
          name: userName,
          userId,
          activeRuns: 0,
          completedRuns: 0,
        });
      }

      const entry = byMember.get(userId)!;
      if (run.status === 'IN_PROGRESS') {
        entry.activeRuns++;
      } else if (run.status === 'COMPLETED') {
        entry.completedRuns++;
      }
    }

    const result = Array.from(byMember.values());
    result.sort((a, b) => (b.activeRuns + b.completedRuns) - (a.activeRuns + a.completedRuns));

    res.json({
      success: true,
      data: result,
    });
  })
);

export default router;
