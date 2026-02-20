/**
 * Flows API Routes (Active Instances)
 *
 * Endpoints for executing workflow instances (flows).
 * Handles creating flows from templates and tracking step progress.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, users, organizations, contacts, magicLinks, FlowRunStatus } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onStepCompleted, onFlowCompleted, onFlowCancelled, updateFlowActivity } from '../services/execution.js';

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
          stepExecutions: {
            columns: { id: true },
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
          stepExecutions: {
            columns: { id: true },
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
          stepExecutions: {
            columns: { id: true },
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
          stepExecutions: {
            columns: { id: true },
          },
        },
      });
    }

    const runsWithTotalSteps = allRuns.map(run => ({
      ...run,
      totalSteps: (run as any).stepExecutions?.length || 0,
    }));

    res.json({
      success: true,
      data: runsWithTotalSteps,
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
    const { name, isTest, roleAssignments, kickoffData } = req.body;

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

    // Allow DRAFT templates only for test runs
    if (flow.status === 'DRAFT' && !isTest) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot start a real run from a DRAFT template. Publish first or use test mode.' },
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
    const runName = name || `${flow.name} - ${isTest ? 'Test' : 'Run'} ${new Date().toISOString().split('T')[0]}`;

    const [newRun] = await db
      .insert(flowRuns)
      .values({
        flowId: flow.id,
        name: runName,
        status: 'IN_PROGRESS',
        isSample: !!isTest,
        currentStepIndex: 0,
        startedById: userId,
        organizationId: orgId,
        roleAssignments: roleAssignments || null,
        kickoffData: kickoffData || null,
      })
      .returning();

    // Resolve role assignments: build map from role name -> contact ID
    const resolvedRoles: Record<string, string> = {};
    if (roleAssignments && typeof roleAssignments === 'object') {
      for (const [roleName, contactId] of Object.entries(roleAssignments as Record<string, string>)) {
        if (contactId && typeof contactId === 'string') {
          resolvedRoles[roleName] = contactId;
        }
      }
    }

    // Create step executions for each step in the flow
    const stepExecutionValues = steps.map((step, index) => {
      const stepDef = step as any;
      const assigneeRole = stepDef.config?.assignee || stepDef.assignee;
      const contactId = assigneeRole ? resolvedRoles[assigneeRole] : undefined;

      return {
        flowRunId: newRun.id,
        stepId: step.id,
        stepIndex: index,
        status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
        startedAt: index === 0 ? new Date() : null,
        assignedToContactId: contactId || null,
        assignedToUserId: (!contactId && assigneeRole === '__coordinator__') ? userId : null,
      };
    });

    await db.insert(stepExecutions).values(stepExecutionValues);

    // Create magic links for contact-assigned steps
    for (let i = 0; i < stepExecutionValues.length; i++) {
      const stepVal = stepExecutionValues[i];
      if (stepVal.assignedToContactId && i === 0) {
        const stepExec = await db.query.stepExecutions.findFirst({
          where: and(
            eq(stepExecutions.flowRunId, newRun.id),
            eq(stepExecutions.stepIndex, 0)
          ),
        });
        if (stepExec) {
          const { createMagicLink } = await import('../services/magic-link.js');
          const { sendMagicLink } = await import('../services/email.js');
          const token = await createMagicLink(stepExec.id);
          const contact = await db.query.contacts.findFirst({
            where: eq(contacts.id, stepVal.assignedToContactId),
          });
          if (contact) {
            await sendMagicLink({
              to: contact.email,
              contactName: contact.name,
              stepName: (steps[0] as any).config?.name || 'Task',
              flowName: flow.name,
              token,
            });
          }
        }
      }
    }

    // Schedule notification jobs for the first step if it has a due date
    const firstStep = steps[0] as { id: string; due?: { value: number; unit: string } };
    const firstStepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, newRun.id),
        eq(stepExecutions.stepIndex, 0)
      ),
    });
    if (firstStepExec) {
      await onStepActivated(firstStepExec.id, firstStep.due, flow.definition);
    }

    // Set initial activity timestamp
    await updateFlowActivity(newRun.id);

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

    // Notify: step completed (cancel jobs, notify coordinator)
    await onStepCompleted(stepExecution, run);
    await updateFlowActivity(runId);

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

      // Schedule notification jobs for the next step
      const definition = run.flow?.definition as { steps?: Array<{ id: string; due?: { value: number; unit: string } }> } | null;
      const nextStepDef = definition?.steps?.find(s => s.id === nextStepExecution.stepId);
      await onStepActivated(nextStepExecution.id, nextStepDef?.due, run.flow?.definition as Record<string, unknown>);

      // If next step has a contact assignee, create magic link and send email
      if (nextStepExecution.assignedToContactId) {
        const { createMagicLink } = await import('../services/magic-link.js');
        const { sendMagicLink } = await import('../services/email.js');
        const token = await createMagicLink(nextStepExecution.id);
        const contact = await db.query.contacts.findFirst({
          where: eq(contacts.id, nextStepExecution.assignedToContactId),
        });
        if (contact) {
          await sendMagicLink({
            to: contact.email,
            contactName: contact.name,
            stepName: `Step ${nextStepExecution.stepIndex + 1}`,
            flowName: run.flow?.name || 'Flow',
            token,
          });
        }
      }

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

      // Notify: flow completed
      await onFlowCompleted(run);
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

    // Notify: flow cancelled (cancel all jobs, notify assignees)
    const allStepExecs = await db.query.stepExecutions.findMany({
      where: eq(stepExecutions.flowRunId, id),
    });
    await onFlowCancelled(run, allStepExecs.map(se => se.id));

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

// ============================================================================
// POST /api/flows/:id/steps/:stepId/remind - Send reminder for a step
// ============================================================================

router.post(
  '/:id/steps/:stepId/remind',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const stepId = req.params.stepId as string;

    // Get step execution
    const stepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, id),
        eq(stepExecutions.stepId, stepId)
      ),
    });

    if (!stepExec) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Step execution not found' },
      });
      return;
    }

    if (stepExec.status !== 'IN_PROGRESS' && stepExec.status !== 'WAITING_FOR_ASSIGNEE') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Can only send reminders for active steps' },
      });
      return;
    }

    // Get run for context
    const run = await db.query.flowRuns.findFirst({
      where: eq(flowRuns.id, id),
      with: { flow: true },
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    // Get step name from definition
    const definition = run.flow?.definition as any;
    const defSteps = definition?.steps || [];
    const defStep = defSteps.find((s: any) => s.stepId === stepId);
    const stepName = defStep?.config?.name || `Step ${stepExec.stepIndex + 1}`;

    // Send reminder email to the assigned contact
    if (stepExec.assignedToContactId) {
      const contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, stepExec.assignedToContactId),
      });

      if (contact) {
        // Find existing magic link for this step
        const existingLink = await db.query.magicLinks.findFirst({
          where: eq(magicLinks.stepExecutionId, stepExec.id),
        });

        if (existingLink && !existingLink.usedAt) {
          const { sendMagicLink } = await import('../services/email.js');
          await sendMagicLink({
            to: contact.email,
            contactName: contact.name,
            stepName,
            flowName: run.flow?.name || 'Flow',
            token: existingLink.token,
          });
        }
      }
    }

    // Update reminder tracking
    await db.update(stepExecutions)
      .set({
        lastReminderSentAt: new Date(),
        reminderCount: (stepExec.reminderCount || 0) + 1,
      })
      .where(eq(stepExecutions.id, stepExec.id));

    logAction({
      flowRunId: id,
      action: 'REMINDER_SENT',
      details: { stepId, stepIndex: stepExec.stepIndex },
    });

    res.json({
      success: true,
      data: { message: 'Reminder sent successfully' },
    });
  })
);

export default router;
