import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { usePreviewStore } from '@/stores/previewStore';
import type { Flow, StepType } from '@/types';
import { STEP_TYPE_META } from '@/types';

type PreviewStatus = 'idle' | 'thinking' | 'building' | 'complete' | 'error';

interface FlowPreviewInlineProps {
  status: PreviewStatus;
  workflow: Flow | null;
  error: string | null;
  prompt: string;
  sessionId: string | null;
  onRetry?: () => void;
}

function StepTypeBadge({ type }: { type: StepType }) {
  const meta = STEP_TYPE_META[type];
  if (!meta) return null;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{
        backgroundColor: meta.color + '18',
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white animate-pulse">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function FlowPreviewInline({
  status,
  workflow,
  error,
  prompt,
  sessionId,
  onRetry,
}: FlowPreviewInlineProps) {
  const navigate = useNavigate();
  const setPreview = usePreviewStore((s) => s.setPreview);

  if (status === 'idle') return null;

  const handleCTA = () => {
    if (workflow) {
      setPreview(workflow, prompt, sessionId || undefined);
      navigate(`/login?returnTo=${encodeURIComponent('/templates/new?fromPreview=true')}`);
    }
  };

  return (
    <div className="mt-10 max-w-2xl mx-auto">
      {/* Thinking state */}
      {(status === 'thinking' || status === 'building') && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 text-violet-700 text-sm font-medium">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {status === 'thinking'
              ? 'AI is designing your workflow...'
              : 'Building your workflow...'}
          </div>
        </div>
      )}

      {/* Skeleton loading cards */}
      {(status === 'thinking' || status === 'building') && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="text-center p-6 rounded-2xl border border-red-100 bg-red-50">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-600 mb-4">
            {error || 'Something went wrong. Please try again.'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Complete state with step list */}
      {status === 'complete' && workflow && (
        <div>
          {/* Workflow name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            {workflow.name}
          </h3>

          {/* Steps list */}
          <div className="space-y-2">
            {workflow.steps.map((step, index) => {
              const assignee = step.config.assignee;
              return (
                <div
                  key={step.stepId}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:border-violet-100 transition-colors"
                >
                  {/* Step number */}
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {step.config.name}
                    </p>
                    {assignee && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {assignee}
                      </p>
                    )}
                  </div>

                  {/* Type badge */}
                  <StepTypeBadge type={step.type} />
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
            >
              Sign up to customize this workflow
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
