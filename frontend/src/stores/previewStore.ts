import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flow } from '@/types';

interface PreviewStore {
  previewWorkflow: Flow | null;
  previewPrompt: string | null;
  previewSessionId: string | null;
  previewTimestamp: number | null;
  sandboxFlowId: string | null;

  setPreview: (workflow: Flow, prompt: string, sessionId?: string) => void;
  setSandboxFlowId: (id: string) => void;
  clearPreview: () => void;
}

export const usePreviewStore = create<PreviewStore>()(
  persist(
    (set) => ({
      previewWorkflow: null,
      previewPrompt: null,
      previewSessionId: null,
      previewTimestamp: null,
      sandboxFlowId: null,

      setPreview: (workflow, prompt, sessionId) =>
        set({
          previewWorkflow: workflow,
          previewPrompt: prompt,
          previewSessionId: sessionId || null,
          previewTimestamp: Date.now(),
        }),

      setSandboxFlowId: (id) =>
        set({ sandboxFlowId: id }),

      clearPreview: () =>
        set({
          previewWorkflow: null,
          previewPrompt: null,
          previewSessionId: null,
          previewTimestamp: null,
          sandboxFlowId: null,
        }),
    }),
    {
      name: 'serviceflow-preview',
    }
  )
);
