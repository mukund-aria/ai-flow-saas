/**
 * Condition Evaluator Service
 *
 * Evaluates conditions on branch paths to determine which path to take
 * in MULTI_CHOICE_BRANCH steps. Supports a variety of comparison operators
 * and resolves DDR tokens in condition sources before comparison.
 */

import { resolveDDR, type DDRContext } from './ddr-resolver.js';

// ============================================================================
// Types
// ============================================================================

export interface Condition {
  /** DDR token like "{Kickoff / Country}" or a literal field path */
  source: string;
  /** Comparison operator */
  operator: string;
  /** Value to compare against (not required for is_empty / not_empty) */
  value?: any;
}

export interface EvaluationContext {
  kickoffData?: Record<string, unknown>;
  roleAssignments?: Record<string, unknown>;
  stepOutputs?: Record<string, Record<string, unknown>>;
  workspace?: { name: string; id: string };
}

// ============================================================================
// Context Builder
// ============================================================================

/**
 * Build an evaluation context from a flow run's data.
 * Gathers kickoff data, role assignments, and completed step outputs
 * into a shape suitable for condition evaluation.
 */
export function buildEvaluationContext(
  flowRun: {
    kickoffData?: Record<string, unknown> | null;
    roleAssignments?: Record<string, unknown> | null;
  },
  completedSteps: Array<{
    stepId: string;
    stepName?: string;
    resultData?: Record<string, unknown> | null;
  }>,
  workspace?: { name: string; id: string }
): EvaluationContext {
  const stepOutputs: Record<string, Record<string, unknown>> = {};

  for (const step of completedSteps) {
    if (step.resultData) {
      const key = step.stepName || step.stepId;
      stepOutputs[key] = step.resultData;
    }
  }

  return {
    kickoffData: flowRun.kickoffData ?? undefined,
    roleAssignments: flowRun.roleAssignments ?? undefined,
    stepOutputs,
    workspace,
  };
}

// ============================================================================
// Condition Evaluation
// ============================================================================

/**
 * Resolve DDR tokens in the condition source and return the resolved value.
 * If the source is a DDR token (contains braces), resolve it against the context.
 * Otherwise return the source string as-is (literal value).
 */
function resolveSource(source: string, context: EvaluationContext): string {
  const ddrContext: DDRContext = {
    kickoffData: context.kickoffData,
    roleAssignments: context.roleAssignments as DDRContext['roleAssignments'],
    stepOutputs: context.stepOutputs,
    workspace: context.workspace,
  };

  // If the source contains a DDR token, resolve it
  if (source.includes('{') && source.includes('}')) {
    const resolved = resolveDDR(source, ddrContext);
    // If the DDR token wasn't resolved (returned as-is), treat as empty
    return resolved === source ? '' : resolved;
  }

  return source;
}

/**
 * Evaluate a single condition against the provided context.
 * Returns true if the condition is satisfied.
 */
export function evaluateCondition(condition: Condition, context: EvaluationContext): boolean {
  const resolvedSource = resolveSource(condition.source, context);
  const value = condition.value !== undefined && condition.value !== null
    ? String(condition.value)
    : '';

  switch (condition.operator) {
    case 'equals':
      return resolvedSource.toLowerCase() === value.toLowerCase();

    case 'not_equals':
      return resolvedSource.toLowerCase() !== value.toLowerCase();

    case 'contains':
      return resolvedSource.toLowerCase().includes(value.toLowerCase());

    case 'not_contains':
      return !resolvedSource.toLowerCase().includes(value.toLowerCase());

    case 'greater_than': {
      const numSource = parseFloat(resolvedSource);
      const numValue = parseFloat(value);
      if (isNaN(numSource) || isNaN(numValue)) return false;
      return numSource > numValue;
    }

    case 'less_than': {
      const numSource = parseFloat(resolvedSource);
      const numValue = parseFloat(value);
      if (isNaN(numSource) || isNaN(numValue)) return false;
      return numSource < numValue;
    }

    case 'is_empty':
      return resolvedSource.trim() === '';

    case 'not_empty':
      return resolvedSource.trim() !== '';

    case 'in': {
      // Value is expected to be a comma-separated list
      const list = value.split(',').map(v => v.trim().toLowerCase());
      return list.includes(resolvedSource.toLowerCase());
    }

    case 'not_in': {
      const list = value.split(',').map(v => v.trim().toLowerCase());
      return !list.includes(resolvedSource.toLowerCase());
    }

    default:
      console.warn(`[ConditionEvaluator] Unknown operator: ${condition.operator}`);
      return false;
  }
}
