/**
 * Assignee Resolution Service
 *
 * Resolves assignee placeholders from a flow template to actual contacts/users
 * when a flow run starts. Each resolution type has different resolution logic.
 */

import { db, contacts, flowRuns, stepExecutions } from '../db/index.js';
import { eq, and, sql } from 'drizzle-orm';
import type { Resolution, Role } from '../models/assignees.js';

export interface ResolvedAssignee {
  contactId?: string;
  userId?: string;
}

export interface AssigneeResolutionContext {
  organizationId: string;
  startedByUserId: string;
  roleAssignments?: Record<string, string>;  // Manual assignments from coordinator (for CONTACT_TBD)
  kickoffData?: Record<string, unknown>;     // Kickoff form data
  flowVariables?: Record<string, unknown>;   // Flow variables passed at start
  flowId: string;                            // Template ID for round-robin tracking
}

/**
 * Resolve all assignee placeholders for a flow template.
 * Returns a map of roleName -> { contactId?, userId? }
 */
export async function resolveAssignees(
  roles: Role[],
  ctx: AssigneeResolutionContext
): Promise<Record<string, ResolvedAssignee>> {
  const resolved: Record<string, ResolvedAssignee> = {};

  for (const role of roles) {
    const result = await resolveOne(role, ctx);
    resolved[role.name] = result;
  }

  return resolved;
}

async function resolveOne(
  role: Role,
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  const resolution = role.resolution;
  if (!resolution) return {};

  switch (resolution.type) {
    case 'CONTACT_TBD':
      return resolveTbd(role.name, ctx);

    case 'FIXED_CONTACT':
      return resolveFixedContact(resolution.email, ctx.organizationId);

    case 'WORKSPACE_INITIALIZER':
      return { userId: ctx.startedByUserId };

    case 'KICKOFF_FORM_FIELD':
      return resolveFromKickoff(resolution.fieldKey, ctx);

    case 'FLOW_VARIABLE':
      return resolveFromVariable(resolution.variableKey, ctx);

    case 'ROUND_ROBIN':
      return resolveRoundRobin(resolution.emails, ctx);

    case 'RULES':
      return resolveRules(resolution.config, ctx);

    default:
      return {};
  }
}

/**
 * CONTACT_TBD: Use manual assignment from coordinator, if provided.
 */
function resolveTbd(
  roleName: string,
  ctx: AssigneeResolutionContext
): ResolvedAssignee {
  const contactId = ctx.roleAssignments?.[roleName];
  return contactId ? { contactId } : {};
}

/**
 * FIXED_CONTACT: Look up (or create) a contact by email in the organization.
 */
async function resolveFixedContact(
  email: string,
  organizationId: string
): Promise<ResolvedAssignee> {
  if (!email) return {};

  // Find existing contact by email
  const existing = await db.query.contacts.findFirst({
    where: and(
      eq(contacts.email, email.toLowerCase()),
      eq(contacts.organizationId, organizationId)
    ),
  });

  if (existing) {
    return { contactId: existing.id };
  }

  // Auto-create the contact
  const [newContact] = await db
    .insert(contacts)
    .values({
      email: email.toLowerCase(),
      name: email.split('@')[0],
      organizationId,
      type: 'ASSIGNEE',
      status: 'ACTIVE',
    })
    .returning();

  return { contactId: newContact.id };
}

/**
 * KICKOFF_FORM_FIELD: Extract email from kickoff form data, find/create contact.
 */
async function resolveFromKickoff(
  fieldKey: string,
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  if (!fieldKey || !ctx.kickoffData) return {};

  const value = ctx.kickoffData[fieldKey];
  if (!value || typeof value !== 'string') return {};

  // Treat the value as an email
  return resolveFixedContact(value, ctx.organizationId);
}

/**
 * FLOW_VARIABLE: Extract email from flow variables, find/create contact.
 */
async function resolveFromVariable(
  variableKey: string,
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  if (!variableKey || !ctx.flowVariables) return {};

  const value = ctx.flowVariables[variableKey];
  if (!value || typeof value !== 'string') return {};

  return resolveFixedContact(value, ctx.organizationId);
}

/**
 * ROUND_ROBIN: Rotate through a list of emails based on usage count.
 * Uses the count of flow runs per contact to determine next assignment.
 */
async function resolveRoundRobin(
  emails: string[],
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  if (!emails || emails.length === 0) return {};

  // Get or create contacts for all emails
  const contactIds: { email: string; id: string }[] = [];
  for (const email of emails) {
    const result = await resolveFixedContact(email, ctx.organizationId);
    if (result.contactId) {
      contactIds.push({ email, id: result.contactId });
    }
  }

  if (contactIds.length === 0) return {};
  if (contactIds.length === 1) return { contactId: contactIds[0].id };

  // Count how many times each contact has been assigned in runs of this template
  // by checking step_executions for this flow template
  const counts: Record<string, number> = {};
  for (const c of contactIds) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(stepExecutions)
      .innerJoin(flowRuns, eq(stepExecutions.flowRunId, flowRuns.id))
      .where(
        and(
          eq(flowRuns.flowId, ctx.flowId),
          eq(stepExecutions.assignedToContactId, c.id)
        )
      );
    counts[c.id] = Number(result[0]?.count ?? 0);
  }

  // Pick the contact with the fewest assignments
  const sorted = contactIds.sort((a, b) => (counts[a.id] || 0) - (counts[b.id] || 0));
  return { contactId: sorted[0].id };
}

/**
 * RULES: Evaluate conditions against context data to determine assignee.
 * First matching rule wins. Falls back to default if no rules match.
 */
async function resolveRules(
  config: {
    source: 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD' | 'STEP_OUTPUT';
    variableKey?: string;
    fieldKey?: string;
    stepOutputRef?: string;
    rules: Array<{
      if: { contains?: string; equals?: string; notEmpty?: boolean };
      then: Resolution;
    }>;
    default: Resolution;
  },
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  // Get the source value to evaluate rules against
  let sourceValue: string = '';

  switch (config.source) {
    case 'KICKOFF_FORM_FIELD':
      if (config.fieldKey && ctx.kickoffData) {
        const val = ctx.kickoffData[config.fieldKey];
        sourceValue = typeof val === 'string' ? val : String(val ?? '');
      }
      break;
    case 'FLOW_VARIABLE':
      if (config.variableKey && ctx.flowVariables) {
        const val = ctx.flowVariables[config.variableKey];
        sourceValue = typeof val === 'string' ? val : String(val ?? '');
      }
      break;
    case 'STEP_OUTPUT':
      // Step outputs aren't available at flow start -- skip
      break;
  }

  // Evaluate rules in order, first match wins
  for (const rule of config.rules || []) {
    const cond = rule.if;
    let matches = false;

    if (cond.equals !== undefined) {
      matches = sourceValue.toLowerCase() === cond.equals.toLowerCase();
    } else if (cond.contains !== undefined) {
      matches = sourceValue.toLowerCase().includes(cond.contains.toLowerCase());
    } else if (cond.notEmpty) {
      matches = sourceValue.trim().length > 0;
    }

    if (matches) {
      // Recursively resolve the "then" resolution
      return resolveResolution(rule.then, ctx);
    }
  }

  // No rules matched -- use the default
  if (config.default) {
    return resolveResolution(config.default, ctx);
  }

  return {};
}

/**
 * Helper to resolve a Resolution object (used by RULES for its then/default values)
 */
async function resolveResolution(
  resolution: Resolution,
  ctx: AssigneeResolutionContext
): Promise<ResolvedAssignee> {
  switch (resolution.type) {
    case 'FIXED_CONTACT':
      return resolveFixedContact(resolution.email, ctx.organizationId);
    case 'WORKSPACE_INITIALIZER':
      return { userId: ctx.startedByUserId };
    case 'CONTACT_TBD':
      return {};
    default:
      return {};
  }
}
