import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowStore } from '@/stores/workflowStore';

describe('workflowStore', () => {
  beforeEach(() => {
    useWorkflowStore.setState({ workflow: null, savedFlowId: null, savedFlowStatus: null, isSaving: false });
  });

  // ============================================================================
  // initEmptyWorkflow
  // ============================================================================

  describe('initEmptyWorkflow', () => {
    it('creates workflow with empty steps and default name "Untitled Flow"', () => {
      useWorkflowStore.getState().initEmptyWorkflow();

      const { workflow } = useWorkflowStore.getState();
      expect(workflow).not.toBeNull();
      expect(workflow!.name).toBe('Untitled Template');
      expect(workflow!.steps).toEqual([]);
      expect(workflow!.milestones).toEqual([]);
      expect(workflow!.roles).toEqual([]);
      expect(workflow!.description).toBe('');
      expect(workflow!.flowId).toMatch(/^flow-/);
    });

    it('uses provided name when given', () => {
      useWorkflowStore.getState().initEmptyWorkflow('My Flow');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow).not.toBeNull();
      expect(workflow!.name).toBe('My Flow');
      expect(workflow!.steps).toEqual([]);
    });
  });

  // ============================================================================
  // addStep
  // ============================================================================

  describe('addStep', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
    });

    it('inserts a FORM step at index 0 into an empty workflow', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps).toHaveLength(1);
      expect(workflow!.steps[0].type).toBe('FORM');
      expect(workflow!.steps[0].stepId).toMatch(/^step-/);
      expect(workflow!.steps[0].config).toEqual({ name: '', description: '' });
    });

    it('inserts at index 0 (beginning) when steps already exist', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(0, 'APPROVAL');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps).toHaveLength(2);
      expect(workflow!.steps[0].type).toBe('APPROVAL');
      expect(workflow!.steps[1].type).toBe('FORM');
    });

    it('inserts at the end when index equals steps length', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(1, 'APPROVAL');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps).toHaveLength(2);
      expect(workflow!.steps[0].type).toBe('FORM');
      expect(workflow!.steps[1].type).toBe('APPROVAL');
    });

    it('inserts in the middle at the correct index', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(1, 'TODO');
      useWorkflowStore.getState().addStep(1, 'APPROVAL');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps).toHaveLength(3);
      expect(workflow!.steps[0].type).toBe('FORM');
      expect(workflow!.steps[1].type).toBe('APPROVAL');
      expect(workflow!.steps[2].type).toBe('TODO');
    });

    it('does nothing if workflow is null', () => {
      useWorkflowStore.setState({ workflow: null });
      useWorkflowStore.getState().addStep(0, 'FORM');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow).toBeNull();
    });
  });

  // ============================================================================
  // removeStep
  // ============================================================================

  describe('removeStep', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(1, 'APPROVAL');
      useWorkflowStore.getState().addStep(2, 'TODO');
    });

    it('removes the correct step by stepId', () => {
      const { workflow } = useWorkflowStore.getState();
      const stepToRemove = workflow!.steps[1]; // APPROVAL

      useWorkflowStore.getState().removeStep(stepToRemove.stepId);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps).toHaveLength(2);
      expect(updated!.steps[0].type).toBe('FORM');
      expect(updated!.steps[1].type).toBe('TODO');
    });

    it('removes the first step correctly', () => {
      const { workflow } = useWorkflowStore.getState();
      const firstStep = workflow!.steps[0];

      useWorkflowStore.getState().removeStep(firstStep.stepId);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps).toHaveLength(2);
      expect(updated!.steps[0].type).toBe('APPROVAL');
    });

    it('removes the last step correctly', () => {
      const { workflow } = useWorkflowStore.getState();
      const lastStep = workflow!.steps[2];

      useWorkflowStore.getState().removeStep(lastStep.stepId);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps).toHaveLength(2);
      expect(updated!.steps[1].type).toBe('APPROVAL');
    });

    it('does nothing if stepId does not match any step', () => {
      useWorkflowStore.getState().removeStep('non-existent-id');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps).toHaveLength(3);
    });
  });

  // ============================================================================
  // updateStep
  // ============================================================================

  describe('updateStep', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
      useWorkflowStore.getState().addStep(0, 'FORM');
    });

    it('patches the config with updated name', () => {
      const { workflow } = useWorkflowStore.getState();
      const stepId = workflow!.steps[0].stepId;

      useWorkflowStore.getState().updateStep(stepId, { name: 'Updated' });

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].config.name).toBe('Updated');
    });

    it('patches the config with multiple fields', () => {
      const { workflow } = useWorkflowStore.getState();
      const stepId = workflow!.steps[0].stepId;

      useWorkflowStore.getState().updateStep(stepId, {
        name: 'Client Form',
        description: 'Collect client details',
        assignee: 'Client',
      });

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].config.name).toBe('Client Form');
      expect(updated!.steps[0].config.description).toBe('Collect client details');
      expect(updated!.steps[0].config.assignee).toBe('Client');
    });

    it('does not affect other steps', () => {
      useWorkflowStore.getState().addStep(1, 'APPROVAL');
      const { workflow } = useWorkflowStore.getState();
      const firstStepId = workflow!.steps[0].stepId;

      useWorkflowStore.getState().updateStep(firstStepId, { name: 'Updated First' });

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].config.name).toBe('Updated First');
      expect(updated!.steps[1].config.name).toBe('');
    });

    it('does nothing if stepId does not match', () => {
      useWorkflowStore.getState().updateStep('non-existent', { name: 'Nope' });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps[0].config.name).toBe('');
    });
  });

  // ============================================================================
  // moveStep
  // ============================================================================

  describe('moveStep', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(1, 'APPROVAL');
      useWorkflowStore.getState().addStep(2, 'TODO');
    });

    it('moves a step from beginning to end', () => {
      const { workflow } = useWorkflowStore.getState();
      const firstStepId = workflow!.steps[0].stepId;

      useWorkflowStore.getState().moveStep(firstStepId, 2);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].type).toBe('APPROVAL');
      expect(updated!.steps[1].type).toBe('TODO');
      expect(updated!.steps[2].type).toBe('FORM');
    });

    it('moves a step from end to beginning', () => {
      const { workflow } = useWorkflowStore.getState();
      const lastStepId = workflow!.steps[2].stepId;

      useWorkflowStore.getState().moveStep(lastStepId, 0);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].type).toBe('TODO');
      expect(updated!.steps[1].type).toBe('FORM');
      expect(updated!.steps[2].type).toBe('APPROVAL');
    });

    it('does nothing when moving to the same position', () => {
      const { workflow } = useWorkflowStore.getState();
      const middleStepId = workflow!.steps[1].stepId;

      useWorkflowStore.getState().moveStep(middleStepId, 1);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].type).toBe('FORM');
      expect(updated!.steps[1].type).toBe('APPROVAL');
      expect(updated!.steps[2].type).toBe('TODO');
    });

    it('does nothing if stepId does not exist', () => {
      useWorkflowStore.getState().moveStep('non-existent', 0);

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.steps[0].type).toBe('FORM');
      expect(workflow!.steps[1].type).toBe('APPROVAL');
      expect(workflow!.steps[2].type).toBe('TODO');
    });
  });

  // ============================================================================
  // addRole
  // ============================================================================

  describe('addRole', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
    });

    it('adds a role with the given name', () => {
      useWorkflowStore.getState().addRole('Client');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.roles).toHaveLength(1);
      expect(workflow!.roles[0].name).toBe('Client');
      expect(workflow!.roles[0].roleId).toMatch(/^role-/);
    });

    it('adds multiple roles', () => {
      useWorkflowStore.getState().addRole('Client');
      useWorkflowStore.getState().addRole('Manager');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.roles).toHaveLength(2);
      expect(workflow!.roles[0].name).toBe('Client');
      expect(workflow!.roles[1].name).toBe('Manager');
    });

    it('includes description when provided', () => {
      useWorkflowStore.getState().addRole('Client', 'External customer');

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.roles[0].description).toBe('External customer');
    });
  });

  // ============================================================================
  // removeRole
  // ============================================================================

  describe('removeRole', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
      useWorkflowStore.getState().addRole('Client');
      useWorkflowStore.getState().addRole('Manager');
    });

    it('removes the role with the given id', () => {
      const { workflow } = useWorkflowStore.getState();
      const clientId = workflow!.roles[0].roleId;

      useWorkflowStore.getState().removeRole(clientId);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.roles).toHaveLength(1);
      expect(updated!.roles[0].name).toBe('Manager');
    });

    it('clears assignee from steps that reference the removed role', () => {
      // Add a step and assign it to 'Client'
      useWorkflowStore.getState().addStep(0, 'FORM');
      const workflow = useWorkflowStore.getState().workflow!;
      const stepId = workflow.steps[0].stepId;
      useWorkflowStore.getState().updateStep(stepId, { assignee: 'Client' });

      // Verify assignment
      expect(useWorkflowStore.getState().workflow!.steps[0].config.assignee).toBe('Client');

      // Remove the 'Client' role
      const clientId = useWorkflowStore.getState().workflow!.roles[0].roleId;
      useWorkflowStore.getState().removeRole(clientId);

      // The step's assignee should be cleared
      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].config.assignee).toBeUndefined();
    });

    it('does not clear assignee from steps with a different role', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().addStep(1, 'APPROVAL');
      const workflow = useWorkflowStore.getState().workflow!;
      useWorkflowStore.getState().updateStep(workflow.steps[0].stepId, { assignee: 'Client' });
      useWorkflowStore.getState().updateStep(workflow.steps[1].stepId, { assignee: 'Manager' });

      // Remove Client role
      const clientId = useWorkflowStore.getState().workflow!.roles[0].roleId;
      useWorkflowStore.getState().removeRole(clientId);

      const updated = useWorkflowStore.getState().workflow;
      expect(updated!.steps[0].config.assignee).toBeUndefined();
      expect(updated!.steps[1].config.assignee).toBe('Manager');
    });
  });

  // ============================================================================
  // updateFlowMetadata
  // ============================================================================

  describe('updateFlowMetadata', () => {
    beforeEach(() => {
      useWorkflowStore.getState().initEmptyWorkflow();
    });

    it('updates the flow name', () => {
      useWorkflowStore.getState().updateFlowMetadata({ name: 'New Name' });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.name).toBe('New Name');
    });

    it('updates the flow description', () => {
      useWorkflowStore.getState().updateFlowMetadata({ description: 'A test flow' });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.description).toBe('A test flow');
    });

    it('updates both name and description simultaneously', () => {
      useWorkflowStore.getState().updateFlowMetadata({
        name: 'Updated Flow',
        description: 'Updated description',
      });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.name).toBe('Updated Flow');
      expect(workflow!.description).toBe('Updated description');
    });

    it('preserves existing fields when updating partially', () => {
      useWorkflowStore.getState().addStep(0, 'FORM');
      useWorkflowStore.getState().updateFlowMetadata({ name: 'New Name' });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow!.name).toBe('New Name');
      expect(workflow!.steps).toHaveLength(1);
    });

    it('does nothing if workflow is null', () => {
      useWorkflowStore.setState({ workflow: null });
      useWorkflowStore.getState().updateFlowMetadata({ name: 'Should not work' });

      const { workflow } = useWorkflowStore.getState();
      expect(workflow).toBeNull();
    });
  });
});
