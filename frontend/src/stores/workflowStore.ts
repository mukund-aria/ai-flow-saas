import { create } from 'zustand';
import type { Flow, Step, StepType, StepConfig } from '@/types';

interface WorkflowStore {
  workflow: Flow | null;
  isLoading: boolean;
  // Database state
  savedFlowId: string | null;
  savedFlowStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  isSaving: boolean;

  setWorkflow: (workflow: Flow | null) => void;
  clearWorkflow: () => void;
  setLoading: (loading: boolean) => void;
  // Database actions
  setSavedFlow: (id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => void;
  setSaving: (saving: boolean) => void;
  clearSavedFlow: () => void;
  // Manual edit actions
  initEmptyWorkflow: (name?: string) => void;
  addStep: (afterIndex: number, stepType: StepType) => void;
  removeStep: (stepId: string) => void;
  updateStep: (stepId: string, updates: Partial<StepConfig>) => void;
  moveStep: (stepId: string, newIndex: number) => void;
  // Assignee management
  addAssigneePlaceholder: (roleName: string, description?: string) => void;
  removeAssigneePlaceholder: (placeholderId: string) => void;
  updateFlowMetadata: (updates: Partial<Pick<Flow, 'name' | 'description'>>) => void;
}

let stepCounter = 0;
function generateStepId(): string {
  stepCounter++;
  return `step-${Date.now()}-${stepCounter}`;
}

function createDefaultStep(stepType: StepType): Step {
  return {
    stepId: generateStepId(),
    type: stepType,
    config: {
      name: '',
      description: '',
    },
  };
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflow: null,
  isLoading: false,
  savedFlowId: null,
  savedFlowStatus: null,
  isSaving: false,

  setWorkflow: (workflow) => set({ workflow, isLoading: false }),

  clearWorkflow: () => set({ workflow: null, savedFlowId: null, savedFlowStatus: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSavedFlow: (id, status) => set({ savedFlowId: id, savedFlowStatus: status, isSaving: false }),

  setSaving: (saving) => set({ isSaving: saving }),

  clearSavedFlow: () => set({ savedFlowId: null, savedFlowStatus: null }),

  initEmptyWorkflow: (name) => {
    set({
      workflow: {
        flowId: `flow-${Date.now()}`,
        name: name || 'Untitled Flow',
        description: '',
        steps: [],
        milestones: [],
        assigneePlaceholders: [],
      },
    });
  },

  addStep: (afterIndex, stepType) => {
    const { workflow } = get();
    if (!workflow) return;

    const newStep = createDefaultStep(stepType);
    const steps = [...workflow.steps];
    steps.splice(afterIndex, 0, newStep);

    set({ workflow: { ...workflow, steps } });
  },

  removeStep: (stepId) => {
    const { workflow } = get();
    if (!workflow) return;

    const steps = workflow.steps.filter((s) => s.stepId !== stepId);
    set({ workflow: { ...workflow, steps } });
  },

  updateStep: (stepId, updates) => {
    const { workflow } = get();
    if (!workflow) return;

    const steps = workflow.steps.map((s) =>
      s.stepId === stepId
        ? { ...s, config: { ...s.config, ...updates } }
        : s
    );
    set({ workflow: { ...workflow, steps } });
  },

  moveStep: (stepId, newIndex) => {
    const { workflow } = get();
    if (!workflow) return;

    const steps = [...workflow.steps];
    const currentIndex = steps.findIndex((s) => s.stepId === stepId);
    if (currentIndex === -1 || currentIndex === newIndex) return;

    const [step] = steps.splice(currentIndex, 1);
    steps.splice(newIndex, 0, step);
    set({ workflow: { ...workflow, steps } });
  },

  addAssigneePlaceholder: (roleName, description) => {
    const { workflow } = get();
    if (!workflow) return;

    const placeholder = {
      placeholderId: `role-${Date.now()}-${++stepCounter}`,
      roleName,
      description,
    };

    set({
      workflow: {
        ...workflow,
        assigneePlaceholders: [...(workflow.assigneePlaceholders || []), placeholder],
      },
    });
  },

  removeAssigneePlaceholder: (placeholderId) => {
    const { workflow } = get();
    if (!workflow) return;

    const assigneePlaceholders = (workflow.assigneePlaceholders || []).filter(
      (a) => a.placeholderId !== placeholderId
    );

    // Also clear assignee from any steps that reference the removed role
    const removedRole = (workflow.assigneePlaceholders || []).find(
      (a) => a.placeholderId === placeholderId
    );

    let steps = workflow.steps;
    if (removedRole) {
      steps = steps.map((s) =>
        s.config.assignee === removedRole.roleName
          ? { ...s, config: { ...s.config, assignee: undefined } }
          : s
      );
    }

    set({ workflow: { ...workflow, assigneePlaceholders, steps } });
  },

  updateFlowMetadata: (updates) => {
    const { workflow } = get();
    if (!workflow) return;

    set({ workflow: { ...workflow, ...updates } });
  },
}));
