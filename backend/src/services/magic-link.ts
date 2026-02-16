/**
 * Magic Link Service
 *
 * Creates and validates magic link tokens for external assignees.
 */

import { db } from '../db/client.js';
import { magicLinks, stepExecutions, flowRuns, flows, contacts } from '../db/schema.js';
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

export interface TaskContext {
  token: string;
  flowName: string;
  runName: string;
  stepName: string;
  stepDescription?: string;
  stepType: string;
  contactName: string;
  contactEmail: string;
  formFields?: any[];
  expired: boolean;
  completed: boolean;
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

  // Get contact info
  let contactName = 'Assignee';
  let contactEmail = '';
  if (stepExec.assignedToContactId) {
    const contact = await db.query.contacts.findFirst({
      where: eq(contacts.id, stepExec.assignedToContactId),
    });
    if (contact) {
      contactName = contact.name;
      contactEmail = contact.email;
    }
  }

  // Get step details from flow definition
  const definition = run.flow?.definition as any;
  const steps = definition?.steps || [];
  const step = steps.find((s: any) => s.stepId === stepExec.stepId);

  return {
    token,
    flowName: run.flow?.name || 'Unknown Flow',
    runName: run.name,
    stepName: step?.config?.name || 'Task',
    stepDescription: step?.config?.description,
    stepType: step?.type || 'FORM',
    contactName,
    contactEmail,
    formFields: step?.config?.formFields,
    expired: new Date() > link.expiresAt,
    completed: !!link.usedAt || stepExec.status === 'COMPLETED',
  };
}
