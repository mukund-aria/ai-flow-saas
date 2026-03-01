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
  workspaceNameTemplate?: string;
  kickoff?: KickoffConfig;
  permissions?: FlowPermissions;
  settings?: FlowSettings;
  dueDates?: FlowDueDates;
  steps: Step[];
  milestones: Milestone[];
  roles: Role[];
  parameters?: Parameter[];
  triggerConfig?: TriggerConfig;
  /** User IDs of template coordinators who can see ALL runs of this template */
  templateCoordinatorIds?: string[];
}

// ============================================================================
// Kickoff / Trigger Configuration
// ============================================================================

export type StartMode =
  | 'MANUAL_EXECUTE'
  | 'KICKOFF_FORM'
  | 'START_LINK'
  | 'WEBHOOK'
  | 'SCHEDULE'
  | 'INTEGRATION';

export interface KickoffConfig {
  defaultStartMode: StartMode;
  supportedStartModes: StartMode[];
  kickoffFormEnabled?: boolean;
  kickoffFormFields?: FormField[];
  startLinkEnabled?: boolean;
  startLink?: StartLinkConfig;
  flowVariables: FlowVariable[];
  notes?: string[];
}

export interface StartLinkConfig {
  enabled: boolean;
  url?: string;
  embedHtml?: string;
  qrCodeUrl?: string;
  initPage?: {
    title: string;
    subtitle?: string;
    buttonLabel: string;
  };
  completedPage?: {
    imageUrl?: string;
    title: string;
    subtitle?: string;
  };
}

export interface FlowVariable {
  key: string;
  type: 'TEXT' | 'FILE';
  required: boolean;
  description?: string;
}

// ============================================================================
// Permissions
// ============================================================================

export type PermissionType = 'EXPLICIT_USERS' | 'ALL_MEMBERS' | 'ADMINS_ONLY';

export interface PermissionConfig {
  type: PermissionType;
  principals?: string[];
}

export interface FlowPermissions {
  execute: PermissionConfig;
  edit: PermissionConfig;
  coordinate: PermissionConfig;
}

// ============================================================================
// Flow Settings
// ============================================================================

export interface FlowSettings {
  chatAssistanceEnabled?: boolean;
  chatAssistanceDefault?: 'ON' | 'OFF';
  autoArchiveEnabled?: boolean;
  coverImage?: string | 'DEFAULT';
  notifications?: FlowNotificationSettings;
  assigneeExperience?: AssigneeExperienceConfig;
}

export interface AssigneeExperienceConfig {
  welcomeMessage?: string;
  headerImage?: string;
  chatEnabled?: boolean;
  viewMode?: 'SPOTLIGHT' | 'GALLERY';
}

export type DueUnit = 'HOURS' | 'DAYS' | 'WEEKS';

// --- Step-Level Due Dates ---
export interface RelativeDue {
  type: 'RELATIVE';
  value: number;
  unit: DueUnit;
}

export interface FixedDue {
  type: 'FIXED';
  date: string;  // ISO 8601, e.g. "2026-04-15"
}

export interface BeforeFlowDue {
  type: 'BEFORE_FLOW_DUE';
  value: number;
  unit: DueUnit;
}

export type StepDue = RelativeDue | FixedDue | BeforeFlowDue;

// --- Flow-Level Due Dates ---
export type FlowDue =
  | { type: 'RELATIVE'; value: number; unit: DueUnit }
  | { type: 'FIXED'; date: string };

export interface FlowDueDates {
  flowDue?: FlowDue;
}

export type DeliveryChannel = 'AUTO' | 'EMAIL_OR_SMS' | 'EMAIL_AND_SMS';

export interface FlowNotificationSettings {
  mode: 'default' | 'custom';

  assignee: {
    actionAlerts: {
      actionAssigned: boolean;
      dueDateApproaching: boolean;
      dueDateApproachingDays: number;
      actionDue: boolean;
      actionOverdue: boolean;
      actionOverdueRepeatDays: number;
      actionOverdueMaxTimes: number;
      delivery: DeliveryChannel;
    };
    flowCompletion: {
      flowCompleted: boolean;
      delivery: DeliveryChannel;
    };
  };

  coordinator: {
    actionAlerts: {
      actionCompleted: boolean;
      delivery: DeliveryChannel;
    };
    flowAlerts: {
      flowStarted: boolean;
      flowOverdue: boolean;
      flowOverdueRepeatDays: number;
      flowOverdueMaxTimes: number;
      flowCompleted: boolean;
      delivery: DeliveryChannel;
    };
    escalationAlerts: {
      noActivityDays: number | null;
      assigneeNotStartedDays: number | null;
      automationFailure: boolean;
      delivery: DeliveryChannel;
    };
    chatAlerts: {
      newMessage: boolean;
      delivery: DeliveryChannel;
    };
    dailyDigest: boolean;
  };

  channelIntegrations?: ChannelIntegrations;
}

// ============================================================================
// Channel Integration Types
// ============================================================================

export type SlackChannelMode = 'SHARED' | 'PER_FLOW_RUN';
export type ChannelVisibility = 'PRIVATE' | 'PUBLIC';
export type ChannelInviteGroup = 'ALL_COORDINATORS' | 'COORDINATOR_ASSIGNEES' | 'FLOW_OWNER_ONLY';

export interface SlackEventConfig {
  actionCompleted: boolean;
  flowStarted: boolean;
  flowCompleted: boolean;
  chatMessages: boolean;
}

export interface SlackSharedConfig {
  channelName: string;
}

export interface SlackPerFlowConfig {
  namingPattern: string;
  visibility: ChannelVisibility;
  inviteGroup: ChannelInviteGroup;
  additionalMembers: string;
  autoArchiveOnComplete: boolean;
}

export interface SlackIntegrationSettings {
  enabled: boolean;
  channelMode: SlackChannelMode;
  shared: SlackSharedConfig;
  perFlow: SlackPerFlowConfig;
  events: SlackEventConfig;
}

export interface TeamsIntegrationSettings {
  enabled: boolean;
}

// ============================================================================
// Outgoing Webhook Types
// ============================================================================

export type WebhookEventType =
  | 'flow.started' | 'step.completed' | 'flow.completed'
  | 'flow.cancelled' | 'step.overdue' | 'step.escalated' | 'chat.message';

export interface WebhookEventConfig {
  flowStarted: boolean;
  stepCompleted: boolean;
  flowCompleted: boolean;
  flowCancelled: boolean;
  stepOverdue: boolean;
  stepEscalated: boolean;
  chatMessage: boolean;
}

export interface WebhookEndpointConfig {
  id: string;
  label: string;
  url: string;
  secret: string;
  enabled: boolean;
  events: WebhookEventConfig;
  createdAt: string;
}

export interface WebhookIntegrationSettings {
  endpoints: WebhookEndpointConfig[];
}

export interface ChannelIntegrations {
  slack: SlackIntegrationSettings;
  teams?: TeamsIntegrationSettings;
  webhooks?: WebhookIntegrationSettings;
}

// ============================================================================
// Assignee Resolution Types
// ============================================================================

export type ResolutionType =
  | 'CONTACT_TBD'
  | 'FIXED_CONTACT'
  | 'WORKSPACE_INITIALIZER'
  | 'KICKOFF_FORM_FIELD'
  | 'FLOW_VARIABLE'
  | 'RULES'
  | 'ROUND_ROBIN'
  | 'CONTACT_GROUP'
  | 'ACCOUNT_CONTACTS';

export type CompletionMode = 'ANY_ONE' | 'ALL' | 'MAJORITY';

export interface Resolution {
  type: ResolutionType;
  email?: string;
  fieldKey?: string;
  variableKey?: string;
  emails?: string[];
  groupId?: string;
  accountId?: string;
  completionMode?: CompletionMode;
  config?: {
    source: 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD' | 'STEP_OUTPUT';
    variableKey?: string;
    fieldKey?: string;
    rules: Array<{
      if: { contains?: string; equals?: string; notEmpty?: boolean };
      then: { type: ResolutionType; email?: string };
    }>;
    default: { type: ResolutionType; email?: string };
  };
}

export interface Step {
  stepId: string;
  type: StepType;
  config: StepConfig;
  title?: string;  // Backend uses this for step name
  description?: string;
  milestoneId?: string;
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
  | 'PDF_FORM'
  | 'SINGLE_CHOICE_BRANCH'
  | 'MULTI_CHOICE_BRANCH'
  | 'PARALLEL_BRANCH'
  | 'GOTO'
  | 'GOTO_DESTINATION'
  | 'TERMINATE'
  | 'WAIT'
  | 'SUB_FLOW'
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
  | 'REST_API'
  | 'MCP_SERVER';

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
  reminderOverride?: Record<string, unknown>;
  // Questionnaire config
  questionnaire?: QuestionnaireConfig;
  // E-Sign config
  esign?: ESignConfig;
  // File request config
  fileRequest?: FileRequestConfig;
  // Automation configs
  aiAutomation?: AIAutomationConfig;
  systemEmail?: SystemEmailConfig;
  systemWebhook?: SystemWebhookConfig;
  systemChatMessage?: SystemChatMessageConfig;
  systemUpdateWorkspace?: SystemUpdateWorkspaceConfig;
  businessRule?: BusinessRuleConfig;
  // PDF Form config
  pdfForm?: PDFFormConfig;
  // Step-level due date
  stepDue?: StepDue;
  // Skip sequential order — step starts without waiting for previous step
  skipSequentialOrder?: boolean;
  // Sub Flow config
  subFlow?: SubFlowConfig;
  // Integration config
  integration?: IntegrationConfig;
  // AI Assignee configs
  aiPrepare?: { enabled: boolean; prompt?: string };
  aiAdvise?: { enabled: boolean; prompt?: string };
  aiReview?: { enabled: boolean; criteria?: string };
}

export interface QuestionnaireConfig {
  questions: QuestionnaireQuestion[];
}

export interface QuestionnaireQuestion {
  questionId: string;
  question: string;
  answerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXT' | 'YES_NO';
  choices?: string[];
  required?: boolean;
}

export interface ESignConfig {
  documentName?: string;
  documentDescription?: string;
  signingOrder: 'SEQUENTIAL' | 'PARALLEL';
}

export interface FileRequestConfig {
  maxFiles?: number;
  allowedTypes?: string[];
  instructions?: string;
  aiReview?: {
    enabled: boolean;
    criteria?: string;
  };
}

// ============================================================================
// Automation Step Configs
// ============================================================================

export type AIActionType = 'CUSTOM_PROMPT' | 'EXTRACT' | 'SUMMARIZE' | 'TRANSCRIBE' | 'TRANSLATE' | 'WRITE';

export type AIFieldType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'EMAIL' | 'PHONE' | 'URL' | 'DATE' | 'FILE';

export interface AIInputField {
  fieldId: string;
  name: string;
  type: AIFieldType;
  value: string;
}

export interface AIOutputField {
  fieldId: string;
  name: string;
  type: AIFieldType;
  fileFormat?: string;
  description?: string;
  required?: boolean;
}

export interface AIAutomationConfig {
  actionType: AIActionType;
  inputFields: AIInputField[];
  knowledgeSources: string[];
  prompt: string;
  outputFields: AIOutputField[];
  humanReview?: boolean;
}

export interface SystemEmailConfig {
  to: string[];
  subject: string;
  body: string;
}

export interface SystemWebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  payload?: string;
}

export interface SystemChatMessageConfig {
  message: string;
}

export interface SystemUpdateWorkspaceConfig {
  updates: Record<string, string>;
}

export interface BusinessRuleInput {
  key: string;
  ref: string;
}

export interface BusinessRuleCondition {
  when: Record<string, string>;
  set: Record<string, string>;
}

export interface BusinessRuleConfig {
  inputs: BusinessRuleInput[];
  rules: BusinessRuleCondition[];
  outputs: AIOutputField[];
}

export interface PDFFormConfig {
  documentUrl?: string;
  fields: PDFFormField[];
}

export interface PDFFormField {
  fieldId: string;
  pdfFieldName: string;
  label: string;
  fieldType?: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature';
  required?: boolean;
  readOnly?: boolean;
  defaultValue?: string;
  options?: string[];
  dataRef?: string; // Dynamic data reference for pre-population
}

export interface SubFlowConfig {
  flowTemplateId: string;
  assigneeMappings: Array<{
    parentRoleId: string;
    childRoleId: string;
  }>;
  variableMappings: Array<{
    parentKey: string;
    childKey: string;
  }>;
  inputMappings: Array<{
    parentRef: string;
    subFlowField: string;
  }>;
  outputMappings: Array<{
    subFlowOutputRef: string;
    parentOutputKey: string;
  }>;
  waitForCompletion?: boolean;
}

export interface IntegrationConfig {
  provider: 'AIRTABLE' | 'CLICKUP' | 'DROPBOX' | 'GMAIL' | 'GOOGLE_DRIVE' | 'GOOGLE_SHEETS' | 'WRIKE';
  event: string;
  accountId?: string;
  fieldMappings: Array<{
    targetField: string;
    value: string;
    isDynamic: boolean;
  }>;
  config: Record<string, unknown>;
}

// ============================================================================
// AI Assignee Result Types
// ============================================================================

export interface AIPrepareResult {
  status: 'COMPLETED' | 'FAILED';
  prefilledFields: Record<string, string>;
  confidence?: Record<string, number>;
  reasoning?: string;
  preparedAt: string;
}

export interface AIAdviseResult {
  status: 'COMPLETED' | 'FAILED';
  recommendation: string;
  reasoning: string;
  supportingData?: Record<string, unknown>;
  advisedAt: string;
}

export interface AIReviewResult {
  status: 'APPROVED' | 'REVISION_NEEDED';
  feedback: string;
  issues?: string[];
  reviewedAt: string;
}

export interface AIFlowSummary {
  summary: string;
  keyDecisions: string[];
  timeline: Array<{ step: string; completedAt: string; outcome: string }>;
  generatedAt: string;
}

export interface StepOption {
  optionId: string;
  label: string;
  value?: string;
}

export interface BranchCondition {
  source: string;
  operator: string;
  value?: any;
}

export interface BranchPath {
  pathId: string;
  label: string;
  isDefault?: boolean;
  condition?: BranchCondition;
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

export type FormFieldType =
  | 'TEXT_SINGLE_LINE'
  | 'TEXT_MULTI_LINE'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'DROPDOWN'
  | 'FILE_UPLOAD'
  | 'DATE'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'CURRENCY'
  | 'NAME'
  | 'ADDRESS'
  | 'HEADING'
  | 'PARAGRAPH'
  | 'SIGNATURE'
  | 'DYNAMIC_DROPDOWN'
  | 'IMAGE'
  | 'PAGE_BREAK'
  | 'LINE_SEPARATOR';

export const FORM_FIELD_TYPES: { value: FormFieldType; label: string; category: string }[] = [
  { value: 'TEXT_SINGLE_LINE', label: 'Short Text', category: 'basic' },
  { value: 'TEXT_MULTI_LINE', label: 'Long Text', category: 'basic' },
  { value: 'SINGLE_SELECT', label: 'Single Select', category: 'basic' },
  { value: 'MULTI_SELECT', label: 'Multi Select', category: 'basic' },
  { value: 'DROPDOWN', label: 'Dropdown', category: 'basic' },
  { value: 'FILE_UPLOAD', label: 'File Upload', category: 'basic' },
  { value: 'DYNAMIC_DROPDOWN', label: 'Dynamic Dropdown', category: 'basic' },
  { value: 'DATE', label: 'Date', category: 'predefined' },
  { value: 'NUMBER', label: 'Number', category: 'predefined' },
  { value: 'EMAIL', label: 'Email', category: 'predefined' },
  { value: 'PHONE', label: 'Phone', category: 'predefined' },
  { value: 'CURRENCY', label: 'Currency', category: 'predefined' },
  { value: 'NAME', label: 'Full Name', category: 'predefined' },
  { value: 'ADDRESS', label: 'Address', category: 'predefined' },
  { value: 'SIGNATURE', label: 'Signature', category: 'predefined' },
  { value: 'HEADING', label: 'Heading', category: 'layout' },
  { value: 'PARAGRAPH', label: 'Paragraph', category: 'layout' },
  { value: 'IMAGE', label: 'Image', category: 'layout' },
  { value: 'PAGE_BREAK', label: 'Page Break', category: 'layout' },
  { value: 'LINE_SEPARATOR', label: 'Line Separator', category: 'layout' },
];

export interface FormField {
  fieldId: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
}

export interface Milestone {
  milestoneId: string;
  name: string;
  afterStepId: string;
}

export type RoleType = 'coordinator' | 'assignee';

export interface RoleOptions {
  coordinatorToggle: boolean;
  allowViewAllActions: boolean;
}

export interface Role {
  roleId: string;
  name: string;
  description?: string;
  resolution?: Resolution;
  roleOptions?: RoleOptions;
  /** Whether this role is a coordinator (full run access) or assignee (task-only portal).
   *  Defaults to 'assignee' for backward compatibility. */
  roleType?: RoleType;
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

export interface ThinkingStepInfo {
  step: number;
  label: string;
  done: boolean;
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
  savedChangeRequest?: string;  // Locked display of submitted change request
  suggestedActions?: SuggestedAction[];  // For 'respond' mode - quick actions
  error?: string;
  attachment?: MessageAttachment;
  // Enhancement data (post-creation)
  enhancement?: EnhancementData;
  // Thinking chain (collapsed after response arrives)
  thinkingSteps?: ThinkingStepInfo[];
  thinkingDuration?: number;  // seconds
}

export interface EnhancementData {
  workflowName: string;
  isLocked?: boolean;
  wasSkipped?: boolean;
  selections?: Record<string, string | Record<string, string>>;
}

// ============================================================================
// Workflow Analysis Types
// ============================================================================

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
  op:
    | 'ADD_STEP_AFTER' | 'ADD_STEP_BEFORE' | 'REMOVE_STEP' | 'UPDATE_STEP' | 'MOVE_STEP'
    | 'ADD_PATH_STEP_AFTER' | 'ADD_PATH_STEP_BEFORE'
    | 'UPDATE_FLOW_METADATA' | 'UPDATE_FLOW_NAME'
    | 'ADD_ROLE' | 'REMOVE_ROLE' | 'UPDATE_ROLE'
    | 'ADD_MILESTONE' | 'REMOVE_MILESTONE' | 'UPDATE_MILESTONE';
  stepId?: string;
  afterStepId?: string;
  beforeStepId?: string;
  branchStepId?: string;
  pathId?: string;
  step?: Partial<Step> & { title?: string };  // Include title for new schema
  updates?: Record<string, unknown>;
  // Role operations
  placeholder?: { name: string; roleId?: string };
  roleId?: string;
  // Milestone operations
  milestone?: { name: string; milestoneId?: string; sequence?: number };
  milestoneId?: string;
  // Flow name
  name?: string;
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

  /** Quick suggestion chips shown below text inputs */
  quickSuggestions?: string[];

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

// ============================================================================
// Proposal Types (for right-panel proposal mode)
// ============================================================================

export type StepChangeStatus = 'added' | 'modified' | 'moved' | 'unchanged';

export interface ChangeInfo {
  status: StepChangeStatus;
  title?: string;
}

export interface PendingProposal {
  plan: PendingPlan;
  changeStatusMap: Map<string, ChangeInfo>;
  operationSummary: string[];
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
  // Human Actions — each type gets a distinctive color for quick visual identification
  FORM: { label: 'Form', color: '#22c55e', category: 'human' },
  QUESTIONNAIRE: { label: 'Questionnaire', color: '#10b981', category: 'human' },
  FILE_REQUEST: { label: 'File Request', color: '#14b8a6', category: 'human' },
  TODO: { label: 'To-Do', color: '#3b82f6', category: 'human' },
  APPROVAL: { label: 'Approval', color: '#3b82f6', category: 'human' },
  ACKNOWLEDGEMENT: { label: 'Acknowledgement', color: '#ec4899', category: 'human' },
  ESIGN: { label: 'E-Sign', color: '#ef4444', category: 'human' },
  DECISION: { label: 'Decision', color: '#f59e0b', category: 'human' },
  CUSTOM_ACTION: { label: 'Custom Action', color: '#6366f1', category: 'human' },
  WEB_APP: { label: 'Web App', color: '#0ea5e9', category: 'human' },
  PDF_FORM: { label: 'PDF Form', color: '#22c55e', category: 'human' },

  // Control Flow
  SINGLE_CHOICE_BRANCH: { label: 'Single Choice', color: '#f59e0b', category: 'control' },
  MULTI_CHOICE_BRANCH: { label: 'Multi Choice', color: '#f59e0b', category: 'control' },
  PARALLEL_BRANCH: { label: 'Parallel Branch', color: '#f59e0b', category: 'control' },
  GOTO: { label: 'Go To', color: '#d97706', category: 'control' },
  GOTO_DESTINATION: { label: 'Go To Destination', color: '#d97706', category: 'control' },
  TERMINATE: { label: 'Flow Terminate', color: '#ef4444', category: 'control' },
  WAIT: { label: 'Wait', color: '#6b7280', category: 'control' },
  SUB_FLOW: { label: 'Sub Flow', color: '#f59e0b', category: 'control' },

  // Automations
  AI_CUSTOM_PROMPT: { label: 'AI Custom Prompt', color: '#8b5cf6', category: 'automation' },
  AI_EXTRACT: { label: 'AI Extract', color: '#8b5cf6', category: 'automation' },
  AI_SUMMARIZE: { label: 'AI Summarize', color: '#8b5cf6', category: 'automation' },
  AI_TRANSCRIBE: { label: 'AI Transcribe', color: '#8b5cf6', category: 'automation' },
  AI_TRANSLATE: { label: 'AI Translate', color: '#8b5cf6', category: 'automation' },
  AI_WRITE: { label: 'AI Write', color: '#8b5cf6', category: 'automation' },
  SYSTEM_WEBHOOK: { label: 'Webhook', color: '#6b7280', category: 'automation' },
  SYSTEM_EMAIL: { label: 'Email', color: '#6b7280', category: 'automation' },
  SYSTEM_CHAT_MESSAGE: { label: 'Chat Message', color: '#6b7280', category: 'automation' },
  SYSTEM_UPDATE_WORKSPACE: { label: 'Update Workspace', color: '#6b7280', category: 'automation' },
  BUSINESS_RULE: { label: 'Business Rule', color: '#6b7280', category: 'automation' },
  REST_API: { label: 'REST API', color: '#0ea5e9', category: 'automation' },
  MCP_SERVER: { label: 'MCP Server', color: '#8b5cf6', category: 'automation' },
};

// ============================================================================
// Portal Types
// ============================================================================

export type EmailTemplateType = 'TASK_ASSIGNED' | 'TASK_REMINDER' | 'FLOW_COMPLETED';

export interface PortalSettings {
  flowExperience?: {
    headerImage?: string;
    viewMode?: string;
    welcomeMessage?: string;
  };
  startLink?: {
    initTitle?: string;
    initSubtitle?: string;
    startButtonLabel?: string;
    completedImage?: string;
    completedTitle?: string;
    completedSubtitle?: string;
  };
  allowSelfServiceFlowStart?: boolean;
  showWorkspaceSummary?: boolean;
}

export interface PortalBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
}

export interface Portal {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description?: string;
  isDefault: boolean;
  settings?: PortalSettings;
  brandingOverrides?: PortalBranding;
  createdAt: string;
  updatedAt: string;
}

export interface PortalTemplate {
  id: string;
  portalId: string;
  templateId: string;
  displayTitle?: string;
  displayDescription?: string;
  sortOrder: number;
  enabled: boolean;
  template?: {
    id: string;
    name: string;
    description?: string;
    status: string;
  };
}

export interface EmailTemplate {
  id?: string;
  organizationId?: string;
  portalId?: string;
  templateType: EmailTemplateType;
  subject: string;
  heading: string;
  body: string;
  buttonLabel?: string;
  enabled: boolean;
  isDefault?: boolean;
}

export interface PortalDashboardData {
  summary: {
    new: number;
    inProgress: number;
    due: number;
    completed: number;
  };
  workspaces: Array<{
    id: string;
    name: string;
    templateName: string;
    status: string;
    progress: { completed: number; total: number };
    dueAt?: string;
    nextTaskToken?: string;
  }>;
}

// ============================================================================
// Assignee Portal Types
// ============================================================================

export interface JourneyStep {
  stepIndex: number;
  stepName: string;
  stepType: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  isCurrentStep: boolean;
  assignedToMe: boolean;
  completedAt?: string;
  resultData?: Record<string, unknown>;
}

export interface ActivityEvent {
  id: string;
  type: 'step_started' | 'step_completed' | 'reminder_sent' | 'message_received';
  description: string;
  timestamp: string;
}

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
  if (!name || !name.trim()) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase();
}
