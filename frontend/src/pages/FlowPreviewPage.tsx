/**
 * Flow Preview Page
 *
 * Full-page animated preview of AI-generated workflow.
 * Shows the prompt, building animation, and "Edit This Flow" CTA.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AnimatedWorkflowPanel } from '@/components/preview/AnimatedWorkflowPanel';
import { PreviewCTA } from '@/components/preview/PreviewCTA';
import { usePreviewChat } from '@/hooks/usePreviewChat';

export function FlowPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const prompt = (location.state as { prompt?: string })?.prompt;
  const { status, workflow, error, sessionId, sendPrompt } = usePreviewChat();

  // Send prompt on mount
  useEffect(() => {
    if (prompt && status === 'idle') {
      sendPrompt(prompt);
    }
  }, [prompt, status, sendPrompt]);

  // Redirect if no prompt
  if (!prompt) {
    navigate('/', { replace: true });
    return null;
  }

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
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Try a different prompt
        </button>

        {/* User's prompt */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Your prompt</p>
          <p className="text-gray-900 font-medium">{prompt}</p>
        </div>

        {/* Status indicator */}
        {(status === 'thinking' || status === 'building') && (
          <div className="flex items-center gap-3 mb-6 px-1">
            <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
            <span className="text-sm font-medium text-violet-700">
              {status === 'thinking'
                ? 'Analyzing your request...'
                : 'Building your workflow...'}
            </span>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
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

        {/* Workflow Preview */}
        {workflow && (
          <AnimatedWorkflowPanel
            workflow={workflow}
            isBuilding={status === 'building'}
          />
        )}
      </div>

      {/* CTA bar (fixed at bottom) */}
      {status === 'complete' && workflow && (
        <PreviewCTA
          workflow={workflow}
          prompt={prompt}
          sessionId={sessionId || undefined}
        />
      )}
    </div>
  );
}
