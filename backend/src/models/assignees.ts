/**
 * Assignee & Placeholder Types
 *
 * Assignees are role placeholders that resolve to email addresses at runtime.
 * This file defines all assignee-related types.
 */

// ============================================================================
// Resolution Types
// ============================================================================

export type ResolutionType =
  | 'CONTACT_TBD'           // Determined later
  | 'FIXED_CONTACT'         // Always same person
  | 'WORKSPACE_INITIALIZER' // Person who starts the run
  | 'KICKOFF_FORM_FIELD'    // From kickoff form input
  | 'FLOW_VARIABLE'         // From variable passed at kickoff
  | 'RULES'                 // Conditional routing (first match wins)
  | 'ROUND_ROBIN';          // Rotates among a list

// ============================================================================
// Resolution Configurations
// ============================================================================

export interface ContactTbdResolution {
  type: 'CONTACT_TBD';
}

export interface FixedContactResolution {
  type: 'FIXED_CONTACT';
  email: string;
}

export interface WorkspaceInitializerResolution {
  type: 'WORKSPACE_INITIALIZER';
}

export interface KickoffFormFieldResolution {
  type: 'KICKOFF_FORM_FIELD';
  fieldKey: string;
}

export interface FlowVariableResolution {
  type: 'FLOW_VARIABLE';
  variableKey: string;
}

export interface RulesResolution {
  type: 'RULES';
  config: {
    source: 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD' | 'STEP_OUTPUT';
    variableKey?: string;
    fieldKey?: string;
    stepOutputRef?: string;
    rules: AssigneeRule[];
    default: Resolution;
  };
}

export interface AssigneeRule {
  if: {
    contains?: string;
    equals?: string;
    notEmpty?: boolean;
  };
  then: Resolution;
}

export interface RoundRobinResolution {
  type: 'ROUND_ROBIN';
  emails: string[];
}

export type Resolution =
  | ContactTbdResolution
  | FixedContactResolution
  | WorkspaceInitializerResolution
  | KickoffFormFieldResolution
  | FlowVariableResolution
  | RulesResolution
  | RoundRobinResolution;

// ============================================================================
// Role Options
// ============================================================================

export interface RoleOptions {
  allowViewAllActions: boolean;   // Can see all actions in the flow
  coordinatorToggle: boolean;     // Has coordinator permissions
}

// ============================================================================
// Role (Template-level definition)
// ============================================================================

export interface Role {
  roleId: string;
  name: string;                   // Display name (e.g., "Client", "Account Manager")
  resolution: Resolution;
  roleOptions: RoleOptions;
}

/** @deprecated Use Role instead */
export type AssigneePlaceholder = Role;

// ============================================================================
// Assignee Reference (Used in steps)
// ============================================================================

export interface AssigneeRef {
  mode: 'PLACEHOLDER';
  roleId: string;
  /** @deprecated Use roleId instead */
  placeholderId?: string;
}

// For steps that support multiple assignees
export type AssigneeOrAssignees = AssigneeRef | AssigneeRef[];

// ============================================================================
// Flow Variables
// ============================================================================

export type VariableType = 'TEXT' | 'FILE';

export interface FlowVariable {
  key: string;
  type: VariableType;
  required: boolean;
  description?: string;
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createContactTbdRole(
  roleId: string,
  name: string
): Role {
  return {
    roleId,
    name,
    resolution: { type: 'CONTACT_TBD' },
    roleOptions: {
      allowViewAllActions: false,
      coordinatorToggle: false,
    },
  };
}

/** @deprecated Use createContactTbdRole instead */
export const createContactTbdPlaceholder = createContactTbdRole;

export function createAssigneeRef(roleId: string): AssigneeRef {
  return {
    mode: 'PLACEHOLDER',
    roleId,
  };
}

// ============================================================================
// Type Guards
// ============================================================================

export function isAssigneeArray(
  assignee: AssigneeOrAssignees
): assignee is AssigneeRef[] {
  return Array.isArray(assignee);
}

export function isSingleAssignee(
  assignee: AssigneeOrAssignees
): assignee is AssigneeRef {
  return !Array.isArray(assignee);
}
