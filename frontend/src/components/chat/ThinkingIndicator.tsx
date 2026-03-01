import { useState } from 'react';
import { Sparkles, Check, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ThinkingStepInfo } from '@/types';

interface ThinkingIndicatorProps {
  /** While actively thinking: live steps from the store */
  steps?: ThinkingStepInfo[];
  /** Collapsed mode: show "Thought for Xs" on a completed message */
  collapsed?: boolean;
  /** Duration in seconds (for collapsed header) */
  duration?: number;
}

export function ThinkingIndicator({ steps = [], collapsed = false, duration }: ThinkingIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  // Nothing to show if no steps
  if (steps.length === 0 && !collapsed) return null;

  // ---------- Collapsed mode (on completed messages) ----------
  if (collapsed) {
    const durationText = duration != null && duration > 0 ? `${duration}s` : '<1s';

    return (
      <div className="mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thought for {durationText}</span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </button>

        {expanded && steps.length > 0 && (
          <div className="mt-1.5 ml-1 border-l-2 border-violet-100 pl-3 space-y-1">
            {steps.map((step) => (
              <div key={step.step} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-500">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- Active mode (while thinking) ----------
  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Progressive step list */}
      <div className="flex-1 max-w-sm">
        <div className="ml-1 border-l-2 border-violet-200 pl-3 space-y-1.5 py-1">
          {steps.map((step, idx) => (
            <div
              key={step.step}
              className={cn(
                'flex items-center gap-2 animate-in fade-in duration-300',
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {step.done ? (
                <Check className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              ) : (
                <Loader2 className="w-3.5 h-3.5 text-violet-500 animate-spin shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm',
                  step.done
                    ? 'text-gray-500'
                    : 'text-violet-600 font-medium'
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
