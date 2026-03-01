/**
 * LLM Parser Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  parseAIResponse,
  extractJSON,
  getResponseSummary,
} from '../src/llm/parser.js';
import type { AIResponse } from '../src/llm/types.js';

describe('extractJSON', () => {
  it('should extract JSON from plain JSON string', () => {
    const input = '{"mode": "create", "workflow": {}}';
    const result = extractJSON(input);
    expect(result).toBe('{"mode": "create", "workflow": {}}');
  });

  it('should extract JSON from markdown code block', () => {
    const input = '```json\n{"mode": "create", "workflow": {}}\n```';
    const result = extractJSON(input);
    expect(result).toBe('{"mode": "create", "workflow": {}}');
  });

  it('should extract JSON from code block without language', () => {
    const input = '```\n{"mode": "edit", "operations": []}\n```';
    const result = extractJSON(input);
    expect(result).toBe('{"mode": "edit", "operations": []}');
  });

  it('should extract JSON embedded in text', () => {
    const input = 'Here is the response: {"mode": "reject", "reason": "test"}';
    const result = extractJSON(input);
    expect(result).toBe('{"mode": "reject", "reason": "test"}');
  });

  it('should return null for non-JSON content', () => {
    const input = 'This is just plain text without any JSON';
    const result = extractJSON(input);
    expect(result).toBeNull();
  });
});

describe('parseAIResponse', () => {
  describe('create mode', () => {
    it('should parse valid create response', () => {
      const input = JSON.stringify({
        mode: 'create',
        workflow: {
          flowId: 'flow_1',
          name: 'Test Flow',
          steps: [],
          milestones: [],
          roles: [],
        },
        message: 'Created successfully',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(true);
      expect(result.response?.mode).toBe('create');
      if (result.response?.mode === 'create') {
        expect(result.response.workflow.name).toBe('Test Flow');
        expect(result.response.message).toBe('Created successfully');
      }
    });

    it('should fail for create response without workflow', () => {
      const input = JSON.stringify({
        mode: 'create',
        message: 'Created',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.includes('workflow'))).toBe(true);
    });

    it('should fail for create response with invalid workflow', () => {
      const input = JSON.stringify({
        mode: 'create',
        workflow: {
          // Missing required fields
          name: 'Test',
        },
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
    });
  });

  describe('edit mode', () => {
    it('should parse valid edit response', () => {
      const input = JSON.stringify({
        mode: 'edit',
        operations: [
          {
            op: 'ADD_STEP_AFTER',
            afterStepId: 'step_1',
            step: { stepId: 'step_new', type: 'FORM', title: 'New Form' },
          },
        ],
        message: 'Added step',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(true);
      expect(result.response?.mode).toBe('edit');
      if (result.response?.mode === 'edit') {
        expect(result.response.operations).toHaveLength(1);
        expect(result.response.operations[0].op).toBe('ADD_STEP_AFTER');
      }
    });

    it('should fail for edit response without operations array', () => {
      const input = JSON.stringify({
        mode: 'edit',
        message: 'Edited',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('operations'))).toBe(true);
    });

    it('should validate operation structure', () => {
      const input = JSON.stringify({
        mode: 'edit',
        operations: [
          {
            // Missing 'op' field
            stepId: 'step_1',
          },
        ],
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('op'))).toBe(true);
    });
  });

  describe('clarify mode', () => {
    it('should parse valid clarify response', () => {
      const input = JSON.stringify({
        mode: 'clarify',
        questions: [
          { id: 'q1', text: 'Who should review this?' },
          { id: 'q2', text: 'How many approvers needed?' },
        ],
        context: 'Need more details',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(true);
      expect(result.response?.mode).toBe('clarify');
      if (result.response?.mode === 'clarify') {
        expect(result.response.questions).toHaveLength(2);
        expect(result.response.questions[0].id).toBe('q1');
        expect(result.response.context).toBe('Need more details');
      }
    });

    it('should fail for clarify response without questions', () => {
      const input = JSON.stringify({
        mode: 'clarify',
        context: 'Need info',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
    });

    it('should fail for empty questions array', () => {
      const input = JSON.stringify({
        mode: 'clarify',
        questions: [],
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
    });

    it('should validate question structure', () => {
      const input = JSON.stringify({
        mode: 'clarify',
        questions: [
          { id: 'q1' }, // Missing text
        ],
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('text'))).toBe(true);
    });
  });

  describe('reject mode', () => {
    it('should parse valid reject response', () => {
      const input = JSON.stringify({
        mode: 'reject',
        reason: 'Cannot exceed 3 parallel branches',
        suggestion: 'Consider using sequential execution instead',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(true);
      expect(result.response?.mode).toBe('reject');
      if (result.response?.mode === 'reject') {
        expect(result.response.reason).toBe('Cannot exceed 3 parallel branches');
        expect(result.response.suggestion).toBe('Consider using sequential execution instead');
      }
    });

    it('should fail for reject response without reason', () => {
      const input = JSON.stringify({
        mode: 'reject',
        suggestion: 'Try something else',
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('reason'))).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid JSON', () => {
      const input = 'not valid json {';
      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('JSON'))).toBe(true);
    });

    it('should handle missing mode', () => {
      const input = JSON.stringify({
        workflow: {},
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('mode'))).toBe(true);
    });

    it('should handle unknown mode', () => {
      const input = JSON.stringify({
        mode: 'unknown',
        data: {},
      });

      const result = parseAIResponse(input);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.includes('unknown'))).toBe(true);
    });
  });
});

describe('getResponseSummary', () => {
  it('should summarize create response', () => {
    const response: AIResponse = {
      mode: 'create',
      workflow: {
        flowId: 'flow_1',
        name: 'Test Flow',
        steps: [{ stepId: 's1' }, { stepId: 's2' }],
      } as any,
      message: 'Done',
    };

    const summary = getResponseSummary(response);
    expect(summary).toContain('Created workflow');
    expect(summary).toContain('Test Flow');
    expect(summary).toContain('2 steps');
  });

  it('should summarize edit response', () => {
    const response: AIResponse = {
      mode: 'edit',
      operations: [{ op: 'ADD_STEP_AFTER' }, { op: 'REMOVE_STEP' }] as any,
      message: 'Updated workflow',
    };

    const summary = getResponseSummary(response);
    expect(summary).toContain('2 operation');
    expect(summary).toContain('Updated workflow');
  });

  it('should summarize clarify response', () => {
    const response: AIResponse = {
      mode: 'clarify',
      questions: [
        { id: 'q1', text: 'Q1?' },
        { id: 'q2', text: 'Q2?' },
      ],
      context: 'Need info',
    };

    const summary = getResponseSummary(response);
    expect(summary).toContain('clarification');
    expect(summary).toContain('2 question');
  });

  it('should summarize reject response', () => {
    const response: AIResponse = {
      mode: 'reject',
      reason: 'Not allowed',
      suggestion: 'Try this',
    };

    const summary = getResponseSummary(response);
    expect(summary).toContain('Rejected');
    expect(summary).toContain('Not allowed');
  });
});
