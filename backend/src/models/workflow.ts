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
}

// ============================================================================
// Due Dates
// ============================================================================

export type DueUnit = 'HOURS' | 'DAYS' | 'WEEKS';

export interface RelativeDue {
  type: 'RELATIVE';
  value: number;
  unit: DueUnit;
}

export interface FlowDueDates {
  flowDue?: RelativeDue;
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
