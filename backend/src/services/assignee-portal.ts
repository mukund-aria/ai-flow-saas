/**
 * Assignee Portal Service
 *
 * Business logic for the assignee portal dashboard and flow management.
 */

import { db, flows, stepExecutions, contacts, templates, magicLinks, portalTemplates, portals } from '../db/index.js';
import { eq, and, inArray } from 'drizzle-orm';

export async function getAssigneeDashboard(contactId: string, orgId: string) {
  // Find all step executions assigned to this contact
  const contactSteps = await db.query.stepExecutions.findMany({
    where: eq(stepExecutions.assignedToContactId, contactId),
    with: {
      flow: {
        with: { template: true },
      },
    },
  });

  // Fetch magic links for these steps
  const stepIds = contactSteps.map(s => s.id);
  const stepMagicLinks = stepIds.length > 0
    ? await db.query.magicLinks.findMany({
        where: inArray(magicLinks.stepExecutionId, stepIds),
      })
    : [];
  const magicLinkByStepId = new Map(stepMagicLinks.map(ml => [ml.stepExecutionId, ml]));

  // Group by flow
  const flowMap = new Map<string, {
    flow: any;
    steps: any[];
  }>();

  for (const step of contactSteps) {
    const flow = (step as any).flow;
    if (!flow || flow.organizationId !== orgId) continue;

    if (!flowMap.has(flow.id)) {
      flowMap.set(flow.id, { flow, steps: [] });
    }
    flowMap.get(flow.id)!.steps.push({ ...step, magicLink: magicLinkByStepId.get(step.id) });
  }

  // Calculate summary
  let newCount = 0;
  let inProgressCount = 0;
  let dueCount = 0;
  let completedCount = 0;

  const workspaces = [];

  for (const [, { flow, steps }] of flowMap) {
    // Get all steps for this flow to calculate progress
    const allSteps = await db.query.stepExecutions.findMany({
      where: eq(stepExecutions.flowId, flow.id),
    });

    const completedSteps = allSteps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = allSteps.length;

    // Find the next active task for this contact
    const activeStep = steps.find(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING_FOR_ASSIGNEE');
    const nextTaskToken = activeStep?.magicLink?.token;

    if (flow.status === 'COMPLETED') {
      completedCount++;
    } else if (activeStep) {
      if (activeStep.dueAt && new Date(activeStep.dueAt) < new Date()) {
        dueCount++;
      } else if (activeStep.status === 'WAITING_FOR_ASSIGNEE' && !activeStep.startedAt) {
        newCount++;
      } else {
        inProgressCount++;
      }
    }

    workspaces.push({
      id: flow.id,
      name: flow.name,
      templateName: flow.template?.name || 'Unknown',
      status: flow.status,
      progress: { completed: completedSteps, total: totalSteps },
      dueAt: activeStep?.dueAt || flow.dueAt || undefined,
      nextTaskToken,
    });
  }

  return {
    summary: { new: newCount, inProgress: inProgressCount, due: dueCount, completed: completedCount },
    workspaces,
  };
}

export async function getAvailableFlows(portalId: string) {
  const catalog = await db.query.portalTemplates.findMany({
    where: and(
      eq(portalTemplates.portalId, portalId),
      eq(portalTemplates.enabled, true)
    ),
    with: { template: true },
    orderBy: (pf, { asc }) => [asc(pf.sortOrder)],
  });

  return catalog
    .filter(pf => (pf.template as any)?.status === 'ACTIVE')
    .map(pf => {
      const template = pf.template as any;
      const definition = template.definition as any;
      return {
        id: template.id,
        name: pf.displayTitle || template.name,
        description: pf.displayDescription || template.description,
        stepCount: definition?.steps?.length || 0,
      };
    });
}

export async function startFlowAsAssignee(
  templateId: string,
  contactId: string,
  orgId: string,
  portalId: string,
  startedById: string,
  kickoffData?: Record<string, unknown>
) {
  // Verify template exists and is ACTIVE
  const template = await db.query.templates.findFirst({
    where: and(eq(templates.id, templateId), eq(templates.organizationId, orgId)),
  });

  if (!template || template.status !== 'ACTIVE') {
    throw new Error('Flow template not found or not active');
  }

  const definition = template.definition as any;
  const steps = definition?.steps || [];

  // Create flow
  const [flow] = await db.insert(flows).values({
    templateId: template.id,
    name: `${template.name} - ${new Date().toLocaleDateString()}`,
    status: 'IN_PROGRESS',
    currentStepIndex: 0,
    startedById,
    organizationId: orgId,
    portalId,
    startedByContactId: contactId,
    kickoffData,
  }).returning();

  // Create step executions
  let firstTaskToken: string | undefined;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const isFirst = i === 0;

    const [stepExec] = await db.insert(stepExecutions).values({
      flowId: flow.id,
      stepId: step.id || step.stepId,
      stepIndex: i,
      status: isFirst ? 'WAITING_FOR_ASSIGNEE' : 'PENDING',
      assignedToContactId: isFirst ? contactId : null,
      startedAt: isFirst ? new Date() : null,
    }).returning();

    // Create magic link for the first step
    if (isFirst) {
      const [link] = await db.insert(magicLinks).values({
        stepExecutionId: stepExec.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }).returning();
      firstTaskToken = link.token;
    }
  }

  return { flowId: flow.id, firstTaskToken };
}
