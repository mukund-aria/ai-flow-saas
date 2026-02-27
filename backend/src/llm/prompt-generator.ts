/**
 * System Prompt Generator
 *
 * Assembles the system prompt from modular configuration files:
 *   1. Technical: constraints, step types, defaults, triggers
 *   2. Consultative: consultation stages, inference rules, post-create suggestions
 *   3. UX: response formatting, question policy, edit behavior
 *
 * The public API (generateSystemPrompt, generateWorkflowContext, generateStepTypeGuidance)
 * is unchanged.
 */

import {
  getConstraints,
  getStepTypes,
  getDefaults,
  getConsultation,
  getUXGuidelines,
  getTemplateCatalog,
  type ConstraintsConfig,
  type StepTypeConfig,
  type DefaultsConfig,
  type ConsultationConfig,
  type UXGuidelinesConfig,
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
  const templateCatalog = getTemplateCatalog();

  const templateSection = templateCatalog
    ? `\n\n${generateTemplatePatternsSection(templateCatalog)}`
    : '';

  const clarificationNote = metadata?.clarificationsPending
    ? `\nNote: You asked clarification questions in your previous message. The user's response follows.\n`
    : '';

  return [
    generateRoleSection(consultation, ux),
    generateOutputFormatSection(ux),
    generateConstraintsSection(constraints),
    generateStepTypesSection(stepTypes),
    generateConsultationSection(consultation),
    generateDefaultsSection(defaults),
    generateDueDateTypesSection(),
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
// Section Generators — Output Format (UX)
// ============================================================================

function generateOutputFormatSection(ux: UXGuidelinesConfig): string {
  return `# Response Format — Using Tools

You MUST use one of the provided tools to respond. NEVER respond with plain text only.

## Available Tools

1. **create_workflow** — Design a complete workflow
2. **ask_clarification** — Request more information TO CREATE OR EDIT a workflow
3. **edit_workflow** — Modify an existing workflow
4. **reject_request** — Request cannot be fulfilled due to platform constraints
5. **respond** — Informational questions, explanations, general conversation

## respond vs ask_clarification

**USE respond** when the user is:
- Asking a QUESTION about the current workflow
- Asking for EXPLANATION of what you did
- Making a COMMENT or observation
- Asking about YOUR CAPABILITIES
- Any message that is NOT a request to create or modify

**USE ask_clarification** ONLY when:
- User wants to CREATE but request is vague
- User wants to EDIT but you need specifics
- You genuinely need information TO TAKE AN ACTION

## When to Ask vs Create

**ASK** when request is vague or missing key details:
- "I need an invoice approval process" -> Who's involved? What thresholds?
- "Help me with onboarding" -> Client or employee? Who participates?

**CREATE** when you have enough specifics:
- User described concrete steps, roles, or process flow
- User has answered your clarifying questions

## Recognizing Clarification Answers

When you see Q&A pairs like:
**Q: Who is involved?**
A: Account manager and client

You MUST:
1. Extract the information
2. IMMEDIATELY use create_workflow
3. Do NOT use ask_clarification again

## Avoid Redundant Questions

- Do NOT re-ask about things you can infer
- If they mentioned "manager approves", you know there's an approval point
- Prefer 2-3 focused questions over 4-5 that overlap

## Clarification Question Types

### Text (default) — open-ended
${ux.questionTypes.text.roleGuidance ? `For role questions: ${ux.questionTypes.text.roleGuidance}` : ''}

Example: { "id": "q_roles", "text": "Who is involved?", "placeholder": "e.g., Client, Account Manager..." }

### Text with File Upload — process questions
Example: { "id": "q_steps", "text": "What are the key steps?", "inputType": "text_with_file", "placeholder": "Describe steps or upload a diagram" }

### Selection — platform-specific options
Example:
{
  "id": "q_kickoff",
  "text": "How does this process get started?",
  "inputType": "selection",
  "options": [
    { "optionId": "manual", "label": "Manual Start", "description": "Someone clicks to start", "icon": "MousePointerClick" },
    { "optionId": "automatic", "label": "Triggered by Another System", "description": "Started via webhook", "icon": "Zap" }
  ]
}

Available icons: MousePointerClick, Zap, FileText

## Branch Steps — Nesting Structure

Steps with conditional paths (SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH, PARALLEL_BRANCH, DECISION) MUST nest steps INSIDE paths/outcomes.

### WRONG — steps at top level:
\`\`\`json
{ "steps": [
  { "stepId": "s1", "type": "FORM", "config": { "name": "Expense Form" } },
  { "stepId": "s2", "type": "SINGLE_CHOICE_BRANCH", "config": { "name": "Amount Routing", "paths": [] } },
  { "stepId": "s3", "type": "APPROVAL", "config": { "name": "Manager Approval" } }
]}
\`\`\`

### CORRECT — steps nested inside paths:
SINGLE_CHOICE_BRANCH: 2-3 paths, each with \`condition\` or \`conditions\` (up to 10, combined with \`conditionLogic\`: ALL|ANY).
Condition types: EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, NOT_EMPTY, ELSE.

\`\`\`json
{ "steps": [
  { "stepId": "s1", "type": "FORM", "config": { "name": "Expense Form" } },
  { "stepId": "s2", "type": "SINGLE_CHOICE_BRANCH", "config": { "name": "Amount Routing", "paths": [
    { "pathId": "p_small", "label": "Under $5K", "condition": { "type": "EQUALS", "left": "{Step 1 / Category}", "right": "Small" },
      "steps": [{ "stepId": "s2a", "type": "APPROVAL", "config": { "name": "Manager Approval", "assignee": "Manager" } }] },
    { "pathId": "p_large", "label": "$5K+", "condition": { "type": "ELSE" },
      "steps": [{ "stepId": "s2b", "type": "APPROVAL", "config": { "name": "Director Approval", "assignee": "Director" } }] }
  ]}},
  { "stepId": "s3", "type": "SYSTEM_EMAIL", "config": { "name": "Confirmation" } }
]}
\`\`\`

### MULTI_CHOICE_BRANCH
All paths with true conditions execute simultaneously. Use when criteria are not mutually exclusive.

### DECISION — uses "outcomes" instead of "paths":
\`\`\`json
{ "stepId": "s3", "type": "DECISION", "config": { "name": "Review Decision", "assignee": "Manager", "outcomes": [
  { "outcomeId": "approve", "label": "Approve", "steps": [{ "type": "SYSTEM_EMAIL", "config": { "name": "Approval Notice" } }] },
  { "outcomeId": "reject", "label": "Reject", "steps": [{ "type": "SYSTEM_EMAIL", "config": { "name": "Rejection Notice" } }] }
]}}
\`\`\`

## Concurrent Execution Patterns

### skipSequentialOrder — 2-3 concurrent individual steps
\`\`\`json
{ "steps": [
  { "stepId": "s1", "type": "FORM", "config": { "name": "Application", "assignee": "Applicant" } },
  { "stepId": "s2", "type": "FILE_REQUEST", "config": { "name": "Background Check", "assignee": "HR", "skipSequentialOrder": true } },
  { "stepId": "s3", "type": "TODO", "config": { "name": "IT Setup", "assignee": "IT", "skipSequentialOrder": true } },
  { "stepId": "s4", "type": "APPROVAL", "config": { "name": "Final Approval", "assignee": "Manager" } }
]}
\`\`\`
Steps 2+3 run concurrently after step 1. Step 4 waits for both.

### PARALLEL_BRANCH — multi-step parallel tracks

### Decision tree:
- 2-3 individual concurrent steps -> skipSequentialOrder
- Multi-step parallel tracks -> PARALLEL_BRANCH
- Conditional routing (automated) -> SINGLE_CHOICE_BRANCH
- Conditional routing (human) -> DECISION

## GOTO Revision Loops

\`\`\`json
{ "steps": [
  { "stepId": "s1", "type": "GOTO_DESTINATION", "config": { "name": "Review Start", "destinationLabel": "Point A" } },
  { "stepId": "s2", "type": "FILE_REQUEST", "config": { "name": "Upload Document", "assignee": "Client" } },
  { "stepId": "s3", "type": "DECISION", "config": { "name": "Review", "assignee": "Reviewer", "outcomes": [
    { "outcomeId": "approve", "label": "Approve", "steps": [{ "type": "SYSTEM_EMAIL", "config": { "name": "Approved" } }] },
    { "outcomeId": "reject", "label": "Revise", "steps": [{ "type": "GOTO", "config": { "name": "Back", "targetGotoDestinationId": "s1" } }] }
  ]}}
]}
\`\`\`
GOTO only inside DECISION or SINGLE_CHOICE_BRANCH. GOTO_DESTINATION must be on main path.

## Milestones

Group steps into phases. Each milestone has name and afterStepId.
\`\`\`json
{ "milestones": [
  { "milestoneId": "m_1", "name": "Collection", "afterStepId": "s0" },
  { "milestoneId": "m_2", "name": "Review", "afterStepId": "s3" }
]}
\`\`\`
Milestones cannot be inside branches. For 8+ step workflows, suggest phases.

## Step-Specific Config

- **FORM**: formFields array (fieldId, label, type, required, options)
- **QUESTIONNAIRE**: questions array (questionId, question, answerType, choices)
- **FILE_REQUEST**: fileRequest (maxFiles, allowedTypes, instructions)
- **ESIGN**: esign (documentName, signingOrder)
- **AI types**: aiAutomation (actionType, prompt, inputFields, outputFields)
- **SYSTEM_EMAIL**: systemEmail (to, subject, body — all support DDR)
- **SYSTEM_WEBHOOK**: systemWebhook (url, method, headers, payload)
- **PDF_FORM**: pdfForm (documentUrl, fields array)
- **SUB_FLOW**: subFlow (flowTemplateId, assigneeMappings, variableMappings)
- **WAIT**: waitType (DURATION|DATE|CONDITION), waitDuration
- **TERMINATE**: terminateStatus (COMPLETED|CANCELLED)
- **GOTO**: targetGotoDestinationId
- **GOTO_DESTINATION**: destinationLabel`;
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

function generateDueDateTypesSection(): string {
  return `## Due Dates

- **RELATIVE**: \`{ "type": "RELATIVE", "value": 3, "unit": "DAYS" }\` — X time after step starts
- **FIXED**: \`{ "type": "FIXED", "date": "2026-04-15" }\` — specific date
- **BEFORE_FLOW_DUE**: \`{ "type": "BEFORE_FLOW_DUE", "value": 5, "unit": "DAYS" }\` — X before deadline

Flow-level: RELATIVE and FIXED only. Use RELATIVE for reusable templates. Valid units: HOURS, DAYS, WEEKS.`;
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
    assigneePlaceholders?: Array<{ placeholderId: string; name?: string; roleName?: string }>;
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
  if (flow.assigneePlaceholders?.length) {
    roleList = `\n## Roles\n`;
    flow.assigneePlaceholders.forEach(role => {
      const name = role.name || role.roleName || 'Unnamed';
      roleList += `- "${name}" - ID: ${role.placeholderId}\n`;
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
