/**
 * Step Type Definitions
 *
 * Defines all step types supported by the workflow system.
 * This includes human actions, controls, and automations.
 */

import type { AssigneeRef, AssigneeOrAssignees } from './assignees.js';
import type { RelativeDue, AssigneeActionAlerts, CoordinatorEscalationAlerts } from './workflow.js';

// ============================================================================
// Step-Level Reminder Override
// ============================================================================

export interface StepReminderOverride {
  useFlowDefaults: boolean;
  actionAlerts?: Partial<AssigneeActionAlerts>;
  escalationAlerts?: Partial<CoordinatorEscalationAlerts>;
}

// ============================================================================
// Step Type Enum
// ============================================================================

export type HumanActionType =
  | 'FORM'
  | 'QUESTIONNAIRE'
  | 'FILE_REQUEST'
  | 'TODO'
  | 'APPROVAL'
  | 'ACKNOWLEDGEMENT'
  | 'ESIGN'
  | 'DECISION'
  | 'CUSTOM_ACTION'
  | 'WEB_APP'
  | 'PDF_FORM';

export type ControlType =
  | 'SINGLE_CHOICE_BRANCH'
  | 'MULTI_CHOICE_BRANCH'
  | 'PARALLEL_BRANCH'
  | 'GOTO'
  | 'GOTO_DESTINATION'
  | 'TERMINATE'
  | 'WAIT'
  | 'SUB_FLOW';

export type AutomationType =
  | 'AI_CUSTOM_PROMPT'
  | 'AI_EXTRACT'
  | 'AI_SUMMARIZE'
  | 'AI_TRANSCRIBE'
  | 'AI_TRANSLATE'
  | 'AI_WRITE'
  | 'SYSTEM_WEBHOOK'
  | 'SYSTEM_EMAIL'
  | 'SYSTEM_CHAT_MESSAGE'
  | 'SYSTEM_UPDATE_WORKSPACE'
  | 'BUSINESS_RULE'
  | 'INTEGRATION_AIRTABLE'
  | 'INTEGRATION_CLICKUP'
  | 'INTEGRATION_DROPBOX'
  | 'INTEGRATION_GMAIL'
  | 'INTEGRATION_GOOGLE_DRIVE'
  | 'INTEGRATION_GOOGLE_SHEETS'
  | 'INTEGRATION_WRIKE';

export type StepType = HumanActionType | ControlType | AutomationType;

// ============================================================================
// Base Step Interface
// ============================================================================

export interface BaseStep {
  stepId: string;
  type: StepType;
  milestoneId: string;
  title?: string;
  description?: string;

  // Backwards compatibility
  _unknown?: boolean;  // True if step type not recognized
  _originalData?: unknown;  // Preserve original data for unknown types
}

// ============================================================================
// Common Options
// ============================================================================

export interface StepOptions {
  visibleToAllAssignees?: boolean;
  skipSequentialOrder?: boolean;
}

export interface VisibilityConfig {
  coordinatorOnly?: boolean;
}

// ============================================================================
// Output Definitions
// ============================================================================

export interface StepOutput {
  key: string;
  type: 'TEXT' | 'FILE' | 'FILE_LIST' | 'JSON' | string;
  description?: string;
}

export interface InputRef {
  ref: string;  // e.g., "s1_form.outputs.form.client_name"
}

// ============================================================================
// Human Action Steps
// ============================================================================

// --- FORM ---
export interface FormField {
  key: string;
  type: string;  // TEXT_SINGLE_LINE, DROPDOWN, etc.
  label: string;
  required?: boolean;
  choices?: string[];
}

export interface FormStep extends BaseStep {
  type: 'FORM';
  assignees: AssigneeOrAssignees;
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  form: {
    fields: FormField[];
  };
  outputs?: StepOutput[];
}

// --- QUESTIONNAIRE ---
export interface QuestionnaireStep extends BaseStep {
  type: 'QUESTIONNAIRE';
  assignees: AssigneeOrAssignees;
  options?: StepOptions;
  questionnaire: {
    question: string;
    answerType: 'SINGLE_SELECT' | 'MULTI_SELECT';
    choices: string[];
  };
  review?: {
    required: boolean;
    reviewer?: AssigneeRef;
  };
  outputs?: StepOutput[];
}

// --- FILE_REQUEST ---
export interface FileRequestStep extends BaseStep {
  type: 'FILE_REQUEST';
  assignees: AssigneeOrAssignees;
  reviewer?: AssigneeRef;
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  outputs?: StepOutput[];
}

// --- TODO ---
export type CompletionMode = 'ONE' | 'MAJORITY' | 'ALL';

export interface TodoStep extends BaseStep {
  type: 'TODO';
  assignees: AssigneeOrAssignees;
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  completion?: {
    mode: CompletionMode;
  };
}

// --- APPROVAL ---
export type AssigneeOrder = 'SEQUENTIAL' | 'PARALLEL';

export interface ApprovalStep extends BaseStep {
  type: 'APPROVAL';
  assignees: AssigneeOrAssignees;
  attachments?: { ref: string }[];
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  approval: {
    completion: { mode: CompletionMode };
    assigneeOrder: AssigneeOrder;
  };
}

// --- ACKNOWLEDGEMENT ---
export interface AcknowledgementStep extends BaseStep {
  type: 'ACKNOWLEDGEMENT';
  assignees: AssigneeOrAssignees;
  attachments?: { ref: string }[];
  options?: StepOptions & {
    requireAttachmentReview?: boolean;
  };
}

// --- ESIGN ---
export interface EsignStep extends BaseStep {
  type: 'ESIGN';
  signers: AssigneeRef[];
  signingOrder: AssigneeOrder;
  document?: { ref: string };
  outputs?: StepOutput[];
}

// --- DECISION ---
export interface DecisionOutcome {
  outcomeId: string;
  label: string;
  steps: Step[];  // Nested steps for this outcome
}

export interface DecisionStep extends BaseStep {
  type: 'DECISION';
  assignee: AssigneeRef;  // Single assignee only
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  outcomes: DecisionOutcome[];
}

// --- CUSTOM_ACTION ---
export interface CustomActionStep extends BaseStep {
  type: 'CUSTOM_ACTION';
  assignees: AssigneeOrAssignees;
  options?: StepOptions;
  actionConfig?: Record<string, unknown>;
}

// --- WEB_APP ---
export interface WebAppStep extends BaseStep {
  type: 'WEB_APP';
  assignees: AssigneeOrAssignees;
  options?: StepOptions;
  webAppConfig?: {
    url: string;
    [key: string]: unknown;
  };
}

// --- PDF_FORM ---
export interface PdfFormField {
  fieldId: string;
  pdfFieldName: string;
  label: string;
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: string;
  dataRef?: string;
}

export interface PdfFormStep extends BaseStep {
  type: 'PDF_FORM';
  assignees: AssigneeOrAssignees;
  due?: RelativeDue;
  reminderOverride?: StepReminderOverride;
  options?: StepOptions;
  pdfForm: {
    documentRef: string;
    fields: PdfFormField[];
  };
  outputs?: StepOutput[];
}

// ============================================================================
// Control Steps
// ============================================================================

// --- Condition Types ---
export interface EqualsCondition {
  type: 'EQUALS';
  left: string;
  right: string;
}

export interface NotEqualsCondition {
  type: 'NOT_EQUALS';
  left: string;
  right: string;
}

export interface ContainsCondition {
  type: 'CONTAINS';
  left: string;
  right: string;
}

export interface NotContainsCondition {
  type: 'NOT_CONTAINS';
  left: string;
  right: string;
}

export interface NotEmptyCondition {
  type: 'NOT_EMPTY';
  value: string;
}

export interface ElseCondition {
  type: 'ELSE';
}

export type BranchCondition =
  | EqualsCondition
  | NotEqualsCondition
  | ContainsCondition
  | NotContainsCondition
  | NotEmptyCondition
  | ElseCondition;

// --- Branch Path ---
export interface BranchPath {
  pathId: string;
  label: string;
  condition?: BranchCondition;
  conditions?: BranchCondition[];  // Multiple conditions per branch (up to 10)
  conditionLogic?: 'ALL' | 'ANY';  // How to combine multiple conditions
  steps: Step[];
}

// --- SINGLE_CHOICE_BRANCH ---
export interface SingleChoiceBranchStep extends BaseStep {
  type: 'SINGLE_CHOICE_BRANCH';
  paths: BranchPath[];  // 2-3 paths
}

// --- MULTI_CHOICE_BRANCH ---
export interface MultiChoiceBranchStep extends BaseStep {
  type: 'MULTI_CHOICE_BRANCH';
  paths: BranchPath[];  // 2-3 paths
}

// --- PARALLEL_BRANCH ---
export interface ParallelBranchStep extends BaseStep {
  type: 'PARALLEL_BRANCH';
  paths: BranchPath[];  // 2-3 paths
}

// --- GOTO ---
export interface GotoStep extends BaseStep {
  type: 'GOTO';
  targetGotoDestinationId: string;
}

// --- GOTO_DESTINATION ---
export interface GotoDestinationStep extends BaseStep {
  type: 'GOTO_DESTINATION';
  label: string;
}

// --- TERMINATE ---
export type TerminateStatus = 'COMPLETED' | 'CANCELLED';

export interface TerminateStep extends BaseStep {
  type: 'TERMINATE';
  status: TerminateStatus;
}

// --- WAIT ---
export interface WaitStep extends BaseStep {
  type: 'WAIT';
  waitFor: {
    type: 'EXTERNAL_APP_EVENT' | 'SUB_FLOW_COMPLETION' | 'DURATION' | 'DATE';
    app?: string;
    event?: string;
    subFlowStepId?: string;
    outputVariables?: Array<{ key: string; ref: string }>;
    duration?: { value: number; unit: 'MINUTES' | 'HOURS' | 'DAYS' };
    date?: string;
  };
}

// --- SUB_FLOW ---
export interface SubFlowStep extends BaseStep {
  type: 'SUB_FLOW';
  flowTemplateId: string;
  assigneeMappings?: Array<{
    parentRoleId: string;
    childRoleId: string;
  }>;
  variableMappings?: Array<{
    parentKey: string;
    childKey: string;
  }>;
}

// ============================================================================
// Automation Steps
// ============================================================================

// --- Shared AI Automation Base ---
export interface BaseAiStep extends BaseStep {
  visibility?: VisibilityConfig;
  inputs?: InputRef[];
  prompt?: string;
  knowledge?: {
    sources: string[];
    mode: 'REQUIRED' | 'OPTIONAL';
  };
  outputs: StepOutput[];
}

// --- AI_CUSTOM_PROMPT ---
export interface AiCustomPromptStep extends BaseAiStep {
  type: 'AI_CUSTOM_PROMPT';
  prompt: string;
}

// --- AI_EXTRACT ---
export interface AiExtractStep extends BaseAiStep {
  type: 'AI_EXTRACT';
}

// --- AI_SUMMARIZE ---
export interface AiSummarizeStep extends BaseAiStep {
  type: 'AI_SUMMARIZE';
}

// --- AI_TRANSCRIBE ---
export interface AiTranscribeStep extends BaseAiStep {
  type: 'AI_TRANSCRIBE';
  sourceUrl?: string;
}

// --- AI_TRANSLATE ---
export interface AiTranslateStep extends BaseAiStep {
  type: 'AI_TRANSLATE';
  targetLanguage?: string;
}

// --- AI_WRITE ---
export interface AiWriteStep extends BaseAiStep {
  type: 'AI_WRITE';
  contentParams?: {
    tone?: string;
    audience?: string;
    format?: string;
    goals?: string;
    length?: string;
  };
}

// --- SYSTEM_WEBHOOK ---
export interface SystemWebhookStep extends BaseStep {
  type: 'SYSTEM_WEBHOOK';
  visibility?: VisibilityConfig;
  webhook: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  };
  payload?: Record<string, string>;
}

// --- SYSTEM_EMAIL ---
export interface SystemEmailStep extends BaseStep {
  type: 'SYSTEM_EMAIL';
  visibility?: VisibilityConfig;
  email: {
    to: string[];
    subject: string;
    body: string;
  };
}

// --- SYSTEM_CHAT_MESSAGE ---
export interface SystemChatMessageStep extends BaseStep {
  type: 'SYSTEM_CHAT_MESSAGE';
  visibility?: VisibilityConfig;
  message: string;
}

// --- SYSTEM_UPDATE_WORKSPACE ---
export interface SystemUpdateWorkspaceStep extends BaseStep {
  type: 'SYSTEM_UPDATE_WORKSPACE';
  visibility?: VisibilityConfig;
  updates: Record<string, string>;
}

// --- BUSINESS_RULE ---
export interface BusinessRuleStep extends BaseStep {
  type: 'BUSINESS_RULE';
  visibility?: VisibilityConfig;
  inputs: { key: string; ref: string }[];
  rules: {
    when: Record<string, string>;
    set: Record<string, string>;
  }[];
  outputs: StepOutput[];
}

// --- INTEGRATION ---
export interface IntegrationStep extends BaseStep {
  type: 'INTEGRATION_AIRTABLE' | 'INTEGRATION_CLICKUP' | 'INTEGRATION_DROPBOX' | 'INTEGRATION_GMAIL' | 'INTEGRATION_GOOGLE_DRIVE' | 'INTEGRATION_GOOGLE_SHEETS' | 'INTEGRATION_WRIKE';
  visibility?: VisibilityConfig;
  integration: {
    provider: string;
    event: string;
    accountId?: string;
    fieldMappings: Array<{
      targetField: string;
      value: string;
      isDynamic: boolean;
    }>;
    config: Record<string, unknown>;
  };
  outputs?: StepOutput[];
}

// ============================================================================
// Unknown Step (for backwards compatibility)
// ============================================================================

export interface UnknownStep extends BaseStep {
  _unknown: true;
  _originalData: unknown;
}

// ============================================================================
// Union Type for All Steps
// ============================================================================

export type Step =
  // Human Actions
  | FormStep
  | QuestionnaireStep
  | FileRequestStep
  | TodoStep
  | ApprovalStep
  | AcknowledgementStep
  | EsignStep
  | DecisionStep
  | CustomActionStep
  | WebAppStep
  | PdfFormStep
  // Controls
  | SingleChoiceBranchStep
  | MultiChoiceBranchStep
  | ParallelBranchStep
  | GotoStep
  | GotoDestinationStep
  | TerminateStep
  | WaitStep
  | SubFlowStep
  // Automations
  | AiCustomPromptStep
  | AiExtractStep
  | AiSummarizeStep
  | AiTranscribeStep
  | AiTranslateStep
  | AiWriteStep
  | SystemWebhookStep
  | SystemEmailStep
  | SystemChatMessageStep
  | SystemUpdateWorkspaceStep
  | BusinessRuleStep
  | IntegrationStep
  // Unknown
  | UnknownStep;

// ============================================================================
// Type Guards
// ============================================================================

export function isHumanActionStep(step: Step): boolean {
  const humanActions: StepType[] = [
    'FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO',
    'APPROVAL', 'ACKNOWLEDGEMENT', 'ESIGN', 'DECISION',
    'CUSTOM_ACTION', 'WEB_APP', 'PDF_FORM',
  ];
  return humanActions.includes(step.type);
}

export function isControlStep(step: Step): boolean {
  const controls: StepType[] = [
    'SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH',
    'GOTO', 'GOTO_DESTINATION', 'TERMINATE', 'WAIT', 'SUB_FLOW',
  ];
  return controls.includes(step.type);
}

export function isAutomationStep(step: Step): boolean {
  const automations: StepType[] = [
    'AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE',
    'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE',
    'SYSTEM_WEBHOOK', 'SYSTEM_EMAIL',
    'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE', 'BUSINESS_RULE',
    'INTEGRATION_AIRTABLE', 'INTEGRATION_CLICKUP', 'INTEGRATION_DROPBOX',
    'INTEGRATION_GMAIL', 'INTEGRATION_GOOGLE_DRIVE', 'INTEGRATION_GOOGLE_SHEETS',
    'INTEGRATION_WRIKE',
  ];
  return automations.includes(step.type);
}

export function isBranchStep(
  step: Step
): step is SingleChoiceBranchStep | MultiChoiceBranchStep | ParallelBranchStep {
  // Check both the type AND that paths exists and is an array
  // This prevents crashes when LLM generates malformed branch steps
  return (
    ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH'].includes(step.type) &&
    'paths' in step &&
    Array.isArray((step as { paths?: unknown }).paths)
  );
}

export function isDecisionStep(step: Step): step is DecisionStep {
  // Check both the type AND that outcomes exists and is an array
  // This prevents crashes when LLM generates malformed decision steps
  return (
    step.type === 'DECISION' &&
    'outcomes' in step &&
    Array.isArray((step as { outcomes?: unknown }).outcomes)
  );
}

export function isUnknownStep(step: Step): step is UnknownStep {
  return '_unknown' in step && step._unknown === true;
}

export function hasNestedSteps(step: Step): boolean {
  return isBranchStep(step) || isDecisionStep(step);
}
