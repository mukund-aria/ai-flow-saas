/**
 * Flows API Routes (Active Instances)
 *
 * Endpoints for executing workflow instances (flows).
 * Handles creating flows from templates and tracking step progress.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, users, organizations, contacts, magicLinks, auditLogs, userOrganizations, FlowRunStatus } from '../db/index.js';
import { eq, desc, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onStepCompleted, onFlowCompleted, onFlowCancelled, onFlowStarted, updateFlowActivity, computeFlowDueAt, handleSubFlowStep } from '../services/execution.js';
import { getNextStepExecutions } from '../services/step-advancement.js';

const router = Router();

// ============================================================================
// GET /api/flows - List all flows (active instances)
// ============================================================================

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, flowId } = req.query;
    const orgId = req.organizationId;
    const userId = req.user?.id;

    // Build query conditions with org scoping
    const conditions = [];
    if (orgId) conditions.push(eq(flowRuns.organizationId, orgId));
    if (status) conditions.push(eq(flowRuns.status, status as FlowRunStatus));
    if (flowId) conditions.push(eq(flowRuns.flowId, flowId as string));

    const allRuns = await db.query.flowRuns.findMany({
      ...(conditions.length > 0 ? { where: and(...conditions) } : {}),
      orderBy: [desc(flowRuns.startedAt)],
      with: {
        flow: {
          columns: {
            id: true,
            name: true,
            templateCoordinatorIds: true,
            definition: true,
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
          columns: {
            id: true,
            stepIndex: true,
            status: true,
            assignedToUserId: true,
            assignedToContactId: true,
          },
          with: {
            assignedToUser: { columns: { id: true, name: true } },
            assignedToContact: { columns: { id: true, name: true } },
          },
        },
      },
    });

    // Determine user's org role for access filtering
    let isAdmin = false;
    if (userId && orgId) {
      const membership = await db.query.userOrganizations.findFirst({
        where: and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, orgId)
        ),
      });
      isAdmin = membership?.role === 'ADMIN';
    }

    // Filter runs based on coordinator/assignee role model:
    // - Admins: see all runs (no filtering)
    // - Template Coordinators: see all runs of templates where they're listed
    // - Flow Coordinators: see runs where they're assigned to a coordinator role
    // - Started by: see runs they started
    // - Not assigned: don't see the run
    const filteredRuns = (userId && !isAdmin)
      ? allRuns.filter(run => {
          const flow = run.flow as any;

          // (a) User started this run
          if (run.startedById === userId) return true;

          // (b) User is a template coordinator for this template
          const templateCoordinatorIds: string[] = flow?.templateCoordinatorIds || [];
          if (templateCoordinatorIds.includes(userId)) return true;

          // (c) User is assigned to a coordinator role on this run
          const definition = flow?.definition as any;
          const assigneePlaceholders: Array<{ roleName: string; roleType?: string; roleOptions?: { coordinatorToggle?: boolean } }> =
            definition?.assigneePlaceholders || [];
          const roleAssignments: Record<string, string> = (run.roleAssignments as Record<string, string>) || {};

          // Find coordinator role names (explicit roleType='coordinator' OR legacy coordinatorToggle)
          const coordinatorRoleNames = new Set(
            assigneePlaceholders
              .filter(p =>
                p.roleType === 'coordinator' || p.roleOptions?.coordinatorToggle
              )
              .map(p => p.roleName)
          );

          // Check if user is assigned to any coordinator role via step executions
          const stepExecs = (run as any).stepExecutions || [];
          const isCoordinatorOnRun = stepExecs.some((se: any) =>
            se.assignedToUserId === userId
          ) && (() => {
            // Check if any of the user's assigned steps belong to a coordinator role
            const defSteps = definition?.steps || [];
            for (const se of stepExecs) {
              if (se.assignedToUserId !== userId) continue;
              const defStep = defSteps.find((s: any) => (s.stepId || s.id) === se.stepId);
              const stepRole = defStep?.config?.assignee;
              if (stepRole && coordinatorRoleNames.has(stepRole)) return true;
            }
            return false;
          })();

          if (isCoordinatorOnRun) return true;

          // (d) Check roleAssignments map for coordinator roles assigned to this user
          // roleAssignments maps roleName -> userId/contactId
          for (const [roleName, assignedId] of Object.entries(roleAssignments)) {
            if (assignedId === userId && coordinatorRoleNames.has(roleName)) {
              return true;
            }
          }

          return false;
        })
      : allRuns;

    const runsWithTotalSteps = filteredRuns.map(run => {
      const stepExecs = (run as any).stepExecutions || [];
      const totalSteps = stepExecs.length;

      // Compute currentStepAssignee from first active step
      const activeStep = stepExecs.find(
        (se: any) => se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE'
      );
      let currentStepAssignee = null;
      if (activeStep?.assignedToContact) {
        currentStepAssignee = { id: activeStep.assignedToContact.id, name: activeStep.assignedToContact.name, type: 'contact' as const };
      } else if (activeStep?.assignedToUser) {
        currentStepAssignee = { id: activeStep.assignedToUser.id, name: activeStep.assignedToUser.name, type: 'user' as const };
      }

      // Compute currentStep info from active step
      const currentStep = activeStep
        ? {
            stepId: activeStep.id,
            stepIndex: activeStep.stepIndex,
            hasAssignee: !!(activeStep.assignedToContactId || activeStep.assignedToUserId),
          }
        : null;

      // Strip stepExecutions and large flow fields from response to keep payload small
      const { stepExecutions: _se, ...rest } = run as any;
      const { definition: _def, templateCoordinatorIds: _tc, ...flowSlim } = rest.flow || {};
      return { ...rest, flow: flowSlim, totalSteps, currentStepAssignee, currentStep };
    });

    res.json({
      success: true,
      data: runsWithTotalSteps,
    });
  })
);

// ============================================================================
// POST /api/flows/bulk-remind - Send reminders for multiple overdue runs
// ============================================================================

router.post(
  '/bulk-remind',
  asyncHandler(async (req, res) => {
    const { runIds } = req.body;
    if (!Array.isArray(runIds) || runIds.length === 0 || runIds.length > 50) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'runIds must be an array of 1-50 IDs' },
      });
      return;
    }

    const orgId = req.organizationId;
    let remindedCount = 0;

    for (const runId of runIds) {
      // Get run with flow context
      const run = await db.query.flowRuns.findFirst({
        where: orgId
          ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
          : eq(flowRuns.id, runId),
        with: { flow: true },
      });

      if (!run || run.status !== 'IN_PROGRESS') continue;

      // Find active step executions with contact assignees
      const activeSteps = await db.query.stepExecutions.findMany({
        where: and(
          eq(stepExecutions.flowRunId, runId),
        ),
      });

      for (const stepExec of activeSteps) {
        if (stepExec.status !== 'IN_PROGRESS' && stepExec.status !== 'WAITING_FOR_ASSIGNEE') continue;
        if (!stepExec.assignedToContactId) continue;

        const contact = await db.query.contacts.findFirst({
          where: eq(contacts.id, stepExec.assignedToContactId),
        });

        if (!contact) continue;

        // Find existing magic link for this step
        const existingLink = await db.query.magicLinks.findFirst({
          where: eq(magicLinks.stepExecutionId, stepExec.id),
        });

        if (existingLink && !existingLink.usedAt) {
          // Get step name from definition
          const definition = run.flow?.definition as any;
          const defSteps = definition?.steps || [];
          const defStep = defSteps.find((s: any) => s.stepId === stepExec.stepId);
          const stepName = defStep?.config?.name || `Step ${stepExec.stepIndex + 1}`;

          const { sendMagicLink } = await import('../services/email.js');
          await sendMagicLink({
            to: contact.email,
            contactName: contact.name,
            stepName,
            flowName: run.flow?.name || 'Flow',
            token: existingLink.token,
          });
        }

        // Update reminder tracking
        await db.update(stepExecutions)
          .set({
            lastReminderSentAt: new Date(),
            reminderCount: (stepExec.reminderCount || 0) + 1,
          })
          .where(eq(stepExecutions.id, stepExec.id));

        logAction({
          flowRunId: runId,
          action: 'REMINDER_SENT',
          details: { stepId: stepExec.stepId, stepIndex: stepExec.stepIndex, bulk: true },
        });

        remindedCount++;
      }
    }

    res.json({ success: true, data: { remindedCount } });
  })
);

// ============================================================================
// GET /api/flows/:id - Get single flow with step executions
// ============================================================================

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, id), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, id),
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

    // Get the flow template (scoped to org)
    const orgId = req.organizationId;
    const flow = await db.query.flows.findFirst({
      where: orgId
        ? and(eq(flows.id, flowId), eq(flows.organizationId, orgId))
        : eq(flows.id, flowId),
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
    // Note: steps may use `stepId` (gallery templates) or `id` (other sources)
    const definition = flow.definition as { steps?: Array<Record<string, unknown>> } | null;
    const steps = definition?.steps || [];

    if (steps.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Flow has no steps defined' },
      });
      return;
    }

    // Validate kickoff form data if required
    const kickoffConfig = (definition as any)?.kickoff;
    if (kickoffConfig?.kickoffFormEnabled && kickoffConfig?.kickoffFormFields) {
      const fields = kickoffConfig.kickoffFormFields as Array<{
        fieldId: string;
        label: string;
        type: string;
        required?: boolean;
      }>;
      const data = (kickoffData || {}) as Record<string, unknown>;
      const errors: string[] = [];

      for (const field of fields) {
        // Skip display-only fields
        if (field.type === 'HEADING' || field.type === 'PARAGRAPH') continue;

        if (field.required) {
          const val = data[field.fieldId];
          if (val === undefined || val === null || val === '') {
            errors.push(`"${field.label}" is required`);
          } else if (Array.isArray(val) && val.length === 0) {
            errors.push(`"${field.label}" is required`);
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Kickoff form validation failed: ${errors.join(', ')}` },
        });
        return;
      }
    }

    // Use authenticated user context (set by requireAuth + orgScope middleware in production)
    let userId = req.user?.id;
    let resolvedOrgId = orgId;

    // Dev fallback: create default user/org if not authenticated
    if (!userId || !resolvedOrgId) {
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
      resolvedOrgId = defaultOrg.id;
    }

    // Create the flow run
    const runName = name || `${flow.name} - ${isTest ? 'Test' : 'Run'} ${new Date().toISOString().split('T')[0]}`;

    // Compute flow-level dueAt from the template's dueDates config
    const flowStartedAt = new Date();
    const flowDueDates = (definition as any)?.dueDates;
    const flowDueAt = computeFlowDueAt(flowDueDates?.flowDue, flowStartedAt);

    const [newRun] = await db
      .insert(flowRuns)
      .values({
        flowId: flow.id,
        name: runName,
        status: 'IN_PROGRESS',
        isSample: !!isTest,
        currentStepIndex: 0,
        startedById: userId,
        organizationId: resolvedOrgId,
        roleAssignments: roleAssignments || null,
        kickoffData: kickoffData || null,
        dueAt: flowDueAt,
      })
      .returning();

    // Resolve assignee placeholders using the resolution service
    const assigneePlaceholders = (definition as any)?.assigneePlaceholders || [];
    const { resolveAssignees } = await import('../services/assignee-resolution.js');

    // Flow variables convention: flow variables are stored as a nested object
    // inside kickoffData under the key "flowVariables". This allows them to be
    // persisted alongside kickoff form data and accessed for DDR resolution and
    // assignee resolution. The frontend does not currently send flowVariables in
    // kickoffData -- this is a TODO for when flow variables UI is implemented.
    const resolvedAssignees = await resolveAssignees(assigneePlaceholders, {
      organizationId: resolvedOrgId,
      startedByUserId: userId,
      roleAssignments: roleAssignments as Record<string, string> | undefined,
      kickoffData: kickoffData as Record<string, unknown> | undefined,
      flowVariables: (kickoffData as any)?.flowVariables as Record<string, unknown> | undefined,
      flowId: flow.id,
    });

    // Also support legacy direct roleAssignments for backward compat
    const legacyRoles: Record<string, string> = {};
    if (roleAssignments && typeof roleAssignments === 'object') {
      for (const [roleName, contactId] of Object.entries(roleAssignments as Record<string, string>)) {
        if (contactId && typeof contactId === 'string') {
          legacyRoles[roleName] = contactId;
        }
      }
    }

    // Create step executions for each step in the flow
    const stepExecutionValues = steps.map((step, index) => {
      const stepDef = step as any;
      const assigneeRole = stepDef.config?.assignee || stepDef.assignee;
      const resolvedStepId = stepDef.stepId || stepDef.id || `step-${index}`;

      let assignedToContactId: string | null = null;
      let assignedToUserId: string | null = null;

      if (assigneeRole) {
        // Try the new resolution service first
        const resolved = resolvedAssignees[assigneeRole];
        if (resolved?.contactId) {
          assignedToContactId = resolved.contactId;
        } else if (resolved?.userId) {
          assignedToUserId = resolved.userId;
        } else if (legacyRoles[assigneeRole]) {
          // Fall back to legacy direct assignment
          assignedToContactId = legacyRoles[assigneeRole];
        } else if (assigneeRole === '__coordinator__') {
          assignedToUserId = userId;
        }
      }

      return {
        flowRunId: newRun.id,
        stepId: resolvedStepId,
        stepIndex: index,
        status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
        startedAt: index === 0 ? new Date() : null,
        assignedToContactId,
        assignedToUserId,
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
              stepName: (steps[0] as any).config?.name || (steps[0] as any).name || 'Task',
              flowName: flow.name,
              token,
            });
          }
        }
      }
    }

    // Schedule notification jobs for the first step if it has a due date
    const firstStep = steps[0] as { id?: string; stepId?: string; due?: { value: number; unit: string }; config?: { due?: { value: number; unit: string } } };
    const firstStepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, newRun.id),
        eq(stepExecutions.stepIndex, 0)
      ),
    });
    if (firstStepExec) {
      await onStepActivated(firstStepExec.id, firstStep.due || firstStep.config?.due, flow.definition as Record<string, unknown>, flowDueAt);

      // If first step is a SUB_FLOW, start the child flow automatically
      if ((steps[0] as any).type === 'SUB_FLOW') {
        await handleSubFlowStep(firstStepExec.id, steps[0] as Record<string, unknown>, {
          id: newRun.id,
          organizationId: resolvedOrgId,
          startedById: userId,
          flowId: flow.id,
          name: runName,
        });
      }
    }

    // Set initial activity timestamp
    await updateFlowActivity(newRun.id);

    // Dispatch flow.started webhook
    await onFlowStarted({ id: newRun.id, name: runName, organizationId: resolvedOrgId, flowId: flow.id, flow: { name: flow.name } });

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
    const orgId = req.organizationId;

    // Get the flow run (scoped to org)
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, runId),
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

    // AI Review interception: check before marking step as completed
    const definition = run.flow?.definition as { steps?: Array<Record<string, unknown>> } | null;
    const stepDefs = (definition?.steps || []) as any[];
    const currentStepDef = stepDefs.find((s: any) => (s.stepId || s.id) === stepExecution.stepId);
    if (currentStepDef?.config?.aiReview?.enabled) {
      const { runAIReview } = await import('../services/ai-assignee.js');
      const reviewResult = await runAIReview(stepExecution.id, currentStepDef, resultData || {});
      if (reviewResult.status === 'REVISION_NEEDED') {
        // Revert step to IN_PROGRESS with feedback
        await db.update(stepExecutions)
          .set({
            status: 'IN_PROGRESS',
            completedAt: null,
          })
          .where(eq(stepExecutions.id, stepExecution.id));
        res.json({
          success: true,
          data: { revisionNeeded: true, feedback: reviewResult.feedback, issues: reviewResult.issues },
        });
        return;
      }
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

    // Determine the next step(s) using the step advancement service
    const currentIndex = stepExecution.stepIndex;
    const nextStepIds = getNextStepExecutions(
      stepExecution as any,
      run.stepExecutions as any[],
      stepDefs,
      resultData
    );
    const nextStepExecution = nextStepIds.length > 0
      ? run.stepExecutions.find(se => se.id === nextStepIds[0])
      : undefined;

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
      const nextStepDef = definition?.steps?.find((s: any) => (s.stepId || s.id) === nextStepExecution.stepId);
      const nextStepDue = (nextStepDef as any)?.due || (nextStepDef as any)?.config?.due;
      // Pass flow-level dueAt so BEFORE_FLOW_DUE steps can be computed
      const runDueAt = run.dueAt ? new Date(run.dueAt) : null;
      await onStepActivated(nextStepExecution.id, nextStepDue, run.flow?.definition as Record<string, unknown>, runDueAt);

      // If next step is a SUB_FLOW, start the child flow automatically
      if ((nextStepDef as any)?.type === 'SUB_FLOW') {
        await handleSubFlowStep(nextStepExecution.id, nextStepDef as Record<string, unknown>, {
          id: run.id,
          organizationId: run.organizationId,
          startedById: run.startedById,
          flowId: run.flowId,
          name: run.name,
        });
      }

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
          currentStepIndex: nextStepExecution.stepIndex,
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
    const orgId = req.organizationId;

    // Get the flow run (scoped to org)
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, id), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, id),
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
// POST /api/flows/:id/steps/:stepId/act-token - Get action token for coordinator
// ============================================================================

router.post(
  '/:id/steps/:stepId/act-token',
  asyncHandler(async (req, res) => {
    const runId = req.params.id as string;
    const stepId = req.params.stepId as string;
    const orgId = req.organizationId;

    // Verify the flow run belongs to this org
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, runId),
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    // Get step execution
    const stepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, runId),
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
        error: { code: 'INVALID_STATE', message: 'Can only act on active steps' },
      });
      return;
    }

    // Check if there's already a magic link for this step
    const existingLink = await db.query.magicLinks.findFirst({
      where: eq(magicLinks.stepExecutionId, stepExec.id),
    });

    if (existingLink && !existingLink.usedAt && new Date() < existingLink.expiresAt) {
      // Existing valid link - return it
      res.json({
        success: true,
        data: { token: existingLink.token },
      });
      return;
    }

    if (existingLink) {
      // Existing link is used or expired - refresh it
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 168); // 7 days
      const newToken = crypto.randomUUID();
      await db.update(magicLinks)
        .set({ token: newToken, expiresAt, usedAt: null })
        .where(eq(magicLinks.id, existingLink.id));

      res.json({
        success: true,
        data: { token: newToken },
      });
      return;
    }

    // Create a new magic link for the coordinator to act on this step
    const { createMagicLink } = await import('../services/magic-link.js');
    const token = await createMagicLink(stepExec.id);

    res.json({
      success: true,
      data: { token },
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
    const orgId = req.organizationId;

    // Get run for context (scoped to org)
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, id), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, id),
      with: { flow: true },
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

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

// ============================================================================
// GET /api/flows/:id/audit-log - Get audit log for a flow run
// ============================================================================

router.get(
  '/:id/audit-log',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const orgId = req.organizationId;

    // Verify the flow run belongs to this org
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, id), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, id),
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow run not found' },
      });
      return;
    }

    // Query audit logs with actor info
    const logs = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        actorId: auditLogs.actorId,
        actorEmail: auditLogs.actorEmail,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        actorName: users.name,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(eq(auditLogs.flowRunId, id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);

    const data = logs.map((log) => ({
      id: log.id,
      action: log.action,
      actorName: log.actorName || null,
      actorEmail: log.actorEmail || null,
      details: log.details || null,
      createdAt: log.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data,
    });
  })
);

// ============================================================================
// POST /api/flows/:id/steps/:stepId/reassign - Reassign a step to a different person
// ============================================================================

router.post(
  '/:id/steps/:stepId/reassign',
  asyncHandler(async (req, res) => {
    const runId = req.params.id as string;
    const stepId = req.params.stepId as string;
    const { assignToContactId, assignToUserId } = req.body;
    const orgId = req.organizationId;

    // Validate exactly one assignment target
    if ((!assignToContactId && !assignToUserId) || (assignToContactId && assignToUserId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Provide exactly one of assignToContactId or assignToUserId' },
      });
      return;
    }

    // Get the flow run (scoped to org)
    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, runId),
      with: { flow: true },
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
        error: { code: 'INVALID_STATE', message: 'Can only reassign steps on an in-progress run' },
      });
      return;
    }

    // Find the step execution
    const stepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, runId),
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

    if (stepExec.status === 'COMPLETED' || stepExec.status === 'SKIPPED') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATE', message: 'Cannot reassign a completed or skipped step' },
      });
      return;
    }

    // Record old assignee info for audit
    const oldAssignee = {
      contactId: stepExec.assignedToContactId,
      userId: stepExec.assignedToUserId,
    };

    // Update the step execution
    await db
      .update(stepExecutions)
      .set({
        assignedToContactId: assignToContactId || null,
        assignedToUserId: assignToUserId || null,
      })
      .where(eq(stepExecutions.id, stepExec.id));

    // If step is active and reassigned to a new contact, handle magic link
    const isActive = stepExec.status === 'IN_PROGRESS' || stepExec.status === 'WAITING_FOR_ASSIGNEE';
    if (isActive && assignToContactId) {
      // Invalidate old magic link
      const existingLink = await db.query.magicLinks.findFirst({
        where: eq(magicLinks.stepExecutionId, stepExec.id),
      });
      if (existingLink) {
        await db.update(magicLinks)
          .set({ usedAt: new Date() })
          .where(eq(magicLinks.id, existingLink.id));
      }

      // Create new magic link and send notification
      const { createMagicLink } = await import('../services/magic-link.js');
      const { sendMagicLink } = await import('../services/email.js');
      const token = await createMagicLink(stepExec.id);
      const contact = await db.query.contacts.findFirst({
        where: eq(contacts.id, assignToContactId),
      });

      // Get step name from definition
      const definition = run.flow?.definition as any;
      const defSteps = definition?.steps || [];
      const defStep = defSteps.find((s: any) => (s.stepId || s.id) === stepId);
      const stepName = defStep?.config?.name || `Step ${stepExec.stepIndex + 1}`;

      if (contact) {
        await sendMagicLink({
          to: contact.email,
          contactName: contact.name,
          stepName,
          flowName: run.flow?.name || 'Flow',
          token,
        });
      }
    }

    // Audit log
    logAction({
      flowRunId: runId,
      action: 'STEP_REASSIGNED',
      actorId: req.user?.id,
      details: {
        stepId,
        stepIndex: stepExec.stepIndex,
        oldAssignee,
        newAssignee: {
          contactId: assignToContactId || null,
          userId: assignToUserId || null,
        },
      },
    });

    res.json({
      success: true,
      data: { message: 'Step reassigned successfully' },
    });
  })
);

// ============================================================================
// GET /api/flows/:id/summary - Get AI-generated flow run summary
// ============================================================================

router.get(
  '/:id/summary',
  asyncHandler(async (req, res) => {
    const runId = req.params.id as string;
    const orgId = req.organizationId;

    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, runId),
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Run not found' },
      });
      return;
    }

    const existingData = (run.kickoffData as Record<string, unknown>) || {};
    if (existingData._aiSummary) {
      res.json({ success: true, data: existingData._aiSummary });
      return;
    }

    // Generate on first request if flow is completed
    if (run.status === 'COMPLETED') {
      const { generateFlowSummary } = await import('../services/ai-assignee.js');
      const summary = await generateFlowSummary(run.id);
      res.json({ success: true, data: summary });
      return;
    }

    res.json({ success: true, data: null });
  })
);

// ============================================================================
// POST /api/flows/:id/ai-chat - AI chat for flow run (SSE)
// ============================================================================

router.post(
  '/:id/ai-chat',
  asyncHandler(async (req, res) => {
    const runId = req.params.id as string;
    const { message, history } = req.body;
    const orgId = req.organizationId;

    const run = await db.query.flowRuns.findFirst({
      where: orgId
        ? and(eq(flowRuns.id, runId), eq(flowRuns.organizationId, orgId))
        : eq(flowRuns.id, runId),
    });

    if (!run) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Run not found' },
      });
      return;
    }

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Message is required' },
      });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const { handleAIChat } = await import('../services/ai-assignee.js');
    await handleAIChat(run.id, message, history || [], res);
  })
);

export default router;
