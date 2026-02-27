/**
 * Activity Section
 *
 * Collapsible section showing chronological events for the flow run.
 * Fetches activity data lazily on first expand.
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface ActivitySectionProps {
  token: string;
}

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

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivitySection({ token }: ActivitySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const handleToggle = async () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);

    if (willExpand && !hasFetched) {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/public/task/${token}/activity`);
        const data = await res.json();
        if (data.success) {
          setEvents(data.data || []);
        }
      } catch {
        // Silently fail - activity is non-critical
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="font-medium">Activity</span>
      </button>

      {isExpanded && (
        <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Loading activity...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {events.map(event => (
                <div key={event.id} className="px-4 py-3 flex items-start gap-3">
                  <Clock className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
