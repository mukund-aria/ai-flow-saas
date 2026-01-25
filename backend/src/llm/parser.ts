/**
 * AI Response Parser
 *
 * Parses and validates structured JSON responses from the AI.
 * Handles extraction from markdown code blocks and validates
 * against expected response schemas.
 */

import type {
  AIResponse,
  CreateResponse,
  EditResponse,
  ClarifyResponse,
  RejectResponse,
  ParseResult,
  ResponseValidationError,
  ResponseValidationResult,
} from './types.js';

// ============================================================================
// Main Parser
// ============================================================================

/**
 * Parse AI response from raw string content
 */
export function parseAIResponse(content: string): ParseResult {
  const errors: string[] = [];

  // Step 1: Extract JSON from content (may be wrapped in markdown)
  const jsonContent = extractJSON(content);

  if (!jsonContent) {
    return {
      success: false,
      errors: ['Could not find valid JSON in response'],
      rawContent: content,
    };
  }

  // Step 2: Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    return {
      success: false,
      errors: [`Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}`],
      rawContent: content,
    };
  }

  // Step 3: Validate structure
  if (!parsed || typeof parsed !== 'object') {
    return {
      success: false,
      errors: ['Response must be a JSON object'],
      rawContent: content,
    };
  }

  const obj = parsed as Record<string, unknown>;

  // Step 4: Check mode
  if (!obj.mode || typeof obj.mode !== 'string') {
    return {
      success: false,
      errors: ['Response must have a "mode" field'],
      rawContent: content,
    };
  }

  // Step 5: Parse based on mode
  const mode = obj.mode as string;

  switch (mode) {
    case 'create':
      return parseCreateResponse(obj, content);
    case 'edit':
      return parseEditResponse(obj, content);
    case 'clarify':
      return parseClarifyResponse(obj, content);
    case 'reject':
      return parseRejectResponse(obj, content);
    default:
      return {
        success: false,
        errors: [`Unknown response mode: ${mode}. Expected: create, edit, clarify, or reject`],
        rawContent: content,
      };
  }
}

// ============================================================================
// Mode-Specific Parsers
// ============================================================================

function parseCreateResponse(obj: Record<string, unknown>, rawContent: string): ParseResult {
  const errors: string[] = [];

  // Validate workflow
  if (!obj.workflow || typeof obj.workflow !== 'object') {
    errors.push('Create response must have a "workflow" object');
  }

  // Validate message (optional but recommended)
  if (obj.message && typeof obj.message !== 'string') {
    errors.push('"message" must be a string');
  }

  if (errors.length > 0) {
    return { success: false, errors, rawContent };
  }

  // Validate workflow structure
  const workflowValidation = validateWorkflowStructure(obj.workflow as Record<string, unknown>);
  if (!workflowValidation.valid) {
    return {
      success: false,
      errors: workflowValidation.errors.map(e => `${e.field}: ${e.message}`),
      rawContent,
    };
  }

  const response: CreateResponse = {
    mode: 'create',
    workflow: obj.workflow as CreateResponse['workflow'],
    message: (obj.message as string) || 'Workflow created',
  };

  return { success: true, response, rawContent };
}

function parseEditResponse(obj: Record<string, unknown>, rawContent: string): ParseResult {
  const errors: string[] = [];

  // Validate operations
  if (!obj.operations || !Array.isArray(obj.operations)) {
    errors.push('Edit response must have an "operations" array');
  }

  // Validate message (optional but recommended)
  if (obj.message && typeof obj.message !== 'string') {
    errors.push('"message" must be a string');
  }

  if (errors.length > 0) {
    return { success: false, errors, rawContent };
  }

  // Validate each operation
  const operations = obj.operations as unknown[];
  for (let i = 0; i < operations.length; i++) {
    const opValidation = validateOperation(operations[i], i);
    if (!opValidation.valid) {
      errors.push(...opValidation.errors.map(e => `operations[${i}].${e.field}: ${e.message}`));
    }
  }

  if (errors.length > 0) {
    return { success: false, errors, rawContent };
  }

  const response: EditResponse = {
    mode: 'edit',
    operations: obj.operations as EditResponse['operations'],
    message: (obj.message as string) || 'Workflow updated',
  };

  return { success: true, response, rawContent };
}

function parseClarifyResponse(obj: Record<string, unknown>, rawContent: string): ParseResult {
  const errors: string[] = [];

  // Validate questions
  if (!obj.questions || !Array.isArray(obj.questions)) {
    errors.push('Clarify response must have a "questions" array');
  } else if (obj.questions.length === 0) {
    errors.push('Clarify response must have at least one question');
  } else {
    // Validate each question
    for (let i = 0; i < (obj.questions as unknown[]).length; i++) {
      const q = (obj.questions as unknown[])[i] as Record<string, unknown>;
      if (!q.id || typeof q.id !== 'string') {
        errors.push(`questions[${i}].id must be a string`);
      }
      if (!q.text || typeof q.text !== 'string') {
        errors.push(`questions[${i}].text must be a string`);
      }
    }
  }

  // Validate context (optional but recommended)
  if (obj.context && typeof obj.context !== 'string') {
    errors.push('"context" must be a string');
  }

  if (errors.length > 0) {
    return { success: false, errors, rawContent };
  }

  const response: ClarifyResponse = {
    mode: 'clarify',
    questions: obj.questions as ClarifyResponse['questions'],
    context: (obj.context as string) || '',
  };

  return { success: true, response, rawContent };
}

function parseRejectResponse(obj: Record<string, unknown>, rawContent: string): ParseResult {
  const errors: string[] = [];

  // Validate reason
  if (!obj.reason || typeof obj.reason !== 'string') {
    errors.push('Reject response must have a "reason" string');
  }

  // Validate suggestion (optional but recommended)
  if (obj.suggestion && typeof obj.suggestion !== 'string') {
    errors.push('"suggestion" must be a string');
  }

  if (errors.length > 0) {
    return { success: false, errors, rawContent };
  }

  const response: RejectResponse = {
    mode: 'reject',
    reason: obj.reason as string,
    suggestion: (obj.suggestion as string) || '',
  };

  return { success: true, response, rawContent };
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate basic workflow structure
 * Note: flowId and stepIds are optional here - the handler adds them if missing
 */
function validateWorkflowStructure(workflow: Record<string, unknown>): ResponseValidationResult {
  const errors: ResponseValidationError[] = [];

  // flowId is optional - handler will add it if missing
  if (workflow.flowId && typeof workflow.flowId !== 'string') {
    errors.push({ field: 'flowId', message: 'must be a string if provided' });
  }

  // Name is required
  if (!workflow.name || typeof workflow.name !== 'string') {
    errors.push({ field: 'name', message: 'must be a string' });
  }

  // Steps array is required (can be empty)
  if (!workflow.steps || !Array.isArray(workflow.steps)) {
    errors.push({ field: 'steps', message: 'must be an array' });
  }

  // Optional but must be correct type if present
  if (workflow.milestones && !Array.isArray(workflow.milestones)) {
    errors.push({ field: 'milestones', message: 'must be an array' });
  }

  if (workflow.assigneePlaceholders && !Array.isArray(workflow.assigneePlaceholders)) {
    errors.push({ field: 'assigneePlaceholders', message: 'must be an array' });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate operation structure
 */
function validateOperation(op: unknown, index: number): ResponseValidationResult {
  const errors: ResponseValidationError[] = [];

  if (!op || typeof op !== 'object') {
    return {
      valid: false,
      errors: [{ field: '', message: 'must be an object' }],
    };
  }

  const operation = op as Record<string, unknown>;

  // Must have op field
  if (!operation.op || typeof operation.op !== 'string') {
    errors.push({ field: 'op', message: 'must be a string' });
  }

  // Validate based on operation type
  const opType = operation.op as string;

  switch (opType) {
    case 'ADD_STEP_AFTER':
      if (!operation.afterStepId || typeof operation.afterStepId !== 'string') {
        errors.push({ field: 'afterStepId', message: 'must be a string' });
      }
      if (!operation.step || typeof operation.step !== 'object') {
        errors.push({ field: 'step', message: 'must be an object' });
      }
      break;

    case 'ADD_STEP_BEFORE':
      if (!operation.beforeStepId || typeof operation.beforeStepId !== 'string') {
        errors.push({ field: 'beforeStepId', message: 'must be a string' });
      }
      if (!operation.step || typeof operation.step !== 'object') {
        errors.push({ field: 'step', message: 'must be an object' });
      }
      break;

    case 'REMOVE_STEP':
      if (!operation.stepId || typeof operation.stepId !== 'string') {
        errors.push({ field: 'stepId', message: 'must be a string' });
      }
      break;

    case 'UPDATE_STEP':
      if (!operation.stepId || typeof operation.stepId !== 'string') {
        errors.push({ field: 'stepId', message: 'must be a string' });
      }
      if (!operation.updates || typeof operation.updates !== 'object') {
        errors.push({ field: 'updates', message: 'must be an object' });
      }
      break;

    case 'MOVE_STEP':
      if (!operation.stepId || typeof operation.stepId !== 'string') {
        errors.push({ field: 'stepId', message: 'must be a string' });
      }
      // afterStepId can be null to move to beginning
      if (operation.afterStepId !== null && typeof operation.afterStepId !== 'string') {
        errors.push({ field: 'afterStepId', message: 'must be a string or null' });
      }
      break;

    // Branch path operations
    case 'ADD_PATH_STEP_AFTER':
    case 'ADD_PATH_STEP_BEFORE':
      if (!operation.branchStepId || typeof operation.branchStepId !== 'string') {
        errors.push({ field: 'branchStepId', message: 'must be a string' });
      }
      if (!operation.pathId || typeof operation.pathId !== 'string') {
        errors.push({ field: 'pathId', message: 'must be a string' });
      }
      if (!operation.step || typeof operation.step !== 'object') {
        errors.push({ field: 'step', message: 'must be an object' });
      }
      break;

    // Allow unknown operation types (forwards compatibility)
    default:
      // Log warning but don't fail
      console.warn(`Unknown operation type: ${opType}`);
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// JSON Extraction
// ============================================================================

/**
 * Extract JSON from content that may be wrapped in markdown code blocks
 */
export function extractJSON(content: string): string | null {
  // Trim whitespace
  const trimmed = content.trim();

  // Try direct parse first
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  // Look for JSON in markdown code blocks
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const potential = match[1].trim();
    if (potential.startsWith('{') || potential.startsWith('[')) {
      return potential;
    }
  }

  // Look for raw JSON object in the content
  const jsonObjectRegex = /\{[\s\S]*\}/;
  const jsonMatch = content.match(jsonObjectRegex);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return null;
}

// ============================================================================
// Response Utilities
// ============================================================================

/**
 * Extract the conversational message from content (text before JSON code block)
 * This is the human-friendly text the AI writes before the JSON.
 */
export function extractConversationalMessage(content: string): string {
  const trimmed = content.trim();

  // Find the first code block (```json or just ```)
  const codeBlockIndex = trimmed.indexOf('```');

  if (codeBlockIndex > 0) {
    // Return everything before the code block, trimmed
    return trimmed.substring(0, codeBlockIndex).trim();
  }

  // If no code block, check if the whole thing is JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    // Pure JSON - no conversational message
    return '';
  }

  // Look for JSON object in the content
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const jsonIndex = trimmed.indexOf(jsonMatch[0]);
    if (jsonIndex > 0) {
      return trimmed.substring(0, jsonIndex).trim();
    }
  }

  // No JSON found - return the whole thing (might be an error message)
  return trimmed;
}

/**
 * Safely stringify AI response for logging
 */
export function stringifyResponse(response: AIResponse): string {
  return JSON.stringify(response, null, 2);
}

/**
 * Get a human-readable summary of the response
 */
export function getResponseSummary(response: AIResponse): string {
  switch (response.mode) {
    case 'create':
      return `Created workflow "${response.workflow.name}" with ${response.workflow.steps.length} steps`;
    case 'edit':
      return `Applied ${response.operations.length} operation(s): ${response.message}`;
    case 'clarify':
      return `Needs clarification: ${response.questions.length} question(s)`;
    case 'reject':
      return `Rejected: ${response.reason}`;
    case 'respond':
      return `Response: ${response.message.substring(0, 100)}${response.message.length > 100 ? '...' : ''}`;
  }
}
