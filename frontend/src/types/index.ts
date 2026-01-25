/**
 * Frontend Types
 *
 * Types specific to the frontend application state and UI.
 */

// ============================================================================
// Workflow Types (matching backend)
// ============================================================================

export interface Flow {
  flowId: string;
  name: string;
  description?: string;
  steps: Step[];
  milestones: Milestone[];
  assigneePlaceholders: AssigneePlaceholder[];
  parameters?: Parameter[];
  triggerConfig?: TriggerConfig;
}

export interface Step {
  stepId: string;
  type: StepType;
  config: StepConfig;
  order?: number;
}

export type StepType =
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
  | 'SINGLE_CHOICE_BRANCH'
  | 'MULTI_CHOICE_BRANCH'
  | 'PARALLEL_BRANCH'
  | 'GOTO'
  | 'GOTO_DESTINATION'
  | 'TERMINATE'
  | 'WAIT'
  | 'AI_AUTOMATION'
  | 'SYSTEM_WEBHOOK'
  | 'SYSTEM_EMAIL'
  | 'SYSTEM_CHAT_MESSAGE'
  | 'BUSINESS_RULE';

export interface StepConfig {
  name: string;
  description?: string;
  assignee?: string;
  options?: StepOption[];
  paths?: BranchPath[];
  outcomes?: DecisionOutcome[];
  waitDuration?: WaitDuration;
  formFields?: FormField[];
  targetStepId?: string;
  destinationId?: string;
}

export interface StepOption {
  optionId: string;
  label: string;
  value?: string;
}

export interface BranchPath {
  pathId: string;
  label: string;
  steps: Step[];
}

export interface DecisionOutcome {
  outcomeId: string;
  label: string;
  steps: Step[];
}

export interface WaitDuration {
  value: number;
  unit: 'minutes' | 'hours' | 'days';
}

export interface FormField {
  fieldId: string;
  label: string;
  type: string;
  required?: boolean;
}

export interface Milestone {
  milestoneId: string;
  name: string;
  afterStepId: string;
}

export interface AssigneePlaceholder {
  placeholderId: string;
  roleName: string;
  description?: string;
}

export interface Parameter {
  parameterId: string;
  name: string;
  type: string;
  required?: boolean;
}

export interface TriggerConfig {
  type: 'manual' | 'automatic' | 'scheduled';
  /** Who starts the workflow (for manual triggers) */
  initiator?: string;
  /** Fields collected at kickoff (for manual triggers with forms) */
  kickoffFields?: string[];
  /** External system that triggers the workflow (for automatic triggers) */
  triggerSource?: string;
  /** Schedule expression (for scheduled triggers) */
  schedule?: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export type ResponseMode = 'create' | 'edit' | 'clarify' | 'reject' | 'respond';

/**
 * Suggested action for respond mode
 */
export interface SuggestedAction {
  label: string;
  /** For 'prompt' type - the message to send */
  prompt?: string;
  /** Action type determines frontend behavior:
   * - 'approve_plan': Trigger plan approval (no scroll needed)
   * - 'discard_plan': Discard the pending plan
   * - 'edit_plan': Open edit input for the plan
   * - 'prompt': Send the prompt as a new message (default)
   */
  actionType?: 'approve_plan' | 'discard_plan' | 'edit_plan' | 'prompt';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mode?: ResponseMode;
  isStreaming?: boolean;
  pendingPlan?: PendingPlan;
  planPublished?: boolean;  // Whether the plan has been published (card locked)
  clarifications?: Clarification[];
  clarificationAnswers?: Record<string, string>;  // Answers to clarification questions
  clarificationsLocked?: boolean;  // Whether the clarification card is locked (submitted)
  rejection?: Rejection;
  suggestedActions?: SuggestedAction[];  // For 'respond' mode - quick actions
  error?: string;
  attachment?: MessageAttachment;
  // Phase 2 enhancements (post-creation)
  phase2?: Phase2Data;
}

export interface Phase2Data {
  workflowName: string;
  isLocked?: boolean;
  wasSkipped?: boolean;
  selections?: Record<string, string | Record<string, string>>;
}

export interface PendingPlan {
  planId: string;
  workflow: Flow;
  message: string;
  assumptions?: string[];  // What the AI assumed/inferred
  mode?: 'create' | 'edit';  // Whether this is a new workflow or an edit
  operations?: EditOperation[];  // Edit operations (for edit mode)
}

/**
 * Edit operation for patch-based workflow updates
 */
export interface EditOperation {
  op: 'ADD_STEP_AFTER' | 'ADD_STEP_BEFORE' | 'REMOVE_STEP' | 'UPDATE_STEP' | 'MOVE_STEP' | 'ADD_PATH_STEP_AFTER' | 'ADD_PATH_STEP_BEFORE' | 'UPDATE_FLOW_METADATA';
  stepId?: string;
  afterStepId?: string;
  beforeStepId?: string;
  branchStepId?: string;
  pathId?: string;
  step?: Partial<Step>;
  updates?: Record<string, unknown>;
}

// ============================================================================
// Clarification Types (Enhanced)
// ============================================================================

/**
 * Input type for clarification questions
 */
export type ClarificationInputType =
  | 'text'           // Free text only (default)
  | 'text_with_file' // Free text + optional file upload
  | 'selection';     // Single-select with conditional fields

/**
 * File upload configuration for text_with_file input type
 */
export interface FileUploadConfig {
  /** Prompt text for file upload area */
  placeholder: string;
  /** Accepted MIME types (default: images and PDF) */
  acceptedTypes?: string[];
  /** Help text explaining what kind of file is useful */
  helpText?: string;
}

/**
 * Conditional field shown when a selection option is chosen
 */
export interface ConditionalField {
  /** Unique field identifier */
  fieldId: string;
  /** Field label text */
  label: string;
  /** Field type */
  type: 'text' | 'textarea';
  /** Placeholder text */
  placeholder?: string;
  /** Whether this field is required when visible */
  required?: boolean;
}

/**
 * Selection option for selection input type
 */
export interface SelectionOption {
  /** Unique option identifier */
  optionId: string;
  /** Display label */
  label: string;
  /** Short description shown below label */
  description?: string;
  /** Icon identifier (lucide icon name) */
  icon?: string;
  /** Conditional fields to show when this option is selected */
  conditionalFields?: ConditionalField[];
}

/**
 * Enhanced clarification question
 */
export interface Clarification {
  /** Unique question identifier */
  id: string;
  /** Question text */
  text: string;
  /** Input type - defaults to 'text' for backward compatibility */
  inputType?: ClarificationInputType;

  // For inputType: 'text' (default)
  /** Placeholder text for text input */
  placeholder?: string;

  // For inputType: 'text_with_file'
  /** File upload configuration */
  fileUpload?: FileUploadConfig;

  // For inputType: 'selection'
  /** Selection options (required when inputType is 'selection') */
  options?: SelectionOption[];
}

/**
 * Answer value for a single clarification question
 */
export interface ClarificationAnswer {
  /** The question ID this answers */
  questionId: string;
  /** Text value (for text or text_with_file types) */
  textValue?: string;
  /** Selected option ID for selection type */
  selectedOptionId?: string;
  /** File attachment if any */
  file?: File;
  /** File preview URL for display */
  filePreviewUrl?: string;
  /** Conditional field values keyed by fieldId */
  conditionalValues?: Record<string, string>;
}

export interface Rejection {
  reason: string;
  suggestion?: string;
}

export interface MessageAttachment {
  type: 'image' | 'pdf';
  name: string;
  url: string;
}

// ============================================================================
// Session Types
// ============================================================================

export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  workflowName: string | null;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  isThinking: boolean;
  streamingContent: string;
  pendingPlan: PendingPlan | null;
  error: string | null;
}

export interface WorkflowState {
  workflow: Flow | null;
  isLoading: boolean;
}

export interface SessionState {
  currentSessionId: string | null;
  sessions: Session[];
}

// ============================================================================
// Step Type Metadata
// ============================================================================

export const STEP_TYPE_META: Record<StepType, { label: string; color: string; category: string }> = {
  // Human Actions
  FORM: { label: 'Form', color: '#22c55e', category: 'human' },
  QUESTIONNAIRE: { label: 'Questionnaire', color: '#22c55e', category: 'human' },
  FILE_REQUEST: { label: 'File Request', color: '#22c55e', category: 'human' },
  TODO: { label: 'To-Do', color: '#22c55e', category: 'human' },
  APPROVAL: { label: 'Approval', color: '#3b82f6', category: 'human' },
  ACKNOWLEDGEMENT: { label: 'Acknowledgement', color: '#ec4899', category: 'human' },
  ESIGN: { label: 'E-Sign', color: '#8b5cf6', category: 'human' },
  DECISION: { label: 'Decision', color: '#8b5cf6', category: 'human' },
  CUSTOM_ACTION: { label: 'Custom Action', color: '#6b7280', category: 'human' },
  WEB_APP: { label: 'Web App', color: '#6b7280', category: 'human' },

  // Control Flow
  SINGLE_CHOICE_BRANCH: { label: 'Single Choice', color: '#f59e0b', category: 'control' },
  MULTI_CHOICE_BRANCH: { label: 'Multi Choice', color: '#f59e0b', category: 'control' },
  PARALLEL_BRANCH: { label: 'Parallel Branch', color: '#f59e0b', category: 'control' },
  GOTO: { label: 'Go To', color: '#6b7280', category: 'control' },
  GOTO_DESTINATION: { label: 'Destination', color: '#6b7280', category: 'control' },
  TERMINATE: { label: 'Terminate', color: '#ef4444', category: 'control' },
  WAIT: { label: 'Wait', color: '#6b7280', category: 'control' },

  // Automations
  AI_AUTOMATION: { label: 'AI Automation', color: '#8b5cf6', category: 'automation' },
  SYSTEM_WEBHOOK: { label: 'Webhook', color: '#6b7280', category: 'automation' },
  SYSTEM_EMAIL: { label: 'Email', color: '#6b7280', category: 'automation' },
  SYSTEM_CHAT_MESSAGE: { label: 'Chat Message', color: '#6b7280', category: 'automation' },
  BUSINESS_RULE: { label: 'Business Rule', color: '#6b7280', category: 'automation' },
};

// ============================================================================
// Role Colors
// ============================================================================

export const ROLE_COLORS = [
  '#14b8a6', // Teal
  '#8b5cf6', // Purple
  '#22c55e', // Green
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#6366f1', // Indigo
];

export function getRoleColor(index: number): string {
  return ROLE_COLORS[index % ROLE_COLORS.length];
}

export function getRoleInitials(name: string): string {
  const words = name.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
