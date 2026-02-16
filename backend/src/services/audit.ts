/**
 * Audit Logging Service
 *
 * Logs actions to the audit_logs table for compliance and debugging.
 */

import { db } from '../db/client.js';
import { auditLogs } from '../db/schema.js';

export async function logAction(params: {
  flowRunId: string;
  action: string;
  actorId?: string;
  actorEmail?: string;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      flowRunId: params.flowRunId,
      action: params.action,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      details: params.details,
    });
  } catch (err) {
    console.error('[Audit] Failed to log action:', err);
  }
}
