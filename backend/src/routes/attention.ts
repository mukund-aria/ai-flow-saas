/**
 * Attention API Route
 *
 * Returns items needing coordinator attention, scoped to runs
 * where the requesting user is "involved" (started the run or
 * is assigned to a step).
 *
 * GET /api/attention
 */

import { Router } from 'express';
import { db, flowRuns, stepExecutions, flows } from '../db/index.js';
import { eq, and, or, inArray } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';

const router = Router();

// ============================================================================
// Types
// ============================================================================

export type AttentionReasonType =
  | 'YOUR_TURN'
  | 'UNREAD_CHAT'
  | 'STEP_OVERDUE'
  | 'FLOW_OVERDUE'
  | 'ESCALATED'
  | 'STALLED'
  | 'AUTOMATION_FAILED';

export type TrackingStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK';

export interface AttentionReason {
  type: AttentionReasonType;
  stepId?: string;
  detail?: string;
}

export interface AttentionItem {
  flowRun: {
    id: string;
    name: string;
    status: string;
    dueAt: string | null;
    startedAt: string;
    currentStepIndex: number;
  };
  flow: {
    id: string;
    name: string;
  };
  reasons: AttentionReason[];
  trackingStatus: TrackingStatus;
  totalSteps: number;
  completedSteps: number;
  currentStepAssignee: { id: string; name: string; type: 'user' | 'contact' } | null;
}

// ============================================================================
// Constants
// ============================================================================

const STALLED_THRESHOLD_MS = 72 * 60 * 60 * 1000; // 72 hours

// ============================================================================
// GET /api/attention
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orgId = req.organizationId;
    const userId = req.user?.id;

    // Dev fallback: if no user, find the first user
    let currentUserId = userId;
    if (!currentUserId) {
      const defaultUser = await db.query.users.findFirst();
      currentUserId = defaultUser?.id;
    }

    if (!currentUserId) {
      res.json({ success: true, data: [] });
      return;
    }

    // Step 1: Find all IN_PROGRESS runs in this org
    const conditions = [eq(flowRuns.status, 'IN_PROGRESS')];
    if (orgId) conditions.push(eq(flowRuns.organizationId, orgId));

    const allInProgressRuns = await db.query.flowRuns.findMany({
      where: and(...conditions),
      with: {
        flow: {
          columns: { id: true, name: true },
        },
        stepExecutions: {
          columns: {
            id: true,
            stepId: true,
            stepIndex: true,
            status: true,
            assignedToUserId: true,
            assignedToContactId: true,
            startedAt: true,
            dueAt: true,
            escalatedAt: true,
          },
          with: {
            assignedToUser: { columns: { id: true, name: true } },
            assignedToContact: { columns: { id: true, name: true } },
          },
        },
      },
    });

    // Step 2: Filter to runs where user is "involved"
    const involvedRuns = allInProgressRuns.filter((run) => {
      // User started the run
      if (run.startedById === currentUserId) return true;
      // User is assigned to any step
      return run.stepExecutions.some(
        (se) => se.assignedToUserId === currentUserId
      );
    });

    // Step 3: Build attention items
    const now = new Date();
    const attentionItems: AttentionItem[] = [];

    for (const run of involvedRuns) {
      const reasons: AttentionReason[] = [];
      const stepExecs = run.stepExecutions;
      const totalSteps = stepExecs.length;
      const completedSteps = stepExecs.filter(
        (se) => se.status === 'COMPLETED'
      ).length;

      // YOUR_TURN: active step assigned to current user
      const activeStepsAssignedToMe = stepExecs.filter(
        (se) =>
          (se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE') &&
          se.assignedToUserId === currentUserId
      );
      for (const se of activeStepsAssignedToMe) {
        reasons.push({ type: 'YOUR_TURN', stepId: se.stepId });
      }

      // STEP_OVERDUE: any active step past its dueAt
      const overdueSteps = stepExecs.filter(
        (se) =>
          (se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE') &&
          se.dueAt &&
          new Date(se.dueAt) < now
      );
      for (const se of overdueSteps) {
        reasons.push({ type: 'STEP_OVERDUE', stepId: se.stepId });
      }

      // FLOW_OVERDUE: flow past its dueAt
      if (run.dueAt && new Date(run.dueAt) < now) {
        reasons.push({ type: 'FLOW_OVERDUE' });
      }

      // ESCALATED: any active step with escalatedAt set
      const escalatedSteps = stepExecs.filter(
        (se) =>
          (se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE') &&
          se.escalatedAt
      );
      for (const se of escalatedSteps) {
        reasons.push({ type: 'ESCALATED', stepId: se.stepId });
      }

      // STALLED: no activity for 72 hours
      if (run.lastActivityAt) {
        const lastActivity = new Date(run.lastActivityAt);
        if (now.getTime() - lastActivity.getTime() > STALLED_THRESHOLD_MS) {
          reasons.push({ type: 'STALLED' });
        }
      }

      // AUTOMATION_FAILED: any step with FAILED status
      // (StepExecutionStatus doesn't include FAILED, but check for safety)
      const failedSteps = stepExecs.filter(
        (se) => (se.status as string) === 'FAILED'
      );
      for (const se of failedSteps) {
        reasons.push({ type: 'AUTOMATION_FAILED', stepId: se.stepId });
      }

      // Only include runs with at least one reason
      if (reasons.length === 0) continue;

      // Compute tracking status
      const trackingStatus = computeTrackingStatus(
        run,
        totalSteps,
        completedSteps,
        overdueSteps.length > 0,
        now
      );

      // Compute currentStepAssignee from first active step
      const activeStep = stepExecs.find(
        (se: any) => se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE'
      );
      let currentStepAssignee: AttentionItem['currentStepAssignee'] = null;
      if ((activeStep as any)?.assignedToContact) {
        const c = (activeStep as any).assignedToContact;
        currentStepAssignee = { id: c.id, name: c.name, type: 'contact' };
      } else if ((activeStep as any)?.assignedToUser) {
        const u = (activeStep as any).assignedToUser;
        currentStepAssignee = { id: u.id, name: u.name, type: 'user' };
      }

      attentionItems.push({
        flowRun: {
          id: run.id,
          name: run.name,
          status: run.status,
          dueAt: run.dueAt ? new Date(run.dueAt).toISOString() : null,
          startedAt: new Date(run.startedAt).toISOString(),
          currentStepIndex: run.currentStepIndex,
        },
        flow: {
          id: run.flow?.id || '',
          name: run.flow?.name || 'Unknown',
        },
        reasons,
        trackingStatus,
        totalSteps,
        completedSteps,
        currentStepAssignee,
      });
    }

    res.json({ success: true, data: attentionItems });
  })
);

// ============================================================================
// Helpers
// ============================================================================

function computeTrackingStatus(
  run: { dueAt: Date | string | null; startedAt: Date | string },
  totalSteps: number,
  completedSteps: number,
  hasOverdueSteps: boolean,
  now: Date
): TrackingStatus {
  // OFF_TRACK: any overdue step or flow past deadline
  if (hasOverdueSteps) return 'OFF_TRACK';
  if (run.dueAt && new Date(run.dueAt) < now) return 'OFF_TRACK';

  // AT_RISK: time elapsed exceeds progress by >20%
  if (run.dueAt && totalSteps > 0) {
    const startedAt = new Date(run.startedAt);
    const dueAt = new Date(run.dueAt);
    const totalDuration = dueAt.getTime() - startedAt.getTime();
    if (totalDuration > 0) {
      const elapsed = now.getTime() - startedAt.getTime();
      const timeProgress = elapsed / totalDuration; // 0..1+
      const stepProgress = completedSteps / totalSteps; // 0..1
      // If time progress exceeds step progress by >20%, flag as at risk
      if (timeProgress - stepProgress > 0.2) {
        return 'AT_RISK';
      }
    }
  }

  return 'ON_TRACK';
}

export default router;
