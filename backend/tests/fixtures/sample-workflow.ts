/**
 * Sample Workflow Fixture
 *
 * A sample workflow for testing the validator and operations engine.
 */

import type { Flow } from '../../src/models/workflow.js';

export const sampleWorkflow: Flow = {
  flowId: 'flow_test_001',
  name: 'Test Client Onboarding',
  workspaceNameTemplate: 'Onboarding - {kickoff.client_name}',

  kickoff: {
    defaultStartMode: 'MANUAL_EXECUTE',
    supportedStartModes: ['MANUAL_EXECUTE', 'KICKOFF_FORM'],
    flowVariables: [
      { key: 'case_id', type: 'TEXT', required: true },
    ],
  },

  permissions: {
    execute: { type: 'EXPLICIT_USERS', principals: ['user_1'] },
    edit: { type: 'EXPLICIT_USERS', principals: ['user_1'] },
    coordinate: { type: 'EXPLICIT_USERS', principals: ['user_1'] },
  },

  settings: {
    chatAssistanceEnabled: true,
    autoArchiveEnabled: true,
  },

  milestones: [
    { milestoneId: 'ms1', name: 'Intake', sequence: 1 },
    { milestoneId: 'ms2', name: 'Review', sequence: 2 },
  ],

  roles: [
    {
      roleId: 'role_client',
      name: 'Client',
      resolution: { type: 'CONTACT_TBD' },
      roleOptions: { allowViewAllActions: false, coordinatorToggle: false },
    },
    {
      roleId: 'role_manager',
      name: 'Manager',
      resolution: { type: 'WORKSPACE_INITIALIZER' },
      roleOptions: { allowViewAllActions: true, coordinatorToggle: true },
    },
  ],

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

  steps: [
    {
      stepId: 's1_form',
      type: 'FORM',
      milestoneId: 'ms1',
      title: 'Client Intake Form',
      description: 'Please fill out this form',
      assignees: { mode: 'PLACEHOLDER', roleId: 'role_client' },
      form: {
        fields: [
          { key: 'client_name', type: 'TEXT_SINGLE_LINE', label: 'Name', required: true },
        ],
      },
    },
    {
      stepId: 's2_decision',
      type: 'DECISION',
      milestoneId: 'ms1',
      title: 'Approve Client?',
      assignee: { mode: 'PLACEHOLDER', roleId: 'role_manager' },
      outcomes: [
        {
          outcomeId: 'o_yes',
          label: 'Yes',
          steps: [],
        },
        {
          outcomeId: 'o_no',
          label: 'No',
          steps: [
            {
              stepId: 's2_1_terminate',
              type: 'TERMINATE',
              milestoneId: 'ms1',
              status: 'CANCELLED',
            },
          ],
        },
      ],
    },
    {
      stepId: 's3_approval',
      type: 'APPROVAL',
      milestoneId: 'ms2',
      title: 'Final Approval',
      assignees: { mode: 'PLACEHOLDER', roleId: 'role_manager' },
      approval: {
        completion: { mode: 'ONE' },
        assigneeOrder: 'PARALLEL',
      },
    },
  ],
};

/**
 * Sample workflow with validation errors
 */
export const invalidWorkflow: Flow = {
  flowId: 'flow_invalid',
  name: 'Invalid Workflow',

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
    { milestoneId: 'ms1', name: 'Main', sequence: 1 },
  ],

  roles: [],

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

  steps: [
    {
      stepId: 's1_decision',
      type: 'DECISION',
      milestoneId: 'ms1',
      title: 'Invalid Decision',
      // Decision should have single assignee, not array - but we're using any for testing
      assignee: { mode: 'PLACEHOLDER', roleId: 'nonexistent_role' } as any,
      outcomes: [
        { outcomeId: 'o1', label: 'One', steps: [] },
        // Only 1 outcome - should have at least 2
      ],
    } as any,
    {
      stepId: 's1_decision', // Duplicate ID!
      type: 'FORM',
      milestoneId: 'ms1',
      title: 'Duplicate ID',
      assignees: [],
      form: { fields: [] },
    } as any,
  ],
};
