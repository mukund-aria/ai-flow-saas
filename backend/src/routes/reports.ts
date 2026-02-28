/**
 * Reports API Routes
 *
 * Analytics endpoints for dashboard metrics, flow performance,
 * assignee performance, and member activity reports.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, contacts, users } from '../db/index.js';
import { eq, and, gte, lte, sql, count, desc, isNotNull } from 'drizzle-orm';
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

// ============================================================================
// GET /api/reports/sla - SLA compliance metrics
// ============================================================================

router.get(
  '/sla',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const cutoff = getDateRangeCutoff(range);

    // Fetch completed step executions within the time range, with their flow run + flow info
    const completedSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.completedAt} >= ${cutoff} AND ${stepExecutions.flowRunId} IN (SELECT ${flowRuns.id} FROM ${flowRuns} WHERE ${flowRuns.organizationId} = ${orgId})`
        : sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.completedAt} >= ${cutoff}`,
      with: {
        flowRun: { with: { flow: true } },
      },
    });

    // Overall SLA compliance
    const stepsWithDue = completedSteps.filter((s) => s.dueAt);
    const stepsOnTime = stepsWithDue.filter((s) => !s.slaBreachedAt);
    const stepsBreached = stepsWithDue.filter((s) => !!s.slaBreachedAt);
    const complianceRate = stepsWithDue.length > 0
      ? Math.round((stepsOnTime.length / stepsWithDue.length) * 100)
      : 100;

    // Per-template breakdown
    const byTemplate = new Map<string, {
      templateName: string;
      templateId: string;
      totalSteps: number;
      stepsWithDue: number;
      breached: number;
      totalTimeMs: number;
      stepsWithTime: number;
      stepTimes: Map<string, { stepName: string; totalMs: number; count: number; breachCount: number }>;
    }>();

    for (const step of completedSteps) {
      const templateId = step.flowRun?.flowId || 'unknown';
      const templateName = step.flowRun?.flow?.name || 'Unknown Template';

      if (!byTemplate.has(templateId)) {
        byTemplate.set(templateId, {
          templateName,
          templateId,
          totalSteps: 0,
          stepsWithDue: 0,
          breached: 0,
          totalTimeMs: 0,
          stepsWithTime: 0,
          stepTimes: new Map(),
        });
      }

      const entry = byTemplate.get(templateId)!;
      entry.totalSteps++;

      if (step.dueAt) {
        entry.stepsWithDue++;
        if (step.slaBreachedAt) entry.breached++;
      }

      if (step.timeToComplete) {
        entry.totalTimeMs += step.timeToComplete;
        entry.stepsWithTime++;
      }

      // Track per-step metrics for bottleneck detection
      const stepKey = step.stepId;
      // Get step name from flow definition
      const definition = step.flowRun?.flow?.definition as any;
      const stepDef = definition?.steps?.find((s: any) => (s.stepId || s.id) === step.stepId);
      const stepName = stepDef?.config?.name || `Step ${step.stepIndex + 1}`;

      if (!entry.stepTimes.has(stepKey)) {
        entry.stepTimes.set(stepKey, { stepName, totalMs: 0, count: 0, breachCount: 0 });
      }
      const stepEntry = entry.stepTimes.get(stepKey)!;
      if (step.timeToComplete) {
        stepEntry.totalMs += step.timeToComplete;
        stepEntry.count++;
      }
      if (step.slaBreachedAt) stepEntry.breachCount++;
    }

    const templateBreakdown = Array.from(byTemplate.values()).map((entry) => {
      const avgCompletionMs = entry.stepsWithTime > 0 ? entry.totalTimeMs / entry.stepsWithTime : 0;
      const breachRate = entry.stepsWithDue > 0 ? Math.round((entry.breached / entry.stepsWithDue) * 100) : 0;

      // Find bottleneck step (slowest average)
      let bottleneckStep: string | null = null;
      let maxAvgMs = 0;
      for (const [, stepData] of entry.stepTimes) {
        if (stepData.count > 0) {
          const avg = stepData.totalMs / stepData.count;
          if (avg > maxAvgMs) {
            maxAvgMs = avg;
            bottleneckStep = stepData.stepName;
          }
        }
      }

      return {
        templateName: entry.templateName,
        templateId: entry.templateId,
        totalSteps: entry.totalSteps,
        avgCompletionMs,
        avgCompletionFormatted: formatDuration(avgCompletionMs),
        breachRate,
        bottleneckStep,
      };
    });

    templateBreakdown.sort((a, b) => b.breachRate - a.breachRate);

    res.json({
      success: true,
      data: {
        overall: {
          totalCompleted: completedSteps.length,
          stepsWithDue: stepsWithDue.length,
          onTime: stepsOnTime.length,
          breached: stepsBreached.length,
          complianceRate,
        },
        templateBreakdown,
      },
    });
  })
);

// ============================================================================
// GET /api/reports/bottlenecks - Top 10 slowest steps
// ============================================================================

router.get(
  '/bottlenecks',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'month';
    const cutoff = getDateRangeCutoff(range);

    // Fetch completed steps with time data
    const completedSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.timeToComplete} IS NOT NULL AND ${stepExecutions.completedAt} >= ${cutoff} AND ${stepExecutions.flowRunId} IN (SELECT ${flowRuns.id} FROM ${flowRuns} WHERE ${flowRuns.organizationId} = ${orgId})`
        : sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.timeToComplete} IS NOT NULL AND ${stepExecutions.completedAt} >= ${cutoff}`,
      with: {
        flowRun: { with: { flow: true } },
        assignedToContact: true,
        assignedToUser: true,
      },
    });

    // Aggregate by stepId + templateId
    const byStep = new Map<string, {
      stepName: string;
      templateName: string;
      templateId: string;
      totalMs: number;
      count: number;
      breachCount: number;
      assignees: Set<string>;
    }>();

    for (const step of completedSteps) {
      const templateId = step.flowRun?.flowId || 'unknown';
      const templateName = step.flowRun?.flow?.name || 'Unknown Template';
      const key = `${templateId}:${step.stepId}`;

      // Get step name from flow definition
      const definition = step.flowRun?.flow?.definition as any;
      const stepDef = definition?.steps?.find((s: any) => (s.stepId || s.id) === step.stepId);
      const stepName = stepDef?.config?.name || `Step ${step.stepIndex + 1}`;

      if (!byStep.has(key)) {
        byStep.set(key, {
          stepName,
          templateName,
          templateId,
          totalMs: 0,
          count: 0,
          breachCount: 0,
          assignees: new Set(),
        });
      }

      const entry = byStep.get(key)!;
      entry.totalMs += step.timeToComplete!;
      entry.count++;
      if (step.slaBreachedAt) entry.breachCount++;

      const assigneeName = step.assignedToContact?.name || step.assignedToUser?.name;
      if (assigneeName) entry.assignees.add(assigneeName);
    }

    const result = Array.from(byStep.values())
      .map((entry) => ({
        stepName: entry.stepName,
        templateName: entry.templateName,
        templateId: entry.templateId,
        avgDurationMs: Math.round(entry.totalMs / entry.count),
        avgDurationFormatted: formatDuration(entry.totalMs / entry.count),
        occurrences: entry.count,
        breachCount: entry.breachCount,
        assignees: Array.from(entry.assignees).slice(0, 3),
      }))
      .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
      .slice(0, 10);

    res.json({
      success: true,
      data: result,
    });
  })
);

// ============================================================================
// Helpers
// ============================================================================

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) {
    const mins = Math.round(ms / (1000 * 60));
    return `${mins}m`;
  }
  if (hours < 24) {
    return `${hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${days.toFixed(1)}d`;
}

export default router;
