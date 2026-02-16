import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Flow } from '@/types';

interface PreviewStore {
  previewWorkflow: Flow | null;
  previewPrompt: string | null;
  previewSessionId: string | null;
  previewTimestamp: number | null;

  setPreview: (workflow: Flow, prompt: string, sessionId?: string) => void;
  clearPreview: () => void;
}

export const usePreviewStore = create<PreviewStore>()(
  persist(
    (set) => ({
      previewWorkflow: null,
      previewPrompt: null,
      previewSessionId: null,
      previewTimestamp: null,

      setPreview: (workflow, prompt, sessionId) =>
        set({
          previewWorkflow: workflow,
          previewPrompt: prompt,
          previewSessionId: sessionId || null,
          previewTimestamp: Date.now(),
        }),

      clearPreview: () =>
        set({
          previewWorkflow: null,
          previewPrompt: null,
          previewSessionId: null,
          previewTimestamp: null,
        }),
    }),
    {
      name: 'ai-flow-preview',
    }
  )
);
