import { create } from 'zustand';
import type { Flow } from '@/types';

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
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
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
}));
