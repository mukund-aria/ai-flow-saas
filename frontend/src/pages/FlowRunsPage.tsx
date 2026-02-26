/**
 * Flow Runs Page
 *
 * Lists all active and completed workflow instances.
 * Shows progress, status, tracking badges, and allows filtering.
 * Supports "Attention Needed" and "Where I'm Involved" filter modes.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  PlayCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  XCircle,
} from 'lucide-react';
import { listFlows, getAttentionItems, type Flow, type AttentionItem, type TrackingStatus } from '@/lib/api';

function getStatusIcon(status: Flow['status']) {
  switch (status) {
    case 'IN_PROGRESS':
      return <PlayCircle className="w-4 h-4 text-blue-500" />;
    case 'COMPLETED':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'PAUSED':
      return <Clock className="w-4 h-4 text-amber-500" />;
    case 'CANCELLED':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
}

function getStatusBadge(status: Flow['status']) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full';

  switch (status) {
    case 'IN_PROGRESS':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          {getStatusIcon(status)}
          In Progress
        </span>
      );
    case 'COMPLETED':
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          {getStatusIcon(status)}
          Completed
        </span>
      );
    case 'PAUSED':
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          {getStatusIcon(status)}
          Paused
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`${baseClasses} bg-red-100 text-red-700`}>
          {getStatusIcon(status)}
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          {status}
        </span>
      );
  }
}

function getTrackingBadge(status: TrackingStatus) {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full';
  switch (status) {
    case 'ON_TRACK':
      return <span className={`${baseClasses} bg-green-50 text-green-700`}>On Track</span>;
    case 'AT_RISK':
      return <span className={`${baseClasses} bg-amber-50 text-amber-700`}>At Risk</span>;
    case 'OFF_TRACK':
      return <span className={`${baseClasses} bg-red-50 text-red-700`}>Off Track</span>;
  }
}

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

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function FlowRunsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [runs, setRuns] = useState<Flow[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Read initial filter from URL search params
  const filterParam = searchParams.get('filter');
  const [statusFilter, setStatusFilter] = useState<string>(
    filterParam === 'attention' ? 'ATTENTION' : filterParam === 'involved' ? 'INVOLVED' : 'all'
  );

  // Build attention run IDs lookup for tracking status
  const attentionRunIds = new Set(attentionItems.map((a) => a.flowRun.id));
  const attentionByRunId = new Map(attentionItems.map((a) => [a.flowRun.id, a]));

  // Fetch flows and attention data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [flowData, attention] = await Promise.all([
          listFlows(),
          getAttentionItems().catch(() => [] as AttentionItem[]),
        ]);
        setRuns(flowData);
        setAttentionItems(attention);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flows');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Update URL when filter changes
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    if (newFilter === 'ATTENTION') {
      setSearchParams({ filter: 'attention' });
    } else if (newFilter === 'INVOLVED') {
      setSearchParams({ filter: 'involved' });
    } else if (newFilter !== 'all') {
      setSearchParams({ filter: newFilter });
    } else {
      setSearchParams({});
    }
  };

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (run.flow?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    let matchesStatus = true;
    if (statusFilter === 'ATTENTION') {
      matchesStatus = attentionRunIds.has(run.id);
    } else if (statusFilter === 'INVOLVED') {
      // "Where I'm Involved" — the attention API already scopes to involved runs
      // so we include attention runs plus all runs (the API returns involved runs)
      // For now, show attention items as a proxy for involvement
      matchesStatus = attentionRunIds.has(run.id);
    } else if (statusFilter !== 'all') {
      matchesStatus = run.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading flows...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading flows</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flows</h1>
        <p className="text-sm text-gray-500 mt-1">
          {runs.length} flow{runs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Status</option>
          <option value="ATTENTION">Attention Needed</option>
          <option value="INVOLVED">Where I'm Involved</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Run List */}
      {filteredRuns.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredRuns.map((run) => {
            const progressPercent = run.totalSteps > 0
              ? (run.currentStepIndex / run.totalSteps) * 100
              : 0;

            // Look up tracking status from attention data
            const attentionData = attentionByRunId.get(run.id);

            return (
              <div
                key={run.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/flows/${run.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{run.name}</h3>
                      <p className="text-sm text-gray-500">
                        {run.flow?.name || 'Unknown Template'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Tracking badge for in-progress runs */}
                    {run.status === 'IN_PROGRESS' && attentionData && (
                      getTrackingBadge(attentionData.trackingStatus)
                    )}

                    {/* Status Badge */}
                    {getStatusBadge(run.status)}

                    {/* Progress */}
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span className="font-medium">
                          {run.currentStepIndex}/{run.totalSteps}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            run.status === 'COMPLETED'
                              ? 'bg-green-500'
                              : run.status === 'CANCELLED'
                              ? 'bg-red-400'
                              : 'bg-violet-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Time */}
                    <span className="text-sm text-gray-400 w-24 text-right">
                      {formatTimeAgo(run.startedAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PlayCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'ATTENTION'
              ? 'No items need attention'
              : statusFilter === 'INVOLVED'
              ? 'No flows where you are involved'
              : 'No flows yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {statusFilter === 'ATTENTION'
              ? 'All your flows are on track. Check back later.'
              : statusFilter === 'INVOLVED'
              ? 'Start or get assigned to a flow to see it here.'
              : 'Flows are live instances of your workflow templates. Publish a template, then start a flow to see progress here.'}
          </p>
        </div>
      )}
    </div>
  );
}
