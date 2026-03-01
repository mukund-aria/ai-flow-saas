/**
 * Template Preview Page
 *
 * Full-page animated preview of AI-generated workflow.
 * Split-panel UX: thinking/reasoning on the left, workflow building on the right.
 * After generation completes, auto-saves to sandbox and shows CTAs.
 */

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft, CheckCircle2, Brain } from 'lucide-react';
import { AnimatedWorkflowPanel } from '@/components/preview/AnimatedWorkflowPanel';
import { PreviewCTA } from '@/components/preview/PreviewCTA';
import { PostGenerationPanel } from '@/components/preview/PostGenerationPanel';
import { usePreviewChat } from '@/hooks/usePreviewChat';
import { saveSandboxFlow } from '@/lib/api';

export function TemplatePreviewPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const prompt = searchParams.get('prompt');
  const { status, workflow, error, sessionId, thinkingText, thinkingStatus, sendPrompt } = usePreviewChat();

  const [sandboxFlowId, setSandboxFlowId] = useState<string | null>(null);
  const savedRef = useRef(false);
  const thinkingEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll thinking text
  useEffect(() => {
    thinkingEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [thinkingText]);

  // Send prompt on mount
  useEffect(() => {
    if (prompt && status === 'idle') {
      sendPrompt(prompt);
    }
  }, [prompt, status, sendPrompt]);

  // Auto-save to sandbox when generation completes
  useEffect(() => {
    if (status !== 'complete' || !workflow || !prompt || savedRef.current) return;
    savedRef.current = true;

    const save = async () => {
      try {
        const result = await saveSandboxFlow({
          name: workflow.name || 'Untitled Flow',
          description: workflow.description,
          definition: workflow as unknown as Record<string, unknown>,
          prompt,
          sessionId: sessionId || undefined,
        });
        setSandboxFlowId(result.sandboxFlowId);
      } catch (err) {
        console.error('[Preview] Failed to save sandbox flow:', err);
      }
    };

    save();
  }, [status, workflow, prompt, sessionId]);

  // Redirect if no prompt
  if (!prompt) {
    navigate('/', { replace: true });
    return null;
  }

  const isActive = status === 'thinking' || status === 'building';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-gray-900">ServiceFlow</span>
            </Link>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Try a different prompt
        </button>

        {/* User's prompt */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Your prompt</p>
          <p className="text-gray-900 font-medium">{prompt}</p>
        </div>

        {/* Error state */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 max-w-2xl">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Could not generate workflow</span>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-3 text-sm text-red-700 underline hover:no-underline"
            >
              Try a different prompt
            </button>
          </div>
        )}

        {/* Split Panel Layout */}
        {status !== 'error' && status !== 'idle' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: AI Thinking */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[350px] lg:min-h-[500px]">
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                {isActive ? (
                  <>
                    <Brain className="w-4 h-4 text-violet-500 animate-pulse" />
                    <span className="text-sm font-medium text-violet-700">
                      {thinkingStatus || 'Analyzing your request...'}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-emerald-600">Analysis complete</span>
                  </>
                )}
              </div>

              {/* Streaming text */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {thinkingText ? (
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {thinkingText}
                    {isActive && (
                      <span className="inline-block w-1.5 h-4 bg-violet-500 ml-0.5 animate-pulse rounded-sm" />
                    )}
                    <div ref={thinkingEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                    {isActive && (
                      <>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">AI is analyzing your request...</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Workflow Preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[350px] lg:min-h-[500px]">
              {/* Header */}
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-gray-700">
                  {workflow ? workflow.name || 'Generated Workflow' : 'Workflow Preview'}
                </span>
              </div>

              {/* Workflow content */}
              <div className="flex-1 overflow-y-auto">
                {workflow ? (
                  <AnimatedWorkflowPanel
                    workflow={workflow}
                    isBuilding={status === 'building'}
                    hideControlFlow
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-300" />
                    <span className="text-sm">
                      {status === 'building' ? 'Building workflow...' : 'Waiting for AI...'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA bar (fixed at bottom) */}
      {status === 'complete' && workflow && (
        sandboxFlowId ? (
          <PostGenerationPanel
            workflow={workflow}
            prompt={prompt}
            sessionId={sessionId || undefined}
            sandboxFlowId={sandboxFlowId}
          />
        ) : (
          <PreviewCTA
            workflow={workflow}
            prompt={prompt}
            sessionId={sessionId || undefined}
          />
        )
      )}
    </div>
  );
}
