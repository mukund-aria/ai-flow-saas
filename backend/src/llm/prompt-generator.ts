/**
 * System Prompt Generator
 *
 * Assembles the system prompt from modular configuration files:
 *   1. Technical:      constraints, step types, defaults
 *   2. Consultative:   consultation stages, inference rules, post-create suggestions
 *   3. UX:             response format, question policy, edit behavior
 *
 * All content is now data-driven from YAML configs. No hardcoded prompt text
 * lives in this file — it only handles assembly and formatting.
 *
 * Public API (unchanged):
 *   - generateSystemPrompt()
 *   - generateWorkflowContext()
 *   - generateStepTypeGuidance()
 */

import {
  getConstraints,
  getStepTypes,
  getDefaults,
  getConsultation,
  getUXGuidelines,
  getResponseFormat,
  getTemplateCatalog,
  type ConstraintsConfig,
  type StepTypeConfig,
  type DefaultsConfig,
  type ConsultationConfig,
  type UXGuidelinesConfig,
  type ResponseFormatConfig,
  type TemplateCatalogConfig,
} from '../config/loader.js';

// ============================================================================
// Prompt Generation — Public API
// ============================================================================

interface SessionMetadata {
  clarificationsPending?: boolean;
}

/**
 * Generate the full system prompt for the AI SE.
 * Signature unchanged — this is the public API.
 */
export function generateSystemPrompt(metadata?: SessionMetadata): string {
  const constraints = getConstraints();
  const stepTypes = getStepTypes();
  const defaults = getDefaults();
  const consultation = getConsultation();
  const ux = getUXGuidelines();
  const responseFormat = getResponseFormat();
  const templateCatalog = getTemplateCatalog();

  const templateSection = templateCatalog
    ? `\n\n${generateTemplatePatternsSection(templateCatalog)}`
    : '';

  const clarificationNote = metadata?.clarificationsPending
    ? `\nNote: You asked clarification questions in your previous message. The user's response follows.\n`
    : '';

  return [
    generateRoleSection(consultation, ux),
    generateOutputFormatSection(responseFormat, ux),
    generateConstraintsSection(constraints),
    generateStepTypesSection(stepTypes),
    generateConsultationSection(consultation),
    generateDefaultsSection(defaults),
    generateDueDateTypesSection(responseFormat),
    generateBehaviorSection(consultation, ux),
  ].join('\n\n') + templateSection + clarificationNote;
}

// ============================================================================
// Section Generators — Role & Scope
// ============================================================================

function generateRoleSection(consultation: ConsultationConfig, ux: UXGuidelinesConfig): string {
  const p = consultation.personality;
  const styleList = Array.isArray(p.style)
    ? p.style.map(s => `- ${s}`).join('\n')
    : p.style;

  return `# Role and Personality

You are an ${p.role} for a workflow automation platform.

**Your job:** Consult with the user like an SE on a discovery call:
1. Understand their SPECIFIC business process
2. Ask about who's involved, what happens today, pain points
3. Design a workflow tailored to their needs

**Tone:** ${p.tone}

**Style:**
${styleList}

**Greeting:** "${p.greeting}"

# Scope and Guardrails

**You ONLY help with workflow and business process topics:** ${ux.scope.allowed.join('; ')}.

**Decline unrelated requests with:** "${ux.scope.declineMessage}"

**Never disclose:** ${ux.scope.neverDisclose.join('; ')}.
If asked, redirect to workflow design.`;
}

// ============================================================================
// Section Generators — Output Format (from response-format.yaml)
// ============================================================================

function generateOutputFormatSection(rf: ResponseFormatConfig, ux: UXGuidelinesConfig): string {
  // Tools list
  const toolsList = rf.tools
    .map((t, i) => `${i + 1}. **${t.name}** — ${t.description}`)
    .join('\n');

  // respond vs clarify
  const useRespondList = rf.respondVsClarify.useRespond
    .map(item => `- ${item}`)
    .join('\n');
  const useClarifyList = rf.respondVsClarify.useClarify
    .map(item => `- ${item}`)
    .join('\n');

  // ask vs create
  const askExamples = rf.askVsCreate.askExamples
    .map(ex => `- "${ex.trigger}" -> ${ex.followUp}`)
    .join('\n');
  const createWhen = rf.askVsCreate.createWhen
    .map(item => `- ${item}`)
    .join('\n');

  // redundant questions
  const redundantList = rf.avoidRedundantQuestions
    .map(item => `- ${item}`)
    .join('\n');

  // question type examples
  const textType = ux.questionTypes['text'] as { description: string; roleGuidance?: string } | undefined;
  const roleGuidance = textType?.roleGuidance
    ? `For role questions: ${textType.roleGuidance}`
    : '';

  // branch nesting
  const bn = rf.branchNesting;
  const conditionTypes = bn.singleChoiceBranch.conditionTypes.join(', ');

  // concurrent execution
  const ce = rf.concurrentExecution;
  const decisionTree = ce.decisionTree
    .map(item => `- ${item}`)
    .join('\n');

  // GOTO
  const gotoRules = rf.gotoRevisionLoops.rules
    .map(r => `- ${r}`)
    .join('\n');

  // Milestones
  const milestoneRules = rf.milestones.rules
    .map(r => `- ${r}`)
    .join('\n');

  // Step-specific config
  const stepConfigList = Object.entries(rf.stepSpecificConfig)
    .map(([key, val]) => `- **${key}**: ${val}`)
    .join('\n');

  return `# Response Format — Using Tools

You MUST use one of the provided tools to respond. NEVER respond with plain text only.

## Available Tools

${toolsList}

## respond vs ask_clarification

**USE respond** when the user is:
${useRespondList}

**USE ask_clarification** ONLY when:
${useClarifyList}

## When to Ask vs Create

**ASK** when request is vague or missing key details:
${askExamples}

**CREATE** when you have enough specifics:
${createWhen}

## Recognizing Clarification Answers

${rf.clarificationRecognition.instruction.trim()}

## Avoid Redundant Questions

${redundantList}

## Clarification Question Types

### Text (default) — open-ended
${roleGuidance}

Example: ${rf.questionTypeExamples.text.trim()}

### Text with File Upload — process questions
Example: ${rf.questionTypeExamples.textWithFile.trim()}

### Selection — platform-specific options
Example:
${rf.questionTypeExamples.selection.trim()}

Available icons: ${rf.questionTypeExamples.availableIcons.join(', ')}

## Branch Steps — Nesting Structure

${bn.rule}

### WRONG — steps at top level:
\`\`\`json
${bn.wrongExample.trim()}
\`\`\`

### CORRECT — steps nested inside paths:
SINGLE_CHOICE_BRANCH: ${bn.singleChoiceBranch.pathCount}, each with \`condition\` or \`conditions\` (up to 10, combined with \`conditionLogic\`: ALL|ANY).
Condition types: ${conditionTypes}.

\`\`\`json
${bn.correctExample.trim()}
\`\`\`

### MULTI_CHOICE_BRANCH
${bn.multiChoiceBranch.description}

### DECISION — uses "outcomes" instead of "paths":
\`\`\`json
${bn.decisionExample.trim()}
\`\`\`

## Concurrent Execution Patterns

### skipSequentialOrder — ${ce.skipSequentialOrder.description}
\`\`\`json
${ce.skipSequentialOrder.example.trim()}
\`\`\`
${ce.skipSequentialOrder.note}

### PARALLEL_BRANCH — ${ce.parallelBranch.description}

### Decision tree:
${decisionTree}

## GOTO Revision Loops

\`\`\`json
${rf.gotoRevisionLoops.example.trim()}
\`\`\`
${gotoRules}

## Milestones

${rf.milestones.description}
\`\`\`json
${rf.milestones.example.trim()}
\`\`\`
${milestoneRules}

## Step-Specific Config

${stepConfigList}`;
}

// ============================================================================
// Section Generators — Technical (Constraints, Step Types, Defaults)
// ============================================================================

function generateConstraintsSection(constraints: ConstraintsConfig): string {
  return `# Platform Constraints (Hard Rules)

## Branching
- Max parallel paths: ${constraints.branching.maxParallelPaths}
- Max DECISION outcomes: ${constraints.branching.maxDecisionOutcomes}
- Max nesting depth: ${constraints.branching.maxNestingDepth}
- Milestones inside branches: ${constraints.branching.milestonesInsideBranches ? 'ALLOWED' : 'NOT ALLOWED'}
- Branch must fit single milestone: ${constraints.branching.branchMustFitSingleMilestone ? 'YES' : 'NO'}

## GOTO
- Allowed inside: ${constraints.goto.allowedInside.join(', ')}
- Target must be on main path: ${constraints.goto.targetMustBeOnMainPath ? 'YES' : 'NO'}

## TERMINATE
- Allowed inside: ${constraints.terminate.allowedInside.join(', ')}
- Valid statuses: ${constraints.terminate.validStatuses.join(', ')}

## Variables
- Types: ${constraints.variables.allowedTypes.join(', ')}
- Set only at initiation: ${constraints.variables.setOnlyAtInitiation ? 'YES' : 'NO'}
- Immutable: ${constraints.variables.immutable ? 'YES' : 'NO'}

## Completion Modes (multi-assignee): ${constraints.completionModes.join(', ')}
## Assignee Order: ${constraints.assigneeOrderOptions.join(', ')}

## skipSequentialOrder
- For 2-3 concurrent steps. Set on 2nd/3rd step, not 1st.
- For 3+ concurrent or multi-step tracks: use PARALLEL_BRANCH.

## Sub-Flow: max depth ${constraints.subflow?.maxNestingDepth ?? 3}, no recursion.
## Multi-Choice Branch: max ${constraints.multiChoiceBranch?.maxPaths ?? 3} paths, all true paths execute.`;
}

function generateStepTypesSection(stepTypes: StepTypeConfig[]): string {
  const humanActions = stepTypes.filter(s => s.category === 'HUMAN_ACTION');
  const controls = stepTypes.filter(s => s.category === 'CONTROL');
  const automations = stepTypes.filter(s => s.category === 'AUTOMATION');

  return `# Step Types

## Human Actions
${humanActions.map(formatStepType).join('\n\n')}

## Controls
${controls.map(formatStepType).join('\n\n')}

## Automations
${automations.map(formatStepType).join('\n\n')}`;
}

function formatStepType(config: StepTypeConfig): string {
  let output = `### ${config.stepType}
**${config.displayName}**: ${config.description}`;

  if (config.aiGuidance?.whenToUse) {
    output += `\n**When to use:** ${config.aiGuidance.whenToUse.trim()}`;
  }

  if (config.aiGuidance?.whenNotToUse) {
    output += `\n**When NOT to use:** ${config.aiGuidance.whenNotToUse.trim()}`;
  }

  if (config.completion) {
    const info: string[] = [];
    if (config.completion.multipleAssignees) info.push('multiple assignees');
    if (config.completion.singleAssigneeOnly) info.push('single assignee only');
    if (config.completion.autoCompletes) info.push('auto-completes');
    if (config.completion.completionMode) info.push(`completion: ${config.completion.completionMode}`);
    if (info.length > 0) {
      output += `\n**Completion:** ${info.join(', ')}`;
    }
  }

  if (config.specialRules?.length) {
    output += `\n**Rules:** ${config.specialRules.join('; ')}`;
  }

  if (config.aiGuidance?.seQuestions?.length) {
    output += `\n**Consider asking:** ${config.aiGuidance.seQuestions.join('; ')}`;
  }

  if (config.aiGuidance?.editQuestions?.length) {
    output += `\n**Edit aspects:** ${config.aiGuidance.editQuestions.map(eq => eq.question).join('; ')}`;
  }

  return output;
}

function generateDefaultsSection(defaults: DefaultsConfig): string {
  return `# Default Assumptions

Apply unless user specifies otherwise:

- **Assignees:** ${defaults.assignees.defaultResolution}, view all: No, coordinator: No
- **Steps:** ${defaults.steps.executionOrder}, visible to assignee only, completion: ${defaults.steps.completionMode}, assignee order: ${defaults.steps.assigneeOrder}
- **Kickoff:** ${defaults.kickoff.defaultStartMode}
- **Milestones:** ${defaults.milestones.defaultToSingleMilestone ? 'Single milestone' : 'Multiple'} ("${defaults.milestones.defaultMilestoneName}")
- **Flow:** Chat ${defaults.flow.chatAssistanceEnabled ? 'enabled' : 'disabled'}, auto-archive ${defaults.flow.autoArchiveEnabled ? 'enabled' : 'disabled'}
- **APPROVAL vs DECISION:** APPROVAL = approve-only (no reject). DECISION = choose between 2-3 outcomes.
- **Experience:** Default Spotlight (focused task view). Alternative: Gallery (all visible steps).`;
}

function generateDueDateTypesSection(rf: ResponseFormatConfig): string {
  const typeEntries = Object.entries(rf.dueDates.types)
    .map(([name, cfg]) => {
      const { example, description } = cfg as { example: string; description: string };
      return `- **${name}**: \`${example}\` — ${description}`;
    })
    .join('\n');

  return `## Due Dates

${typeEntries}

Flow-level: ${rf.dueDates.flowLevel} Valid units: ${rf.dueDates.validUnits.join(', ')}.`;
}

// ============================================================================
// Section Generators — Consultative
// ============================================================================

function generateConsultationSection(consultation: ConsultationConfig): string {
  const stages = consultation.stages
    .sort((a, b) => a.order - b.order)
    .map(stage => {
      let text = `### ${stage.order}. ${stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
**Key:** "${stage.keyQuestion}"`;

      if (stage.explanation) {
        text += `\n*${stage.explanation}*`;
      }

      if (stage.secondaryQuestions?.length) {
        text += `\n**Follow-ups:** ${stage.secondaryQuestions.join('; ')}`;
      }

      if (stage.perStepQuestions?.length) {
        text += `\n**Per step:** ${stage.perStepQuestions.join('; ')}`;
      }

      if (stage.proactiveReview?.length) {
        text += `\n**Proactive:** ${stage.proactiveReview.join('; ')}`;
      }

      if (stage.defaults?.length) {
        text += `\n**Defaults:** ${stage.defaults.join('; ')}`;
      }

      if (stage.permissions) {
        text += `\n**Permissions:** ${Object.entries(stage.permissions).map(([k, v]) => `${k}: ${v}`).join('; ')}`;
      }

      if (stage.experienceOptions) {
        text += `\n**Experience:** ${Object.entries(stage.experienceOptions).map(([k, v]) => `${k}: ${v}`).join('; ')}`;
      }

      return text;
    })
    .join('\n\n');

  return `# Consultation Approach

Follow this staged approach. Apply defaults when appropriate — only clarify when intent is ambiguous.

${stages}`;
}

// ============================================================================
// Section Generators — Behavioral (merged from consultation + UX)
// ============================================================================

function generateBehaviorSection(consultation: ConsultationConfig, ux: UXGuidelinesConfig): string {
  const qp = ux.questionPolicy;
  const inference = consultation.inferenceRules;

  let output = `# Behavioral Guidelines

## Infer-First Decision Tree

1. **User said or implied something?** -> Apply user's intent
2. **Can infer from context?** -> Infer silently (document in assumptions)
3. **Otherwise** -> Apply default silently (document in assumptions)

## Rework Risk Test

Before asking or creating: **If I got it wrong, would the user start over or just tweak?**
- Start over -> ASK
- Just tweak -> CREATE with assumptions

**ASK when:**
${qp.reworkRiskTest.askWhen.map(item => `- ${item}`).join('\n')}

**CREATE when:**
${qp.reworkRiskTest.createWhen.map(item => `- ${item}`).join('\n')}

**For generic prompts, ask:**
${qp.genericPromptQuestions.map(q => `- ${q}`).join('\n')}

## After User Answers Questions

${qp.afterClarification.map(item => `- ${item}`).join('\n')}

Remember: The user provided the information you asked for. Deliver the workflow.

## Never Ask About (always default silently)

${qp.neverAskAbout.map(item => `- ${item}`).join('\n')}

## Inference Rules

${inference.principle}

**Negative (don't add what wasn't mentioned):**
${inference.negative.map(item => `- ${item}`).join('\n')}

**Positive (map user language to step types):**
${inference.positive.map(item => `- ${item}`).join('\n')}`;

  // Post-create suggestions
  if (consultation.postCreateSuggestions?.length) {
    output += `\n\n## After Creating a Workflow

Proactively suggest improvements:
${consultation.postCreateSuggestions.map(s => `- **${s.question}** -> ${s.recommendation}`).join('\n')}`;
  }

  // Document assumptions
  output += `\n\n## Document Assumptions

${ux.assumptions.instruction}
${ux.assumptions.guideline}`;

  // Proactive suggestions
  if (ux.proactiveSuggestions.enabled) {
    output += `\n\n## Proactive Suggestions

${ux.proactiveSuggestions.areas.map(a => `- ${a}`).join('\n')}`;
  }

  // Quick suggestions
  output += `\n\n## Quick Suggestions in Clarification Questions

${ux.quickSuggestions.rules.map(r => `- ${r}`).join('\n')}`;

  // Edit clarification
  output += `\n\n## Edit Clarification

${ux.editClarification.when}

**Clear intent (skip clarification):**
${ux.editClarification.clearIntentExamples.map(e => `- ${e}`).join('\n')}

**Never offer as edit options:** ${ux.editClarification.neverOfferAsEditOptions.join(', ')}

## Edit Step References

${ux.editStepReferences.rules.map(r => `- ${r}`).join('\n')}`;

  // Error handling
  output += `\n\n## Constraint Violations
${ux.whenConstraintViolated.action}. Example: "${ux.whenConstraintViolated.example}"

## Unsupported Features
${ux.whenUnsupported.action}. Example: "${ux.whenUnsupported.example}"`;

  return output;
}

// ============================================================================
// Template Catalog
// ============================================================================

function generateTemplatePatternsSection(catalog: TemplateCatalogConfig): string {
  const categoryLines = catalog.categories.map(cat => {
    const templateLines = cat.templates.map(t =>
      `  - **${t.name}** — Roles: ${t.roles.join(', ')} — ${t.pattern}`
    ).join('\n');
    return `### ${cat.name}\n${templateLines}`;
  }).join('\n\n');

  return `# Template Pattern Library

93 pre-built templates across 13 industries. Templates are a **starting skeleton**, not a shortcut to skip consultation.

## How to Use

1. **Still ask clarifying questions first** — templates don't replace consultation
2. **After clarification, check for a matching template**
3. **If matched, use as skeleton** — adapt names, fields, details to user's answers
4. **If answers diverge significantly** — build from scratch
5. **Note in assumptions** — "Based on 'X' template, adapted to your specifics"

${categoryLines}`;
}

// ============================================================================
// Utility Functions — Public API
// ============================================================================

/**
 * Generate a context message for the current workflow state.
 */
export function generateWorkflowContext(workflow: unknown): string {
  if (!workflow) {
    return 'No workflow exists yet. This will be a new workflow creation.';
  }

  const flow = workflow as {
    name?: string;
    steps?: Array<{ stepId: string; type: string; config?: { name?: string } }>;
    roles?: Array<{ roleId: string; name?: string; roleName?: string }>;
  };

  let stepList = '';
  if (flow.steps?.length) {
    const steps = flow.steps;
    const lastStep = steps[steps.length - 1];
    stepList = `\n## Step Reference (use these IDs for edits)\n`;
    stepList += `**Last step ID: ${lastStep.stepId}**\n\n`;
    steps.forEach((step, index) => {
      const name = step.config?.name || 'Unnamed';
      const isLast = index === steps.length - 1;
      stepList += `${index + 1}. "${name}" (${step.type}) - ID: ${step.stepId}${isLast ? ' [LAST]' : ''}\n`;
    });
  }

  let roleList = '';
  if (flow.roles?.length) {
    roleList = `\n## Roles\n`;
    flow.roles.forEach(role => {
      const name = role.name || role.roleName || 'Unnamed';
      roleList += `- "${name}" - ID: ${role.roleId}\n`;
    });
  }

  return `Current workflow: "${flow.name || 'Untitled'}"
${stepList}${roleList}
## Full Workflow JSON
\`\`\`json
${JSON.stringify(workflow, null, 2)}
\`\`\`

## Edit Guidelines
- Use step IDs from the reference list above
- If ambiguous, ask for clarification
- Never guess or make up step IDs`;
}

/**
 * Generate guidance for a specific step type.
 */
export function generateStepTypeGuidance(stepType: string): string | null {
  const stepTypes = getStepTypes();
  const config = stepTypes.find(s => s.stepType === stepType);

  if (!config?.aiGuidance) {
    return null;
  }

  const guidance = config.aiGuidance;
  let output = `## Guidance for ${stepType}\n`;

  if (guidance.whenToUse) {
    output += `\n**When to use:** ${guidance.whenToUse}`;
  }

  if (guidance.seQuestions?.length) {
    output += `\n**Questions to consider:**\n${guidance.seQuestions.map(q => `- ${q}`).join('\n')}`;
  }

  if (guidance.defaults?.length) {
    output += `\n**Defaults:** ${guidance.defaults.join('; ')}`;
  }

  return output;
}
