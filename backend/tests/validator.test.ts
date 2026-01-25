/**
 * Validator Tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { validateWorkflow, type ValidationMode } from '../src/validator/index.js';
import { stepRegistry } from '../src/config/step-registry.js';
import { sampleWorkflow, invalidWorkflow } from './fixtures/sample-workflow.js';

// Initialize the step registry before tests
beforeAll(() => {
  stepRegistry.initialize();
});

describe('validateWorkflow', () => {
  describe('valid workflows', () => {
    it('should validate a correct workflow', () => {
      const result = validateWorkflow(sampleWorkflow);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return warnings but still be valid in LENIENT mode', () => {
      const result = validateWorkflow(sampleWorkflow, { mode: 'LENIENT' });

      expect(result.valid).toBe(true);
    });
  });

  describe('invalid workflows', () => {
    it('should catch duplicate step IDs', () => {
      const result = validateWorkflow(invalidWorkflow);

      expect(result.valid).toBe(false);
      const duplicateError = result.errors.find(e => e.rule === 'UNIQUE_ID');
      expect(duplicateError).toBeDefined();
    });

    it('should catch invalid assignee references', () => {
      const result = validateWorkflow(invalidWorkflow);

      expect(result.valid).toBe(false);
      const assigneeError = result.errors.find(e => e.rule === 'INVALID_REFERENCE');
      expect(assigneeError).toBeDefined();
    });

    it('should catch decision with less than 2 outcomes', () => {
      const result = validateWorkflow(invalidWorkflow);

      expect(result.valid).toBe(false);
      const outcomeError = result.errors.find(e => e.rule === 'MIN_OUTCOMES');
      expect(outcomeError).toBeDefined();
    });
  });

  describe('constraint validation', () => {
    it('should validate TERMINATE is only in allowed containers', () => {
      // The sample workflow has TERMINATE inside a DECISION outcome - valid
      const result = validateWorkflow(sampleWorkflow);
      expect(result.valid).toBe(true);
    });

    it('should validate milestone references', () => {
      const workflowWithBadMilestone = {
        ...sampleWorkflow,
        steps: [
          {
            ...sampleWorkflow.steps[0],
            milestoneId: 'nonexistent_milestone',
          },
        ],
      };

      const result = validateWorkflow(workflowWithBadMilestone as any);

      expect(result.valid).toBe(false);
      const milestoneError = result.errors.find(e => e.rule === 'INVALID_REFERENCE');
      expect(milestoneError).toBeDefined();
    });
  });

  describe('validation modes', () => {
    it('STRICT mode should error on unknown step types', () => {
      const workflowWithUnknownType = {
        ...sampleWorkflow,
        steps: [
          {
            stepId: 's_unknown',
            type: 'UNKNOWN_TYPE',
            milestoneId: 'ms1',
          } as any,
        ],
      };

      const result = validateWorkflow(workflowWithUnknownType, { mode: 'STRICT' });

      expect(result.valid).toBe(false);
      const unknownError = result.errors.find(e => e.rule === 'UNKNOWN_STEP_TYPE');
      expect(unknownError).toBeDefined();
    });

    it('LENIENT mode should warn on unknown step types but still be valid', () => {
      const workflowWithUnknownType = {
        ...sampleWorkflow,
        steps: [
          {
            stepId: 's_unknown',
            type: 'UNKNOWN_TYPE',
            milestoneId: 'ms1',
          } as any,
        ],
      };

      const result = validateWorkflow(workflowWithUnknownType, { mode: 'LENIENT' });

      expect(result.valid).toBe(true);
      const unknownWarning = result.warnings.find(e => e.rule === 'UNKNOWN_STEP_TYPE');
      expect(unknownWarning).toBeDefined();
    });
  });
});
