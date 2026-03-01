/**
 * Public Start Link Routes
 *
 * Handles starting flows via shareable public URLs.
 * No authentication required - access is via template ID.
 */

import { Router } from 'express';
import { db, templates, flows, stepExecutions, organizations, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { asyncHandler } from '../middleware/async-handler.js';
import { logAction } from '../services/audit.js';
import { onStepActivated, onFlowStarted, updateFlowActivity } from '../services/execution.js';

const router = Router();

// ============================================================================
// GET /api/public/start/:templateId - Get template info for the start link page
// ============================================================================

router.get(
  '/:templateId',
  asyncHandler(async (req, res) => {
    const templateId = req.params.templateId as string;

    // Look up the template
    const template = await db.query.templates.findFirst({
      where: eq(templates.id, templateId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Extract kickoff form fields and assignee placeholders from definition
    const definition = template.definition as {
      steps?: Array<{ id: string; name?: string; type?: string; config?: Record<string, unknown> }>;
      kickoff?: Record<string, unknown>;
      roles?: Array<{ name: string; description?: string }>;
    } | null;

    res.json({
      success: true,
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        kickoff: definition?.kickoff || null,
        roles: definition?.roles || [],
      },
    });
  })
);

// ============================================================================
// POST /api/public/start/:templateId - Start a flow via public link
// ============================================================================

router.post(
  '/:templateId',
  asyncHandler(async (req, res) => {
    const templateId = req.params.templateId as string;
    const { submitterName, submitterEmail, kickoffData } = req.body as {
      submitterName?: string;
      submitterEmail?: string;
      kickoffData?: Record<string, unknown>;
    };

    // Validate the template exists
    const template = await db.query.templates.findFirst({
      where: eq(templates.id, templateId),
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Flow not found' },
      });
      return;
    }

    // Only allow published templates (not drafts)
    if (template.status === 'DRAFT') {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'This flow is not yet published and cannot be started via a public link.' },
      });
      return;
    }

    // Get template definition and steps
    const definition = template.definition as { steps?: Array<{ id: string; name?: string; type?: string; due?: { value: number; unit: string } }> } | null;
    const steps = definition?.steps || [];

    if (steps.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Flow has no steps defined' },
      });
      return;
    }

    // Look up the organization from the template record (public route - no req.user)
    const orgId = template.organizationId;

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

    // Create the flow
    const runName = `${template.name} - Started via link - ${new Date().toISOString().split('T')[0]}`;

    const [newFlow] = await db
      .insert(flows)
      .values({
        templateId: template.id,
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
      flowId: newFlow.id,
      stepId: step.id,
      stepIndex: index,
      status: index === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
      startedAt: index === 0 ? new Date() : null,
    }));

    await db.insert(stepExecutions).values(stepExecutionValues);

    // Schedule notification jobs for the first step if it has a due date
    const firstStep = steps[0] as { id: string; due?: { value: number; unit: string } };
    const firstStepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.flowId, newFlow.id),
    });
    if (firstStepExec) {
      await onStepActivated(firstStepExec.id, firstStep.due, template.definition);
    }

    // Set initial activity timestamp
    await updateFlowActivity(newFlow.id);

    // Dispatch flow.started webhook
    await onFlowStarted({ id: newFlow.id, name: runName, organizationId: orgId, templateId: template.id, template: { name: template.name } });

    // Audit: public link flow started
    logAction({
      flowId: newFlow.id,
      action: 'PUBLIC_LINK_FLOW_STARTED',
      details: {
        templateId: template.id,
        templateName: template.name,
        submitterName: submitterName || null,
        submitterEmail: submitterEmail || null,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        flowId: newFlow.id,
        message: 'Flow started successfully',
      },
    });
  })
);

export default router;
