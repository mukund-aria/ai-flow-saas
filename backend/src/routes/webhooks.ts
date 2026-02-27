/**
 * Webhook Routes
 *
 * Public HTTP endpoints for triggering flow starts via webhook.
 * No authentication required - mounted outside auth middleware.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, organizations, users, contacts } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onFlowStarted, updateFlowActivity } from '../services/execution.js';

const router = Router();

// ============================================================================
// POST /api/webhooks/flows/:flowId/start - Start a flow via webhook
// ============================================================================

router.post(
  '/:flowId/start',
  asyncHandler(async (req, res) => {
    const flowId = req.params.flowId as string;
    const { name, roleAssignments, kickoffData, callbackUrl } = req.body as {
      name?: string;
      roleAssignments?: Record<string, string>;
      kickoffData?: Record<string, unknown>;
      callbackUrl?: string;
    };

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

    // Allow both DRAFT and PUBLISHED templates (webhooks are typically automated)

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

    // Look up organization and user from the flow record (public route - no req.user)
    const orgId = flow.organizationId;
    let userId = flow.createdById;

    // Dev fallback: create default org/user if not available
    if (!orgId || !userId) {
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
    }

    // Create the flow run
    const runName = name || `${flow.name} - Webhook ${new Date().toISOString().split('T')[0]}`;

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
        roleAssignments: roleAssignments || null,
        kickoffData: { ...(kickoffData || {}), _callbackUrl: callbackUrl || undefined },
      })
      .returning();

    // Resolve role assignments: build map from role name -> contact ID
    const resolvedRoles: Record<string, string> = {};
    if (roleAssignments && typeof roleAssignments === 'object') {
      for (const [roleName, contactId] of Object.entries(roleAssignments)) {
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

    // Create magic links for contact-assigned first step
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

    // Dispatch flow.started webhook
    await onFlowStarted({ id: newRun.id, name: runName, organizationId: orgId, flowId: flow.id, flow: { name: flow.name } });

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

    // Audit: webhook flow started
    logAction({
      flowRunId: newRun.id,
      action: 'WEBHOOK_FLOW_STARTED',
      details: { flowId: flow.id, flowName: flow.name, runName, callbackUrl: callbackUrl || null },
    });

    res.status(201).json({
      success: true,
      data: completeRun,
    });
  })
);

// ============================================================================
// GET /api/webhooks/flows/:flowId/schema - Get webhook payload schema
// ============================================================================

router.get(
  '/:flowId/schema',
  asyncHandler(async (req, res) => {
    const flowId = req.params.flowId as string;

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

    const definition = flow.definition as {
      steps?: Array<{ id: string; name?: string; type?: string; config?: Record<string, unknown> }>;
      assigneePlaceholders?: Array<{ role: string; label?: string }>;
      kickoff?: { fields?: Array<{ key: string; label?: string; type?: string; required?: boolean }> };
    } | null;

    // Extract assignee placeholders (roles that need to be mapped to contacts)
    const assigneePlaceholders = definition?.assigneePlaceholders || [];

    // Extract kickoff form fields
    const kickoffFields = definition?.kickoff?.fields || [];

    res.json({
      success: true,
      data: {
        flowId: flow.id,
        flowName: flow.name,
        assigneePlaceholders,
        kickoffFields,
      },
    });
  })
);

export default router;
