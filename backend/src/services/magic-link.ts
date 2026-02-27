/**
 * Magic Link Service
 *
 * Creates and validates magic link tokens for external assignees.
 */

import { db } from '../db/client.js';
import { magicLinks, stepExecutions, flowRuns, flows, contacts, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function createMagicLink(stepExecutionId: string, expiresInHours = 168): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  const [link] = await db.insert(magicLinks).values({
    stepExecutionId,
    expiresAt,
  }).returning();

  return link.token;
}

export interface JourneyStep {
  stepIndex: number;
  stepName: string;
  stepType: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  isCurrentStep: boolean;
  assignedToMe: boolean;
  completedAt?: string;
  resultData?: Record<string, unknown>;
}

export interface TaskContext {
  token: string;
  flowName: string;
  runName: string;
  stepName: string;
  stepDescription?: string;
  stepType: string;
  stepIndex?: number;
  totalSteps?: number;
  milestoneName?: string;
  contactName: string;
  contactEmail: string;
  formFields?: any[];
  questionnaire?: any;
  esign?: any;
  fileRequest?: any;
  pdfForm?: any;
  outcomes?: any[];
  options?: any[];
  expired: boolean;
  completed: boolean;
  journeySteps?: JourneyStep[];
}

export async function validateMagicLink(token: string): Promise<TaskContext | null> {
  const link = await db.query.magicLinks.findFirst({
    where: eq(magicLinks.token, token),
    with: {
      stepExecution: true,
    },
  });

  if (!link) return null;

  const stepExec = link.stepExecution;
  if (!stepExec) return null;

  // Get flow run and flow details
  const run = await db.query.flowRuns.findFirst({
    where: eq(flowRuns.id, stepExec.flowRunId),
    with: { flow: true },
  });

  if (!run) return null;

  // Get assignee info (contact or user)
  let contactName = 'Participant';
  let contactEmail = '';
  if (stepExec.assignedToContactId) {
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, stepExec.assignedToContactId),
    });
    if (contact) {
      contactName = contact.name;
      contactEmail = contact.email;
    }
  } else if (stepExec.assignedToUserId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, stepExec.assignedToUserId),
    });
    if (user) {
      contactName = user.name;
      contactEmail = user.email;
    }
  }

  // Get all step executions for this run to build journey
  const allStepExecs = await db.query.stepExecutions.findMany({
    where: eq(stepExecutions.flowRunId, stepExec.flowRunId),
    orderBy: (se, { asc }) => [asc(se.stepIndex)],
  });

  // Get step details from flow definition
  const definition = run.flow?.definition as any;
  const steps = definition?.steps || [];
  const milestones = definition?.milestones || [];
  const step = steps.find((s: any) => s.stepId === stepExec.stepId);
  const stepIndex = steps.findIndex((s: any) => s.stepId === stepExec.stepId);

  // Find milestone for this step
  let milestoneName: string | undefined;
  for (const m of milestones) {
    if (m.afterStepIndex !== undefined && stepIndex <= m.afterStepIndex) {
      // This step is before or at this milestone
    }
    // Simple: find last milestone whose afterStepIndex < stepIndex
    if (m.afterStepIndex !== undefined && m.afterStepIndex < stepIndex) {
      milestoneName = m.name;
    }
  }
  // If step is before first milestone, use first milestone name
  if (!milestoneName && milestones.length > 0) {
    milestoneName = milestones[0]?.name;
  }

  // Build journey steps array
  const currentContactId = stepExec.assignedToContactId;
  const currentUserId = stepExec.assignedToUserId;
  const journeySteps: JourneyStep[] = steps.map((defStep: any, idx: number) => {
    const exec = allStepExecs.find((se) => se.stepId === defStep.stepId);
    const isAssignedToMe = exec
      ? (currentContactId ? exec.assignedToContactId === currentContactId : false) ||
        (currentUserId ? exec.assignedToUserId === currentUserId : false)
      : false;

    const journeyStep: JourneyStep = {
      stepIndex: idx,
      stepName: defStep.config?.name || `Step ${idx + 1}`,
      stepType: defStep.type || 'TODO',
      status: exec?.status === 'COMPLETED' ? 'COMPLETED' :
              exec?.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'PENDING',
      isCurrentStep: idx === stepIndex,
      assignedToMe: isAssignedToMe,
      completedAt: exec?.completedAt?.toISOString(),
    };

    // Only include result data for steps assigned to the requesting contact
    if (isAssignedToMe && exec?.status === 'COMPLETED' && exec.resultData) {
      journeyStep.resultData = exec.resultData as Record<string, unknown>;
    }

    return journeyStep;
  });

  return {
    token,
    flowName: run.flow?.name || 'Unknown Flow',
    runName: run.name,
    stepName: step?.config?.name || 'Task',
    stepDescription: step?.config?.description,
    stepType: step?.type || 'FORM',
    stepIndex: stepIndex >= 0 ? stepIndex + 1 : undefined,
    totalSteps: steps.length,
    milestoneName,
    contactName,
    contactEmail,
    formFields: step?.config?.formFields,
    questionnaire: step?.config?.questionnaire,
    esign: step?.config?.esign,
    fileRequest: step?.config?.fileRequest,
    pdfForm: step?.config?.pdfForm,
    outcomes: step?.config?.outcomes,
    options: step?.config?.options,
    expired: new Date() > link.expiresAt,
    completed: !!link.usedAt || stepExec.status === 'COMPLETED',
    journeySteps,
  };
}
