import { create } from 'zustand';
import type { Flow } from '@/types';

interface WorkflowStore {
  workflow: Flow | null;
  isLoading: boolean;

  setWorkflow: (workflow: Flow | null) => void;
  clearWorkflow: () => void;
  setLoading: (loading: boolean) => void;
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflow: null,
  isLoading: false,

  setWorkflow: (workflow) => set({ workflow, isLoading: false }),

  clearWorkflow: () => set({ workflow: null }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
