/**
 * Flows API Routes (Active Instances)
 *
 * Endpoints for executing workflow instances (flows).
 * Handles creating flows from templates and tracking step progress.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, users, organizations, FlowRunStatus } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';

const router = Router();

// ============================================================================
// GET /api/flows - List all flows (active instances)
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, flowId } = req.query;

    // Build query with optional filters
    let allRuns;

    if (status && flowId) {
      allRuns = await db.query.flowRuns.findMany({
        where: and(
          eq(flowRuns.status, status as FlowRunStatus),
          eq(flowRuns.flowId, flowId as string)
        ),
        orderBy: [desc(flowRuns.startedAt)],
        with: {
          flow: {
            columns: {
              id: true,
              name: true,
            },
          },
          startedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (status) {
      allRuns = await db.query.flowRuns.findMany({
        where: eq(flowRuns.status, status as FlowRunStatus),
        orderBy: [desc(flowRuns.startedAt)],
        with: {
          flow: {
            columns: {
              id: true,
              name: true,
            },
          },
          startedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else if (flowId) {
      allRuns = await db.query.flowRuns.findMany({
        where: eq(flowRuns.flowId, flowId as string),
        orderBy: [desc(flowRuns.startedAt)],
        with: {
          flow: {
            columns: {
              id: true,
              name: true,
            },
          },
          startedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      allRuns = await db.query.flowRuns.findMany({
        orderBy: [desc(flowRuns.startedAt)],
        with: {
          flow: {
            columns: {
              id: true,
              name: true,
            },
          },
          startedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    res.json({
      success: true,
      data: allRuns,
    });
  })
);

// ============================================================================
// GET /api/flows/:id - Get single flow with step executions
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, id),
      with: {
        flow: true,
        startedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        stepExecutions: {
          orderBy: [stepExecutions.stepIndex],
          with: {
            assignedToUser: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            assignedToContact: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    res.json({
      success: true,
      data: run,
    });
  })
);

// ============================================================================
// POST /api/templates/:templateId/flows - Start a new flow from a template
// ============================================================================

router.post(
  '/templates/:templateId/flows',
  asyncHandler(async (req, res) => {
    const flowId = req.params.templateId as string;
    const { name } = req.body;

    // Get the flow template
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

    // Get flow definition and steps
    const definition = flow.definition as { steps?: Array<{ id: string; name?: string; type?: string }> } | null;
    const steps = definition?.steps || [];

    if (steps.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Flow has no steps defined' },
      });
      return;
    }

    // Use authenticated user context (set by requireAuth + orgScope middleware in production)
    let userId = req.user?.id;
    let orgId = req.organizationId;

    // Dev fallback: create default user/org if not authenticated
    if (!userId || !orgId) {
      let defaultOrg = await db.query.organizations.findFirst();
      if (!defaultOrg) {
        const [newOrg] = await db
          .insert(organizations)
          .values({ name: 'Default Organization', slug: 'default' })
          .returning();
        defaultOrg = newOrg;
      }
      let defaultUser = await db.query.users.findFirst();
      if (!defaultUser) {
        const [newUser] = await db
          .insert(users)
          .values({ email: 'dev@localhost', name: 'Developer', activeOrganizationId: defaultOrg.id })
          .returning();
        defaultUser = newUser;
      }
      userId = defaultUser.id;
      orgId = defaultOrg.id;
    }

    // Create the flow run
    const runName = name || `${flow.name} - Run ${new Date().toISOString().split('T')[0]}`;

    const [newRun] = await db
      .insert(flowRuns)
      .values({
        flowId: flow.id,
        name: runName,
        status: 'IN_PROGRESS',
        currentStepIndex: 0,
        startedById: userId,
        organizationId: orgId,
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

    // Fetch the complete run with step executions
    const completeRun = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, newRun.id),
      with: {
        flow: {
          columns: {
            id: true,
            name: true,
          },
        },
        startedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        stepExecutions: {
          orderBy: [stepExecutions.stepIndex],
        },
      },
    });

    // Audit: run started
    logAction({
      flowRunId: newRun.id,
      action: 'RUN_STARTED',
      actorId: userId,
      details: { flowId: flow.id, flowName: flow.name, runName },
    });

    res.status(201).json({
      success: true,
      data: completeRun,
    });
  })
);

// ============================================================================
// POST /api/flows/:id/steps/:stepId/complete - Mark a step as completed
// ============================================================================

router.post(
  '/:id/steps/:stepId/complete',
  asyncHandler(async (req, res) => {
    const runId = req.params.id as string;
    const stepId = req.params.stepId as string;
    const { resultData } = req.body;

    // Get the flow run
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, runId),
      with: {
        flow: true,
        stepExecutions: {
          orderBy: [stepExecutions.stepIndex],
        },
      },
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    if (run.status !== 'IN_PROGRESS') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: `Cannot complete step on a run with status: ${run.status}` },
      });
      return;
    }

    // Find the step execution
    const stepExecution = run.stepExecutions.find((se) => se.stepId === stepId);

    if (!stepExecution) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Step execution not found' },
      });
      return;
    }

    if (stepExecution.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Step is already completed' },
      });
      return;
    }

    if (stepExecution.status === 'PENDING') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Step has not been started yet' },
      });
      return;
    }

    // Mark the step as completed
    await db
      .update(stepExecutions)
      .set({
        status: 'COMPLETED',
        resultData: resultData || {},
        completedAt: new Date(),
      })
      .where(eq(stepExecutions.id, stepExecution.id));

    // Check if there's a next step
    const currentIndex = stepExecution.stepIndex;
    const nextStepExecution = run.stepExecutions.find((se) => se.stepIndex === currentIndex + 1);

    if (nextStepExecution) {
      // Start the next step
      await db
        .update(stepExecutions)
        .set({
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        })
        .where(eq(stepExecutions.id, nextStepExecution.id));

      // Update current step index on the run
      await db
        .update(flowRuns)
        .set({
          currentStepIndex: currentIndex + 1,
        })
        .where(eq(flowRuns.id, runId));
    } else {
      // No more steps - mark run as completed
      await db
        .update(flowRuns)
        .set({
          status: 'COMPLETED',
          completedAt: new Date(),
        })
        .where(eq(flowRuns.id, runId));
    }

    // Audit: step completed
    logAction({
      flowRunId: runId,
      action: 'STEP_COMPLETED',
      details: { stepId, stepIndex: stepExecution.stepIndex, hasNextStep: !!nextStepExecution },
    });

    // Fetch the updated run
    const updatedRun = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, runId),
      with: {
        flow: {
          columns: {
            id: true,
            name: true,
          },
        },
        startedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        stepExecutions: {
          orderBy: [stepExecutions.stepIndex],
        },
      },
    });

    res.json({
      success: true,
      data: updatedRun,
    });
  })
);

// ============================================================================
// POST /api/flows/:id/cancel - Cancel a flow
// ============================================================================

router.post(
  '/:id/cancel',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;

    // Get the flow run
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, id),
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    if (run.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Cannot cancel a completed run' },
      });
      return;
    }

    if (run.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Run is already cancelled' },
      });
      return;
    }

    // Cancel the run
    const [cancelledRun] = await db
      .update(flowRuns)
      .set({
        status: 'CANCELLED',
        completedAt: new Date(),
      })
      .where(eq(flowRuns.id, id))
      .returning();

    // Mark any pending or in-progress steps as skipped
    await db
      .update(stepExecutions)
      .set({
        status: 'SKIPPED',
      })
      .where(
        and(
          eq(stepExecutions.flowRunId, id),
          eq(stepExecutions.status, 'PENDING')
        )
      );

    await db
      .update(stepExecutions)
      .set({
        status: 'SKIPPED',
      })
      .where(
        and(
          eq(stepExecutions.flowRunId, id),
          eq(stepExecutions.status, 'IN_PROGRESS')
        )
      );

    // Audit: run cancelled
    logAction({
      flowRunId: id,
      action: 'RUN_CANCELLED',
    });

    // Fetch the updated run with step executions
    const updatedRun = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, id),
      with: {
        flow: {
          columns: {
            id: true,
            name: true,
          },
        },
        startedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        stepExecutions: {
          orderBy: [stepExecutions.stepIndex],
        },
      },
    });

    res.json({
      success: true,
      data: updatedRun,
    });
  })
);

export default router;
