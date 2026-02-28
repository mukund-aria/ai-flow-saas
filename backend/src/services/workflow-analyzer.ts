/**
 * Workflow Analyzer Service
 *
 * Pure function — no AI call, no DB. Evaluates YAML-driven rules
 * against a workflow's shape and returns categorized suggestions.
 */

import type { AnalysisRule, AnalysisRuleCondition, AnalysisRulesConfig } from '../config/loader.js';

export interface WorkflowShape {
  stepCount: number;
  stepTypes: Set<string>;
  hasMilestones: boolean;
  hasNamingConvention: boolean;
}

export interface AnalysisSuggestion {
  id: string;
  category: string;
  priority: string;
  prompt: string;
  hint?: string;
  surfaces: string[];
  enhancementDefault?: boolean;
}

export interface AnalysisResult {
  suggestions: AnalysisSuggestion[];
  shape: {
    stepCount: number;
    stepTypes: string[];
    hasMilestones: boolean;
  };
}

interface WorkflowInput {
  steps?: Array<{ type?: string; stepType?: string }>;
  milestones?: Array<unknown>;
  workspaceNameTemplate?: string;
  settings?: { workspaceNameTemplate?: string };
}

const PRIORITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
  lowest: 3,
};

/**
 * Extract the structural shape of a workflow for rule evaluation.
 */
export function extractShape(workflow: WorkflowInput): WorkflowShape {
  const steps = workflow.steps || [];
  const stepTypes = new Set<string>();

  for (const step of steps) {
    const type = step.type || step.stepType;
    if (type) {
      stepTypes.add(type);
    }
  }

  return {
    stepCount: steps.length,
    stepTypes,
    hasMilestones: (workflow.milestones?.length ?? 0) > 0,
    hasNamingConvention: !!(
      workflow.workspaceNameTemplate ||
      workflow.settings?.workspaceNameTemplate
    ),
  };
}

/**
 * Evaluate a single condition against the workflow shape.
 * All present fields are AND-ed together.
 * Array fields (has_step_types, missing_step_types) use OR within the array.
 */
export function evaluateCondition(condition: AnalysisRuleCondition, shape: WorkflowShape): boolean {
  // always: true → passes unconditionally
  if (condition.always) {
    return true;
  }

  // has_step_types: at least one of the listed types must be present
  if (condition.has_step_types) {
    const hasAny = condition.has_step_types.some((t) => shape.stepTypes.has(t));
    if (!hasAny) return false;
  }

  // missing_step_types: none of the listed types should be present
  if (condition.missing_step_types) {
    const hasAny = condition.missing_step_types.some((t) => shape.stepTypes.has(t));
    if (hasAny) return false;
  }

  // min_steps: stepCount must be >= N
  if (condition.min_steps !== undefined) {
    if (shape.stepCount < condition.min_steps) return false;
  }

  // missing_milestones: workflow has no milestones
  if (condition.missing_milestones) {
    if (shape.hasMilestones) return false;
  }

  // missing_naming_convention: workflow has no naming template
  if (condition.missing_naming_convention) {
    if (shape.hasNamingConvention) return false;
  }

  return true;
}

/**
 * Interpolate template variables in hint text.
 * Supported: {{stepCount}}
 */
function interpolateHint(hint: string, shape: WorkflowShape): string {
  return hint.replace(/\{\{stepCount\}\}/g, String(shape.stepCount));
}

/**
 * Analyze a workflow against the configured rules and return matching suggestions.
 */
export function analyzeWorkflow(workflow: WorkflowInput, config: AnalysisRulesConfig): AnalysisResult {
  const shape = extractShape(workflow);
  const suggestions: AnalysisSuggestion[] = [];

  for (const rule of config.rules) {
    if (evaluateCondition(rule.condition, shape)) {
      suggestions.push({
        id: rule.id,
        category: rule.category,
        priority: rule.priority,
        prompt: rule.suggestion.prompt,
        hint: rule.suggestion.hint ? interpolateHint(rule.suggestion.hint, shape) : undefined,
        surfaces: rule.surfaces,
        enhancementDefault: rule.enhancement_default,
      });
    }
  }

  // Sort by priority: high > medium > low > lowest
  suggestions.sort((a, b) => {
    return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
  });

  return {
    suggestions,
    shape: {
      stepCount: shape.stepCount,
      stepTypes: Array.from(shape.stepTypes),
      hasMilestones: shape.hasMilestones,
    },
  };
}
