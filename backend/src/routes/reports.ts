/**
 * Reports API Routes
 *
 * Analytics endpoints for dashboard metrics, flow performance,
 * assignee performance, and member activity reports.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, contacts, users, accounts, flowRunAccounts } from '../db/index.js';
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
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
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
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId}) AND ${stepExecutions.assignedToContactId} IS NOT NULL`
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
        ? sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.completedAt} >= ${cutoff} AND ${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
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
        ? sql`${stepExecutions.status} = 'COMPLETED' AND ${stepExecutions.timeToComplete} IS NOT NULL AND ${stepExecutions.completedAt} >= ${cutoff} AND ${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
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

function computePreviousCutoff(cutoff: Date): Date {
  const now = new Date();
  const periodMs = now.getTime() - cutoff.getTime();
  return new Date(cutoff.getTime() - periodMs);
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

function getStepNameFromDefinition(definition: any, stepId: string, stepIndex: number): string {
  const stepDef = definition?.steps?.find((s: any) => (s.stepId || s.id) === stepId);
  return stepDef?.config?.name || `Step ${stepIndex + 1}`;
}

function getStepTypeFromDefinition(definition: any, stepId: string): string {
  const stepDef = definition?.steps?.find((s: any) => (s.stepId || s.id) === stepId);
  return stepDef?.type || 'UNKNOWN';
}

function generateTrendBuckets(cutoff: Date, range: string): { labels: string[]; starts: Date[]; ends: Date[] } {
  const now = new Date();
  const labels: string[] = [];
  const starts: Date[] = [];
  const ends: Date[] = [];

  if (range === 'week' || range === 'today') {
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      labels.push(dayStart.toLocaleDateString('en-US', { weekday: 'short' }));
      starts.push(dayStart);
      ends.push(dayEnd);
    }
  } else {
    const totalMs = now.getTime() - cutoff.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const numBuckets = Math.max(1, Math.ceil(totalMs / weekMs));
    for (let i = numBuckets - 1; i >= 0; i--) {
      const bucketEnd = new Date(now.getTime() - i * weekMs);
      const bucketStart = new Date(bucketEnd.getTime() - weekMs);
      if (bucketStart < cutoff) bucketStart.setTime(cutoff.getTime());
      labels.push(`W${numBuckets - i}`);
      starts.push(bucketStart);
      ends.push(bucketEnd);
    }
  }

  return { labels, starts, ends };
}

// ============================================================================
// GET /api/reports/pulse - Performance dashboard
// ============================================================================

router.get(
  '/pulse',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const cutoff = getDateRangeCutoff(range);
    const previousCutoff = computePreviousCutoff(cutoff);
    const now = new Date();

    const orgFilter = orgId ? eq(flowRuns.organizationId, orgId) : undefined;

    const allRuns = await db.query.flowRuns.findMany({
      ...(orgFilter ? { where: orgFilter } : {}),
    });

    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
        : undefined,
    });

    const currentRuns = allRuns.filter((r) => r.startedAt && new Date(r.startedAt) >= cutoff);
    const previousRuns = allRuns.filter(
      (r) => r.startedAt && new Date(r.startedAt) >= previousCutoff && new Date(r.startedAt) < cutoff
    );

    const currentCompleted = currentRuns.filter((r) => r.status === 'COMPLETED');
    const previousCompleted = previousRuns.filter((r) => r.status === 'COMPLETED');

    const currentSteps = allSteps.filter(
      (s) => s.completedAt && new Date(s.completedAt) >= cutoff
    );
    const previousSteps = allSteps.filter(
      (s) => s.completedAt && new Date(s.completedAt) >= previousCutoff && new Date(s.completedAt) < cutoff
    );

    const currentStepsWithDue = currentSteps.filter((s) => s.dueAt);
    const currentOnTime = currentStepsWithDue.filter((s) => !s.slaBreachedAt);
    const onTimeRate = currentStepsWithDue.length > 0
      ? currentOnTime.length / currentStepsWithDue.length
      : 1;

    const previousStepsWithDue = previousSteps.filter((s) => s.dueAt);
    const previousOnTime = previousStepsWithDue.filter((s) => !s.slaBreachedAt);
    const prevOnTimeRate = previousStepsWithDue.length > 0
      ? previousOnTime.length / previousStepsWithDue.length
      : 1;

    const currentSlaBreaches = currentStepsWithDue.filter((s) => !!s.slaBreachedAt);
    const slaCompliance = currentStepsWithDue.length > 0
      ? (currentStepsWithDue.length - currentSlaBreaches.length) / currentStepsWithDue.length
      : 1;

    const previousSlaBreaches = previousStepsWithDue.filter((s) => !!s.slaBreachedAt);
    const prevSlaCompliance = previousStepsWithDue.length > 0
      ? (previousStepsWithDue.length - previousSlaBreaches.length) / previousStepsWithDue.length
      : 1;

    const currentCycleTimes = currentCompleted
      .filter((r) => r.startedAt && r.completedAt)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
    const avgCycleTimeCurrent = currentCycleTimes.length > 0
      ? currentCycleTimes.reduce((a, b) => a + b, 0) / currentCycleTimes.length
      : 0;

    const previousCycleTimes = previousCompleted
      .filter((r) => r.startedAt && r.completedAt)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
    const avgCycleTimePrevious = previousCycleTimes.length > 0
      ? previousCycleTimes.reduce((a, b) => a + b, 0) / previousCycleTimes.length
      : 0;

    const cycleTimeTrend = avgCycleTimePrevious > 0
      ? (avgCycleTimePrevious - avgCycleTimeCurrent) / avgCycleTimePrevious
      : 0;
    const cycleTimeTrendNormalized = Math.max(0, Math.min(1, (cycleTimeTrend + 1) / 2));

    const currentEscalations = currentSteps.filter((s) => !!s.escalatedAt).length;
    const previousEscalations = previousSteps.filter((s) => !!s.escalatedAt).length;
    const escalationRate = currentSteps.length > 0
      ? currentEscalations / currentSteps.length
      : 0;

    const completionRate = currentRuns.length > 0
      ? currentCompleted.length / currentRuns.length
      : 0;

    const performanceScore = Math.round(
      onTimeRate * 100 * 0.30 +
      slaCompliance * 100 * 0.25 +
      cycleTimeTrendNormalized * 100 * 0.20 +
      (1 - escalationRate) * 100 * 0.15 +
      completionRate * 100 * 0.10
    );

    const prevEscalationRate = previousSteps.length > 0
      ? previousEscalations / previousSteps.length
      : 0;
    const prevCompletionRate = previousRuns.length > 0
      ? previousCompleted.length / previousRuns.length
      : 0;
    const prevCycleTimeTrendNormalized = 0.5;

    const previousScore = Math.round(
      prevOnTimeRate * 100 * 0.30 +
      prevSlaCompliance * 100 * 0.25 +
      prevCycleTimeTrendNormalized * 100 * 0.20 +
      (1 - prevEscalationRate) * 100 * 0.15 +
      prevCompletionRate * 100 * 0.10
    );

    const factors = {
      onTimeRate: Math.round(onTimeRate * 100),
      slaCompliance: Math.round(slaCompliance * 100),
      cycleTimeTrend: Math.round(cycleTimeTrendNormalized * 100),
      escalationRate: Math.round(escalationRate * 100),
      completionRate: Math.round(completionRate * 100),
    };

    const factorContributions: Record<string, number> = {
      'On-Time Rate': onTimeRate * 0.30,
      'SLA Compliance': slaCompliance * 0.25,
      'Cycle Time Trend': cycleTimeTrendNormalized * 0.20,
      'Low Escalation Rate': (1 - escalationRate) * 0.15,
      'Completion Rate': completionRate * 0.10,
    };
    const topContributor = Object.entries(factorContributions)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'On-Time Rate';

    const trend: 'up' | 'down' | 'stable' = performanceScore > previousScore + 2
      ? 'up'
      : performanceScore < previousScore - 2
        ? 'down'
        : 'stable';

    const buckets = generateTrendBuckets(cutoff, range);
    const prevBuckets = generateTrendBuckets(previousCutoff, range);

    const throughputTrend: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      return allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
      ).length;
    });

    const cycleTimeTrendArr: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const completed = allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt && r.startedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
      );
      if (completed.length === 0) return 0;
      const total = completed.reduce(
        (sum, r) => sum + (new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime()), 0
      );
      return Math.round(total / completed.length);
    });

    const onTimeRateTrend: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const bucketSteps = allSteps.filter(
        (s) => s.completedAt && s.dueAt && new Date(s.completedAt) >= start && new Date(s.completedAt) <= end
      );
      if (bucketSteps.length === 0) return 100;
      const onTime = bucketSteps.filter((s) => !s.slaBreachedAt).length;
      return Math.round((onTime / bucketSteps.length) * 100);
    });

    const slaComplianceTrend: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const bucketSteps = allSteps.filter(
        (s) => s.completedAt && s.dueAt && new Date(s.completedAt) >= start && new Date(s.completedAt) <= end
      );
      if (bucketSteps.length === 0) return 100;
      const compliant = bucketSteps.filter((s) => !s.slaBreachedAt).length;
      return Math.round((compliant / bucketSteps.length) * 100);
    });

    const throughputPeriodChange = previousCompleted.length > 0
      ? Math.round(((currentCompleted.length - previousCompleted.length) / previousCompleted.length) * 100)
      : (currentCompleted.length > 0 ? 100 : 0);
    const cycleTimePeriodChange = avgCycleTimePrevious > 0
      ? Math.round(((avgCycleTimeCurrent - avgCycleTimePrevious) / avgCycleTimePrevious) * 100)
      : 0;
    const onTimeRatePeriodChange = prevOnTimeRate > 0
      ? Math.round(((onTimeRate - prevOnTimeRate) / prevOnTimeRate) * 100)
      : 0;
    const slaCompliancePeriodChange = prevSlaCompliance > 0
      ? Math.round(((slaCompliance - prevSlaCompliance) / prevSlaCompliance) * 100)
      : 0;

    const completedOnTimeChart: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      return allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end &&
          (!r.dueAt || new Date(r.completedAt) <= new Date(r.dueAt))
      ).length;
    });

    const completedLateChart: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      return allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end &&
          r.dueAt && new Date(r.completedAt) > new Date(r.dueAt)
      ).length;
    });

    const efficiencyAvg: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const completed = allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt && r.startedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
      );
      if (completed.length === 0) return 0;
      const times = completed.map(
        (r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime()
      );
      return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    });

    const efficiencyP25: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const completed = allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt && r.startedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
      );
      if (completed.length === 0) return 0;
      const times = completed
        .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime())
        .sort((a, b) => a - b);
      return Math.round(percentile(times, 25));
    });

    const efficiencyP75: number[] = buckets.starts.map((start, i) => {
      const end = buckets.ends[i];
      const completed = allRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt && r.startedAt &&
          new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
      );
      if (completed.length === 0) return 0;
      const times = completed
        .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime())
        .sort((a, b) => a - b);
      return Math.round(percentile(times, 75));
    });

    const currentStarted = currentRuns.length;
    const previousStarted = previousRuns.length;

    const currentRemindersSent = currentSteps.reduce((sum, s) => sum + (s.reminderCount || 0), 0);
    const previousRemindersSent = previousSteps.reduce((sum, s) => sum + (s.reminderCount || 0), 0);

    res.json({
      success: true,
      data: {
        performanceScore: {
          score: performanceScore,
          previousScore,
          trend,
          topContributor,
          factors,
        },
        metrics: {
          throughput: {
            value: currentCompleted.length,
            trend: throughputTrend,
            periodChange: throughputPeriodChange,
          },
          avgCycleTimeMs: {
            value: Math.round(avgCycleTimeCurrent),
            trend: cycleTimeTrendArr,
            periodChange: cycleTimePeriodChange,
          },
          onTimeRate: {
            value: Math.round(onTimeRate * 100),
            trend: onTimeRateTrend,
            periodChange: onTimeRatePeriodChange,
          },
          slaCompliance: {
            value: Math.round(slaCompliance * 100),
            trend: slaComplianceTrend,
            periodChange: slaCompliancePeriodChange,
          },
        },
        throughputChart: {
          labels: buckets.labels,
          completedOnTime: completedOnTimeChart,
          completedLate: completedLateChart,
        },
        efficiencyChart: {
          labels: buckets.labels,
          avgCycleTimeMs: efficiencyAvg,
          p25: efficiencyP25,
          p75: efficiencyP75,
        },
        periodComparison: {
          current: {
            started: currentStarted,
            completed: currentCompleted.length,
            avgCycleTimeMs: Math.round(avgCycleTimeCurrent),
            slaBreaches: currentSlaBreaches.length,
            escalations: currentEscalations,
            remindersSent: currentRemindersSent,
          },
          previous: {
            started: previousStarted,
            completed: previousCompleted.length,
            avgCycleTimeMs: Math.round(avgCycleTimePrevious),
            slaBreaches: previousSlaBreaches.length,
            escalations: previousEscalations,
            remindersSent: previousRemindersSent,
          },
        },
      },
    });
  })
);

// ============================================================================
// GET /api/reports/flows/performance - Template performance analytics
// ============================================================================

router.get(
  '/flows/performance',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const templateId = req.query.templateId as string | undefined;
    const cutoff = getDateRangeCutoff(range);
    const previousCutoff = computePreviousCutoff(cutoff);
    const now = new Date();

    const orgFilter = orgId ? eq(flowRuns.organizationId, orgId) : undefined;

    const allRuns = await db.query.flowRuns.findMany({
      ...(orgFilter ? { where: orgFilter } : {}),
      with: { flow: true },
    });

    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
        : undefined,
      with: {
        flowRun: { with: { flow: true } },
      },
    });

    const byTemplate = new Map<string, {
      templateId: string;
      templateName: string;
      currentRuns: typeof allRuns;
      previousRuns: typeof allRuns;
      currentSteps: typeof allSteps;
      previousSteps: typeof allSteps;
    }>();

    for (const run of allRuns) {
      const tid = run.flowId;
      const tName = run.flow?.name || 'Unknown Template';
      if (!byTemplate.has(tid)) {
        byTemplate.set(tid, {
          templateId: tid,
          templateName: tName,
          currentRuns: [],
          previousRuns: [],
          currentSteps: [],
          previousSteps: [],
        });
      }
      const entry = byTemplate.get(tid)!;
      if (run.startedAt && new Date(run.startedAt) >= cutoff) {
        entry.currentRuns.push(run);
      } else if (run.startedAt && new Date(run.startedAt) >= previousCutoff && new Date(run.startedAt) < cutoff) {
        entry.previousRuns.push(run);
      }
    }

    for (const step of allSteps) {
      const tid = step.flowRun?.flowId;
      if (!tid || !byTemplate.has(tid)) continue;
      const entry = byTemplate.get(tid)!;
      if (step.completedAt && new Date(step.completedAt) >= cutoff) {
        entry.currentSteps.push(step);
      } else if (step.completedAt && new Date(step.completedAt) >= previousCutoff && new Date(step.completedAt) < cutoff) {
        entry.previousSteps.push(step);
      }
    }

    const buckets = generateTrendBuckets(cutoff, range);

    const templates = Array.from(byTemplate.values()).map((entry) => {
      const currentCompleted = entry.currentRuns.filter((r) => r.status === 'COMPLETED');
      const prevCompleted = entry.previousRuns.filter((r) => r.status === 'COMPLETED');

      const currentCycleTimes = currentCompleted
        .filter((r) => r.startedAt && r.completedAt)
        .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
      const avgCycleTimeMs = currentCycleTimes.length > 0
        ? Math.round(currentCycleTimes.reduce((a, b) => a + b, 0) / currentCycleTimes.length)
        : 0;

      const prevCycleTimes = prevCompleted
        .filter((r) => r.startedAt && r.completedAt)
        .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
      const previousAvgCycleTimeMs = prevCycleTimes.length > 0
        ? Math.round(prevCycleTimes.reduce((a, b) => a + b, 0) / prevCycleTimes.length)
        : 0;

      const currentWithDue = entry.currentSteps.filter((s) => s.dueAt);
      const currentOnTime = currentWithDue.filter((s) => !s.slaBreachedAt);
      const onTimeRate = currentWithDue.length > 0
        ? Math.round((currentOnTime.length / currentWithDue.length) * 100)
        : 100;
      const slaCompliance = currentWithDue.length > 0
        ? Math.round(((currentWithDue.length - currentWithDue.filter((s) => !!s.slaBreachedAt).length) / currentWithDue.length) * 100)
        : 100;

      const completionRate = entry.currentRuns.length > 0
        ? Math.round((currentCompleted.length / entry.currentRuns.length) * 100)
        : 0;

      let bottleneckStep: { name: string; avgDurationMs: number } | null = null;
      const stepDurations = new Map<string, { name: string; totalMs: number; count: number }>();
      for (const s of entry.currentSteps) {
        if (s.timeToComplete && s.timeToComplete > 0) {
          const def = s.flowRun?.flow?.definition as any;
          const sName = getStepNameFromDefinition(def, s.stepId, s.stepIndex);
          if (!stepDurations.has(s.stepId)) {
            stepDurations.set(s.stepId, { name: sName, totalMs: 0, count: 0 });
          }
          const sd = stepDurations.get(s.stepId)!;
          sd.totalMs += s.timeToComplete;
          sd.count++;
        }
      }
      let maxAvg = 0;
      for (const [, sd] of Array.from(stepDurations.entries())) {
        const avg = sd.totalMs / sd.count;
        if (avg > maxAvg) {
          maxAvg = avg;
          bottleneckStep = { name: sd.name, avgDurationMs: Math.round(avg) };
        }
      }

      const completionRateTrend: number[] = buckets.starts.map((start, i) => {
        const end = buckets.ends[i];
        const bucketRuns = entry.currentRuns.filter(
          (r) => r.startedAt && new Date(r.startedAt) >= start && new Date(r.startedAt) <= end
        );
        const bucketCompleted = bucketRuns.filter((r) => r.status === 'COMPLETED');
        return bucketRuns.length > 0 ? Math.round((bucketCompleted.length / bucketRuns.length) * 100) : 0;
      });

      return {
        templateId: entry.templateId,
        templateName: entry.templateName,
        runsInPeriod: entry.currentRuns.length,
        completed: currentCompleted.length,
        completionRate,
        avgCycleTimeMs,
        previousAvgCycleTimeMs,
        onTimeRate,
        slaCompliance,
        bottleneckStep,
        completionRateTrend,
      };
    });

    templates.sort((a, b) => b.runsInPeriod - a.runsInPeriod);

    let drillDown: any = undefined;

    if (templateId) {
      const templateRuns = allRuns.filter((r) => r.flowId === templateId);
      const templateSteps = allSteps.filter((s) => s.flowRun?.flowId === templateId);
      const currentTemplateSteps = templateSteps.filter(
        (s) => s.completedAt && new Date(s.completedAt) >= cutoff
      );
      const currentTemplateRuns = templateRuns.filter(
        (r) => r.startedAt && new Date(r.startedAt) >= cutoff
      );
      const completedTemplateRuns = currentTemplateRuns.filter((r) => r.status === 'COMPLETED');

      const stepTimingsMap = new Map<string, {
        stepIndex: number; stepName: string; stepType: string;
        durations: number[]; slaBreachCount: number;
      }>();

      for (const s of currentTemplateSteps) {
        if (!stepTimingsMap.has(s.stepId)) {
          const def = s.flowRun?.flow?.definition as any;
          stepTimingsMap.set(s.stepId, {
            stepIndex: s.stepIndex,
            stepName: getStepNameFromDefinition(def, s.stepId, s.stepIndex),
            stepType: getStepTypeFromDefinition(def, s.stepId),
            durations: [],
            slaBreachCount: 0,
          });
        }
        const entry = stepTimingsMap.get(s.stepId)!;
        if (s.timeToComplete && s.timeToComplete > 0) {
          entry.durations.push(s.timeToComplete);
        }
        if (s.slaBreachedAt) entry.slaBreachCount++;
      }

      const stepTimings = Array.from(stepTimingsMap.values())
        .sort((a, b) => a.stepIndex - b.stepIndex)
        .map((entry) => {
          const sorted = [...entry.durations].sort((a, b) => a - b);
          return {
            stepIndex: entry.stepIndex,
            stepName: entry.stepName,
            stepType: entry.stepType,
            avgDurationMs: sorted.length > 0
              ? Math.round(sorted.reduce((a, b) => a + b, 0) / sorted.length)
              : 0,
            medianDurationMs: Math.round(percentile(sorted, 50)),
            p90DurationMs: Math.round(percentile(sorted, 90)),
            count: sorted.length,
            slaBreachCount: entry.slaBreachCount,
          };
        });

      const allStepsForTemplate = templateSteps.filter(
        (s) => s.completedAt && new Date(s.completedAt) >= cutoff || (s.status !== 'COMPLETED' && s.status !== 'SKIPPED')
      );
      const funnelMap = new Map<string, { stepIndex: number; stepName: string; reached: number; completed: number }>();
      for (const s of allStepsForTemplate) {
        if (!funnelMap.has(s.stepId)) {
          const def = s.flowRun?.flow?.definition as any;
          funnelMap.set(s.stepId, {
            stepIndex: s.stepIndex,
            stepName: getStepNameFromDefinition(def, s.stepId, s.stepIndex),
            reached: 0,
            completed: 0,
          });
        }
        const fEntry = funnelMap.get(s.stepId)!;
        if (s.status !== 'PENDING') fEntry.reached++;
        if (s.status === 'COMPLETED') fEntry.completed++;
      }

      const completionFunnel = Array.from(funnelMap.values())
        .sort((a, b) => a.stepIndex - b.stepIndex)
        .map((f) => ({
          stepIndex: f.stepIndex,
          stepName: f.stepName,
          reachedCount: f.reached,
          completedCount: f.completed,
        }));

      const runCycleTimes = completedTemplateRuns
        .filter((r) => r.startedAt && r.completedAt)
        .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime())
        .sort((a, b) => a - b);

      const cycleTimeDistribution = {
        min: runCycleTimes.length > 0 ? runCycleTimes[0] : 0,
        p25: Math.round(percentile(runCycleTimes, 25)),
        median: Math.round(percentile(runCycleTimes, 50)),
        p75: Math.round(percentile(runCycleTimes, 75)),
        max: runCycleTimes.length > 0 ? runCycleTimes[runCycleTimes.length - 1] : 0,
      };

      drillDown = { stepTimings, completionFunnel, cycleTimeDistribution };
    }

    const response: any = { success: true, data: { templates } };
    if (drillDown) response.data.drillDown = drillDown;

    res.json(response);
  })
);

// ============================================================================
// GET /api/reports/accounts/analytics - Account relationship analytics
// ============================================================================

router.get(
  '/accounts/analytics',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const accountId = req.query.accountId as string | undefined;
    const cutoff = getDateRangeCutoff(range);
    const previousCutoff = computePreviousCutoff(cutoff);
    const now = new Date();

    const orgFilter = orgId ? eq(flowRuns.organizationId, orgId) : undefined;

    const allRuns = await db.query.flowRuns.findMany({
      ...(orgFilter ? { where: orgFilter } : {}),
    });

    const allRunAccounts = await db.query.flowRunAccounts.findMany({
      with: { account: true },
    });

    const orgAccounts = await db.query.accounts.findMany({
      ...(orgId ? { where: eq(accounts.organizationId, orgId) } : {}),
    });

    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
        : undefined,
      with: {
        assignedToContact: true,
      },
    });

    const runMap = new Map(allRuns.map((r) => [r.id, r]));
    const runIdsByAccount = new Map<string, Set<string>>();
    const accountInfoMap = new Map<string, { name: string; domain: string | null }>();

    for (const ra of allRunAccounts) {
      const run = runMap.get(ra.flowRunId);
      if (!run) continue;
      if (orgId && run.organizationId !== orgId) continue;

      if (!runIdsByAccount.has(ra.accountId)) {
        runIdsByAccount.set(ra.accountId, new Set());
      }
      runIdsByAccount.get(ra.accountId)!.add(ra.flowRunId);

      if (!accountInfoMap.has(ra.accountId) && ra.account) {
        accountInfoMap.set(ra.accountId, { name: ra.account.name, domain: ra.account.domain });
      }
    }

    for (const acc of orgAccounts) {
      if (!accountInfoMap.has(acc.id)) {
        accountInfoMap.set(acc.id, { name: acc.name, domain: acc.domain });
      }
      if (!runIdsByAccount.has(acc.id)) {
        runIdsByAccount.set(acc.id, new Set());
      }
    }

    const orgCurrentCompleted = allRuns.filter(
      (r) => r.status === 'COMPLETED' && r.completedAt && new Date(r.completedAt) >= cutoff
    );
    const orgCycleTimes = orgCurrentCompleted
      .filter((r) => r.startedAt && r.completedAt)
      .map((r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime());
    const orgAvgCycleTimeMs = orgCycleTimes.length > 0
      ? Math.round(orgCycleTimes.reduce((a, b) => a + b, 0) / orgCycleTimes.length)
      : 0;

    const buckets = generateTrendBuckets(cutoff, range);

    const accountsList = Array.from(runIdsByAccount.entries()).map(([accId, runIds]) => {
      const info = accountInfoMap.get(accId) || { name: 'Unknown', domain: null };
      const accountRuns = allRuns.filter((r) => runIds.has(r.id));

      const activeFlows = accountRuns.filter(
        (r) => r.status === 'IN_PROGRESS'
      ).length;

      const completedInPeriod = accountRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt && new Date(r.completedAt) >= cutoff
      ).length;

      const completedWithTimes = accountRuns.filter(
        (r) => r.status === 'COMPLETED' && r.startedAt && r.completedAt && new Date(r.completedAt) >= cutoff
      );
      const cycleTimes = completedWithTimes.map(
        (r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime()
      );
      const avgCycleTimeMs = cycleTimes.length > 0
        ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
        : 0;

      const accountSteps = allSteps.filter((s) => runIds.has(s.flowRunId));
      const accountStepsWithDue = accountSteps.filter(
        (s) => s.dueAt && s.completedAt && new Date(s.completedAt) >= cutoff
      );
      const accountOnTime = accountStepsWithDue.filter((s) => !s.slaBreachedAt);
      const onTimeRate = accountStepsWithDue.length > 0
        ? Math.round((accountOnTime.length / accountStepsWithDue.length) * 100)
        : 100;

      const accountCompletedSteps = accountSteps.filter(
        (s) => s.status === 'COMPLETED' && s.completedAt && s.startedAt && new Date(s.completedAt) >= cutoff
      );
      const responseTimes = accountCompletedSteps
        .filter((s) => s.timeToComplete && s.timeToComplete > 0)
        .map((s) => s.timeToComplete!);
      const avgResponsivenessMs = responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

      const engagementTrend: number[] = buckets.starts.map((start, i) => {
        const end = buckets.ends[i];
        return accountRuns.filter(
          (r) => r.status === 'COMPLETED' && r.completedAt &&
            new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
        ).length;
      });

      return {
        accountId: accId,
        accountName: info.name,
        domain: info.domain,
        activeFlows,
        completedInPeriod,
        avgCycleTimeMs,
        orgAvgCycleTimeMs,
        onTimeRate,
        avgResponsivenessMs,
        engagementTrend,
      };
    });

    accountsList.sort((a, b) => b.completedInPeriod - a.completedInPeriod);

    let drillDown: any = undefined;

    if (accountId) {
      const accRunIds = runIdsByAccount.get(accountId) || new Set<string>();
      const accRuns = allRuns.filter((r) => accRunIds.has(r.id));
      const accSteps = allSteps.filter((s) => accRunIds.has(s.flowRunId));

      const weekBuckets = generateTrendBuckets(cutoff, range);
      const engagementTimeline = weekBuckets.starts.map((start, i) => {
        const end = weekBuckets.ends[i];
        const started = accRuns.filter(
          (r) => r.startedAt && new Date(r.startedAt) >= start && new Date(r.startedAt) <= end
        ).length;
        const completed = accRuns.filter(
          (r) => r.status === 'COMPLETED' && r.completedAt &&
            new Date(r.completedAt) >= start && new Date(r.completedAt) <= end
        ).length;
        return { weekLabel: weekBuckets.labels[i], started, completed };
      });

      const accCurrentCompleted = accRuns.filter(
        (r) => r.status === 'COMPLETED' && r.startedAt && r.completedAt && new Date(r.completedAt) >= cutoff
      );
      const accCycleTimes = accCurrentCompleted.map(
        (r) => new Date(r.completedAt!).getTime() - new Date(r.startedAt!).getTime()
      );
      const accAvgCycle = accCycleTimes.length > 0
        ? Math.round(accCycleTimes.reduce((a, b) => a + b, 0) / accCycleTimes.length)
        : 0;

      const accStepsWithDue = accSteps.filter(
        (s) => s.dueAt && s.completedAt && new Date(s.completedAt) >= cutoff
      );
      const accOnTime = accStepsWithDue.filter((s) => !s.slaBreachedAt);
      const accOnTimeRate = accStepsWithDue.length > 0
        ? Math.round((accOnTime.length / accStepsWithDue.length) * 100)
        : 100;
      const accSlaCompliance = accStepsWithDue.length > 0
        ? Math.round(((accStepsWithDue.length - accStepsWithDue.filter((s) => !!s.slaBreachedAt).length) / accStepsWithDue.length) * 100)
        : 100;

      const orgStepsWithDue = allSteps.filter(
        (s) => s.dueAt && s.completedAt && new Date(s.completedAt) >= cutoff
      );
      const orgOnTimeAll = orgStepsWithDue.filter((s) => !s.slaBreachedAt);
      const orgOnTimeRate = orgStepsWithDue.length > 0
        ? Math.round((orgOnTimeAll.length / orgStepsWithDue.length) * 100)
        : 100;
      const orgSlaCompliance = orgStepsWithDue.length > 0
        ? Math.round(((orgStepsWithDue.length - orgStepsWithDue.filter((s) => !!s.slaBreachedAt).length) / orgStepsWithDue.length) * 100)
        : 100;

      const vsOrgAverage = {
        cycleTime: { account: accAvgCycle, org: orgAvgCycleTimeMs },
        onTimeRate: { account: accOnTimeRate, org: orgOnTimeRate },
        slaCompliance: { account: accSlaCompliance, org: orgSlaCompliance },
      };

      const contactMap = new Map<string, {
        contactId: string; contactName: string;
        pendingTasks: number; completedInPeriod: number;
        responseTimes: number[]; stepsWithDue: number; onTimeSteps: number;
      }>();

      for (const s of accSteps) {
        const cId = s.assignedToContactId;
        if (!cId) continue;
        if (!contactMap.has(cId)) {
          contactMap.set(cId, {
            contactId: cId,
            contactName: s.assignedToContact?.name || 'Unknown',
            pendingTasks: 0,
            completedInPeriod: 0,
            responseTimes: [],
            stepsWithDue: 0,
            onTimeSteps: 0,
          });
        }
        const ce = contactMap.get(cId)!;
        if (s.status !== 'COMPLETED' && s.status !== 'SKIPPED') {
          ce.pendingTasks++;
        }
        if (s.status === 'COMPLETED' && s.completedAt && new Date(s.completedAt) >= cutoff) {
          ce.completedInPeriod++;
          if (s.timeToComplete && s.timeToComplete > 0) {
            ce.responseTimes.push(s.timeToComplete);
          }
          if (s.dueAt) {
            ce.stepsWithDue++;
            if (!s.slaBreachedAt) ce.onTimeSteps++;
          }
        }
      }

      const contactBreakdown = Array.from(contactMap.values()).map((ce) => ({
        contactId: ce.contactId,
        contactName: ce.contactName,
        pendingTasks: ce.pendingTasks,
        completedInPeriod: ce.completedInPeriod,
        avgResponseTimeMs: ce.responseTimes.length > 0
          ? Math.round(ce.responseTimes.reduce((a, b) => a + b, 0) / ce.responseTimes.length)
          : 0,
        onTimeRate: ce.stepsWithDue > 0
          ? Math.round((ce.onTimeSteps / ce.stepsWithDue) * 100)
          : 100,
      }));

      contactBreakdown.sort((a, b) => b.completedInPeriod - a.completedInPeriod);

      const signals: Array<{ type: string; message: string; severity: 'info' | 'warning' | 'positive' }> = [];

      const accPrevCompleted = accRuns.filter(
        (r) => r.status === 'COMPLETED' && r.completedAt &&
          new Date(r.completedAt) >= previousCutoff && new Date(r.completedAt) < cutoff
      );
      const currentCompletedCount = accCurrentCompleted.length;
      const previousCompletedCount = accPrevCompleted.length;

      if (previousCompletedCount > 0) {
        const changeRate = (currentCompletedCount - previousCompletedCount) / previousCompletedCount;
        if (changeRate > 0.15) {
          signals.push({
            type: 'throughput_increase',
            message: `Completed flows increased by ${Math.round(changeRate * 100)}% compared to the previous period`,
            severity: 'positive',
          });
        } else if (changeRate < -0.15) {
          signals.push({
            type: 'throughput_decrease',
            message: `Completed flows decreased by ${Math.round(Math.abs(changeRate) * 100)}% compared to the previous period`,
            severity: 'warning',
          });
        }
      }

      const accPrevStepsWithDue = accSteps.filter(
        (s) => s.dueAt && s.completedAt && new Date(s.completedAt) >= previousCutoff && new Date(s.completedAt) < cutoff
      );
      const accPrevOnTime = accPrevStepsWithDue.filter((s) => !s.slaBreachedAt);
      const prevAccOnTimeRate = accPrevStepsWithDue.length > 0
        ? accPrevOnTime.length / accPrevStepsWithDue.length
        : 1;
      const currAccOnTimeRateRaw = accStepsWithDue.length > 0
        ? accOnTime.length / accStepsWithDue.length
        : 1;

      if (prevAccOnTimeRate > 0) {
        const otChange = (currAccOnTimeRateRaw - prevAccOnTimeRate) / prevAccOnTimeRate;
        if (otChange < -0.15) {
          signals.push({
            type: 'ontime_decline',
            message: `On-time rate dropped by ${Math.round(Math.abs(otChange) * 100)}% compared to the previous period`,
            severity: 'warning',
          });
        } else if (otChange > 0.15) {
          signals.push({
            type: 'ontime_improvement',
            message: `On-time rate improved by ${Math.round(otChange * 100)}% compared to the previous period`,
            severity: 'positive',
          });
        }
      }

      if (accAvgCycle > orgAvgCycleTimeMs * 1.3 && orgAvgCycleTimeMs > 0) {
        signals.push({
          type: 'slow_cycle',
          message: `Average cycle time is ${Math.round(((accAvgCycle - orgAvgCycleTimeMs) / orgAvgCycleTimeMs) * 100)}% slower than the org average`,
          severity: 'warning',
        });
      } else if (accAvgCycle < orgAvgCycleTimeMs * 0.7 && orgAvgCycleTimeMs > 0) {
        signals.push({
          type: 'fast_cycle',
          message: `Average cycle time is ${Math.round(((orgAvgCycleTimeMs - accAvgCycle) / orgAvgCycleTimeMs) * 100)}% faster than the org average`,
          severity: 'positive',
        });
      }

      if (signals.length === 0) {
        signals.push({
          type: 'stable',
          message: 'Account performance is stable with no significant changes',
          severity: 'info',
        });
      }

      drillDown = { engagementTimeline, vsOrgAverage, contactBreakdown, signals };
    }

    const response: any = { success: true, data: { accounts: accountsList } };
    if (drillDown) response.data.drillDown = drillDown;

    res.json(response);
  })
);

// ============================================================================
// GET /api/reports/people/analytics - People workload & efficiency
// ============================================================================

router.get(
  '/people/analytics',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const range = (req.query.range as string) || 'week';
    const cutoff = getDateRangeCutoff(range);
    const now = new Date();

    const orgFilter = orgId ? eq(flowRuns.organizationId, orgId) : undefined;

    const allRuns = await db.query.flowRuns.findMany({
      ...(orgFilter ? { where: orgFilter } : {}),
      with: { startedBy: true },
    });

    const allSteps = await db.query.stepExecutions.findMany({
      where: orgId
        ? sql`${stepExecutions.flowRunId} IN (SELECT "id" FROM "flow_runs" WHERE "organization_id" = ${orgId})`
        : undefined,
      with: {
        assignedToContact: { with: { account: true } },
        assignedToUser: true,
      },
    });

    const memberMap = new Map<string, {
      userId: string; name: string; picture: string | null;
      activeRuns: number; completedRuns: number;
      cycleTimes: number[];
      completedSteps: number; pendingSteps: number; overdueSteps: number;
    }>();

    for (const run of allRuns) {
      const uid = run.startedById;
      if (!memberMap.has(uid)) {
        memberMap.set(uid, {
          userId: uid,
          name: run.startedBy?.name || 'Unknown',
          picture: run.startedBy?.picture || null,
          activeRuns: 0,
          completedRuns: 0,
          cycleTimes: [],
          completedSteps: 0,
          pendingSteps: 0,
          overdueSteps: 0,
        });
      }
      const m = memberMap.get(uid)!;
      if (run.status === 'IN_PROGRESS') m.activeRuns++;
      if (run.status === 'COMPLETED' && run.completedAt && new Date(run.completedAt) >= cutoff) {
        m.completedRuns++;
        if (run.startedAt && run.completedAt) {
          m.cycleTimes.push(new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime());
        }
      }
    }

    for (const s of allSteps) {
      if (s.assignedToUserId && memberMap.has(s.assignedToUserId)) {
        const m = memberMap.get(s.assignedToUserId)!;
        if (s.status === 'COMPLETED' && s.completedAt && new Date(s.completedAt) >= cutoff) {
          m.completedSteps++;
        } else if (s.status !== 'COMPLETED' && s.status !== 'SKIPPED') {
          m.pendingSteps++;
          if (s.dueAt && new Date(s.dueAt) < now) m.overdueSteps++;
        }
      }
    }

    const allMemberCycleTimes = Array.from(memberMap.values()).flatMap((m) => m.cycleTimes);
    const teamAvgCycleTimeMs = allMemberCycleTimes.length > 0
      ? Math.round(allMemberCycleTimes.reduce((a, b) => a + b, 0) / allMemberCycleTimes.length)
      : 0;

    const members = Array.from(memberMap.values()).map((m) => {
      const avgCycleTimeMs = m.cycleTimes.length > 0
        ? Math.round(m.cycleTimes.reduce((a, b) => a + b, 0) / m.cycleTimes.length)
        : 0;
      const totalManaged = m.activeRuns + m.completedRuns;
      const completionRate = totalManaged > 0
        ? Math.round((m.completedRuns / totalManaged) * 100)
        : 0;

      let loadLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'HEAVY';
      if (m.activeRuns < 5) loadLevel = 'LOW';
      else if (m.activeRuns < 10) loadLevel = 'MODERATE';
      else if (m.activeRuns < 20) loadLevel = 'HIGH';
      else loadLevel = 'HEAVY';

      return {
        userId: m.userId,
        name: m.name,
        picture: m.picture,
        runsManaged: totalManaged,
        avgCycleTimeMs,
        teamAvgCycleTimeMs,
        completionRate,
        loadLevel,
      };
    });

    members.sort((a, b) => b.runsManaged - a.runsManaged);

    const assigneeMap = new Map<string, {
      contactId: string; name: string; accountName: string | null;
      completedInPeriod: number; responseTimes: number[];
      stepsWithDue: number; onTimeSteps: number;
      remindersReceived: number; totalSteps: number;
      pendingSteps: number; overdueSteps: number;
    }>();

    for (const s of allSteps) {
      const cId = s.assignedToContactId;
      if (!cId) continue;

      if (!assigneeMap.has(cId)) {
        assigneeMap.set(cId, {
          contactId: cId,
          name: s.assignedToContact?.name || 'Unknown',
          accountName: (s.assignedToContact as any)?.account?.name || null,
          completedInPeriod: 0,
          responseTimes: [],
          stepsWithDue: 0,
          onTimeSteps: 0,
          remindersReceived: 0,
          totalSteps: 0,
          pendingSteps: 0,
          overdueSteps: 0,
        });
      }

      const a = assigneeMap.get(cId)!;
      a.totalSteps++;

      if (s.status === 'COMPLETED' && s.completedAt && new Date(s.completedAt) >= cutoff) {
        a.completedInPeriod++;
        if (s.timeToComplete && s.timeToComplete > 0) {
          a.responseTimes.push(s.timeToComplete);
        }
        if (s.dueAt) {
          a.stepsWithDue++;
          if (!s.slaBreachedAt) a.onTimeSteps++;
        }
      } else if (s.status !== 'COMPLETED' && s.status !== 'SKIPPED') {
        a.pendingSteps++;
        if (s.dueAt && new Date(s.dueAt) < now) a.overdueSteps++;
      }

      a.remindersReceived += s.reminderCount || 0;
    }

    const assignees = Array.from(assigneeMap.values()).map((a) => {
      const avgResponseTimeMs = a.responseTimes.length > 0
        ? Math.round(a.responseTimes.reduce((x, y) => x + y, 0) / a.responseTimes.length)
        : 0;
      const onTimeRate = a.stepsWithDue > 0
        ? Math.round((a.onTimeSteps / a.stepsWithDue) * 100)
        : 100;

      const allResponseTimes = Array.from(assigneeMap.values()).flatMap((x) => x.responseTimes);
      const maxResponseTime = allResponseTimes.length > 0
        ? Math.max(...allResponseTimes)
        : 1;
      const responseSpeed = maxResponseTime > 0
        ? Math.max(0, Math.min(1, 1 - (avgResponseTimeMs / maxResponseTime)))
        : 1;

      const reminderRatio = a.totalSteps > 0
        ? Math.min(1, a.remindersReceived / a.totalSteps)
        : 0;

      const efficiencyScore = Math.round(
        (onTimeRate / 100) * 0.5 * 100 +
        responseSpeed * 0.3 * 100 +
        (1 - reminderRatio) * 0.2 * 100
      );

      return {
        contactId: a.contactId,
        name: a.name,
        accountName: a.accountName,
        completedInPeriod: a.completedInPeriod,
        avgResponseTimeMs,
        onTimeRate,
        remindersReceived: a.remindersReceived,
        efficiencyScore: Math.min(100, Math.max(0, efficiencyScore)),
      };
    });

    assignees.sort((a, b) => b.completedInPeriod - a.completedInPeriod);

    const workloadChart: Array<{
      personId: string; name: string; type: 'member' | 'assignee';
      completed: number; pending: number; overdue: number;
    }> = [];

    for (const m of Array.from(memberMap.values())) {
      workloadChart.push({
        personId: m.userId,
        name: m.name,
        type: 'member',
        completed: m.completedSteps,
        pending: m.pendingSteps,
        overdue: m.overdueSteps,
      });
    }

    for (const a of Array.from(assigneeMap.values())) {
      workloadChart.push({
        personId: a.contactId,
        name: a.name,
        type: 'assignee',
        completed: a.completedInPeriod,
        pending: a.pendingSteps,
        overdue: a.overdueSteps,
      });
    }

    workloadChart.sort((a, b) => (b.completed + b.pending + b.overdue) - (a.completed + a.pending + a.overdue));

    const fastestResponders = [...assignees]
      .filter((a) => a.avgResponseTimeMs > 0 && a.completedInPeriod > 0)
      .sort((a, b) => a.avgResponseTimeMs - b.avgResponseTimeMs)
      .slice(0, 5)
      .map((a) => ({ name: a.name, avgResponseTimeMs: a.avgResponseTimeMs }));

    const improvementOpportunities = [...assignees]
      .filter((a) => a.efficiencyScore < 70 && a.completedInPeriod > 0)
      .sort((a, b) => a.efficiencyScore - b.efficiencyScore)
      .slice(0, 5)
      .map((a) => {
        let reason: string;
        if (a.onTimeRate < 70) {
          reason = `On-time rate is ${a.onTimeRate}%, well below average`;
        } else if (a.remindersReceived > 3) {
          reason = `Received ${a.remindersReceived} reminders, indicating delayed responses`;
        } else {
          reason = `Efficiency score of ${a.efficiencyScore} is below the 70 threshold`;
        }
        return { name: a.name, efficiencyScore: a.efficiencyScore, reason };
      });

    res.json({
      success: true,
      data: {
        workloadChart,
        members,
        assignees,
        insights: {
          fastestResponders,
          improvementOpportunities,
        },
      },
    });
  })
);

export default router;
