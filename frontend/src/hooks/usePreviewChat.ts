/**
 * usePreviewChat Hook
 *
 * Simplified version of useChat for the public preview page.
 * No plan approval, no file upload, no clarification handling.
 * Uses streamPublicMessage instead of streamMessage.
 *
 * Returns thinkingText (streamed LLM preamble) and thinkingStatus
 * for the split-panel UX (thinking left, workflow right).
 */

import { useState, useCallback, useRef } from 'react';
import { streamPublicMessage } from '@/lib/api';
import type { Flow } from '@/types';

export type PreviewStatus = 'idle' | 'thinking' | 'building' | 'complete' | 'error';

interface UsePreviewChatReturn {
  status: PreviewStatus;
  workflow: Flow | null;
  error: string | null;
  sessionId: string | null;
  thinkingText: string;
  thinkingStatus: string;
  sendPrompt: (prompt: string) => Promise<void>;
}

const TIMEOUT_MS = 90_000;

export function usePreviewChat(): UsePreviewChatReturn {
  const [status, setStatus] = useState<PreviewStatus>('idle');
  const [workflow, setWorkflow] = useState<Flow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [thinkingText, setThinkingText] = useState('');
  const [thinkingStatus, setThinkingStatus] = useState('');
  const timedOutRef = useRef(false);

  const sendPrompt = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    setStatus('thinking');
    setError(null);
    setWorkflow(null);
    setThinkingText('');
    setThinkingStatus('Analyzing your request...');
    timedOutRef.current = false;

    // Timeout — show error if generation takes too long
    const timeoutId = setTimeout(() => {
      timedOutRef.current = true;
      setError('Request timed out. Please try again with a simpler prompt.');
      setStatus('error');
    }, TIMEOUT_MS);

    // Track locally to avoid stale closure issues
    let gotWorkflow = false;
    let gotError = false;

    try {
      const stream = streamPublicMessage({
        message: prompt,
        sessionId: sessionId || undefined,
      });

      for await (const event of stream) {
        if (timedOutRef.current) break;

        switch (event.type) {
          case 'session': {
            const data = event.data as { sessionId: string };
            setSessionId(data.sessionId);
            break;
          }

          case 'thinking': {
            const data = event.data as { status: string };
            setThinkingStatus(data.status);
            if (data.status.includes('Designing') || data.status.includes('Adapting') || data.status.includes('Loading')) {
              setStatus('building');
            }
            break;
          }

          case 'content': {
            const data = event.data as { chunk: string };
            setThinkingText(prev => prev + data.chunk);
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
            gotWorkflow = true;
            setWorkflow(data.workflow);
            setStatus('complete');
            break;
          }

          case 'error': {
            const data = event.data as { message: string };
            gotError = true;
            setError(data.message);
            setStatus('error');
            break;
          }

          case 'clarify':
          case 'reject':
          case 'respond': {
            gotError = true;
            setError('Could not generate a workflow. Please try a different prompt.');
            setStatus('error');
            break;
          }

          case 'done': {
            const data = event.data as { success: boolean };
            if (!data.success && !gotWorkflow) {
              setStatus('error');
              if (!gotError) {
                setError('Something went wrong. Please try again.');
              }
            }
            break;
          }
        }
      }
    } catch (err) {
      if (timedOutRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to generate workflow.';
      setError(message);
      setStatus('error');
    } finally {
      clearTimeout(timeoutId);
    }
  }, [sessionId]);

  return {
    status,
    workflow,
    error,
    sessionId,
    thinkingText,
    thinkingStatus,
    sendPrompt,
  };
}
