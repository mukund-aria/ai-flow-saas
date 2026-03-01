/**
 * Onboarding Flow Fixture
 *
 * "Client Onboarding" flow definition covering all key step types:
 * FORM, APPROVAL, FILE_REQUEST, TODO, ACKNOWLEDGEMENT, DECISION
 *
 * Two roles: Client (assignee) and Coordinator (coordinator).
 */

export const CLIENT_ONBOARDING_FLOW = {
  flowId: 'e2e-onboarding',
  name: 'E2E Client Onboarding',
  description: 'E2E test flow covering all key step types',
  steps: [
    {
      stepId: 'step-form',
      type: 'FORM',
      config: {
        name: 'Client Information',
        description: 'Please fill in your details',
        assignee: 'Client',
        formFields: [
          {
            fieldId: 'client_name',
            label: 'Full Name',
            type: 'TEXT_SINGLE_LINE',
            required: true,
          },
          {
            fieldId: 'client_email',
            label: 'Email Address',
            type: 'EMAIL',
            required: true,
          },
          {
            fieldId: 'company_size',
            label: 'Company Size',
            type: 'DROPDOWN',
            required: true,
            options: [
              { label: '1-10', value: '1-10' },
              { label: '11-50', value: '11-50' },
              { label: '51-200', value: '51-200' },
              { label: '201+', value: '201+' },
            ],
          },
        ],
      },
    },
    {
      stepId: 'step-approval',
      type: 'APPROVAL',
      config: {
        name: 'Manager Approval',
        description: 'Review and approve the client information',
        assignee: 'Coordinator',
      },
    },
    {
      stepId: 'step-files',
      type: 'FILE_REQUEST',
      config: {
        name: 'Upload Documents',
        description: 'Please upload your onboarding documents',
        assignee: 'Client',
        fileRequest: {
          maxFiles: 3,
          instructions:
            'Upload identification and company registration documents',
        },
      },
    },
    {
      stepId: 'step-todo',
      type: 'TODO',
      config: {
        name: 'Complete Setup Checklist',
        description: 'Complete the internal setup tasks',
        assignee: 'Coordinator',
      },
    },
    {
      stepId: 'step-ack',
      type: 'ACKNOWLEDGEMENT',
      config: {
        name: 'Accept Terms of Service',
        description: 'Please review and acknowledge the terms of service',
        assignee: 'Client',
      },
    },
    {
      stepId: 'step-decision',
      type: 'DECISION',
      config: {
        name: 'Choose Package',
        description: 'Select your preferred package',
        assignee: 'Client',
        outcomes: [
          { outcomeId: 'starter', label: 'Starter Package' },
          { outcomeId: 'growth', label: 'Growth Package' },
          { outcomeId: 'enterprise', label: 'Enterprise Package' },
        ],
      },
    },
  ],
  milestones: [],
  roles: [
    {
      roleId: 'role-client',
      name: 'Client',
      roleType: 'assignee',
    },
    {
      roleId: 'role-coordinator',
      name: 'Coordinator',
      roleType: 'coordinator',
    },
  ],
};

export const FORM_DATA = {
  client_name: 'Jane Test',
  client_email: 'jane@test.local',
  company_size: '11-50',
};

const timestamp = Date.now();

export const TEST_CONTACT = {
  name: `E2E Client ${timestamp}`,
  email: `e2e-client-${timestamp}@test.local`,
};
