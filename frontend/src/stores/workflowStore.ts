import { create } from 'zustand';
import type { Flow, Step, StepType, StepConfig, KickoffConfig, FlowSettings, FlowPermissions, FlowDueDates } from '@/types';

const MAX_HISTORY = 50;

interface WorkflowStore {
  workflow: Flow | null;
  isLoading: boolean;
  // Database state
  savedFlowId: string | null;
  savedFlowStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | null;
  isSaving: boolean;
  // Undo/Redo state
  past: Flow[];
  future: Flow[];
  canUndo: boolean;
  canRedo: boolean;

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
  duplicateStep: (stepId: string) => void;
  // Assignee management
  addAssigneePlaceholder: (roleName: string, description?: string) => void;
  removeAssigneePlaceholder: (placeholderId: string) => void;
  updateFlowMetadata: (updates: Partial<Pick<Flow, 'name' | 'description' | 'workspaceNameTemplate'>>) => void;
  updateNotificationSettings: (notifications: Record<string, unknown>) => void;
  // New: Kickoff, Settings, Permissions
  updateKickoffConfig: (kickoff: Partial<KickoffConfig>) => void;
  updateFlowSettings: (settings: Partial<FlowSettings>) => void;
  updateFlowPermissions: (permissions: Partial<FlowPermissions>) => void;
  updateFlowDueDates: (dueDates: FlowDueDates) => void;
  // Milestone CRUD
  addMilestone: (afterStepIndex: number, name?: string) => void;
  removeMilestone: (milestoneId: string) => void;
  updateMilestone: (milestoneId: string, name: string) => void;
  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
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

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => {
  // Helper to push current workflow onto history before mutating
  function pushHistory() {
    const { workflow, past } = get();
    if (!workflow) return;
    const newPast = [...past, deepClone(workflow)];
    if (newPast.length > MAX_HISTORY) {
      newPast.shift();
    }
    set({ past: newPast, future: [], canUndo: true, canRedo: false });
  }

  return {
    workflow: null,
    isLoading: false,
    savedFlowId: null,
    savedFlowStatus: null,
    isSaving: false,
    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    setWorkflow: (workflow) => set({ workflow, isLoading: false, past: [], future: [], canUndo: false, canRedo: false }),

    clearWorkflow: () => set({ workflow: null, savedFlowId: null, savedFlowStatus: null, past: [], future: [], canUndo: false, canRedo: false }),

    setLoading: (loading) => set({ isLoading: loading }),

    setSavedFlow: (id, status) => set({ savedFlowId: id, savedFlowStatus: status, isSaving: false }),

    setSaving: (saving) => set({ isSaving: saving }),

    clearSavedFlow: () => set({ savedFlowId: null, savedFlowStatus: null }),

    initEmptyWorkflow: (name) => {
      set({
        workflow: {
          flowId: `flow-${Date.now()}`,
          name: name || 'Untitled Template',
          description: '',
          steps: [],
          milestones: [],
          assigneePlaceholders: [],
        },
        past: [],
        future: [],
        canUndo: false,
        canRedo: false,
      });
    },

    addStep: (afterIndex, stepType) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const newStep = createDefaultStep(stepType);

      // Auto-name GOTO_DESTINATION with next available letter
      if (stepType === 'GOTO_DESTINATION') {
        const existingCount = workflow.steps.filter(s => s.type === 'GOTO_DESTINATION').length;
        const letter = String.fromCharCode(65 + existingCount); // A, B, C...
        newStep.config.name = `Point ${letter}`;
      }

      const steps = [...workflow.steps];
      steps.splice(afterIndex, 0, newStep);

      set({ workflow: { ...workflow, steps } });
    },

    removeStep: (stepId) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const steps = workflow.steps.filter((s) => s.stepId !== stepId);
      set({ workflow: { ...workflow, steps } });
    },

    updateStep: (stepId, updates) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

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

      pushHistory();

      const steps = [...workflow.steps];
      const currentIndex = steps.findIndex((s) => s.stepId === stepId);
      if (currentIndex === -1 || currentIndex === newIndex) return;

      const [step] = steps.splice(currentIndex, 1);
      steps.splice(newIndex, 0, step);
      set({ workflow: { ...workflow, steps } });
    },

    duplicateStep: (stepId) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const index = workflow.steps.findIndex((s) => s.stepId === stepId);
      if (index === -1) return;

      const original = workflow.steps[index];
      const duplicate: Step = {
        ...JSON.parse(JSON.stringify(original)),
        stepId: generateStepId(),
      };
      // Append " (copy)" to the name
      if (duplicate.config.name) {
        duplicate.config.name = `${duplicate.config.name} (copy)`;
      }

      const steps = [...workflow.steps];
      steps.splice(index + 1, 0, duplicate);
      set({ workflow: { ...workflow, steps } });
    },

    addAssigneePlaceholder: (roleName, description) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

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

      pushHistory();

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

      pushHistory();

      set({ workflow: { ...workflow, ...updates } });
    },

    updateNotificationSettings: (notifications) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      set({
        workflow: {
          ...workflow,
          settings: {
            ...(workflow.settings || {}),
            notifications: notifications as Flow['settings'] extends { notifications?: infer N } ? N : never,
          },
        },
      });
    },

    updateKickoffConfig: (kickoff) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const defaultKickoff: KickoffConfig = {
        defaultStartMode: 'MANUAL_EXECUTE',
        supportedStartModes: ['MANUAL_EXECUTE'],
        flowVariables: [],
      };

      set({
        workflow: {
          ...workflow,
          kickoff: { ...defaultKickoff, ...(workflow.kickoff || {}), ...kickoff },
        },
      });
    },

    updateFlowSettings: (settings) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      set({
        workflow: {
          ...workflow,
          settings: { ...(workflow.settings || {}), ...settings },
        },
      });
    },

    updateFlowPermissions: (permissions) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const defaultPerms: FlowPermissions = {
        execute: { type: 'ALL_MEMBERS' },
        edit: { type: 'ADMINS_ONLY' },
        coordinate: { type: 'ALL_MEMBERS' },
      };

      set({
        workflow: {
          ...workflow,
          permissions: { ...defaultPerms, ...(workflow.permissions || {}), ...permissions },
        },
      });
    },

    updateFlowDueDates: (dueDates) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      set({
        workflow: {
          ...workflow,
          dueDates,
        },
      });
    },

    addMilestone: (afterStepIndex, name) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      const afterStepId = afterStepIndex >= 0 && afterStepIndex < workflow.steps.length
        ? workflow.steps[afterStepIndex].stepId
        : '';

      const milestone = {
        milestoneId: `milestone-${Date.now()}-${++stepCounter}`,
        name: name || 'New Phase',
        afterStepId,
      };

      set({
        workflow: {
          ...workflow,
          milestones: [...(workflow.milestones || []), milestone],
        },
      });
    },

    removeMilestone: (milestoneId) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      set({
        workflow: {
          ...workflow,
          milestones: (workflow.milestones || []).filter(m => m.milestoneId !== milestoneId),
        },
      });
    },

    updateMilestone: (milestoneId, name) => {
      const { workflow } = get();
      if (!workflow) return;

      pushHistory();

      set({
        workflow: {
          ...workflow,
          milestones: (workflow.milestones || []).map(m =>
            m.milestoneId === milestoneId ? { ...m, name } : m
          ),
        },
      });
    },

    undo: () => {
      const { past, workflow } = get();
      if (past.length === 0 || !workflow) return;

      const newPast = [...past];
      const previous = newPast.pop()!;
      const { future } = get();
      const newFuture = [deepClone(workflow), ...future];

      set({
        past: newPast,
        future: newFuture,
        workflow: previous,
        canUndo: newPast.length > 0,
        canRedo: true,
      });
    },

    redo: () => {
      const { future, workflow } = get();
      if (future.length === 0 || !workflow) return;

      const newFuture = [...future];
      const next = newFuture.shift()!;
      const { past } = get();
      const newPast = [...past, deepClone(workflow)];

      set({
        past: newPast,
        future: newFuture,
        workflow: next,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
    },
  };
});
