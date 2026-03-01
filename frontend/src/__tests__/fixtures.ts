/**
 * Test Fixtures
 *
 * Comprehensive test data covering:
 * - Happy path scenarios
 * - Edge cases (missing fields, null values, empty arrays)
 * - Malformed data the LLM might return
 */

import type { Flow, Step, PendingPlan, Message } from '@/types';

// ============================================================================
// Valid Workflow Fixtures
// ============================================================================

export const VALID_WORKFLOW: Flow = {
  flowId: 'flow-123',
  name: 'Client Onboarding',
  description: 'Onboard new clients',
  steps: [
    {
      stepId: 'step-1',
      type: 'FORM',
      config: {
        name: 'Client Information',
        description: 'Collect client details',
        assignee: 'Client',
      },
    },
    {
      stepId: 'step-2',
      type: 'APPROVAL',
      config: {
        name: 'Manager Approval',
        description: 'Manager reviews and approves',
        assignee: 'Manager',
      },
    },
  ],
  milestones: [],
  roles: [
    { roleId: 'p-1', name: 'Client' },
    { roleId: 'p-2', name: 'Manager' },
  ],
};

export const VALID_PENDING_PLAN: PendingPlan = {
  planId: 'plan-123',
  workflow: VALID_WORKFLOW,
  message: 'Created client onboarding workflow',
  assumptions: [
    'Client is external, Manager is internal',
    'Sequential execution of steps',
  ],
};

// ============================================================================
// Edge Case Fixtures - Missing/Null Fields
// ============================================================================

export const WORKFLOW_NO_ASSIGNEES: Flow = {
  flowId: 'flow-no-assignees',
  name: 'No Assignees Workflow',
  steps: [
    {
      stepId: 'step-1',
      type: 'TODO',
      config: { name: 'Task 1' },
    },
  ],
  milestones: [],
  roles: [], // Empty array
};

export const WORKFLOW_NULL_ASSIGNEES: Flow = {
  flowId: 'flow-null-assignees',
  name: 'Null Assignees Workflow',
  steps: [
    {
      stepId: 'step-1',
      type: 'TODO',
      config: { name: 'Task 1' },
    },
  ],
  milestones: [],
  // @ts-expect-error - Simulating LLM returning null
  roles: null,
};

export const WORKFLOW_UNDEFINED_ASSIGNEES = {
  flowId: 'flow-undef-assignees',
  name: 'Undefined Assignees Workflow',
  steps: [
    {
      stepId: 'step-1',
      type: 'TODO',
      config: { name: 'Task 1' },
    },
  ],
  milestones: [],
  // Intentionally missing roles to simulate LLM omission
} as unknown as Flow;

export const WORKFLOW_NO_STEPS: Flow = {
  flowId: 'flow-no-steps',
  name: 'No Steps Workflow',
  steps: [],
  milestones: [],
  roles: [],
};

export const WORKFLOW_NULL_STEPS: Flow = {
  flowId: 'flow-null-steps',
  name: 'Null Steps Workflow',
  // @ts-expect-error - Simulating LLM returning null
  steps: null,
  milestones: [],
  roles: [],
};

// ============================================================================
// Malformed Step Fixtures
// ============================================================================

export const WORKFLOW_MALFORMED_STEPS: Flow = {
  flowId: 'flow-malformed',
  name: 'Malformed Steps',
  steps: [
    // Missing config
    {
      stepId: 'step-1',
      type: 'FORM',
      // @ts-expect-error - Missing config
      config: undefined,
    },
    // Null config
    {
      stepId: 'step-2',
      type: 'APPROVAL',
      // @ts-expect-error - Null config
      config: null,
    },
    // Empty config
    {
      stepId: 'step-3',
      type: 'TODO',
      config: {} as Step['config'],
    },
    // Missing stepId
    {
      // @ts-expect-error - Missing stepId
      stepId: undefined,
      type: 'DECISION',
      config: { name: 'Decision' },
    },
  ],
  milestones: [],
  roles: [{ roleId: 'p-1', name: 'User' }],
};

// ============================================================================
// Pending Plan Edge Cases
// ============================================================================

export const PENDING_PLAN_NO_ASSUMPTIONS: PendingPlan = {
  planId: 'plan-no-assumptions',
  workflow: VALID_WORKFLOW,
  message: 'Created workflow',
  // No assumptions field
};

export const PENDING_PLAN_EMPTY_ASSUMPTIONS: PendingPlan = {
  planId: 'plan-empty-assumptions',
  workflow: VALID_WORKFLOW,
  message: 'Created workflow',
  assumptions: [],
};

export const PENDING_PLAN_NULL_WORKFLOW: PendingPlan = {
  planId: 'plan-null-workflow',
  // @ts-expect-error - Null workflow
  workflow: null,
  message: 'Failed workflow',
};

export const PENDING_PLAN_MINIMAL_WORKFLOW: PendingPlan = {
  planId: 'plan-minimal',
  workflow: WORKFLOW_UNDEFINED_ASSIGNEES,
  message: 'Minimal workflow',
};

// ============================================================================
// Message Fixtures
// ============================================================================

export const USER_MESSAGE: Message = {
  id: 'msg-1',
  role: 'user',
  content: 'Create a client onboarding workflow',
  timestamp: new Date('2024-01-01T10:00:00'),
};

export const ASSISTANT_MESSAGE_WITH_PLAN: Message = {
  id: 'msg-2',
  role: 'assistant',
  content: "Here's what I've designed for you:",
  timestamp: new Date('2024-01-01T10:00:05'),
  mode: 'create',
  pendingPlan: VALID_PENDING_PLAN,
};

export const ASSISTANT_MESSAGE_WITH_ERROR: Message = {
  id: 'msg-3',
  role: 'assistant',
  content: '',
  timestamp: new Date('2024-01-01T10:00:05'),
  error: 'Something went wrong',
};

export const ASSISTANT_MESSAGE_WITH_CLARIFICATIONS: Message = {
  id: 'msg-4',
  role: 'assistant',
  content: 'I have a few questions:',
  timestamp: new Date('2024-01-01T10:00:05'),
  mode: 'clarify',
  clarifications: [
    { id: 'q1', text: 'Who should approve the documents?' },
    { id: 'q2', text: 'Do you need email notifications?' },
  ],
};

// ============================================================================
// Test Scenario Collections
// ============================================================================

export const ALL_WORKFLOW_EDGE_CASES = [
  { name: 'Valid workflow', workflow: VALID_WORKFLOW },
  { name: 'No assignees', workflow: WORKFLOW_NO_ASSIGNEES },
  { name: 'Null assignees', workflow: WORKFLOW_NULL_ASSIGNEES },
  { name: 'Undefined assignees', workflow: WORKFLOW_UNDEFINED_ASSIGNEES },
  { name: 'No steps', workflow: WORKFLOW_NO_STEPS },
  { name: 'Null steps', workflow: WORKFLOW_NULL_STEPS },
  { name: 'Malformed steps', workflow: WORKFLOW_MALFORMED_STEPS },
];

export const ALL_PENDING_PLAN_EDGE_CASES = [
  { name: 'Valid plan', plan: VALID_PENDING_PLAN },
  { name: 'No assumptions', plan: PENDING_PLAN_NO_ASSUMPTIONS },
  { name: 'Empty assumptions', plan: PENDING_PLAN_EMPTY_ASSUMPTIONS },
  { name: 'Null workflow', plan: PENDING_PLAN_NULL_WORKFLOW },
  { name: 'Minimal workflow', plan: PENDING_PLAN_MINIMAL_WORKFLOW },
];
