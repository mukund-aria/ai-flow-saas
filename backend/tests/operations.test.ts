/**
 * Operations Engine Tests
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { applyOperations } from '../src/engine/operations.js';
import { stepRegistry } from '../src/config/step-registry.js';
import { sampleWorkflow } from './fixtures/sample-workflow.js';
import type { Flow } from '../src/models/workflow.js';
import type { Operation, AddStepAfterOperation, RemoveStepOperation, UpdateStepOperation } from '../src/models/operations.js';

// Initialize the step registry before tests
beforeAll(() => {
  stepRegistry.initialize();
});

describe('applyOperations', () => {
  describe('ADD_STEP_AFTER', () => {
    it('should add a step after an existing step', () => {
      const operation: AddStepAfterOperation = {
        op: 'ADD_STEP_AFTER',
        afterStepId: 's1_form',
        step: {
          stepId: 's_new',
          type: 'TODO',
          milestoneId: 'ms1',
          title: 'New TODO',
          assignees: { mode: 'PLACEHOLDER', placeholderId: 'role_client' },
        } as any,
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(true);
      expect(result.finalWorkflow).toBeDefined();

      const workflow = result.finalWorkflow as Flow;
      const newStepIndex = workflow.steps.findIndex(s => s.stepId === 's_new');
      expect(newStepIndex).toBe(1); // After s1_form which is at index 0
    });

    it('should fail if afterStepId not found', () => {
      const operation: AddStepAfterOperation = {
        op: 'ADD_STEP_AFTER',
        afterStepId: 'nonexistent',
        step: {
          stepId: 's_new',
          type: 'TODO',
          milestoneId: 'ms1',
        } as any,
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(false);
      expect(result.results[0].error).toContain('not found');
    });
  });

  describe('REMOVE_STEP', () => {
    it('should remove an existing step', () => {
      const operation: RemoveStepOperation = {
        op: 'REMOVE_STEP',
        stepId: 's3_approval',
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(true);
      expect(result.finalWorkflow).toBeDefined();

      const workflow = result.finalWorkflow as Flow;
      const removedStep = workflow.steps.find(s => s.stepId === 's3_approval');
      expect(removedStep).toBeUndefined();
    });

    it('should fail if step not found', () => {
      const operation: RemoveStepOperation = {
        op: 'REMOVE_STEP',
        stepId: 'nonexistent',
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(false);
    });
  });

  describe('UPDATE_STEP', () => {
    it('should update step properties', () => {
      const operation: UpdateStepOperation = {
        op: 'UPDATE_STEP',
        stepId: 's1_form',
        updates: {
          title: 'Updated Form Title',
          description: 'Updated description',
        } as any,
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(true);
      expect(result.finalWorkflow).toBeDefined();

      const workflow = result.finalWorkflow as Flow;
      const updatedStep = workflow.steps.find(s => s.stepId === 's1_form');
      expect(updatedStep?.title).toBe('Updated Form Title');
      expect(updatedStep?.description).toBe('Updated description');
    });
  });

  describe('multiple operations', () => {
    it('should apply multiple operations in sequence', () => {
      const operations: Operation[] = [
        {
          op: 'ADD_STEP_AFTER',
          afterStepId: 's1_form',
          step: {
            stepId: 's_new_1',
            type: 'TODO',
            milestoneId: 'ms1',
            title: 'New Step 1',
          } as any,
        } as AddStepAfterOperation,
        {
          op: 'ADD_STEP_AFTER',
          afterStepId: 's_new_1',
          step: {
            stepId: 's_new_2',
            type: 'TODO',
            milestoneId: 'ms1',
            title: 'New Step 2',
          } as any,
        } as AddStepAfterOperation,
      ];

      const result = applyOperations(sampleWorkflow, operations);

      expect(result.success).toBe(true);
      expect(result.results).toHaveLength(2);

      const workflow = result.finalWorkflow as Flow;
      const stepIds = workflow.steps.map(s => s.stepId);
      expect(stepIds).toContain('s_new_1');
      expect(stepIds).toContain('s_new_2');
    });

    it('should stop on first failure', () => {
      const operations: Operation[] = [
        {
          op: 'ADD_STEP_AFTER',
          afterStepId: 's1_form',
          step: {
            stepId: 's_new',
            type: 'TODO',
            milestoneId: 'ms1',
          } as any,
        } as AddStepAfterOperation,
        {
          op: 'REMOVE_STEP',
          stepId: 'nonexistent',
        } as RemoveStepOperation,
        {
          op: 'UPDATE_STEP',
          stepId: 's1_form',
          updates: { title: 'Should not happen' } as any,
        } as UpdateStepOperation,
      ];

      const result = applyOperations(sampleWorkflow, operations);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2); // Stopped after second operation failed
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
    });
  });

  describe('decision operations', () => {
    it('should add steps to decision outcomes', () => {
      const operation: Operation = {
        op: 'ADD_OUTCOME_STEP_AFTER',
        decisionStepId: 's2_decision',
        outcomeId: 'o_yes',
        afterStepId: null,
        step: {
          stepId: 's_yes_action',
          type: 'TODO',
          milestoneId: 'ms1',
          title: 'Action for Yes',
        } as any,
      };

      const result = applyOperations(sampleWorkflow, [operation]);

      expect(result.success).toBe(true);

      const workflow = result.finalWorkflow as Flow;
      const decision = workflow.steps.find(s => s.stepId === 's2_decision') as any;
      const yesOutcome = decision.outcomes.find((o: any) => o.outcomeId === 'o_yes');
      expect(yesOutcome.steps).toHaveLength(1);
      expect(yesOutcome.steps[0].stepId).toBe('s_yes_action');
    });
  });

  describe('immutability', () => {
    it('should not mutate the original workflow', () => {
      const originalStepsLength = sampleWorkflow.steps.length;
      const originalFirstStepTitle = sampleWorkflow.steps[0].title;

      const operations: Operation[] = [
        {
          op: 'ADD_STEP_AFTER',
          afterStepId: 's1_form',
          step: {
            stepId: 's_new',
            type: 'TODO',
            milestoneId: 'ms1',
          } as any,
        } as AddStepAfterOperation,
        {
          op: 'UPDATE_STEP',
          stepId: 's1_form',
          updates: { title: 'Changed Title' } as any,
        } as UpdateStepOperation,
      ];

      applyOperations(sampleWorkflow, operations);

      // Original should be unchanged
      expect(sampleWorkflow.steps.length).toBe(originalStepsLength);
      expect(sampleWorkflow.steps[0].title).toBe(originalFirstStepTitle);
    });
  });
});
