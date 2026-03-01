/**
 * AI Assignee Service Tests
 *
 * Tests for AI-powered workflow assistance functions:
 * buildDDRContext, runAIPrepare, runAIAdvise, runAIReview, generateFlowSummary
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// ============================================================================
// Mock setup
// ============================================================================

const mockFindFirst = jest.fn();
const mockFindMany = jest.fn();
const mockUpdateSet = jest.fn();
const mockUpdateWhere = jest.fn();

mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
const mockUpdate = jest.fn().mockReturnValue({ set: mockUpdateSet });

jest.unstable_mockModule('../../src/db/client.js', () => ({
  db: {
    query: {
      flows: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      stepExecutions: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
      organizations: { findFirst: (...args: unknown[]) => mockFindFirst(...args) },
    },
    update: mockUpdate,
  },
}));

jest.unstable_mockModule('../../src/db/schema.js', () => ({
  stepExecutions: { id: 'id', flowId: 'flow_id' },
  flows: { id: 'id' },
  templates: { id: 'id' },
  organizations: { id: 'id' },
}));

jest.unstable_mockModule('drizzle-orm', () => ({
  eq: jest.fn((field: string, value: string) => ({ field, value })),
}));

// Mock Anthropic SDK
const mockCreate = jest.fn();
const mockStream = jest.fn();

jest.unstable_mockModule('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
      stream: mockStream,
    },
  })),
}));

// Dynamic imports after mocks
const { buildDDRContext, runAIPrepare, runAIAdvise, runAIReview, generateFlowSummary } =
  await import('../../src/services/ai-assignee.js');

// ============================================================================
// Helpers
// ============================================================================

function makeAnthropicResponse(text: string) {
  return {
    content: [{ type: 'text', text }],
  };
}

const mockFlow = {
  id: 'run-1',
  templateId: 'flow-1',
  name: 'Test Run',
  status: 'IN_PROGRESS',
  organizationId: 'org-1',
  startedById: 'user-1',
  kickoffData: { clientName: 'Acme Corp', amount: 50000 },
  roleAssignments: { 'Client': 'contact-1' },
  startedAt: new Date('2025-01-01'),
  completedAt: null,
  template: {
    id: 'flow-1',
    name: 'Onboarding Flow',
    definition: {
      steps: [
        {
          stepId: 'step-1',
          type: 'FORM',
          config: {
            name: 'Client Info',
            formFields: [
              { label: 'Company Name', type: 'text', required: true },
              { label: 'Industry', type: 'text', required: false },
            ],
            aiPrepare: { enabled: true, prompt: 'Use kickoff data to fill fields' },
            aiAdvise: { enabled: true, prompt: 'Suggest what to fill' },
          },
        },
        {
          stepId: 'step-2',
          type: 'APPROVAL',
          config: {
            name: 'Manager Approval',
            aiReview: { enabled: true, criteria: 'Check completeness' },
          },
        },
      ],
    },
  },
  stepExecutions: [
    {
      id: 'se-1',
      stepId: 'step-1',
      stepIndex: 0,
      status: 'COMPLETED',
      resultData: { 'Company Name': 'Acme Corp', Industry: 'Technology' },
      completedAt: new Date('2025-01-02'),
      startedAt: new Date('2025-01-01'),
    },
    {
      id: 'se-2',
      stepId: 'step-2',
      stepIndex: 1,
      status: 'IN_PROGRESS',
      resultData: null,
      completedAt: null,
      startedAt: new Date('2025-01-02'),
    },
  ],
};

// ============================================================================
// Tests
// ============================================================================

describe('AI Assignee Service', () => {
  beforeEach(() => {
    mockFindFirst.mockReset();
    mockFindMany.mockReset();
    mockUpdate.mockClear();
    mockUpdateSet.mockClear();
    mockUpdateWhere.mockClear().mockResolvedValue(undefined as never);
    mockUpdateSet.mockReturnValue({ where: mockUpdateWhere });
    mockUpdate.mockReturnValue({ set: mockUpdateSet });
    mockCreate.mockReset();
    mockStream.mockReset();
  });

  // --------------------------------------------------------------------------
  // buildDDRContext
  // --------------------------------------------------------------------------

  describe('buildDDRContext', () => {
    it('should build context from a flow run with completed steps', async () => {
      // flows.findFirst
      mockFindFirst.mockResolvedValueOnce(mockFlow as never);
      // organizations.findFirst
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never);

      const ctx = await buildDDRContext('run-1');

      expect(ctx.flowName).toBe('Onboarding Flow');
      expect(ctx.workspace).toBe('Test Org');
      expect(ctx.kickoffData).toEqual({ clientName: 'Acme Corp', amount: 50000 });
      expect(ctx.roleAssignments).toEqual({ 'Client': 'contact-1' });
      expect(ctx.stepOutputs['Client Info']).toEqual({
        'Company Name': 'Acme Corp',
        Industry: 'Technology',
      });
      expect(ctx.currentStep).toEqual({
        id: 'se-2',
        stepId: 'step-2',
        stepIndex: 1,
        status: 'IN_PROGRESS',
      });
    });

    it('should return empty context when flow run is not found', async () => {
      mockFindFirst.mockResolvedValueOnce(null as never);

      const ctx = await buildDDRContext('nonexistent');

      expect(ctx.flowName).toBe('');
      expect(ctx.workspace).toBe('');
      expect(ctx.kickoffData).toEqual({});
      expect(ctx.stepOutputs).toEqual({});
      expect(ctx.currentStep).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // runAIPrepare
  // --------------------------------------------------------------------------

  describe('runAIPrepare', () => {
    it('should call Claude and store prefilled fields', async () => {
      // buildDDRContext calls
      mockFindFirst.mockResolvedValueOnce(mockFlow as never); // flows
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never); // org

      // Claude response
      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          prefilledFields: { 'Company Name': 'Acme Corp', Industry: 'Technology' },
          confidence: 0.9,
          reasoning: 'Derived from kickoff data',
        })) as never
      );

      // stepExecutions.findFirst for storing result
      mockFindFirst.mockResolvedValueOnce({
        id: 'se-2',
        resultData: {},
      } as never);

      const stepDef = mockFlow.template.definition.steps[0];
      const result = await runAIPrepare('se-2', stepDef as any, 'run-1');

      expect(result.status).toBe('COMPLETED');
      expect(result.prefilledFields).toEqual({
        'Company Name': 'Acme Corp',
        Industry: 'Technology',
      });
      expect(result.confidence).toBe(0.9);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockUpdate).toHaveBeenCalled();
    });

    it('should handle unparseable AI response gracefully', async () => {
      mockFindFirst.mockResolvedValueOnce(mockFlow as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never);
      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse('I cannot generate JSON right now') as never
      );
      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = mockFlow.template.definition.steps[0];
      const result = await runAIPrepare('se-2', stepDef as any, 'run-1');

      expect(result.status).toBe('FAILED');
      expect(result.prefilledFields).toEqual({});
    });

    it('should handle API errors gracefully', async () => {
      mockFindFirst.mockResolvedValueOnce(mockFlow as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never);
      mockCreate.mockRejectedValueOnce(new Error('API key invalid') as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = mockFlow.template.definition.steps[0];
      const result = await runAIPrepare('se-2', stepDef as any, 'run-1');

      expect(result.status).toBe('FAILED');
      expect(result.reasoning).toContain('API key invalid');
    });
  });

  // --------------------------------------------------------------------------
  // runAIAdvise
  // --------------------------------------------------------------------------

  describe('runAIAdvise', () => {
    it('should call Claude and store recommendation', async () => {
      mockFindFirst.mockResolvedValueOnce(mockFlow as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never);

      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          recommendation: 'Approve the submission',
          reasoning: 'All data is complete and accurate',
          supportingData: { completeness: '100%' },
        })) as never
      );

      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = mockFlow.template.definition.steps[1];
      const result = await runAIAdvise('se-2', stepDef as any, 'run-1');

      expect(result.status).toBe('COMPLETED');
      expect(result.recommendation).toBe('Approve the submission');
      expect(result.reasoning).toContain('complete and accurate');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('should handle failure gracefully', async () => {
      mockFindFirst.mockResolvedValueOnce(mockFlow as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'org-1', name: 'Test Org' } as never);
      mockCreate.mockRejectedValueOnce(new Error('Rate limited') as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = mockFlow.template.definition.steps[1];
      const result = await runAIAdvise('se-2', stepDef as any, 'run-1');

      expect(result.status).toBe('FAILED');
      expect(result.reasoning).toContain('Rate limited');
    });
  });

  // --------------------------------------------------------------------------
  // runAIReview
  // --------------------------------------------------------------------------

  describe('runAIReview', () => {
    it('should approve a valid submission', async () => {
      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          status: 'APPROVED',
          feedback: 'Submission looks good',
          issues: [],
        })) as never
      );

      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = {
        type: 'FORM',
        config: {
          name: 'Info Form',
          aiReview: { enabled: true, criteria: 'Check all fields are filled' },
        },
      };

      const result = await runAIReview('se-2', stepDef, { name: 'John', email: 'john@test.com' });

      expect(result.status).toBe('APPROVED');
      expect(result.feedback).toBe('Submission looks good');
      expect(result.issues).toEqual([]);
    });

    it('should request revision for incomplete submissions', async () => {
      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          status: 'REVISION_NEEDED',
          feedback: 'Missing required fields',
          issues: ['Email field is empty', 'Phone number format is invalid'],
        })) as never
      );

      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = {
        type: 'FORM',
        config: {
          name: 'Info Form',
          aiReview: { enabled: true, criteria: 'All fields must be filled' },
        },
      };

      const result = await runAIReview('se-2', stepDef, { name: 'John' });

      expect(result.status).toBe('REVISION_NEEDED');
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0]).toContain('Email');
    });

    it('should approve by default on API failure', async () => {
      mockCreate.mockRejectedValueOnce(new Error('Service unavailable') as never);
      mockFindFirst.mockResolvedValueOnce({ id: 'se-2', resultData: {} } as never);

      const stepDef = {
        type: 'FORM',
        config: { name: 'Form', aiReview: { enabled: true } },
      };

      const result = await runAIReview('se-2', stepDef, { data: 'test' });

      expect(result.status).toBe('APPROVED');
      expect(result.feedback).toContain('could not be completed');
    });

    it('should store review result in resultData', async () => {
      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          status: 'APPROVED',
          feedback: 'All good',
          issues: [],
        })) as never
      );

      mockFindFirst.mockResolvedValueOnce({
        id: 'se-2',
        resultData: { existingField: 'value' },
      } as never);

      const stepDef = {
        type: 'FORM',
        config: { name: 'Form', aiReview: { enabled: true } },
      };

      await runAIReview('se-2', stepDef, { data: 'test' });

      // Verify update was called with merged data
      expect(mockUpdateSet).toHaveBeenCalled();
      const setCall = mockUpdateSet.mock.calls[0]![0] as Record<string, unknown>;
      const resultData = setCall.resultData as Record<string, unknown>;
      expect(resultData.existingField).toBe('value');
      expect(resultData._aiReview).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // generateFlowSummary
  // --------------------------------------------------------------------------

  describe('generateFlowSummary', () => {
    it('should generate a summary for a completed flow', async () => {
      const completedRun = {
        ...mockFlow,
        status: 'COMPLETED',
        completedAt: new Date('2025-01-03'),
        kickoffData: { clientName: 'Acme Corp' },
      };

      mockFindFirst.mockResolvedValueOnce(completedRun as never);

      mockCreate.mockResolvedValueOnce(
        makeAnthropicResponse(JSON.stringify({
          summary: 'Onboarding completed successfully for Acme Corp.',
          keyDecisions: ['Client approved', 'KYC verified'],
          timeline: [
            { step: 'Client Info', completedAt: '2025-01-02', outcome: 'Form filled' },
            { step: 'Manager Approval', completedAt: '2025-01-03', outcome: 'Approved' },
          ],
        })) as never
      );

      const result = await generateFlowSummary('run-1');

      expect(result.summary).toContain('Acme Corp');
      expect(result.keyDecisions).toHaveLength(2);
      expect(result.timeline).toHaveLength(2);
      expect(result.generatedAt).toBeDefined();

      // Should store in kickoffData
      expect(mockUpdateSet).toHaveBeenCalled();
    });

    it('should return fallback on error', async () => {
      mockFindFirst.mockResolvedValueOnce(null as never);

      const result = await generateFlowSummary('nonexistent');

      expect(result.summary).toContain('failed');
      expect(result.keyDecisions).toEqual([]);
      expect(result.timeline).toEqual([]);
    });
  });
});
