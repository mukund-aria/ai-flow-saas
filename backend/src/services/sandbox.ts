/**
 * Sandbox Service
 *
 * Manages ephemeral "sandbox" flows created by unauthenticated visitors
 * on the public landing page. Handles:
 * - Bootstrap: ensures a system-owned sandbox org + user exist
 * - Save: persists AI-generated flow definitions for 72 hours
 * - Materialize: creates real DB records (flow, run, steps, contact, magic link)
 *   so the visitor can experience the full assignee portal
 * - Claim: copies a sandbox flow into a real user's org on sign-up
 * - Cleanup: deletes expired + unclaimed sandbox data
 */

import { db } from '../db/client.js';
import {
  sandboxFlows,
  organizations,
  users,
  userOrganizations,
  flows,
  flowRuns,
  stepExecutions,
  contacts,
  magicLinks,
} from '../db/schema.js';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { createMagicLink } from './magic-link.js';
import * as email from './email.js';

// ============================================================================
// Constants
// ============================================================================

const SANDBOX_ORG_SLUG = '__serviceflow-sandbox__';
const SANDBOX_USER_EMAIL = 'sandbox@serviceflow.internal';
const SANDBOX_FLOW_TTL_HOURS = 72;
const SANDBOX_MAGIC_LINK_TTL_HOURS = 24;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Module-level cache for sandbox infrastructure IDs
let cachedOrgId: string | null = null;
let cachedUserId: string | null = null;

// ============================================================================
// 2a. Bootstrap (called once at server start)
// ============================================================================

export async function ensureSandboxInfrastructure(): Promise<{ orgId: string; userId: string }> {
  // Return cached if available
  if (cachedOrgId && cachedUserId) {
    return { orgId: cachedOrgId, userId: cachedUserId };
  }

  // Find or create sandbox org
  let org = await db.query.organizations.findFirst({
    where: eq(organizations.slug, SANDBOX_ORG_SLUG),
  });

  if (!org) {
    const [created] = await db.insert(organizations).values({
      name: 'ServiceFlow Sandbox',
      slug: SANDBOX_ORG_SLUG,
    }).returning();
    org = created;
    console.log('[Sandbox] Created sandbox organization:', org.id);
  }

  // Find or create sandbox system user
  let user = await db.query.users.findFirst({
    where: eq(users.email, SANDBOX_USER_EMAIL),
  });

  if (!user) {
    const [created] = await db.insert(users).values({
      email: SANDBOX_USER_EMAIL,
      name: 'Sandbox System',
      activeOrganizationId: org.id,
    }).returning();
    user = created;
    console.log('[Sandbox] Created sandbox system user:', user.id);
  }

  // Ensure admin membership exists
  const membership = await db.query.userOrganizations.findFirst({
    where: and(
      eq(userOrganizations.userId, user.id),
      eq(userOrganizations.organizationId, org.id),
    ),
  });

  if (!membership) {
    await db.insert(userOrganizations).values({
      userId: user.id,
      organizationId: org.id,
      role: 'ADMIN',
    });
    console.log('[Sandbox] Created sandbox admin membership');
  }

  cachedOrgId = org.id;
  cachedUserId = user.id;

  console.log('[Sandbox] Infrastructure ready (org=%s, user=%s)', cachedOrgId, cachedUserId);
  return { orgId: cachedOrgId, userId: cachedUserId };
}

// ============================================================================
// 2b. Save Sandbox Flow
// ============================================================================

export async function saveSandboxFlow(input: {
  name: string;
  description?: string;
  definition: Record<string, unknown>;
  prompt: string;
  sessionId?: string;
}): Promise<{ sandboxFlowId: string }> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SANDBOX_FLOW_TTL_HOURS);

  const [row] = await db.insert(sandboxFlows).values({
    name: input.name,
    description: input.description,
    definition: input.definition,
    prompt: input.prompt,
    sessionId: input.sessionId,
    expiresAt,
  }).returning();

  console.log('[Sandbox] Saved sandbox flow: %s (expires %s)', row.id, expiresAt.toISOString());
  return { sandboxFlowId: row.id };
}

// ============================================================================
// 2b'. Get Sandbox Flow
// ============================================================================

export async function getSandboxFlow(sandboxFlowId: string) {
  const row = await db.query.sandboxFlows.findFirst({
    where: eq(sandboxFlows.id, sandboxFlowId),
  });

  if (!row) return null;
  if (new Date() > row.expiresAt) return null;

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    definition: row.definition,
    prompt: row.prompt,
    expiresAt: row.expiresAt,
  };
}

// ============================================================================
// 2c. Materialize for Test
// ============================================================================

export async function materializeSandboxFlowForTest(
  sandboxFlowId: string,
  contactName: string,
  contactEmail: string,
): Promise<{ token: string; runId: string; flowId: string }> {
  const { orgId, userId } = await ensureSandboxInfrastructure();

  // 1. Read sandbox flow
  const sandbox = await db.query.sandboxFlows.findFirst({
    where: eq(sandboxFlows.id, sandboxFlowId),
  });

  if (!sandbox) {
    throw new Error('Sandbox flow not found');
  }
  if (new Date() > sandbox.expiresAt) {
    throw new Error('Sandbox flow has expired');
  }

  const definition = sandbox.definition as Record<string, unknown>;
  const stepsArray = (definition?.steps as any[]) || [];

  // 2. Create flow in sandbox org (mark with isSandbox flag)
  const [flow] = await db.insert(flows).values({
    name: sandbox.name,
    description: sandbox.description,
    status: 'ACTIVE',
    definition: { ...definition, isSandbox: true },
    createdById: userId,
    organizationId: orgId,
  }).returning();

  // 3. Create contact in sandbox org
  const [contact] = await db.insert(contacts).values({
    email: contactEmail,
    name: contactName,
    organizationId: orgId,
  }).returning();

  // 4. Create flow run
  const [run] = await db.insert(flowRuns).values({
    flowId: flow.id,
    name: sandbox.name,
    status: 'IN_PROGRESS',
    currentStepIndex: 0,
    startedById: userId,
    organizationId: orgId,
  }).returning();

  // 5. Create step executions — first step IN_PROGRESS assigned to contact
  const stepValues = stepsArray.map((step: any, idx: number) => ({
    flowRunId: run.id,
    stepId: step.stepId || step.id || `step-${idx}`,
    stepIndex: idx,
    status: idx === 0 ? ('IN_PROGRESS' as const) : ('PENDING' as const),
    assignedToContactId: idx === 0 ? contact.id : null,
    startedAt: idx === 0 ? new Date() : null,
  }));

  const createdSteps = await db.insert(stepExecutions).values(stepValues).returning();

  // 6. Create magic link for first step (24h expiry)
  const firstStep = createdSteps[0];
  const token = await createMagicLink(firstStep.id, SANDBOX_MAGIC_LINK_TTL_HOURS);

  // 7. Send magic link email
  const firstStepDef = stepsArray[0];
  const stepName = firstStepDef?.config?.name || firstStepDef?.name || 'Task';

  try {
    await email.sendMagicLink({
      to: contactEmail,
      contactName,
      flowName: sandbox.name,
      stepName,
      token,
    });
  } catch (err) {
    console.error('[Sandbox] Failed to send magic link email:', err);
    // Non-fatal — the user navigates to the task page directly
  }

  console.log('[Sandbox] Materialized flow=%s, run=%s, token=%s', flow.id, run.id, token);
  return { token, runId: run.id, flowId: flow.id };
}

// ============================================================================
// 2d. Claim Flow
// ============================================================================

export async function claimSandboxFlow(
  sandboxFlowId: string,
  userId: string,
  organizationId: string,
): Promise<{ flowId: string }> {
  // Atomically claim — only succeeds if not already claimed
  const [claimed] = await db
    .update(sandboxFlows)
    .set({
      claimedByUserId: userId,
      claimedAt: new Date(),
    })
    .where(
      and(
        eq(sandboxFlows.id, sandboxFlowId),
        isNull(sandboxFlows.claimedByUserId),
      ),
    )
    .returning();

  if (!claimed) {
    throw new Error('Sandbox flow not found or already claimed');
  }

  // Deep-copy flow definition into user's org as DRAFT
  const [newFlow] = await db.insert(flows).values({
    name: claimed.name,
    description: claimed.description,
    status: 'DRAFT',
    definition: claimed.definition,
    createdById: userId,
    organizationId,
  }).returning();

  console.log('[Sandbox] Claimed sandbox flow %s → new flow %s (org=%s)', sandboxFlowId, newFlow.id, organizationId);
  return { flowId: newFlow.id };
}

// ============================================================================
// 2e. Cleanup
// ============================================================================

export function startSandboxCleanup(): void {
  // Run immediately once, then on interval
  cleanupExpiredSandboxData().catch((err) =>
    console.error('[Sandbox] Initial cleanup failed:', err)
  );

  setInterval(() => {
    cleanupExpiredSandboxData().catch((err) =>
      console.error('[Sandbox] Scheduled cleanup failed:', err)
    );
  }, CLEANUP_INTERVAL_MS);

  console.log('[Sandbox] Cleanup scheduler started (every %dms)', CLEANUP_INTERVAL_MS);
}

export async function cleanupExpiredSandboxData(): Promise<{ deleted: number }> {
  const now = new Date();

  // Delete expired + unclaimed sandbox flow records
  const deleted = await db
    .delete(sandboxFlows)
    .where(
      and(
        lt(sandboxFlows.expiresAt, now),
        isNull(sandboxFlows.claimedByUserId),
      ),
    )
    .returning();

  if (deleted.length > 0) {
    console.log('[Sandbox] Cleaned up %d expired sandbox flows', deleted.length);
  }

  // Clean up materialized sandbox data in the sandbox org
  // (flows with definition.isSandbox = true that are older than TTL)
  if (cachedOrgId) {
    try {
      const sandboxOrgFlows = await db.query.flows.findMany({
        where: eq(flows.organizationId, cachedOrgId),
      });

      const cutoff = new Date(Date.now() - SANDBOX_FLOW_TTL_HOURS * 60 * 60 * 1000);
      const expiredFlows = sandboxOrgFlows.filter((f) => {
        const def = f.definition as any;
        return def?.isSandbox && f.createdAt < cutoff;
      });

      for (const flow of expiredFlows) {
        // Delete in dependency order: magic_links → step_executions → flow_runs → contacts → flows
        const runs = await db.query.flowRuns.findMany({
          where: eq(flowRuns.flowId, flow.id),
        });

        for (const run of runs) {
          const steps = await db.query.stepExecutions.findMany({
            where: eq(stepExecutions.flowRunId, run.id),
          });

          for (const step of steps) {
            await db.delete(magicLinks).where(eq(magicLinks.stepExecutionId, step.id));
          }

          await db.delete(stepExecutions).where(eq(stepExecutions.flowRunId, run.id));
        }

        for (const run of runs) {
          await db.delete(flowRuns).where(eq(flowRuns.id, run.id));
        }

        await db.delete(flows).where(eq(flows.id, flow.id));
      }

      if (expiredFlows.length > 0) {
        console.log('[Sandbox] Cleaned up %d materialized sandbox flows', expiredFlows.length);
      }
    } catch (err) {
      console.error('[Sandbox] Failed to clean up materialized data:', err);
    }
  }

  return { deleted: deleted.length };
}
