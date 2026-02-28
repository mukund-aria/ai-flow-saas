/**
 * Assignee Portal Service
 *
 * Business logic for the assignee portal dashboard and flow management.
 */

import { db, flowRuns, stepExecutions, contacts, flows, magicLinks, portalFlows, portals } from '../db/index.js';
import { eq, and, inArray } from 'drizzle-orm';

export async function getAssigneeDashboard(contactId: string, orgId: string) {
  // Find all step executions assigned to this contact
  const contactSteps = await db.query.stepExecutions.findMany({
    where: eq(stepExecutions.assignedToContactId, contactId),
    with: {
      flowRun: {
        with: { flow: true },
      },
      magicLink: true,
    },
  });

  // Group by flow run
  const runMap = new Map<string, {
    run: any;
    steps: any[];
  }>();

  for (const step of contactSteps) {
    const run = step.flowRun as any;
    if (!run || run.organizationId !== orgId) continue;

    if (!runMap.has(run.id)) {
      runMap.set(run.id, { run, steps: [] });
    }
    runMap.get(run.id)!.steps.push(step);
  }

  // Calculate summary
  let newCount = 0;
  let inProgressCount = 0;
  let dueCount = 0;
  let completedCount = 0;

  const workspaces = [];

  for (const [, { run, steps }] of runMap) {
    // Get all steps for this run to calculate progress
    const allSteps = await db.query.stepExecutions.findMany({
      where: eq(stepExecutions.flowRunId, run.id),
    });

    const completedSteps = allSteps.filter(s => s.status === 'COMPLETED').length;
    const totalSteps = allSteps.length;

    // Find the next active task for this contact
    const activeStep = steps.find(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING_FOR_ASSIGNEE');
    const nextTaskToken = activeStep?.magicLink?.token;

    if (run.status === 'COMPLETED') {
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
      id: run.id,
      name: run.name,
      templateName: run.flow?.name || 'Unknown',
      status: run.status,
      progress: { completed: completedSteps, total: totalSteps },
      dueAt: activeStep?.dueAt || run.dueAt || undefined,
      nextTaskToken,
    });
  }

  return {
    summary: { new: newCount, inProgress: inProgressCount, due: dueCount, completed: completedCount },
    workspaces,
  };
}

export async function getAvailableFlows(portalId: string) {
  const catalog = await db.query.portalFlows.findMany({
    where: and(
      eq(portalFlows.portalId, portalId),
      eq(portalFlows.enabled, true)
    ),
    with: { flow: true },
    orderBy: (pf, { asc }) => [asc(pf.sortOrder)],
  });

  return catalog
    .filter(pf => (pf.flow as any)?.status === 'ACTIVE')
    .map(pf => {
      const flow = pf.flow as any;
      const definition = flow.definition as any;
      return {
        id: flow.id,
        name: pf.displayTitle || flow.name,
        description: pf.displayDescription || flow.description,
        stepCount: definition?.steps?.length || 0,
      };
    });
}

export async function startFlowAsAssignee(
  flowId: string,
  contactId: string,
  orgId: string,
  portalId: string,
  startedById: string,
  kickoffData?: Record<string, unknown>
) {
  // Verify flow exists and is ACTIVE
  const flow = await db.query.flows.findFirst({
    where: and(eq(flows.id, flowId), eq(flows.organizationId, orgId)),
  });

  if (!flow || flow.status !== 'ACTIVE') {
    throw new Error('Flow not found or not active');
  }

  const definition = flow.definition as any;
  const steps = definition?.steps || [];

  // Create flow run
  const [run] = await db.insert(flowRuns).values({
    flowId: flow.id,
    name: `${flow.name} - ${new Date().toLocaleDateString()}`,
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
      flowRunId: run.id,
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

  return { runId: run.id, firstTaskToken };
}
