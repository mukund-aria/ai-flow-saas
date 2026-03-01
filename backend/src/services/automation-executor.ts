/**
 * Automation Executor
 *
 * Executes automation steps (SYSTEM_WEBHOOK, SYSTEM_EMAIL, REST_API, MCP_SERVER, etc.)
 * automatically when they transition to IN_PROGRESS.
 *
 * Called from completeStepAndAdvance() after activating a new step.
 * Uses an iterative loop (not recursion) to handle chains of auto-completing steps,
 * with a cap of 50 consecutive auto-executions to prevent misconfigured infinite loops.
 */

import { db, flowRuns, stepExecutions } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { stepRegistry } from '../config/step-registry.js';
import { resolveDDR, type DDRContext } from './ddr-resolver.js';
import { sseManager } from './sse-manager.js';

const MAX_AUTO_EXEC_CHAIN = 50;

// ============================================================================
// Types
// ============================================================================

interface RunContext {
  id: string;
  name: string;
  organizationId: string;
  startedById: string;
  flowId: string;
  dueAt?: Date | string | null;
  flow?: {
    id: string;
    name: string;
    definition?: Record<string, unknown> | null;
  } | null;
  stepExecutions: Array<{
    id: string;
    stepId: string;
    stepIndex: number;
    status: string;
    flowRunId: string;
    assignedToContactId?: string | null;
    resultData?: Record<string, unknown> | null;
    parallelGroupId?: string | null;
  }>;
}

// ============================================================================
// DDR Context Builder
// ============================================================================

/**
 * Build DDR evaluation context from a run's completed step outputs.
 */
export function buildDDRContext(run: RunContext): DDRContext {
  const definition = run.flow?.definition as any;
  const stepDefs = definition?.steps || [];

  const kickoffData: Record<string, unknown> = {};
  const stepOutputs: Record<string, Record<string, unknown>> = {};

  for (const se of run.stepExecutions) {
    if (se.status !== 'COMPLETED' || !se.resultData) continue;

    const stepDef = stepDefs.find(
      (s: any) => (s.stepId || s.id) === se.stepId
    );
    const stepName = stepDef?.config?.name || stepDef?.title;

    // Check if this is the kickoff step (index 0)
    if (se.stepIndex === 0) {
      Object.assign(kickoffData, se.resultData);
    }

    if (stepName) {
      stepOutputs[stepName] = se.resultData as Record<string, unknown>;
    }
  }

  return {
    kickoffData,
    stepOutputs,
    workspace: { name: '', id: run.organizationId },
  };
}

/**
 * Resolve DDR tokens in all string values of an object (shallow).
 */
function resolveDDRInObject(
  obj: Record<string, unknown>,
  ctx: DDRContext
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = resolveDDR(value, ctx);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Resolve DDR tokens recursively in strings, objects, and arrays.
 */
function resolveDDRDeep(value: unknown, ctx: DDRContext): unknown {
  if (typeof value === 'string') {
    return resolveDDR(value, ctx);
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveDDRDeep(item, ctx));
  }
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = resolveDDRDeep(v, ctx);
    }
    return result;
  }
  return value;
}

// ============================================================================
// JSON Path Helper
// ============================================================================

/**
 * Extract a value from an object using dot-notation path.
 * e.g. getByPath({ data: { id: 123 } }, "data.id") => 123
 */
function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Check if the given step auto-completes and execute it if so.
 *
 * This is designed to be called once after a step is activated.
 * If the step auto-completes, it will complete it and advance the flow.
 * If the NEXT step also auto-completes, the loop continues (up to MAX_AUTO_EXEC_CHAIN).
 */
export async function maybeAutoExecute(
  stepExecutionId: string,
  stepDef: Record<string, unknown> | undefined,
  run: RunContext
): Promise<void> {
  if (!stepDef) return;

  const stepType = (stepDef.type as string) || '';
  if (!stepRegistry.autoCompletes(stepType)) return;

  // Use an iterative loop to avoid deep recursion
  let currentStepExecId = stepExecutionId;
  let currentStepDef = stepDef;
  let chainCount = 0;

  while (chainCount < MAX_AUTO_EXEC_CHAIN) {
    chainCount++;
    const currentType = (currentStepDef.type as string) || '';

    if (!stepRegistry.autoCompletes(currentType)) {
      break; // Not an auto-completing step, stop
    }

    console.log(
      `[AutoExec] Executing ${currentType} step (${currentStepExecId}), chain depth: ${chainCount}`
    );

    try {
      const resultData = await executeAutomation(
        currentStepExecId,
        currentStepDef,
        run
      );

      // Re-fetch the run to get fresh state
      const freshRun = await db.query.flowRuns.findFirst({
        where: eq(flowRuns.id, run.id),
        with: {
          flow: true,
          stepExecutions: {
            orderBy: (se: any, { asc }: any) => [asc(se.stepIndex)],
          },
        },
      });

      if (!freshRun) break;

      // Complete step and advance using the shared helper
      const { completeStepAndAdvance } = await import('./step-completion.js');
      const definition = freshRun.flow?.definition as any;
      const stepDefs = (definition?.steps || []) as any[];

      const advanceResult = await completeStepAndAdvance({
        stepExecutionId: currentStepExecId,
        resultData: resultData || {},
        run: freshRun as any,
        stepDefs,
        skipAIReview: true,
        skipAutoExec: true,  // We handle chaining ourselves in the loop
      });

      if (advanceResult.flowCompleted || !advanceResult.nextStepId) {
        break; // Flow is done or no next step
      }

      // Check if the next step also auto-completes
      const nextStepExec = freshRun.stepExecutions.find(
        (se) => se.id === advanceResult.nextStepId
      );
      if (!nextStepExec) break;

      const nextStepDef = stepDefs.find(
        (s: any) => (s.stepId || s.id) === nextStepExec.stepId
      );
      if (!nextStepDef || !stepRegistry.autoCompletes(nextStepDef.type)) {
        break; // Next step doesn't auto-complete
      }

      // Continue the loop with the next step
      currentStepExecId = advanceResult.nextStepId;
      currentStepDef = nextStepDef;
      // Update run reference for DDR context
      Object.assign(run, freshRun);
    } catch (err) {
      console.error(
        `[AutoExec] Failed to execute ${currentType} step ${currentStepExecId}:`,
        err
      );

      // Mark step as FAILED
      await db
        .update(stepExecutions)
        .set({
          status: 'FAILED' as any,
          resultData: {
            error: err instanceof Error ? err.message : String(err),
            failedAt: new Date().toISOString(),
          },
        })
        .where(eq(stepExecutions.id, currentStepExecId));

      // Emit SSE event for coordinator visibility
      sseManager.emit(run.organizationId, {
        type: 'step.failed',
        data: {
          flowRunId: run.id,
          stepExecId: currentStepExecId,
          stepType: currentType,
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
        },
      });

      break; // Stop the chain on failure
    }
  }

  if (chainCount >= MAX_AUTO_EXEC_CHAIN) {
    console.warn(
      `[AutoExec] Hit max chain limit (${MAX_AUTO_EXEC_CHAIN}) for run ${run.id}. ` +
        'Possible misconfigured flow with too many consecutive automation steps.'
    );
  }
}

// ============================================================================
// Dispatcher
// ============================================================================

async function executeAutomation(
  stepExecutionId: string,
  stepDef: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const stepType = (stepDef.type as string) || '';
  const config = (stepDef.config as Record<string, unknown>) || stepDef;

  switch (stepType) {
    case 'SYSTEM_WEBHOOK':
      return executeWebhook(stepExecutionId, config, run);
    case 'SYSTEM_EMAIL':
      return executeEmail(stepExecutionId, config, run);
    case 'REST_API':
      return executeRestApi(stepExecutionId, config, run);
    case 'MCP_SERVER':
      return executeMcpServer(stepExecutionId, config, run);
    case 'AI_CUSTOM_PROMPT':
    case 'AI_EXTRACT':
    case 'AI_SUMMARIZE':
    case 'AI_TRANSCRIBE':
    case 'AI_TRANSLATE':
    case 'AI_WRITE':
      console.warn(`[AutoExec] AI step type ${stepType} auto-execution not yet implemented. Skipping.`);
      return { skipped: true, reason: 'AI auto-execution not yet implemented' };
    default:
      console.warn(`[AutoExec] Unknown auto-completing step type: ${stepType}. Skipping.`);
      return { skipped: true, reason: `Unknown step type: ${stepType}` };
  }
}

// ============================================================================
// SYSTEM_WEBHOOK Executor
// ============================================================================

async function executeWebhook(
  stepExecutionId: string,
  config: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const ctx = buildDDRContext(run);

  // Resolve webhook config
  const webhookConfig = (config.webhook as Record<string, unknown>) || config;
  const url = resolveDDR(String(webhookConfig.url || config.url || ''), ctx);
  const method = String(webhookConfig.method || config.method || 'POST').toUpperCase();

  // Resolve headers
  const rawHeaders = (webhookConfig.headers || config.headers || {}) as Record<string, string>;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...resolveDDRInObject(rawHeaders, ctx) as Record<string, string>,
  };

  // Resolve payload
  let body: string | undefined;
  const rawPayload = webhookConfig.payload || config.payload || config.body;
  if (rawPayload && ['POST', 'PUT', 'PATCH'].includes(method)) {
    const resolved = resolveDDRDeep(rawPayload, ctx);
    body = typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
  }

  console.log(`[AutoExec] SYSTEM_WEBHOOK: ${method} ${url}`);

  const controller = new AbortController();
  const timeout = Number(config.timeout || 30000);
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    let responseBody: unknown;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    return {
      statusCode: response.status,
      response: responseBody,
      executedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// SYSTEM_EMAIL Executor
// ============================================================================

async function executeEmail(
  stepExecutionId: string,
  config: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const ctx = buildDDRContext(run);

  const emailConfig = (config.email as Record<string, unknown>) || config;
  const toRaw = emailConfig.to as string[] | string;
  const toList = Array.isArray(toRaw) ? toRaw : [String(toRaw || '')];
  const resolvedTo = toList.map((addr) => resolveDDR(addr, ctx)).filter(Boolean);
  const subject = resolveDDR(String(emailConfig.subject || ''), ctx);
  const body = resolveDDR(String(emailConfig.body || ''), ctx);

  console.log(`[AutoExec] SYSTEM_EMAIL: Sending to ${resolvedTo.join(', ')}`);

  const { sendEmail } = await import('./email.js');

  for (const recipient of resolvedTo) {
    await sendEmail(recipient, subject, body);
  }

  return {
    sent: true,
    sentAt: new Date().toISOString(),
    recipients: resolvedTo,
  };
}

// ============================================================================
// REST_API Executor
// ============================================================================

async function executeRestApi(
  stepExecutionId: string,
  config: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const ctx = buildDDRContext(run);

  const apiConfig = (config.api as Record<string, unknown>) || config;
  const url = resolveDDR(String(apiConfig.url || config.url || ''), ctx);
  const method = String(apiConfig.method || config.method || 'GET').toUpperCase();

  // Resolve headers
  const rawHeaders = (apiConfig.headers || config.headers || {}) as Record<string, string>;
  const headers: Record<string, string> = {
    ...resolveDDRInObject(rawHeaders, ctx) as Record<string, string>,
  };

  // Auth
  const auth = (apiConfig.auth || config.auth) as Record<string, unknown> | undefined;
  if (auth) {
    const authType = String(auth.type || 'none');
    if (authType === 'bearer' && auth.token) {
      headers['Authorization'] = `Bearer ${resolveDDR(String(auth.token), ctx)}`;
    } else if (authType === 'basic' && auth.username && auth.password) {
      const username = resolveDDR(String(auth.username), ctx);
      const password = resolveDDR(String(auth.password), ctx);
      headers['Authorization'] = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }
  }

  // Auto-set content-type for POST/PUT/PATCH if not set
  if (['POST', 'PUT', 'PATCH'].includes(method) && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Resolve body
  let body: string | undefined;
  const rawBody = apiConfig.body || config.body;
  if (rawBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
    const resolved = resolveDDRDeep(rawBody, ctx);
    body = typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
  }

  console.log(`[AutoExec] REST_API: ${method} ${url}`);

  // Retry logic
  const retryPolicy = (apiConfig.retryPolicy || config.retryPolicy) as Record<string, unknown> | undefined;
  const maxRetries = Number(retryPolicy?.maxRetries || 0);
  const backoffMs = Number(retryPolicy?.backoffMs || 1000);
  const timeout = Number(apiConfig.timeout || config.timeout || 30000);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = backoffMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log(`[AutoExec] REST_API: Retry attempt ${attempt}/${maxRetries}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      let responseBody: unknown;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }

      const result: Record<string, unknown> = {
        statusCode: response.status,
        response: responseBody,
        headers: Object.fromEntries(response.headers.entries()),
        executedAt: new Date().toISOString(),
      };

      // Apply output mappings
      const outputMappings = (config.outputMappings || apiConfig.outputMappings) as
        | Array<{ responseJsonPath: string; outputKey: string }>
        | undefined;
      if (outputMappings && Array.isArray(outputMappings)) {
        for (const mapping of outputMappings) {
          const extracted = getByPath(responseBody, mapping.responseJsonPath);
          if (extracted !== undefined) {
            result[mapping.outputKey] = extracted;
          }
        }
      }

      clearTimeout(timer);
      return result;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt >= maxRetries) break;
    }
  }

  throw lastError || new Error('REST_API request failed');
}

// ============================================================================
// MCP_SERVER Executor
// ============================================================================

async function executeMcpServer(
  stepExecutionId: string,
  config: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const ctx = buildDDRContext(run);

  const mcpConfig = (config.mcp as Record<string, unknown>) || config;
  const serverUrl = resolveDDR(String(mcpConfig.serverUrl || config.serverUrl || ''), ctx);
  const toolName = resolveDDR(String(mcpConfig.toolName || config.toolName || ''), ctx);
  const timeout = Number(mcpConfig.timeout || config.timeout || 30000);

  // Resolve arguments
  const rawArgs = (mcpConfig.arguments || config.arguments || {}) as Record<string, unknown>;
  const resolvedArgs = resolveDDRDeep(rawArgs, ctx) as Record<string, unknown>;

  console.log(`[AutoExec] MCP_SERVER: Calling tool '${toolName}' on ${serverUrl}`);

  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js');
  const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js');

  // Try Streamable HTTP first, fall back to SSE
  let client: InstanceType<typeof Client>;
  let transport: InstanceType<typeof SSEClientTransport> | InstanceType<typeof StreamableHTTPClientTransport>;

  try {
    transport = new StreamableHTTPClientTransport(new URL(serverUrl));
    client = new Client({ name: 'serviceflow-automation', version: '1.0.0' });
    await client.connect(transport);
  } catch {
    // Fall back to SSE transport
    transport = new SSEClientTransport(new URL(serverUrl));
    client = new Client({ name: 'serviceflow-automation', version: '1.0.0' });
    await client.connect(transport);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const toolResult = await client.callTool({
        name: toolName,
        arguments: resolvedArgs,
      });

      clearTimeout(timer);

      const result: Record<string, unknown> = {
        toolName,
        result: toolResult,
        executedAt: new Date().toISOString(),
      };

      // Apply output mappings
      const outputMappings = (config.outputMappings || mcpConfig.outputMappings) as
        | Array<{ resultJsonPath: string; outputKey: string }>
        | undefined;
      if (outputMappings && Array.isArray(outputMappings)) {
        for (const mapping of outputMappings) {
          const extracted = getByPath(toolResult, mapping.resultJsonPath);
          if (extracted !== undefined) {
            result[mapping.outputKey] = extracted;
          }
        }
      }

      return result;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  } finally {
    try {
      await client.close();
    } catch {
      // Ignore close errors
    }
  }
}
