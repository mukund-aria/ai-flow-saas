/**
 * Flow Completion Summary
 *
 * Displays an AI-generated executive summary when a flow run completes.
 * Lazy-fetches the summary on mount and shows it in a clean card.
 */

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { getFlowRunSummary, type FlowRunSummary } from '@/lib/api';

interface FlowCompletionSummaryProps {
  runId: string;
}

export function FlowCompletionSummary({ runId }: FlowCompletionSummaryProps) {
  const [summary, setSummary] = useState<FlowRunSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      try {
        const data = await getFlowRunSummary(runId);
        if (!cancelled) {
          setSummary(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load summary');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [runId]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-5 mt-6">
        <div className="flex items-center gap-2 text-violet-600">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Generating completion summary...</span>
        </div>
      </div>
    );
  }

  if (error || !summary) return null;

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-5 mt-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
        </div>
        <h3 className="text-sm font-semibold text-violet-900">AI Summary</h3>
      </div>

      {/* Summary text */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {summary.summary}
      </p>

      {/* Key decisions */}
      {summary.keyDecisions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Key Outcomes
          </p>
          <ul className="space-y-1.5">
            {summary.keyDecisions.map((decision, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>{decision}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Collapsible timeline */}
      {summary.timeline.length > 0 && (
        <div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            {showTimeline ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Step Timeline ({summary.timeline.length} steps)
          </button>

          {showTimeline && (
            <div className="mt-2 space-y-1 pl-1">
              {summary.timeline.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-1 text-xs text-gray-600">
                  <span className="w-5 text-center font-medium text-gray-400">{i + 1}</span>
                  <span className="flex-1 truncate">{entry.step}</span>
                  <span className="text-gray-400 shrink-0">{entry.outcome}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
