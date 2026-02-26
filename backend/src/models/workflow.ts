/**
 * Core Workflow Data Model
 *
 * This file defines the main workflow structure (IR - Intermediate Representation)
 * that the AI Copilot generates and edits.
 */

import type { Step, StepType } from './steps.js';
import type { AssigneePlaceholder, FlowVariable } from './assignees.js';

// ============================================================================
// Flow (Top-level)
// ============================================================================

export interface Flow {
  flowId: string;
  name: string;
  workspaceNameTemplate?: string;  // e.g., "Onboarding - {kickoff.client_name}"

  kickoff: KickoffConfig;
  permissions: FlowPermissions;
  settings: FlowSettings;
  dueDates?: FlowDueDates;

  milestones: Milestone[];
  assigneePlaceholders: AssigneePlaceholder[];
  constraints: FlowConstraints;

  steps: Step[];  // Main path - ordered list

  // Metadata for backwards compatibility
  _schemaVersion?: string;
  _unknownFields?: Record<string, unknown>;  // Preserve unknown fields
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
  startLinkEnabled?: boolean;

  flowVariables: FlowVariable[];

  notes?: string[];  // Documentation
}

// ============================================================================
// Permissions
// ============================================================================

export type PermissionType = 'EXPLICIT_USERS' | 'ALL_MEMBERS' | 'ADMINS_ONLY';

export interface PermissionConfig {
  type: PermissionType;
  principals?: string[];  // User IDs or group IDs
}

export interface FlowPermissions {
  execute: PermissionConfig;
  edit: PermissionConfig;
  coordinate: PermissionConfig;
}

// ============================================================================
// Settings
// ============================================================================

export interface FlowSettings {
  chatAssistanceEnabled: boolean;
  chatAssistanceDefault?: 'ON' | 'OFF';
  autoArchiveEnabled: boolean;
  coverImage?: string | 'DEFAULT';
  advancedCoordinatorRoleSetting?: string;
  notifications?: FlowNotificationSettings;
}

// ============================================================================
// Notification Settings (v2 — Two-audience model)
// ============================================================================

export type DeliveryChannel = 'AUTO' | 'EMAIL_OR_SMS' | 'EMAIL_AND_SMS';

export interface AssigneeActionAlerts {
  actionAssigned: boolean;
  dueDateApproaching: boolean;
  dueDateApproachingDays: number;
  actionDue: boolean;
  actionOverdue: boolean;
  actionOverdueRepeatDays: number;
  actionOverdueMaxTimes: number;
  delivery: DeliveryChannel;
}

export interface AssigneeFlowCompletion {
  flowCompleted: boolean;
  delivery: DeliveryChannel;
}

export interface CoordinatorActionAlerts {
  actionCompleted: boolean;
  delivery: DeliveryChannel;
}

export interface CoordinatorFlowAlerts {
  flowStarted: boolean;
  flowOverdue: boolean;
  flowOverdueRepeatDays: number;
  flowOverdueMaxTimes: number;
  flowCompleted: boolean;
  delivery: DeliveryChannel;
}

export interface CoordinatorEscalationAlerts {
  noActivityDays: number | null;
  assigneeNotStartedDays: number | null;
  automationFailure: boolean;
  delivery: DeliveryChannel;
}

export interface CoordinatorChatAlerts {
  newMessage: boolean;
  delivery: DeliveryChannel;
}

export interface FlowNotificationSettings {
  mode: 'default' | 'custom';

  assignee: {
    actionAlerts: AssigneeActionAlerts;
    flowCompletion: AssigneeFlowCompletion;
  };

  coordinator: {
    actionAlerts: CoordinatorActionAlerts;
    flowAlerts: CoordinatorFlowAlerts;
    escalationAlerts: CoordinatorEscalationAlerts;
    chatAlerts: CoordinatorChatAlerts;
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

export interface SlackPerFlowRunConfig {
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
  perFlowRun: SlackPerFlowRunConfig;
  events: SlackEventConfig;
}

export interface TeamsIntegrationSettings {
  enabled: boolean;
}

export interface ChannelIntegrations {
  slack: SlackIntegrationSettings;
  teams?: TeamsIntegrationSettings;
}

export function defaultFlowNotificationSettings(): FlowNotificationSettings {
  return {
    mode: 'default',
    assignee: {
      actionAlerts: {
        actionAssigned: true,
        dueDateApproaching: true,
        dueDateApproachingDays: 1,
        actionDue: true,
        actionOverdue: true,
        actionOverdueRepeatDays: 1,
        actionOverdueMaxTimes: 3,
        delivery: 'AUTO',
      },
      flowCompletion: {
        flowCompleted: true,
        delivery: 'AUTO',
      },
    },
    coordinator: {
      actionAlerts: {
        actionCompleted: true,
        delivery: 'AUTO',
      },
      flowAlerts: {
        flowStarted: true,
        flowOverdue: true,
        flowOverdueRepeatDays: 1,
        flowOverdueMaxTimes: 3,
        flowCompleted: true,
        delivery: 'AUTO',
      },
      escalationAlerts: {
        noActivityDays: 3,
        assigneeNotStartedDays: 2,
        automationFailure: true,
        delivery: 'AUTO',
      },
      chatAlerts: {
        newMessage: true,
        delivery: 'AUTO',
      },
      dailyDigest: false,
    },
    channelIntegrations: {
      slack: {
        enabled: false,
        channelMode: 'SHARED',
        shared: { channelName: '' },
        perFlowRun: {
          namingPattern: '{flowName}-{runId}',
          visibility: 'PRIVATE',
          inviteGroup: 'ALL_COORDINATORS',
          additionalMembers: '',
          autoArchiveOnComplete: true,
        },
        events: {
          actionCompleted: true,
          flowStarted: true,
          flowCompleted: true,
          chatMessages: false,
        },
      },
    },
  };
}

// ============================================================================
// Legacy Notification Settings Migration
// ============================================================================

/** Migrate old-format notification settings to v2 format */
export function migrateNotificationSettings(raw: Record<string, unknown>): FlowNotificationSettings {
  // Already new format
  if (raw.mode && raw.assignee && raw.coordinator) {
    return raw as unknown as FlowNotificationSettings;
  }

  // Old format — map to new structure
  const defaults = defaultFlowNotificationSettings();
  const oldReminder = raw.defaultReminder as Record<string, unknown> | undefined;
  const oldEscalation = raw.escalation as Record<string, unknown> | undefined;
  const oldCoord = raw.coordinatorNotifications as Record<string, unknown> | undefined;

  if (oldReminder) {
    defaults.assignee.actionAlerts.dueDateApproaching = oldReminder.enabled as boolean ?? true;
    defaults.assignee.actionAlerts.actionOverdue = oldReminder.repeatAfterDue as boolean ?? true;
    defaults.assignee.actionAlerts.actionOverdueMaxTimes = oldReminder.maxReminders as number ?? 3;
  }

  if (oldEscalation) {
    const enabled = oldEscalation.enabled as boolean ?? true;
    defaults.coordinator.escalationAlerts.noActivityDays = enabled ? 3 : null;
    defaults.coordinator.escalationAlerts.assigneeNotStartedDays = enabled ? 2 : null;
  }

  if (oldCoord) {
    defaults.coordinator.actionAlerts.actionCompleted = oldCoord.stepCompleted as boolean ?? true;
    defaults.coordinator.flowAlerts.flowCompleted = oldCoord.flowCompleted as boolean ?? true;
    defaults.coordinator.dailyDigest = oldCoord.dailyDigest as boolean ?? false;
  }

  return defaults;
}

// ============================================================================
// Due Dates
// ============================================================================

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

// ============================================================================
// Milestones
// ============================================================================

export interface Milestone {
  milestoneId: string;
  name: string;
  sequence: number;
}

// ============================================================================
// Constraints (Platform Limits)
// ============================================================================

export interface FlowConstraints {
  maxParallelBranches: number;
  maxDecisionOutcomes: number;
  maxBranchNestingDepth: number;
  milestonesInsideBranchesAllowed: boolean;
  branchMustFitSingleMilestone: boolean;
  gotoTargetsMainPathOnly: boolean;
  subflowSupported: boolean;
  variablesSetOnlyAtInitiation: boolean;
  variableTypesAllowed: string[];
}

// ============================================================================
// Validation Result
// ============================================================================

export interface ValidationError {
  path: string;       // e.g., "steps[3].assignees"
  rule: string;       // e.g., "DECISION_SINGLE_ASSIGNEE"
  message: string;    // Human-readable error
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// ============================================================================
// Parse Result (for backwards compatibility)
// ============================================================================

export interface ParseResult {
  flow: Flow;
  unknownStepTypes: string[];
  unknownFields: string[];
  warnings: string[];
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createEmptyFlow(flowId: string, name: string): Flow {
  return {
    flowId,
    name,
    kickoff: {
      defaultStartMode: 'MANUAL_EXECUTE',
      supportedStartModes: ['MANUAL_EXECUTE'],
      flowVariables: [],
    },
    permissions: {
      execute: { type: 'EXPLICIT_USERS', principals: [] },
      edit: { type: 'EXPLICIT_USERS', principals: [] },
      coordinate: { type: 'EXPLICIT_USERS', principals: [] },
    },
    settings: {
      chatAssistanceEnabled: true,
      autoArchiveEnabled: true,
    },
    milestones: [
      { milestoneId: 'ms_default', name: 'Main Process', sequence: 1 },
    ],
    assigneePlaceholders: [],
    constraints: {
      maxParallelBranches: 3,
      maxDecisionOutcomes: 3,
      maxBranchNestingDepth: 2,
      milestonesInsideBranchesAllowed: false,
      branchMustFitSingleMilestone: true,
      gotoTargetsMainPathOnly: true,
      subflowSupported: false,
      variablesSetOnlyAtInitiation: true,
      variableTypesAllowed: ['TEXT', 'FILE'],
    },
    steps: [],
  };
}
