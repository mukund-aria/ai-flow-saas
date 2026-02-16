/**
 * usePreviewChat Hook
 *
 * Simplified version of useChat for the public preview page.
 * No plan approval, no file upload, no clarification handling.
 * Uses streamPublicMessage instead of streamMessage.
 */

import { useState, useCallback } from 'react';
import { streamPublicMessage } from '@/lib/api';
import type { Flow } from '@/types';

type PreviewStatus = 'idle' | 'thinking' | 'building' | 'complete' | 'error';

interface UsePreviewChatReturn {
  status: PreviewStatus;
  workflow: Flow | null;
  error: string | null;
  sessionId: string | null;
  sendPrompt: (prompt: string) => Promise<void>;
}

export function usePreviewChat(): UsePreviewChatReturn {
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [workflow, setWorkflow] = useState<Flow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setStatus('thinking');
    setError(null);
    setWorkflow(null);

    try {
      const stream = streamPublicMessage({
        message: prompt,
        sessionId: sessionId || undefined,
      });

      for await (const event of stream) {
        switch (event.type) {
          case 'session': {
            const data = event.data as { sessionId: string };
            setSessionId(data.sessionId);
            break;
          }

          case 'thinking': {
            setStatus('thinking');
            break;
          }

          case 'mode': {
            const data = event.data as { mode: string };
            if (data.mode === 'create' || data.mode === 'edit') {
              setStatus('building');
            }
            break;
          }

          case 'workflow': {
            const data = event.data as { workflow: Flow };
            setWorkflow(data.workflow);
            setStatus('complete');
            break;
          }

          case 'error': {
            const data = event.data as { message: string };
            setError(data.message);
            setStatus('error');
            break;
          }

          case 'clarify':
          case 'reject':
          case 'respond': {
            // For preview, these are unexpected — show as error
            setError('Could not generate a workflow. Please try a different prompt.');
            setStatus('error');
            break;
          }

          case 'done': {
            const data = event.data as { success: boolean };
            if (!data.success && !workflow) {
              setStatus('error');
              if (!error) {
                setError('Something went wrong. Please try again.');
              }
            }
            break;
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate workflow.';
      setError(message);
      setStatus('error');
    }
  }, [sessionId, workflow, error]);

  return {
    status,
    workflow,
    error,
    sessionId,
    sendPrompt,
  };
}
