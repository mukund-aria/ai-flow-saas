/**
 * AI Assignee Service
 *
 * Provides AI-powered assistance for workflow step execution:
 * - AI Prepare: Pre-fills form fields based on prior step data
 * - AI Advise: Recommends actions for decision/approval steps
 * - AI Review: Reviews submissions before completion
 * - Flow Summary: Generates executive summaries of completed flows
 * - Chat: Contextual AI chat for form help and flow-level questions
 */

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db/client.js';
import { stepExecutions, flows, templates, organizations } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { Response } from 'express';

const anthropic = new Anthropic();

const HAIKU_MODEL = 'claude-haiku-4-5-20251001';
const SONNET_MODEL = 'claude-sonnet-4-6';

// ============================================================================
// DDR Context Builder
// ============================================================================

export interface DDRContext {
  kickoffData: Record<string, unknown>;
  stepOutputs: Record<string, Record<string, unknown>>;
  roleAssignments: Record<string, string>;
  workspace: string;
  flowName: string;
  currentStep: {
    id: string;
    stepId: string;
    stepIndex: number;
    status: string;
  } | null;
}

/**
 * Build dynamic data reference context from a flow run.
 * Gathers kickoff data, completed step outputs, role assignments,
 * and workspace info for use in AI prompts.
 */
export async function buildDDRContext(flowId: string): Promise<DDRContext> {
  const run = await db.query.flows.findFirst({
    where: eq(flows.id, flowId),
    with: {
      template: true,
      stepExecutions: {
        orderBy: (se: any, { asc }: any) => [asc(se.stepIndex)],
      },
    },
  });

  if (!run) {
    return {
      kickoffData: {},
      stepOutputs: {},
      roleAssignments: {},
      workspace: '',
      flowName: '',
      currentStep: null,
    };
  }

  // Get organization name
  let workspace = '';
  if (run.organizationId) {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, run.organizationId),
    });
    workspace = org?.name || '';
  }

  // Build step outputs from completed steps
  const definition = run.template?.definition as { steps?: Array<Record<string, unknown>> } | null;
  const stepDefs = (definition?.steps || []) as any[];
  const stepOutputs: Record<string, Record<string, unknown>> = {};

  for (const se of run.stepExecutions) {
    if (se.status === 'COMPLETED' && se.resultData) {
      const defStep = stepDefs.find((s: any) => (s.stepId || s.id) === se.stepId);
      const name = defStep?.config?.name;
      if (name) {
        stepOutputs[name] = se.resultData as Record<string, unknown>;
      }
    }
  }

  // Find current (active) step
  const activeStep = run.stepExecutions.find(
    (se) => se.status === 'IN_PROGRESS' || se.status === 'WAITING_FOR_ASSIGNEE'
  );

  return {
    kickoffData: (run.kickoffData as Record<string, unknown>) || {},
    stepOutputs,
    roleAssignments: (run.roleAssignments as Record<string, string>) || {},
    workspace,
    flowName: run.template?.name || '',
    currentStep: activeStep
      ? {
          id: activeStep.id,
          stepId: activeStep.stepId,
          stepIndex: activeStep.stepIndex,
          status: activeStep.status,
        }
      : null,
  };
}

// ============================================================================
// AI Prepare (Pre-fill form fields)
// ============================================================================

export interface AIPrepareResult {
  status: 'COMPLETED' | 'FAILED';
  prefilledFields: Record<string, unknown>;
  confidence: number;
  reasoning: string;
  preparedAt: string;
}

/**
 * Build the AI Prepare prompt from a step definition and DDR context.
 * Pure function — no DB access.
 */
export function buildAIPreparePrompt(
  stepDef: Record<string, unknown>,
  context: DDRContext
): string {
  const config = (stepDef.config || stepDef) as Record<string, unknown>;
  const formFields = (config.formFields || []) as Array<Record<string, unknown>>;
  const aiPrepareConfig = config.aiPrepare as Record<string, unknown> | undefined;
  const customPrompt = (aiPrepareConfig?.prompt as string) || '';

  return `You are an AI assistant helping pre-fill a form in a business workflow.

## Workflow Context
- Flow: ${context.flowName}
- Workspace: ${context.workspace}
- Kickoff Data: ${JSON.stringify(context.kickoffData, null, 2)}
- Previous Step Outputs: ${JSON.stringify(context.stepOutputs, null, 2)}
- Role Assignments: ${JSON.stringify(context.roleAssignments, null, 2)}

## Form Fields to Pre-fill
${JSON.stringify(formFields, null, 2)}

${customPrompt ? `## Coordinator Instructions\n${customPrompt}\n` : ''}
Based on the workflow context above, pre-fill the form fields with the most appropriate values.
Only fill fields where you have reasonable confidence from the context data.

Respond in JSON format:
{
  "prefilledFields": { "fieldLabel": "suggestedValue", ... },
  "confidence": 0.0 to 1.0,
  "reasoning": "Brief explanation of how values were derived"
}`;
}

/**
 * Parse the AI Prepare response into a result object.
 */
function parseAIPrepareResponse(text: string): AIPrepareResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      status: 'COMPLETED',
      prefilledFields: parsed.prefilledFields || {},
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reasoning: parsed.reasoning || '',
      preparedAt: new Date().toISOString(),
    };
  }
  return {
    status: 'FAILED',
    prefilledFields: {},
    confidence: 0,
    reasoning: 'Could not parse AI response',
    preparedAt: new Date().toISOString(),
  };
}

/**
 * Use AI to pre-fill form fields based on context from prior steps.
 */
export async function runAIPrepare(
  stepExecId: string,
  stepDef: Record<string, unknown>,
  flowId: string
): Promise<AIPrepareResult> {
  try {
    const context = await buildDDRContext(flowId);
    const prompt = buildAIPreparePrompt(stepDef, context);

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const result = parseAIPrepareResponse(text);

    // Store result in step execution
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecId),
    });
    if (stepExec) {
      const existingData = (stepExec.resultData as Record<string, unknown>) || {};
      await db
        .update(stepExecutions)
        .set({ resultData: { ...existingData, _aiPrepare: result } })
        .where(eq(stepExecutions.id, stepExecId));
    }

    return result;
  } catch (error) {
    console.error('[AI Prepare] Error:', error);
    const failedResult: AIPrepareResult = {
      status: 'FAILED',
      prefilledFields: {},
      confidence: 0,
      reasoning: `AI prepare failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      preparedAt: new Date().toISOString(),
    };

    // Store failure result
    try {
      const stepExec = await db.query.stepExecutions.findFirst({
        where: eq(stepExecutions.id, stepExecId),
      });
      if (stepExec) {
        const existingData = (stepExec.resultData as Record<string, unknown>) || {};
        await db
          .update(stepExecutions)
          .set({ resultData: { ...existingData, _aiPrepare: failedResult } })
          .where(eq(stepExecutions.id, stepExecId));
      }
    } catch {}

    return failedResult;
  }
}

// ============================================================================
// AI Advise (Recommend actions)
// ============================================================================

export interface AIAdviseResult {
  status: 'COMPLETED' | 'FAILED';
  recommendation: string;
  reasoning: string;
  supportingData: Record<string, unknown>;
  advisedAt: string;
}

/**
 * Use AI to recommend an action for a step (decision, approval, etc.).
 */
/**
 * Build the AI Advise prompt from a step definition and DDR context.
 * Pure function — no DB access.
 */
export function buildAIAdvisePrompt(
  stepDef: Record<string, unknown>,
  context: DDRContext
): string {
  const config = (stepDef.config || stepDef) as Record<string, unknown>;
  const stepType = (stepDef.type as string) || 'UNKNOWN';
  const aiAdviseConfig = config.aiAdvise as Record<string, unknown> | undefined;
  const customPrompt = (aiAdviseConfig?.prompt as string) || '';

  let typeContext = '';
  if (stepType === 'DECISION') {
    const outcomes = (config.outcomes || config.options || []) as Array<Record<string, unknown>>;
    typeContext = `\n## Decision Options\n${JSON.stringify(outcomes, null, 2)}`;
  } else if (stepType === 'APPROVAL') {
    typeContext = '\n## Approval Options\nThe assignee can APPROVE or REJECT this step.';
  } else if (stepType === 'FORM') {
    const formFields = (config.formFields || []) as Array<Record<string, unknown>>;
    typeContext = `\n## Form Fields\n${JSON.stringify(formFields, null, 2)}`;
  } else if (stepType === 'FILE_REQUEST') {
    const fileConfig = (config.fileRequest || config) as Record<string, unknown>;
    typeContext = `\n## File Request\nRequired files: ${JSON.stringify(fileConfig.requiredFileTypes || fileConfig.description || 'Not specified')}`;
  }

  return `You are an AI advisor helping with a ${stepType} step in a business workflow.

## Workflow Context
- Flow: ${context.flowName}
- Workspace: ${context.workspace}
- Kickoff Data: ${JSON.stringify(context.kickoffData, null, 2)}
- Previous Step Outputs: ${JSON.stringify(context.stepOutputs, null, 2)}
- Role Assignments: ${JSON.stringify(context.roleAssignments, null, 2)}
${typeContext}

${customPrompt ? `## Coordinator Instructions\n${customPrompt}\n` : ''}
Based on the workflow context, provide a recommendation for this ${stepType} step.

Respond in JSON format:
{
  "recommendation": "Your recommended action or approach",
  "reasoning": "Why this recommendation makes sense given the context",
  "supportingData": { "relevant key": "supporting detail" }
}`;
}

/**
 * Parse the AI Advise response into a result object.
 */
function parseAIAdviseResponse(text: string): AIAdviseResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      status: 'COMPLETED',
      recommendation: parsed.recommendation || '',
      reasoning: parsed.reasoning || '',
      supportingData: parsed.supportingData || {},
      advisedAt: new Date().toISOString(),
    };
  }
  return {
    status: 'FAILED',
    recommendation: '',
    reasoning: 'Could not parse AI response',
    supportingData: {},
    advisedAt: new Date().toISOString(),
  };
}

export async function runAIAdvise(
  stepExecId: string,
  stepDef: Record<string, unknown>,
  flowId: string
): Promise<AIAdviseResult> {
  try {
    const context = await buildDDRContext(flowId);
    const prompt = buildAIAdvisePrompt(stepDef, context);

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const result = parseAIAdviseResponse(text);

    // Store result
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecId),
    });
    if (stepExec) {
      const existingData = (stepExec.resultData as Record<string, unknown>) || {};
      await db
        .update(stepExecutions)
        .set({ resultData: { ...existingData, _aiAdvise: result } })
        .where(eq(stepExecutions.id, stepExecId));
    }

    return result;
  } catch (error) {
    console.error('[AI Advise] Error:', error);
    const failedResult: AIAdviseResult = {
      status: 'FAILED',
      recommendation: '',
      reasoning: `AI advise failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      supportingData: {},
      advisedAt: new Date().toISOString(),
    };

    try {
      const stepExec = await db.query.stepExecutions.findFirst({
        where: eq(stepExecutions.id, stepExecId),
      });
      if (stepExec) {
        const existingData = (stepExec.resultData as Record<string, unknown>) || {};
        await db
          .update(stepExecutions)
          .set({ resultData: { ...existingData, _aiAdvise: failedResult } })
          .where(eq(stepExecutions.id, stepExecId));
      }
    } catch {}

    return failedResult;
  }
}

// ============================================================================
// AI Review (Review submissions)
// ============================================================================

export interface AIReviewResult {
  status: 'APPROVED' | 'REVISION_NEEDED';
  feedback: string;
  issues: string[];
  reviewedAt: string;
}

/**
 * Build the AI Review prompt from a step definition and submitted data.
 * Pure function — no DB access.
 */
export function buildAIReviewPrompt(
  stepDef: Record<string, unknown>,
  submittedData: Record<string, unknown>
): string {
  const config = (stepDef.config || stepDef) as Record<string, unknown>;
  const aiReviewConfig = config.aiReview as Record<string, unknown> | undefined;
  const criteria = (aiReviewConfig?.criteria as string) ||
    'Review the submission for completeness, accuracy, and quality. Check that all required information is present and properly formatted.';

  return `You are reviewing a submission in a business workflow step.

## Step Type: ${(stepDef.type as string) || 'FORM'}
## Step Name: ${(config.name as string) || 'Unknown'}

## Review Criteria
${criteria}

## Submitted Data
${JSON.stringify(submittedData, null, 2)}

Review the submission against the criteria. Be reasonable - only flag genuine issues.

Respond in JSON format:
{
  "status": "APPROVED" or "REVISION_NEEDED",
  "feedback": "Brief overall assessment",
  "issues": ["List of specific issues if any"]
}`;
}

/**
 * Parse the AI Review response into a result object.
 */
function parseAIReviewResponse(text: string): AIReviewResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      status: parsed.status === 'REVISION_NEEDED' ? 'REVISION_NEEDED' : 'APPROVED',
      feedback: parsed.feedback || 'Review complete.',
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      reviewedAt: new Date().toISOString(),
    };
  }
  return {
    status: 'APPROVED',
    feedback: 'Review complete. Submission appears acceptable.',
    issues: [],
    reviewedAt: new Date().toISOString(),
  };
}

export async function runAIReview(
  stepExecId: string,
  stepDef: Record<string, unknown>,
  submittedData: Record<string, unknown>
): Promise<AIReviewResult> {
  try {
    const prompt = buildAIReviewPrompt(stepDef, submittedData);

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const result = parseAIReviewResponse(text);

    // Store result
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecId),
    });
    if (stepExec) {
      const existingData = (stepExec.resultData as Record<string, unknown>) || {};
      await db
        .update(stepExecutions)
        .set({ resultData: { ...existingData, _aiReview: result } })
        .where(eq(stepExecutions.id, stepExecId));
    }

    return result;
  } catch (error) {
    console.error('[AI Review] Error:', error);
    const fallbackResult: AIReviewResult = {
      status: 'APPROVED',
      feedback: 'AI review could not be completed. Submission accepted by default.',
      issues: [],
      reviewedAt: new Date().toISOString(),
    };

    try {
      const stepExec = await db.query.stepExecutions.findFirst({
        where: eq(stepExecutions.id, stepExecId),
      });
      if (stepExec) {
        const existingData = (stepExec.resultData as Record<string, unknown>) || {};
        await db
          .update(stepExecutions)
          .set({ resultData: { ...existingData, _aiReview: fallbackResult } })
          .where(eq(stepExecutions.id, stepExecId));
      }
    } catch {}

    return fallbackResult;
  }
}

// ============================================================================
// Flow Summary
// ============================================================================

export interface FlowSummaryResult {
  summary: string;
  keyDecisions: string[];
  timeline: Array<{ step: string; completedAt: string; outcome: string }>;
  generatedAt: string;
}

/**
 * Generate an executive summary of a completed flow run.
 */
export async function generateFlowSummary(flowId: string): Promise<FlowSummaryResult> {
  try {
    const run = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
      with: {
        template: true,
        stepExecutions: {
          orderBy: (se: any, { asc }: any) => [asc(se.stepIndex)],
        },
      },
    });

    if (!run) {
      throw new Error('Flow run not found');
    }

    const definition = run.template?.definition as { steps?: Array<Record<string, unknown>> } | null;
    const stepDefs = (definition?.steps || []) as any[];

    // Build step timeline
    const stepDetails = run.stepExecutions.map((se) => {
      const defStep = stepDefs.find((s: any) => (s.stepId || s.id) === se.stepId);
      return {
        name: defStep?.config?.name || `Step ${se.stepIndex + 1}`,
        type: defStep?.type || 'UNKNOWN',
        status: se.status,
        resultData: se.resultData || {},
        completedAt: se.completedAt?.toISOString() || null,
      };
    });

    const prompt = `You are generating an executive summary of a completed business workflow.

## Flow Details
- Name: ${run.template?.name || 'Unknown'}
- Started: ${run.startedAt?.toISOString() || 'Unknown'}
- Completed: ${run.completedAt?.toISOString() || 'Unknown'}
- Kickoff Data: ${JSON.stringify(run.kickoffData || {}, null, 2)}

## Steps Completed
${JSON.stringify(stepDetails, null, 2)}

Generate a concise executive summary of this workflow execution.

Respond in JSON format:
{
  "summary": "2-3 sentence executive summary",
  "keyDecisions": ["List of key decisions or outcomes"],
  "timeline": [{"step": "Step Name", "completedAt": "ISO date", "outcome": "Brief outcome"}]
}`;

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let result: FlowSummaryResult;

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      result = {
        summary: parsed.summary || '',
        keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
        generatedAt: new Date().toISOString(),
      };
    } else {
      result = {
        summary: 'Summary could not be generated.',
        keyDecisions: [],
        timeline: [],
        generatedAt: new Date().toISOString(),
      };
    }

    // Store in flow's kickoffData under _aiSummary key
    const existingKickoff = (run.kickoffData as Record<string, unknown>) || {};
    await db
      .update(flows)
      .set({ kickoffData: { ...existingKickoff, _aiSummary: result } })
      .where(eq(flows.id, flowId));

    return result;
  } catch (error) {
    console.error('[AI Summary] Error:', error);
    const fallbackResult: FlowSummaryResult = {
      summary: 'Summary generation failed.',
      keyDecisions: [],
      timeline: [],
      generatedAt: new Date().toISOString(),
    };
    return fallbackResult;
  }
}

// ============================================================================
// Form Chat (SSE streaming)
// ============================================================================

/**
 * Handle AI chat for form field assistance. Streams response via SSE.
 */
export async function handleFormChat(
  stepExecId: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  flowId: string,
  res: Response
): Promise<void> {
  try {
    const context = await buildDDRContext(flowId);

    // Get step definition for form field context
    const run = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
      with: { template: true },
    });

    const definition = run?.template?.definition as { steps?: Array<Record<string, unknown>> } | null;
    const stepDefs = (definition?.steps || []) as any[];
    const stepExec = await db.query.stepExecutions.findFirst({
      where: eq(stepExecutions.id, stepExecId),
    });
    const stepDef = stepExec
      ? stepDefs.find((s: any) => (s.stepId || s.id) === stepExec.stepId)
      : null;
    const formFields = stepDef?.config?.formFields || [];

    const systemPrompt = `You are a helpful assistant guiding a user through filling out a form in a business workflow.

## Workflow Context
- Flow: ${context.flowName}
- Workspace: ${context.workspace}
- Kickoff Data: ${JSON.stringify(context.kickoffData)}
- Previous Step Outputs: ${JSON.stringify(context.stepOutputs)}

## Form Fields
${JSON.stringify(formFields, null, 2)}

Help the user understand what information is needed and provide suggestions based on the workflow context.
Keep responses concise and actionable.`;

    const messages: Anthropic.Messages.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const stream = anthropic.messages.stream({
      model: SONNET_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[Form Chat] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Chat service temporarily unavailable.' })}\n\n`);
    res.end();
  }
}

// ============================================================================
// AI Chat (Flow-level SSE streaming)
// ============================================================================

/**
 * Handle AI chat for flow-level questions. Streams response via SSE.
 */
export async function handleAIChat(
  flowId: string,
  message: string,
  history: Array<{ role: string; content: string }>,
  res: Response
): Promise<void> {
  try {
    const context = await buildDDRContext(flowId);

    // Get full flow run status
    const run = await db.query.flows.findFirst({
      where: eq(flows.id, flowId),
      with: {
        template: true,
        stepExecutions: {
          orderBy: (se: any, { asc }: any) => [asc(se.stepIndex)],
        },
      },
    });

    const definition = run?.template?.definition as { steps?: Array<Record<string, unknown>> } | null;
    const stepDefs = (definition?.steps || []) as any[];

    const stepStatuses = (run?.stepExecutions || []).map((se) => {
      const defStep = stepDefs.find((s: any) => (s.stepId || s.id) === se.stepId);
      return {
        name: defStep?.config?.name || `Step ${se.stepIndex + 1}`,
        type: defStep?.type || 'UNKNOWN',
        status: se.status,
      };
    });

    const systemPrompt = `You are an AI assistant for a business workflow.

## Flow: ${context.flowName}
## Workspace: ${context.workspace}
## Status: ${run?.status || 'UNKNOWN'}

## Kickoff Data
${JSON.stringify(context.kickoffData, null, 2)}

## Step Statuses
${JSON.stringify(stepStatuses, null, 2)}

## Completed Step Outputs
${JSON.stringify(context.stepOutputs, null, 2)}

Answer questions about this workflow run, its progress, step outcomes, and provide guidance.
Keep responses concise and relevant.`;

    const messages: Anthropic.Messages.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const stream = anthropic.messages.stream({
      model: SONNET_MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', content: 'Chat service temporarily unavailable.' })}\n\n`);
    res.end();
  }
}

// ============================================================================
// Test / Preview Functions (No DB writes)
// ============================================================================

export interface AITestContext {
  kickoffData?: Record<string, unknown>;
  priorStepOutputs?: Record<string, Record<string, unknown>>;
}

/**
 * Build a DDRContext from test sample data (no DB access).
 */
function buildTestDDRContext(context?: AITestContext): DDRContext {
  return {
    kickoffData: context?.kickoffData || {},
    stepOutputs: context?.priorStepOutputs || {},
    roleAssignments: {},
    workspace: 'Test Workspace',
    flowName: 'Test Flow',
    currentStep: null,
  };
}

/**
 * Extract text from an Anthropic API response.
 */
function extractResponseText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

/**
 * Test AI Review with sample data — no DB writes.
 */
export async function testAIReview(
  stepDef: Record<string, unknown>,
  sampleData: Record<string, unknown>,
  _context?: AITestContext
): Promise<AIReviewResult> {
  const prompt = buildAIReviewPrompt(stepDef, sampleData);
  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return parseAIReviewResponse(extractResponseText(response));
}

/**
 * Test AI Prepare with sample context — no DB writes.
 */
export async function testAIPrepare(
  stepDef: Record<string, unknown>,
  context?: AITestContext
): Promise<AIPrepareResult> {
  const ddrContext = buildTestDDRContext(context);
  const prompt = buildAIPreparePrompt(stepDef, ddrContext);
  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return parseAIPrepareResponse(extractResponseText(response));
}

/**
 * Test AI Advise with sample data — no DB writes.
 */
export async function testAIAdvise(
  stepDef: Record<string, unknown>,
  _sampleData: Record<string, unknown>,
  context?: AITestContext
): Promise<AIAdviseResult> {
  const ddrContext = buildTestDDRContext(context);
  const prompt = buildAIAdvisePrompt(stepDef, ddrContext);
  const response = await anthropic.messages.create({
    model: HAIKU_MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return parseAIAdviseResponse(extractResponseText(response));
}
