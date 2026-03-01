/**
 * AI Step Executor
 *
 * Executes AI automation steps (AI_CUSTOM_PROMPT, AI_EXTRACT, AI_SUMMARIZE,
 * AI_TRANSLATE, AI_WRITE) by calling Claude with DDR-resolved inputs and
 * returning structured output matching the step's output fields.
 */

import Anthropic from '@anthropic-ai/sdk';
import { buildDDRContext, type RunContext } from './automation-executor.js';
import { resolveDDR } from './ddr-resolver.js';

const anthropic = new Anthropic();
const MODEL = 'claude-haiku-4-5-20251001';

// ============================================================================
// Types
// ============================================================================

interface AIInputField {
  fieldId: string;
  name: string;
  type: string;
  value: string;
}

interface AIOutputField {
  fieldId: string;
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  fileFormat?: string;
}

interface AIAutomationConfig {
  actionType: string;
  inputFields: AIInputField[];
  outputFields: AIOutputField[];
  knowledgeSources: string[];
  prompt: string;
  humanReview?: boolean;
}

// ============================================================================
// Main Entry Point
// ============================================================================

export async function executeAIStep(
  stepType: string,
  config: Record<string, unknown>,
  run: RunContext
): Promise<Record<string, unknown>> {
  const aiConfig = (config.aiAutomation || config) as unknown as AIAutomationConfig;

  if (!aiConfig.actionType && !aiConfig.prompt) {
    return { skipped: true, reason: 'No AI automation config found' };
  }

  const ddrCtx = buildDDRContext(run);

  // Resolve DDR tokens in input field values
  const resolvedInputs: Record<string, string> = {};
  for (const input of aiConfig.inputFields || []) {
    resolvedInputs[input.name] = resolveDDR(input.value, ddrCtx);
  }

  // Resolve DDR tokens in the prompt
  const prompt = resolveDDR(aiConfig.prompt || '', ddrCtx);

  // Build messages based on step type
  const systemPrompt = buildSystemPrompt(stepType, aiConfig, resolvedInputs);
  const userMessage = buildUserMessage(stepType, aiConfig, resolvedInputs, prompt);

  console.log(`[AIExec] Executing ${stepType} with ${Object.keys(resolvedInputs).length} inputs, ${(aiConfig.outputFields || []).length} output fields`);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  return parseAIOutput(aiConfig, text);
}

// ============================================================================
// Prompt Builders
// ============================================================================

function buildSystemPrompt(
  stepType: string,
  config: AIAutomationConfig,
  _inputs: Record<string, string>
): string {
  const outputSchema = (config.outputFields || [])
    .map(f => `  - "${f.name}" (${f.type}${f.required ? ', required' : ''})${f.description ? `: ${f.description}` : ''}`)
    .join('\n');

  const base = `You are an AI assistant executing an automation step in a business workflow. Your task is to process the given inputs and produce structured output.\n\nYou MUST respond with valid JSON matching the output schema below. Do NOT include any text outside the JSON object.\n\nOutput fields:\n${outputSchema || '  - "result" (TEXT): The output'}`;

  switch (stepType) {
    case 'AI_EXTRACT':
      return `${base}\n\nYour role: Extract specific data fields from the provided text or document content. Be precise and extract exact values. If a field cannot be found, set it to null.`;

    case 'AI_SUMMARIZE':
      return `${base}\n\nYour role: Summarize the provided content. Be concise but comprehensive. Capture the key points and important details.`;

    case 'AI_TRANSLATE':
      return `${base}\n\nYour role: Translate the provided content accurately. Preserve meaning, tone, and formatting. Use domain-appropriate terminology.`;

    case 'AI_WRITE':
      return `${base}\n\nYour role: Generate written content based on the provided instructions and context. Match the requested tone, style, and format.`;

    case 'AI_CUSTOM_PROMPT':
    default:
      return `${base}\n\nYour role: Follow the user's instructions precisely and produce the requested output.`;
  }
}

function buildUserMessage(
  stepType: string,
  config: AIAutomationConfig,
  inputs: Record<string, string>,
  prompt: string
): string {
  const parts: string[] = [];

  // Add inputs
  if (Object.keys(inputs).length > 0) {
    parts.push('## Inputs\n');
    for (const [name, value] of Object.entries(inputs)) {
      parts.push(`**${name}:**\n${value}\n`);
    }
  }

  // Add knowledge sources context
  if (config.knowledgeSources?.length > 0) {
    parts.push(`## Knowledge Sources\nReference documents: ${config.knowledgeSources.join(', ')}\n`);
  }

  // Add type-specific instructions
  switch (stepType) {
    case 'AI_EXTRACT':
      parts.push('## Task\nExtract the following fields from the input:\n');
      for (const field of config.outputFields || []) {
        parts.push(`- **${field.name}** (${field.type})${field.description ? `: ${field.description}` : ''}`);
      }
      break;

    case 'AI_SUMMARIZE':
      parts.push('## Task\nSummarize the input content.\n');
      break;

    case 'AI_TRANSLATE':
      parts.push('## Task\nTranslate the input content.\n');
      break;

    case 'AI_WRITE':
      parts.push('## Task\nGenerate the requested content.\n');
      break;
  }

  // Add user prompt
  if (prompt) {
    parts.push(`## Instructions\n${prompt}\n`);
  }

  // Remind about output format
  const outputFieldNames = (config.outputFields || []).map(f => f.name);
  if (outputFieldNames.length > 0) {
    parts.push(`\n## Required Output Format\nRespond with a JSON object containing these keys: ${outputFieldNames.map(n => `"${n}"`).join(', ')}`);
  } else {
    parts.push('\n## Required Output Format\nRespond with a JSON object containing a "result" key with your output.');
  }

  return parts.join('\n');
}

// ============================================================================
// Output Parser
// ============================================================================

function parseAIOutput(
  config: AIAutomationConfig,
  text: string
): Record<string, unknown> {
  // Try to parse JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      const result: Record<string, unknown> = {
        executedAt: new Date().toISOString(),
      };

      // Map parsed values to output fields
      for (const field of config.outputFields || []) {
        const value = parsed[field.name] ?? parsed[field.fieldId];
        if (value !== undefined) {
          result[field.name] = value;
        }
      }

      // If no output fields matched, include all parsed data
      if (Object.keys(result).length <= 1) {
        Object.assign(result, parsed);
      }

      return result;
    } catch {
      // Fall through to plain text handling
    }
  }

  // If JSON parsing fails, return the raw text as the result
  const primaryField = config.outputFields?.[0]?.name || 'result';
  return {
    [primaryField]: text.trim(),
    executedAt: new Date().toISOString(),
  };
}
