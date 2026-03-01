/**
 * Database Helper
 *
 * Direct PostgreSQL queries for E2E test verification.
 * Used to query magic link tokens and verify step/flow statuses.
 */

import pg from 'pg';

// Must match the database the backend's Drizzle ORM actually connects to.
// The backend's db/client.ts defaults to 'serviceflow' when DATABASE_URL
// is not available at ESM import time (before dotenv.config() runs).
const pool = new pg.Pool({
  connectionString:
    process.env.E2E_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/serviceflow',
});

export async function getMagicLinkToken(
  stepExecutionId: string
): Promise<string | null> {
  const result = await pool.query(
    'SELECT token FROM magic_links WHERE step_execution_id = $1 AND used_at IS NULL ORDER BY created_at DESC LIMIT 1',
    [stepExecutionId]
  );
  return result.rows[0]?.token ?? null;
}

export async function getStepExecutions(flowRunId: string) {
  const result = await pool.query(
    `SELECT id, step_id, step_index, status, assigned_to_contact_id, assigned_to_user_id
     FROM step_executions
     WHERE flow_run_id = $1
     ORDER BY step_index`,
    [flowRunId]
  );
  return result.rows;
}

export async function getStepExecutionByStepId(
  flowRunId: string,
  stepId: string
) {
  const result = await pool.query(
    'SELECT id, step_id, step_index, status FROM step_executions WHERE flow_run_id = $1 AND step_id = $2',
    [flowRunId, stepId]
  );
  return result.rows[0] ?? null;
}

export async function waitForStepStatus(
  flowRunId: string,
  stepId: string,
  targetStatus: string,
  timeoutMs = 15000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await pool.query(
      'SELECT status FROM step_executions WHERE flow_run_id = $1 AND step_id = $2',
      [flowRunId, stepId]
    );
    if (result.rows[0]?.status === targetStatus) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Step ${stepId} did not reach status ${targetStatus} within ${timeoutMs}ms`
  );
}

export async function getFlowRunStatus(flowRunId: string): Promise<string> {
  const result = await pool.query(
    'SELECT status FROM flow_runs WHERE id = $1',
    [flowRunId]
  );
  return result.rows[0]?.status ?? 'UNKNOWN';
}

export async function waitForFlowRunStatus(
  flowRunId: string,
  targetStatus: string,
  timeoutMs = 15000
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await getFlowRunStatus(flowRunId);
    if (status === targetStatus) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `Flow run did not reach status ${targetStatus} within ${timeoutMs}ms`
  );
}

export async function closePool() {
  await pool.end();
}
