/**
 * Public Start Link Routes
 *
 * Handles starting flows via shareable public URLs.
 * No authentication required - access is via flow ID.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, organizations, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, updateFlowActivity } from '../services/execution.js';

const router = Router();

// ============================================================================
// GET /api/public/start/:flowId - Get flow info for the start link page
// ============================================================================

router.get(
  '/:flowId',
  asyncHandler(async (req, res) => {
    const flowId = req.params.flowId as string;

    // Look up the flow
    const flow = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
    });

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Extract kickoff form fields and assignee placeholders from definition
    const definition = flow.definition as {
      steps?: Array<{ id: string; name?: string; type?: string; config?: Record<string, unknown> }>;
      kickoff?: Record<string, unknown>;
      roles?: Array<{ name: string; description?: string }>;
    } | null;

    res.json({
      success: true,
      data: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        kickoff: definition?.kickoff || null,
        roles: definition?.roles || [],
      },
    });
  })
);

// ============================================================================
// POST /api/public/start/:flowId - Start a flow via public link
// ============================================================================

router.post(
  '/:flowId',
  asyncHandler(async (req, res) => {
    const flowId = req.params.flowId as string;
    const { submitterName, submitterEmail, kickoffData } = req.body as {
      submitterName?: string;
      submitterEmail?: string;
      kickoffData?: Record<string, unknown>;
    };

    // Validate the flow exists
    const flow = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
    });

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Only allow published flows (not drafts)
    if (flow.status === 'DRAFT') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'This flow is not yet published and cannot be started via a public link.' },
      });
      return;
    }

    // Get flow definition and steps
    const definition = flow.definition as { steps?: Array<{ id: string; name?: string; type?: string; due?: { value: number; unit: string } }> } | null;
    const steps = definition?.steps || [];

    if (steps.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Flow has no steps defined' },
      });
      return;
    }

    // Look up the organization from the flow record (public route - no req.user)
    const orgId = flow.organizationId;

    // Find any existing user in the organization to use as startedById
    const orgUser = await db.query.users.findFirst({
      where: eq(users.activeOrganizationId, orgId),
    });

    if (!orgUser) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'No users found for this organization' },
      });
      return;
    }

    const userId = orgUser.id;

    // Create the flow run
    const runName = `${flow.name} - Started via link - ${new Date().toISOString().split('T')[0]}`;

    const [newRun] = await db
      .insert(flowRuns)
      .values({
        flowId: flow.id,
        name: runName,
        status: 'IN_PROGRESS',
        isSample: false,
        currentStepIndex: 0,
        startedById: userId,
        organizationId: orgId,
        kickoffData: kickoffData || null,
      })
      .returning();

    // Create step executions for each step in the flow
    const stepExecutionValues = steps.map((step, index) => ({
      flowRunId: newRun.id,
      stepId: step.id,
      stepIndex: index,
      status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
      startedAt: index === 0 ? new Date() : null,
    }));

    await db.insert(stepExecutions).values(stepExecutionValues);

    // Schedule notification jobs for the first step if it has a due date
    const firstStep = steps[0] as { id: string; due?: { value: number; unit: string } };
    const firstStepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.flowRunId, newRun.id),
    });
    if (firstStepExec) {
      await onStepActivated(firstStepExec.id, firstStep.due, flow.definition);
    }

    // Set initial activity timestamp
    await updateFlowActivity(newRun.id);

    // Audit: public link flow started
    logAction({
      flowRunId: newRun.id,
      action: 'PUBLIC_LINK_FLOW_STARTED',
      details: {
        flowId: flow.id,
        flowName: flow.name,
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        runId: newRun.id,
        message: 'Flow started successfully',
      },
    });
  })
);

export default router;
