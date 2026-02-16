/**
 * Home Page — Moxo-style Dashboard
 *
 * Modular dashboard with 5 sections:
 * 1. Getting Started Banner (dismissible)
 * 2. AI Prompt Area
 * 3. Needs Attention
 * 4. Recent Activity
 * 5. Usage Analytics
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  PlayCircle,
  Loader2,
  ChevronRight,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listFlowRuns } from '@/lib/api';
import type { FlowRun } from '@/lib/api';
import { useOnboardingStore } from '@/stores/onboardingStore';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_CATEGORIES = ['Finance', 'HR', 'Legal', 'Operations'] as const;

const TEMPLATE_CHIPS: Record<string, string[]> = {
  Finance: ['Invoice Approval', 'Expense Report', 'Budget Review'],
  HR: ['Employee Onboarding', 'Leave Request', 'Performance Review'],
  Legal: ['Contract Review', 'NDA Signing', 'Compliance Audit'],
  Operations: ['Vendor Onboarding', 'Change Request', 'Incident Report'],
};

const ONBOARDING_ITEMS = [
  { key: 'buildFlow' as const, label: 'Build a flow', link: '/flows/new' },
  { key: 'publishFlow' as const, label: 'Publish a flow', link: '/flows' },
  { key: 'runFlow' as const, label: 'Run a flow', link: '/runs' },
  { key: 'viewRun' as const, label: 'View a flow run', link: '/runs' },
  { key: 'inviteContact' as const, label: 'Invite a contact', link: '/contacts' },
];

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function HomePage() {
  const navigate = useNavigate();

  // Data
  const [runs, setRuns] = useState<FlowRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // AI prompt
  const [prompt, setPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(TEMPLATE_CATEGORIES[0]);

  // Onboarding
  const onboarding = useOnboardingStore();

  // Fetch data on mount
  useEffect(() => {
    listFlowRuns()
      .then((runData) => setRuns(runData))
      .catch(() => {
        // Silently handle — sections show empty states
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Derived data
  const inProgressRuns = runs.filter((r) => r.status === 'IN_PROGRESS');

  const needsAttentionRuns = inProgressRuns.slice(0, 5);

  // Recent activity: merge started + completed events, sorted by date desc
  const recentActivity = runs
    .flatMap((run) => {
      const events: { type: 'started' | 'completed'; run: FlowRun; date: string }[] = [
        { type: 'started', run, date: run.startedAt },
      ];
      if (run.completedAt) {
        events.push({ type: 'completed', run, date: run.completedAt });
      }
      return events;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Onboarding progress
  const completedCount = ONBOARDING_ITEMS.filter((item) => onboarding[item.key]).length;
  const showOnboarding = completedCount < 5 && !onboarding.isChecklistDismissed;

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/flows/new', { state: { prompt: prompt.trim() } });
    }
  };

  const handleChipClick = (chipText: string) => {
    navigate('/flows/new', { state: { prompt: `Create a ${chipText} workflow` } });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ================================================================
            1. Getting Started Banner
        ================================================================ */}
        {showOnboarding && (
          <div className="relative bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-xl p-6">
            <button
              onClick={() => onboarding.dismissChecklist()}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: Video callout */}
              <div className="flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 mb-3">
                  <Video className="w-3.5 h-3.5" />
                  5-min Video
                </span>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Getting Started with AI Flow
                </h2>
                <Link
                  to="#"
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
                >
                  Watch how it works <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Right: Checklist */}
              <div className="flex-1 min-w-0">
                {/* Progress bar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${(completedCount / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    {completedCount}/5
                  </span>
                </div>

                {/* Checklist items */}
                <div className="space-y-2">
                  {ONBOARDING_ITEMS.map((item) => {
                    const done = onboarding[item.key];
                    return (
                      <Link
                        key={item.key}
                        to={item.link}
                        className="flex items-center gap-3 py-1.5 group"
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            done
                              ? 'text-gray-400 line-through'
                              : 'text-gray-700 group-hover:text-violet-600'
                          }`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            2. AI Prompt Area
        ================================================================ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              What process can we help you run today?
            </h1>
            <p className="text-gray-500 text-sm">
              Describe your workflow and our AI will design it for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your process..."
                rows={3}
                className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={!prompt.trim()}
                size="sm"
                className="absolute right-3 bottom-3 bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Generate flow
              </Button>
            </div>
          </form>

          {/* Template row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Or start with a template for:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {TEMPLATE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {TEMPLATE_CHIPS[selectedCategory]?.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================
            3. Needs Attention
        ================================================================ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Needs Attention</h2>
              {inProgressRuns.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {inProgressRuns.length}
                </span>
              )}
            </div>
            <Link
              to="/runs"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {needsAttentionRuns.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No items need your attention right now.
            </p>
          ) : (
            <div className="space-y-3">
              {needsAttentionRuns.map((run) => {
                const progress =
                  run.totalSteps > 0
                    ? Math.round((run.currentStepIndex / run.totalSteps) * 100)
                    : 0;
                return (
                  <button
                    key={run.id}
                    onClick={() => navigate(`/runs/${run.id}`)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <PlayCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">
                        {run.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {run.flow?.name || 'Flow'}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                      <div className="w-24">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5 text-right">
                          Step {run.currentStepIndex}/{run.totalSteps}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 whitespace-nowrap">
                        In Progress
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatTimeAgo(run.startedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ================================================================
            4. Recent Activity
        ================================================================ */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <Link
              to="/runs"
              className="text-sm text-violet-600 hover:text-violet-700 font-medium inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No recent activity yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((event, idx) => (
                <div
                  key={`${event.run.id}-${event.type}-${idx}`}
                  className="flex items-center gap-3 py-2"
                >
                  {event.type === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-700">
                      {event.type === 'completed' ? 'Completed' : 'Started'}{' '}
                      <span className="font-medium text-gray-900">{event.run.name}</span>
                    </span>
                    <div className="text-xs text-gray-400">{event.run.flow?.name || 'Flow'}</div>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimeAgo(event.date)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
