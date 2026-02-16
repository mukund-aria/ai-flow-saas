/**
 * Home Page — Clean Dashboard
 *
 * Sections:
 * 1. AI Prompt Area (simplified)
 * 2. Needs Attention (rich status badges)
 * 3. Recent Activity (actor + event variety)
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertCircle,
  PlayCircle,
  ChevronRight,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listFlowRuns } from '@/lib/api';
import type { FlowRun } from '@/lib/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const SUGGESTIONS = [
  'Create a client onboarding workflow',
  'Build an approval process for invoices',
  'Design an employee offboarding flow',
];

// Distinct colors for flow icons based on index
const FLOW_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-600' },
  { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  { bg: 'bg-amber-100', text: 'text-amber-600' },
  { bg: 'bg-rose-100', text: 'text-rose-600' },
  { bg: 'bg-sky-100', text: 'text-sky-600' },
];

function getFlowColor(index: number) {
  return FLOW_COLORS[index % FLOW_COLORS.length];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();

  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    listFlowRuns()
      .then((data) => setRuns(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Derived data
  const inProgressRuns = runs.filter((r) => r.status === 'IN_PROGRESS');
  const needsAttentionRuns = inProgressRuns.slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/flows/new', { state: { prompt: prompt.trim() } });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* ==============================================================
            1. AI Prompt Area
        ============================================================== */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            What process can we help you run today?
          </h2>
          <p className="text-gray-500 text-sm mb-5">
            Describe what you need or pick a template to get started.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative bg-white border border-gray-200 rounded-xl p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your process..."
                rows={2}
                className="w-full text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
                  Show suggestions
                </button>
                <Button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-5"
                >
                  Generate flow
                </Button>
              </div>

              {/* Collapsible suggestions */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => navigate('/flows/new', { state: { prompt: s } })}
                      className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* ==============================================================
            2. Needs Attention
        ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-semibold text-gray-900">Needs Attention</h2>
              {inProgressRuns.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  {inProgressRuns.length}
                </span>
              )}
            </div>
            <Link
              to="/runs"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {needsAttentionRuns.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-400">No items need your attention right now.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
              {needsAttentionRuns.map((run, idx) => {
                const color = getFlowColor(idx);
                const progress =
                  run.totalSteps > 0
                    ? Math.round((run.currentStepIndex / run.totalSteps) * 100)
                    : 0;

                // Determine status badge
                const startedDate = new Date(run.startedAt);
                const daysSinceStart = Math.floor(
                  (Date.now() - startedDate.getTime()) / (1000 * 60 * 60 * 24)
                );
                const isOverdue = daysSinceStart > 3;

                return (
                  <button
                    key={run.id}
                    onClick={() => navigate(`/runs/${run.id}`)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* Flow icon */}
                    <div className={`w-10 h-10 rounded-lg ${color.bg} flex items-center justify-center flex-shrink-0`}>
                      <PlayCircle className={`w-5 h-5 ${color.text}`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {run.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {run.flow?.name || 'Flow'}
                      </div>
                    </div>

                    {/* Step progress */}
                    <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-600">
                          {run.currentStepIndex}/{run.totalSteps}
                        </span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${isOverdue ? 'bg-red-400' : 'bg-violet-400'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status badge */}
                      {isOverdue ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
                          Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 whitespace-nowrap">
                          Your turn
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <span className="text-xs text-gray-400 flex-shrink-0 w-16 text-right">
                      {formatTimeAgo(run.startedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
