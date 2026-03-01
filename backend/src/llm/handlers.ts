/**
 * Response Handlers
 *
 * Processes AI responses and applies them to workflow state.
 * Each handler validates and applies a specific response type.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AIResponse,
  CreateResponse,
  EditResponse,
  ClarifyResponse,
  RejectResponse,
  RespondResponse,
  ConversationSession,
  isCreateResponse,
  isEditResponse,
  isClarifyResponse,
  isRejectResponse,
} from './types.js';
import type { Flow } from '../models/workflow.js';
import { validateWorkflow, type ValidationMode } from '../validator/index.js';

// Use LENIENT mode for AI-generated workflows to allow step types
// that may not be in our config yet (they're still valid Moxo types)
const AI_VALIDATION_MODE: ValidationMode = 'LENIENT';
import { applyOperations } from '../engine/index.js';

// ============================================================================
// Handler Result Types
// ============================================================================

export interface HandlerResult {
  success: boolean;
  workflow?: Flow | null;
  message: string;
  errors?: string[];
  clarifications?: Array<{ id: string; text: string }>;
}

// ============================================================================
// Main Handler
// ============================================================================

/**
 * Handle AI response and optionally update session state
 * @param response - The AI response to handle
 * @param session - The conversation session
 * @param applyToSession - Whether to apply workflow changes to the session (default: true)
 *                         When false, validates and returns workflow but doesn't update session
 */
export async function handleAIResponse(
  response: AIResponse,
  session: ConversationSession,
  applyToSession: boolean = true
): Promise<HandlerResult> {
  switch (response.mode) {
    case 'create':
      return handleCreateResponse(response, session, applyToSession);
    case 'edit':
      return handleEditResponse(response, session, applyToSession);
    case 'clarify':
      return handleClarifyResponse(response, session);
    case 'reject':
      return handleRejectResponse(response, session);
    case 'respond':
      return handleRespondResponse(response, session);
    default:
      return {
        success: false,
        message: 'Unknown response mode',
        errors: [`Unknown response mode: ${(response as AIResponse).mode}`],
      };
  }
}

// ============================================================================
// Create Handler
// ============================================================================

/**
 * Handle workflow creation response
 * @param applyToSession - If false, validates but doesn't update session (for preview mode)
 */
export function handleCreateResponse(
  response: CreateResponse,
  session: ConversationSession,
  applyToSession: boolean = true
): HandlerResult {
  const workflow = response.workflow;

  // Ensure IDs are set
  ensureWorkflowIds(workflow);

  // Validate the workflow (use LENIENT mode for AI-generated content)
  const validation = validateWorkflow(workflow, { mode: AI_VALIDATION_MODE });

  if (!validation.valid) {
    return {
      success: false,
      workflow: null,
      message: 'Generated workflow has validation errors',
      errors: validation.errors.map(e => `${e.path}: ${e.message}`),
    };
  }

  // Only update session if applyToSession is true
  if (applyToSession) {
    session.workflow = workflow;
    session.metadata = {
      ...session.metadata,
      workflowName: workflow.name,
      lastMode: 'create',
      clarificationsPending: undefined,  // Clear pending clarifications
    };
  }

  return {
    success: true,
    workflow,
    message: response.message || `Created workflow "${workflow.name}"`,
  };
}

// ============================================================================
// Edit Handler
// ============================================================================

/**
 * Handle workflow edit response
 * @param applyToSession - If false, validates but doesn't update session (for preview mode)
 */
export function handleEditResponse(
  response: EditResponse,
  session: ConversationSession,
  applyToSession: boolean = true
): HandlerResult {
  // Must have existing workflow to edit
  if (!session.workflow) {
    return {
      success: false,
      workflow: null,
      message: 'Cannot edit - no workflow exists',
      errors: ['No workflow exists to edit. Use "create" mode first.'],
    };
  }

  // Apply operations to a copy (for validation/preview)
  const result = applyOperations(session.workflow, response.operations);

  if (!result.success || !result.finalWorkflow) {
    // Collect errors from failed operations
    const errors = result.results
      .filter(r => !r.success && r.error)
      .map(r => r.error as string);

    return {
      success: false,
      workflow: session.workflow,
      message: 'Failed to apply some operations',
      errors: errors.length > 0 ? errors : ['Unknown operation error'],
    };
  }

  const updatedWorkflow = result.finalWorkflow as Flow;

  // Validate the updated workflow (use LENIENT mode for AI-generated content)
  const validation = validateWorkflow(updatedWorkflow, { mode: AI_VALIDATION_MODE });

  if (!validation.valid) {
    // Don't apply invalid changes
    return {
      success: false,
      workflow: session.workflow,
      message: 'Edit would result in invalid workflow',
      errors: validation.errors.map(e => `${e.path}: ${e.message}`),
    };
  }

  // Only update session if applyToSession is true
  if (applyToSession) {
    session.workflow = updatedWorkflow;
    session.metadata = {
      ...session.metadata,
      lastMode: 'edit',
      clarificationsPending: undefined,  // Clear pending clarifications
    };
  }

  return {
    success: true,
    workflow: updatedWorkflow,
    message: response.message || `Applied ${response.operations.length} operation(s)`,
  };
}

// ============================================================================
// Clarify Handler
// ============================================================================

/**
 * Handle clarification request response
 */
export function handleClarifyResponse(
  response: ClarifyResponse,
  session: ConversationSession
): HandlerResult {
  // Mark that clarifications are pending (helps LLM recognize responses)
  session.metadata = {
    ...session.metadata,
    lastMode: 'clarify',
    clarificationsPending: true,
  };

  return {
    success: true,
    workflow: session.workflow,
    message: response.context || 'Please provide more information',
    clarifications: response.questions,
  };
}

// ============================================================================
// Reject Handler
// ============================================================================

/**
 * Handle rejection response
 */
export function handleRejectResponse(
  response: RejectResponse,
  session: ConversationSession
): HandlerResult {
  session.metadata = {
    ...session.metadata,
    lastMode: 'reject',
  };

  let message = response.reason;
  if (response.suggestion) {
    message += `\n\nSuggestion: ${response.suggestion}`;
  }

  return {
    success: true,
    workflow: session.workflow,
    message,
  };
}

// ============================================================================
// Respond Handler
// ============================================================================

/**
 * Handle conversational response (no workflow changes)
 * Used for answering questions, providing information, etc.
 */
export function handleRespondResponse(
  response: RespondResponse,
  session: ConversationSession
): HandlerResult {
  session.metadata = {
    ...session.metadata,
    lastMode: 'respond',
  };

  return {
    success: true,
    workflow: session.workflow, // No changes to workflow
    message: response.message,
    // Note: suggestedActions are passed through in the response
    // and handled by the frontend directly
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Ensure workflow has valid structure and all IDs are set.
 * Normalizes missing arrays to empty arrays.
 * Note: Milestones are optional - steps only need milestoneId if milestones are defined.
 */
function ensureWorkflowIds(workflow: Flow): void {
  // Ensure flow ID
  if (!workflow.flowId) {
    workflow.flowId = `flow_${uuidv4()}`;
  }

  // Ensure arrays exist (LLM might omit them)
  if (!Array.isArray(workflow.steps)) {
    workflow.steps = [];
  }
  if (!Array.isArray(workflow.milestones)) {
    workflow.milestones = [];
  }
  if (!Array.isArray(workflow.roles)) {
    workflow.roles = [];
  }

  // Ensure milestone IDs if milestones exist
  let milestoneCounter = 1;
  for (const milestone of workflow.milestones) {
    if (!milestone.milestoneId) {
      milestone.milestoneId = `ms_${milestoneCounter++}`;
    }
  }

  // Get the first milestone ID for default assignment (if milestones exist)
  const defaultMilestoneId = workflow.milestones.length > 0
    ? workflow.milestones[0].milestoneId
    : undefined;

  // Ensure step IDs (and milestoneIds if milestones are defined)
  let stepCounter = 1;
  for (const step of workflow.steps) {
    if (!step.stepId) {
      step.stepId = `step_${stepCounter++}`;
    }

    // If milestones exist and step doesn't have one, assign to first milestone
    // GOTO steps don't need milestoneId
    if (defaultMilestoneId && !step.milestoneId && step.type !== 'GOTO') {
      step.milestoneId = defaultMilestoneId;
    }

    // Handle nested steps in branches
    if ('paths' in step && Array.isArray(step.paths)) {
      for (const path of step.paths as Array<{ pathId?: string; steps?: Array<{ stepId?: string; milestoneId?: string }> }>) {
        if (!path.pathId) {
          path.pathId = `path_${uuidv4()}`;
        }
        if (path.steps) {
          for (const nestedStep of path.steps) {
            if (!nestedStep.stepId) {
              nestedStep.stepId = `step_${stepCounter++}`;
            }
            // Nested steps inherit parent's milestoneId if not set
            if (defaultMilestoneId && !nestedStep.milestoneId) {
              nestedStep.milestoneId = step.milestoneId;
            }
          }
        }
      }
    }

    // Handle nested steps in decision outcomes
    if ('outcomes' in step && Array.isArray(step.outcomes)) {
      for (const outcome of step.outcomes as Array<{ outcomeId?: string; steps?: Array<{ stepId?: string; milestoneId?: string }> }>) {
        if (!outcome.outcomeId) {
          outcome.outcomeId = `outcome_${uuidv4()}`;
        }
        if (outcome.steps) {
          for (const nestedStep of outcome.steps) {
            if (!nestedStep.stepId) {
              nestedStep.stepId = `step_${stepCounter++}`;
            }
            // Nested steps inherit parent's milestoneId if not set
            if (defaultMilestoneId && !nestedStep.milestoneId) {
              nestedStep.milestoneId = step.milestoneId;
            }
          }
        }
      }
    }
  }

  // Ensure role IDs
  let roleCounter = 1;
  for (const role of workflow.roles) {
    if (!role.roleId) {
      role.roleId = `role_${roleCounter++}`;
    }
  }
}

/**
 * Create error result helper
 */
export function createErrorResult(message: string, errors?: string[]): HandlerResult {
  return {
    success: false,
    message,
    errors: errors || [message],
  };
}

/**
 * Create success result helper
 */
export function createSuccessResult(
  message: string,
  workflow?: Flow | null
): HandlerResult {
  return {
    success: true,
    message,
    workflow,
  };
}
