/**
 * Public Embed Routes
 *
 * Public endpoints for embedded flow starts.
 * No authentication required — access is via embedId.
 */

import { Router } from 'express';
import { db, flows, flowRuns, stepExecutions, contacts, users, organizations } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onFlowStarted, updateFlowActivity, computeFlowDueAt } from '../services/execution.js';

const router = Router();

/**
 * Helper: look up a flow by its embedId stored in definition.embedId.
 */
async function findFlowByEmbedId(embedId: string) {
  const allFlows = await db.query.flows.findMany();
  return allFlows.find(f => {
    const def = f.definition as Record<string, unknown> | null;
    return def?.embedId === embedId;
  }) || null;
}

// ============================================================================
// GET /api/public/embed/:embedId - Get flow info for the embed start page
// ============================================================================

router.get(
  '/:embedId',
  asyncHandler(async (req, res) => {
    const embedId = req.params.embedId as string;

    const flow = await findFlowByEmbedId(embedId);

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Embedded flow not found' },
      });
      return;
    }

    if (flow.status !== 'ACTIVE') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'This flow is not currently active' },
      });
      return;
    }

    // Extract info from definition
    const definition = flow.definition as Record<string, unknown> | null;
    const kickoff = (definition as any)?.kickoff || null;
    const roles = (definition as any)?.roles || (definition as any)?.assigneePlaceholders || [];

    // Get organization branding if available
    let branding = null;
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, flow.organizationId),
    });
    if (org?.brandingConfig) {
      branding = org.brandingConfig;
    }

    res.json({
      success: true,
      data: {
        id: flow.id,
        name: flow.name,
        description: flow.description,
        kickoff,
        roles,
        branding,
      },
    });
  })
);

// ============================================================================
// POST /api/public/embed/:embedId/start - Start a flow via embed
// ============================================================================

router.post(
  '/:embedId/start',
  asyncHandler(async (req, res) => {
    const embedId = req.params.embedId as string;
    const { kickoffData, assigneeInfo } = req.body as {
      kickoffData?: Record<string, unknown>;
      assigneeInfo?: { name?: string; email?: string };
    };

    const flow = await findFlowByEmbedId(embedId);

    if (!flow) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Embedded flow not found' },
      });
      return;
    }

    if (flow.status !== 'ACTIVE') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'This flow is not currently active' },
      });
      return;
    }

    // Get flow definition and steps
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
        if (field.type === 'HEADING' || field.type === 'PARAGRAPH') continue;
        if (field.required) {
          const val = data[field.fieldId];
          if (val === undefined || val === null || val === '') {
            errors.push(`"${field.label}" is required`);
          }
        }
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: `Form validation failed: ${errors.join(', ')}` },
        });
        return;
      }
    }

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

    // If assignee info provided, find or create a contact
    let firstStepContactId: string | null = null;
    if (assigneeInfo?.email) {
      let contact = await db.query.contacts.findFirst({
        where: and(
          eq(contacts.email, assigneeInfo.email),
          eq(contacts.organizationId, orgId)
        ),
      });

      if (!contact) {
        const [newContact] = await db.insert(contacts).values({
          email: assigneeInfo.email,
          name: assigneeInfo.name || assigneeInfo.email,
          organizationId: orgId,
          type: 'ASSIGNEE',
        }).returning();
        contact = newContact;
      }

      firstStepContactId = contact.id;
    }

    // Create the flow run
    const runName = `${flow.name} - Embedded - ${new Date().toISOString().split('T')[0]}`;

    const flowStartedAt = new Date();
    const flowDueDates = (definition as any)?.dueDates;
    const flowDueAt = computeFlowDueAt(flowDueDates?.flowDue, flowStartedAt);

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
        dueAt: flowDueAt,
      })
      .returning();

    // Create step executions
    const stepExecutionValues = steps.map((step, index) => {
      const stepDef = step as any;
      const resolvedStepId = stepDef.stepId || stepDef.id || `step-${index}`;

      return {
        flowRunId: newRun.id,
        stepId: resolvedStepId,
        stepIndex: index,
        status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
        startedAt: index === 0 ? new Date() : null,
        assignedToContactId: index === 0 ? firstStepContactId : null,
      };
    });

    await db.insert(stepExecutions).values(stepExecutionValues);

    // Create magic link for first step if assigned to a contact
    let firstTaskUrl: string | null = null;
    if (firstStepContactId) {
      const firstStepExec = await db.query.stepExecutions.findFirst({
        where: and(
          eq(stepExecutions.flowRunId, newRun.id),
          eq(stepExecutions.stepIndex, 0)
        ),
      });

      if (firstStepExec) {
        const { createMagicLink } = await import('../services/magic-link.js');
        const token = await createMagicLink(firstStepExec.id);
        firstTaskUrl = `/task/${token}`;
      }
    }

    // Schedule notification jobs for the first step
    const firstStep = steps[0] as any;
    const firstStepExec = await db.query.stepExecutions.findFirst({
      where: and(
        eq(stepExecutions.flowRunId, newRun.id),
        eq(stepExecutions.stepIndex, 0)
      ),
    });
    if (firstStepExec) {
      await onStepActivated(firstStepExec.id, firstStep.due || firstStep.config?.due, flow.definition as Record<string, unknown>, flowDueAt);
    }

    await updateFlowActivity(newRun.id);

    await onFlowStarted({ id: newRun.id, name: runName, organizationId: orgId, flowId: flow.id, flow: { name: flow.name } });

    logAction({
      flowRunId: newRun.id,
      action: 'EMBED_FLOW_STARTED',
      details: {
        flowId: flow.id,
        flowName: flow.name,
        embedId,
        submitterName: assigneeInfo?.name || null,
        submitterEmail: assigneeInfo?.email || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        runId: newRun.id,
        firstTaskUrl,
      },
    });
  })
);

export default router;
