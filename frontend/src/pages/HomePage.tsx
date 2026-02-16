/**
 * Home Page — Clean Dashboard
 *
 * Sections:
 * 1. AI Prompt Area (simplified)
 * 2. Attention Needed (rich status badges)
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
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listFlows } from '@/lib/api';
import type { Flow } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboardingStore';

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
// Setup Steps (horizontal tracker)
// ---------------------------------------------------------------------------

const SETUP_STEPS = [
  { key: 'buildTemplate' as const, label: 'Build', description: 'Build a template', path: '/templates/new' },
  { key: 'publishTemplate' as const, label: 'Publish', description: 'Publish your template', path: '/templates' },
  { key: 'startFlow' as const, label: 'Execute', description: 'Start your first flow', path: '/flows' },
  { key: 'completeAction' as const, label: 'Action', description: 'Complete an action', path: '/flows/latest' },
  { key: 'coordinateFlows' as const, label: 'Coordinate', description: 'Coordinate your flows', path: '/flows' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();
  const onboarding = useOnboardingStore();

  const [runs, setRuns] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    listFlows()
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
      navigate('/templates/new', { state: { prompt: prompt.trim() } });
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
            0. Horizontal Setup Tracker
        ============================================================== */}
        {(() => {
          const completedCount = SETUP_STEPS.filter((s) => onboarding[s.key]).length;
          if (completedCount >= SETUP_STEPS.length || onboarding.isChecklistDismissed) return null;

          return (
            <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm font-medium text-gray-900">
                  Getting Started &middot; {completedCount}/{SETUP_STEPS.length}
                </p>
                <a
                  href="https://www.youtube.com/watch?v=6q1m5HQMJiE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
                >
                  Watch intro video <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center justify-between">
                {SETUP_STEPS.map((step, idx) => {
                  const done = onboarding[step.key];
                  const isLast = idx === SETUP_STEPS.length - 1;

                  return (
                    <div key={step.key} className="contents">
                      {/* Step */}
                      <button
                        onClick={() => {
                          if (done) return;
                          if (step.key === 'completeAction' && inProgressRuns.length > 0) {
                            navigate(`/flows/${inProgressRuns[0].id}`);
                          } else {
                            navigate(step.path);
                          }
                        }}
                        className={`flex flex-col items-center text-center group flex-1 rounded-lg py-3 transition-colors ${
                          done ? '' : 'hover:bg-violet-50 cursor-pointer'
                        }`}
                        disabled={done}
                      >
                        {/* Circle */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            done
                              ? 'bg-green-100'
                              : 'bg-gray-100 group-hover:bg-violet-100 group-hover:ring-2 group-hover:ring-violet-200'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400 group-hover:text-violet-600">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className={`text-xs font-semibold mt-2 ${
                            done ? 'text-gray-400' : 'text-gray-800 group-hover:text-violet-700'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className={`text-[11px] mt-0.5 whitespace-nowrap ${done ? 'text-gray-300' : 'text-gray-400'}`}>
                          {step.description}
                        </span>
                      </button>

                      {/* Arrow connector */}
                      {!isLast && (
                        <div className="flex-shrink-0 px-1">
                          <ArrowRight className={`w-4 h-4 ${done ? 'text-green-300' : 'text-gray-300'}`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ==============================================================
            1. AI Prompt Area
        ============================================================== */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-5">
            What process can we help you run today?
          </h2>

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
                  Generate template
                </Button>
              </div>

              {/* Collapsible suggestions */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPrompt(s)}
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
            2. Attention Needed
        ============================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-semibold text-gray-900">Attention Needed</h2>
              {inProgressRuns.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                  {inProgressRuns.length}
                </span>
              )}
            </div>
            <Link
              to="/flows"
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
                    onClick={() => navigate(`/flows/${run.id}`)}
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
