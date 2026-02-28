/**
 * Audit Timeline Component
 *
 * Collapsible section that displays the activity log for a flow run.
 * Lazy-fetches audit log entries on first expand.
 */

import { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  PlayCircle,
  CheckCircle2,
  Bell,
  UserPlus,
  Flag,
  XCircle,
  Activity,
} from 'lucide-react';
import { getFlowAuditLog, type AuditLogEntry } from '@/lib/api';
import { cn } from '@/lib/utils';

interface AuditTimelineProps {
  runId: string;
}

const ACTION_CONFIG: Record<string, { label: (details?: Record<string, any> | null) => string; icon: typeof PlayCircle; color: string }> = {
  RUN_STARTED: {
    label: () => 'started this flow',
    icon: PlayCircle,
    color: 'text-blue-500 bg-blue-100',
  },
  STEP_COMPLETED: {
    label: (details) => {
      const stepName = details?.stepName || (details?.stepIndex != null ? `Step ${details.stepIndex + 1}` : 'a step');
      return `completed ${stepName}`;
    },
    icon: CheckCircle2,
    color: 'text-green-500 bg-green-100',
  },
  REMINDER_SENT: {
    label: (details) => {
      const stepName = details?.stepName || (details?.stepIndex != null ? `Step ${details.stepIndex + 1}` : 'a step');
      return `sent reminder for ${stepName}`;
    },
    icon: Bell,
    color: 'text-amber-500 bg-amber-100',
  },
  STEP_REASSIGNED: {
    label: (details) => {
      const stepName = details?.stepName || (details?.stepIndex != null ? `Step ${details.stepIndex + 1}` : 'a step');
      return `reassigned ${stepName}`;
    },
    icon: UserPlus,
    color: 'text-violet-500 bg-violet-100',
  },
  FLOW_COMPLETED: {
    label: () => 'completed this flow',
    icon: Flag,
    color: 'text-green-600 bg-green-100',
  },
  RUN_CANCELLED: {
    label: () => 'cancelled this flow',
    icon: XCircle,
    color: 'text-red-500 bg-red-100',
  },
};

function formatRelativeTime(dateString: string): string {
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

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditTimeline({ runId }: AuditTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const handleToggle = useCallback(async () => {
    const willExpand = !expanded;
    setExpanded(willExpand);

    if (willExpand && !hasFetched) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getFlowAuditLog(runId);
        setEntries(data);
        setHasFetched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load activity log');
      } finally {
        setIsLoading(false);
      }
    }
  }, [expanded, hasFetched, runId]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          {hasFetched && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {entries.length}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t border-gray-100">
          {isLoading && (
            <div className="px-6 py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Loading activity log...</span>
            </div>
          )}

          {error && (
            <div className="px-6 py-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {!isLoading && !error && entries.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No activity recorded yet.
            </div>
          )}

          {!isLoading && !error && entries.length > 0 && (
            <div className="px-6 py-4 space-y-0">
              {entries.map((entry) => {
                const config = ACTION_CONFIG[entry.action] || {
                  label: () => entry.action.toLowerCase().replace(/_/g, ' '),
                  icon: Activity,
                  color: 'text-gray-500 bg-gray-100',
                };
                const Icon = config.icon;
                const [iconText, iconBg] = config.color.split(' ');

                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 py-2.5"
                  >
                    {/* Icon */}
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5', iconBg)}>
                      <Icon className={cn('w-3.5 h-3.5', iconText)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          {entry.actorName || entry.actorEmail || 'System'}
                        </span>
                        {' '}
                        {config.label(entry.details)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatRelativeTime(entry.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
