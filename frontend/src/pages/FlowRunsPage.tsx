/**
 * Flow Runs Page — Coordinator Command Center
 *
 * Features:
 * - 4 filter dropdowns: Flows, Templates, Statuses, Contacts
 * - "Needs Attention" toggle pill with count badge
 * - Attention Settings gear popover
 * - Enhanced row items with context badges, progress bars, kebab menus
 * - URL sync for deep linking
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlayCircle,
  Loader2,
  MoreVertical,
  AlertCircle,
} from 'lucide-react';
import {
  listFlows,
  getAttentionItems,
  listTemplates,
  listContacts,
  cancelFlow,
  type Flow,
  type AttentionItem,
  type Template,
  type Contact,
} from '@/lib/api';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { AttentionSettingsPopover } from '@/components/flows/AttentionSettingsPopover';
import { useAttentionSettings, filterByAttentionSettings } from '@/hooks/useAttentionSettings';

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
// Context Badge Helpers
// ---------------------------------------------------------------------------

function getContextBadges(
  run: Flow,
  attentionData: AttentionItem | undefined
) {
  const badges: React.ReactNode[] = [];
  const reasons = attentionData?.reasons.map((r) => r.type) || [];

  // Terminal states
  if (run.status === 'COMPLETED') {
    badges.push(
      <span key="completed" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
        Completed
      </span>
    );
    return badges;
  }
  if (run.status === 'CANCELLED') {
    badges.push(
      <span key="cancelled" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">
        Cancelled
      </span>
    );
    return badges;
  }

  // Attention-based badges (can stack)
  if (reasons.includes('YOUR_TURN')) {
    badges.push(
      <span key="your-turn" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
        Your turn
      </span>
    );
  } else if (run.currentStepAssignee) {
    // Not your turn — show who it's waiting for
    badges.push(
      <span key="waiting" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-300 text-gray-600 bg-white">
        Waiting for: {run.currentStepAssignee.name}
      </span>
    );
  }

  if (reasons.includes('STEP_OVERDUE')) {
    badges.push(
      <span key="action-overdue" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700">
        Action overdue
      </span>
    );
  }
  if (reasons.includes('FLOW_OVERDUE')) {
    badges.push(
      <span key="overdue" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">
        Overdue
      </span>
    );
  }
  if (reasons.includes('ESCALATED')) {
    badges.push(
      <span key="escalated" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700">
        Escalated
      </span>
    );
  }
  if (reasons.includes('STALLED')) {
    badges.push(
      <span key="stalled" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700">
        Stalled
      </span>
    );
  }
  if (reasons.includes('AUTOMATION_FAILED')) {
    badges.push(
      <span key="failed" className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 text-red-700">
        Failed
      </span>
    );
  }

  return badges;
}

// ---------------------------------------------------------------------------
// Kebab Menu
// ---------------------------------------------------------------------------

function KebabMenu({ run, onCancel }: { run: Flow; onCancel: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const navigate = useNavigate();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1 rounded hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[140px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              navigate(`/flows/${run.id}`);
            }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            View flow
          </button>
          {run.status === 'IN_PROGRESS' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onCancel(run.id);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Cancel flow
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FlowRunsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data
  const [runs, setRuns] = useState<Flow[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attention settings
  const { settings: attentionSettings, updateSetting, resetToDefaults } = useAttentionSettings();

  // Filter state — read from URL on mount
  const [flowFilter, setFlowFilter] = useState(searchParams.get('flow') || 'all');
  const [templateFilter, setTemplateFilter] = useState(searchParams.get('template') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [contactFilter, setContactFilter] = useState(searchParams.get('contact') || 'all');
  const [needsAttention, setNeedsAttention] = useState(
    searchParams.get('attention') === '1' || searchParams.get('filter') === 'attention'
  );

  // Lookup maps
  const attentionByRunId = new Map(attentionItems.map((a) => [a.flowRun.id, a]));
  const filteredAttention = filterByAttentionSettings(attentionItems, attentionSettings);
  const filteredAttentionRunIds = new Set(filteredAttention.map((a) => a.flowRun.id));

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [flowData, attention, tmpl, cts] = await Promise.all([
          listFlows(),
          getAttentionItems().catch(() => [] as AttentionItem[]),
          listTemplates().catch(() => [] as Template[]),
          listContacts().catch(() => [] as Contact[]),
        ]);
        setRuns(flowData);
        setAttentionItems(attention);
        setTemplates(tmpl);
        setContactsList(cts);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flows');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sync filters to URL
  const syncURL = useCallback(
    (updates: Record<string, string | boolean>) => {
      const merged = {
        flow: flowFilter,
        template: templateFilter,
        status: statusFilter,
        contact: contactFilter,
        attention: needsAttention,
        ...updates,
      };

      const params: Record<string, string> = {};
      if (merged.flow !== 'all') params.flow = merged.flow as string;
      if (merged.template !== 'all') params.template = merged.template as string;
      if (merged.status !== 'all') params.status = merged.status as string;
      if (merged.contact !== 'all') params.contact = merged.contact as string;
      if (merged.attention) params.attention = '1';

      setSearchParams(params, { replace: true });
    },
    [flowFilter, templateFilter, statusFilter, contactFilter, needsAttention, setSearchParams]
  );

  const updateFilter = (key: string, value: string) => {
    switch (key) {
      case 'flow': setFlowFilter(value); break;
      case 'template': setTemplateFilter(value); break;
      case 'status': setStatusFilter(value); break;
      case 'contact': setContactFilter(value); break;
    }
    syncURL({ [key]: value });
  };

  const toggleAttention = () => {
    const next = !needsAttention;
    setNeedsAttention(next);
    syncURL({ attention: next });
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelFlow(id);
      // Refresh data
      const [flowData, attention] = await Promise.all([
        listFlows(),
        getAttentionItems().catch(() => [] as AttentionItem[]),
      ]);
      setRuns(flowData);
      setAttentionItems(attention);
    } catch {
      // ignore
    }
  };

  // Build filter options
  const flowFilterOptions = [
    { value: 'involved', label: 'Where I\'m Involved' },
  ];

  const templateFilterOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const statusFilterOptions = [
    { value: 'YOUR_TURN', label: 'Your Turn' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const contactFilterOptions = contactsList.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // Apply all filters (AND together)
  const filteredRuns = runs.filter((run) => {
    // Flow filter
    if (flowFilter === 'involved') {
      if (!filteredAttentionRunIds.has(run.id)) return false;
    }

    // Template filter
    if (templateFilter !== 'all') {
      if (run.flow?.id !== templateFilter && (run as any).flowId !== templateFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'YOUR_TURN') {
        const attn = attentionByRunId.get(run.id);
        if (!attn || !attn.reasons.some((r) => r.type === 'YOUR_TURN')) return false;
      } else if (statusFilter === 'OVERDUE') {
        const attn = attentionByRunId.get(run.id);
        if (!attn || !attn.reasons.some((r) => r.type === 'STEP_OVERDUE' || r.type === 'FLOW_OVERDUE')) return false;
      } else {
        if (run.status !== statusFilter) return false;
      }
    }

    // Contact filter
    if (contactFilter !== 'all') {
      if (run.currentStepAssignee?.id !== contactFilter) return false;
    }

    // Needs attention toggle
    if (needsAttention) {
      if (!filteredAttentionRunIds.has(run.id)) return false;
    }

    return true;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Flows{' '}
            <span className="text-lg font-normal text-gray-400 ml-1">
              {runs.length}
            </span>
          </h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {/* Left: Filter dropdowns */}
        <FilterDropdown
          allLabel="All Flows"
          value={flowFilter}
          options={flowFilterOptions}
          onChange={(v) => updateFilter('flow', v)}
        />
        <FilterDropdown
          allLabel="All Templates"
          value={templateFilter}
          options={templateFilterOptions}
          onChange={(v) => updateFilter('template', v)}
          searchable
        />
        <FilterDropdown
          allLabel="All Statuses"
          value={statusFilter}
          options={statusFilterOptions}
          onChange={(v) => updateFilter('status', v)}
        />
        <FilterDropdown
          allLabel="All Contacts"
          value={contactFilter}
          options={contactFilterOptions}
          onChange={(v) => updateFilter('contact', v)}
          searchable
        />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right: Needs Attention toggle + Settings gear */}
        <button
          onClick={toggleAttention}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            needsAttention
              ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${needsAttention ? 'bg-red-500' : 'bg-gray-400'}`} />
          Needs Attention
          {filteredAttention.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[11px] font-semibold ${
              needsAttention ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-700'
            }`}>
              {filteredAttention.length}
            </span>
          )}
        </button>

        <AttentionSettingsPopover
          settings={attentionSettings}
          onUpdate={updateSetting}
          onReset={resetToDefaults}
        />
      </div>

      {/* Run List */}
      {filteredRuns.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredRuns.map((run) => {
            const attentionData = attentionByRunId.get(run.id);
            const hasAttention = filteredAttentionRunIds.has(run.id);
            const completedSteps = attentionData
              ? attentionData.completedSteps
              : run.status === 'COMPLETED'
              ? run.totalSteps
              : run.currentStepIndex;
            const progressPercent = run.totalSteps > 0
              ? (completedSteps / run.totalSteps) * 100
              : 0;

            const badges = getContextBadges(run, attentionData);

            return (
              <div
                key={run.id}
                className="px-4 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/flows/${run.id}`)}
              >
                <div className="flex items-center gap-4">
                  {/* Icon with notification dot */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    {hasAttention && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                    )}
                  </div>

                  {/* Name + Template */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {run.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {run.flow?.name || 'Unknown Template'}
                    </p>
                  </div>

                  {/* Context badges */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {badges}
                  </div>

                  {/* Progress */}
                  <div className="w-36 flex-shrink-0">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {run.status === 'IN_PROGRESS' ? 'In progress' : run.status === 'COMPLETED' ? 'Completed' : run.status === 'CANCELLED' ? 'Cancelled' : run.status}:
                      </span>
                      <span className="font-medium">
                        {completedSteps} of {run.totalSteps}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                  <span className="text-xs text-gray-400 flex-shrink-0 w-16 text-right">
                    {formatTimeAgo(run.startedAt)}
                  </span>

                  {/* Kebab menu */}
                  <KebabMenu run={run} onCancel={handleCancel} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            {needsAttention ? (
              <AlertCircle className="w-8 h-8 text-gray-400" />
            ) : (
              <PlayCircle className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {needsAttention
              ? 'No items need attention'
              : statusFilter !== 'all'
              ? 'No flows match this filter'
              : 'No flows yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {needsAttention
              ? 'All your flows are on track. Check back later.'
              : statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Flows are live instances of your workflow templates. Publish a template, then start a flow to see progress here.'}
          </p>
        </div>
      )}
    </div>
  );
}
