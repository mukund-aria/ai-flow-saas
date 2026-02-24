/**
 * Flow Run Detail Page
 *
 * Displays the detailed progress and status of a single flow run,
 * including milestones, step timeline, send reminder, and result data viewing.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  PlayCircle,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  Users,
  Settings,
  Calendar,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIcon } from '@/components/workflow/StepIcon';
import { getFlow, cancelFlow, getStepActToken, type Flow } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { FlowRunChatPanel } from '@/components/flow-chat/FlowRunChatPanel';
import { useFlowRunChatStore } from '@/stores/flowRunChatStore';
import type { StepType } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================================================
// Types
// ============================================================================

type StepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED' | 'WAITING_FOR_ASSIGNEE';

interface FlowRunStep {
  id: string;
  stepId: string;
  name: string;
  description?: string;
  type: StepType;
  status: StepStatus;
  assignee?: {
    id: string;
    name: string;
    type: 'user' | 'contact';
  };
  resultData?: Record<string, unknown>;
  completedAt?: string;
  startedAt?: string;
  dueAt?: string;
  reminderCount?: number;
  milestoneId?: string;
}

interface MilestoneGroup {
  id: string;
  name: string;
  steps: FlowRunStep[];
  isComplete: boolean;
  isActive: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusIcon(status: Flow['status']) {
  switch (status) {
    case 'IN_PROGRESS':
      return <PlayCircle className="w-5 h-5 text-blue-500" />;
    case 'COMPLETED':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'PAUSED':
      return <Clock className="w-5 h-5 text-amber-500" />;
    case 'CANCELLED':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
  }
}

function getStatusBadge(status: Flow['status']) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full';

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

function getStepStatusBadge(status: StepStatus) {
  const baseClasses = 'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full';

  switch (status) {
    case 'COMPLETED':
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          <PlayCircle className="w-3 h-3" />
          In Progress
        </span>
      );
    case 'WAITING_FOR_ASSIGNEE':
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700`}>
          <Clock className="w-3 h-3" />
          Waiting
        </span>
      );
    case 'PENDING':
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-500`}>
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'SKIPPED':
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-400`}>
          <XCircle className="w-3 h-3" />
          Skipped
        </span>
      );
    default:
      return null;
  }
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

// ============================================================================
// Result Data Viewer
// ============================================================================

function ResultDataViewer({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key]) => key !== '_meta');

  if (entries.length === 0) return null;

  return (
    <div className="mt-2 pl-12 space-y-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-start gap-2 text-sm">
          <span className="text-gray-400 font-medium min-w-[80px] capitalize">
            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:
          </span>
          <span className="text-gray-600">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FlowRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Flow | null>(null);
  const [steps, setSteps] = useState<FlowRunStep[]>([]);
  const [milestoneGroups, setMilestoneGroups] = useState<MilestoneGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [actingOnStep, setActingOnStep] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [collapsedMilestones, setCollapsedMilestones] = useState<Set<string>>(new Set());
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);

  // Track onboarding
  useEffect(() => {
    useOnboardingStore.getState().completeCompleteAction();
    useOnboardingStore.getState().completeCoordinateFlows();
  }, []);

  // Fetch flow run details
  useEffect(() => {
    async function fetchRun() {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await getFlow(id);
        setRun(data);

        // Map step executions to display steps using flow definition
        const definition = (data as any).flow?.definition as {
          steps?: Array<{ stepId: string; type: string; config?: { name?: string; description?: string } }>;
          milestones?: Array<{ milestoneId: string; name: string; afterStepIndex: number }>;
        } | undefined;
        const defSteps = definition?.steps || [];
        const defMilestones = definition?.milestones || [];

        const mappedSteps: FlowRunStep[] = (data.stepExecutions || []).map((se) => {
          const defStep = defSteps.find((d) => d.stepId === se.stepId);
          const assignee = se.assignedToUser
            ? { id: se.assignedToUser.id, name: se.assignedToUser.name, type: 'user' as const }
            : se.assignedToContact
            ? { id: se.assignedToContact.id, name: se.assignedToContact.name, type: 'contact' as const }
            : undefined;

          return {
            id: se.id,
            stepId: se.stepId,
            name: defStep?.config?.name || `Step ${se.stepIndex + 1}`,
            description: defStep?.config?.description,
            type: (defStep?.type || 'TODO') as StepType,
            status: se.status as StepStatus,
            assignee,
            resultData: se.resultData,
            completedAt: se.completedAt,
            startedAt: se.startedAt,
            dueAt: se.dueAt,
            reminderCount: se.reminderCount,
          };
        });

        setSteps(mappedSteps);

        // Group steps by milestones
        if (defMilestones.length > 0) {
          const groups: MilestoneGroup[] = [];
          let lastIndex = 0;

          defMilestones.forEach((m) => {
            const groupSteps = mappedSteps.filter(
              (_, i) => i >= lastIndex && i <= m.afterStepIndex
            );
            const isComplete = groupSteps.every(s => s.status === 'COMPLETED');
            const isActive = groupSteps.some(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING_FOR_ASSIGNEE');

            groups.push({
              id: m.milestoneId,
              name: m.name,
              steps: groupSteps,
              isComplete,
              isActive,
            });
            lastIndex = m.afterStepIndex + 1;
          });

          // Remaining steps after last milestone
          if (lastIndex < mappedSteps.length) {
            const remainingSteps = mappedSteps.slice(lastIndex);
            groups.push({
              id: 'remaining',
              name: 'Final Steps',
              steps: remainingSteps,
              isComplete: remainingSteps.every(s => s.status === 'COMPLETED'),
              isActive: remainingSteps.some(s => s.status === 'IN_PROGRESS' || s.status === 'WAITING_FOR_ASSIGNEE'),
            });
          }

          setMilestoneGroups(groups);
        } else {
          setMilestoneGroups([]);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flow');
      } finally {
        setIsLoading(false);
      }
    }
    fetchRun();
  }, [id]);

  // Handle cancel run
  const handleCancelRun = async () => {
    if (!run || !window.confirm('Are you sure you want to cancel this flow? This cannot be undone.')) {
      return;
    }

    try {
      setIsCancelling(true);
      const updated = await cancelFlow(run.id);
      setRun(updated);
      const updatedSteps = (updated.stepExecutions || []).map((se) => {
        const existing = steps.find(s => s.id === se.id);
        return {
          ...existing!,
          status: se.status as StepStatus,
        };
      });
      setSteps(updatedSteps);
    } catch (err) {
      console.error('Failed to cancel run:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle send reminder
  const handleSendReminder = async (step: FlowRunStep) => {
    if (!run) return;
    setSendingReminder(step.id);
    try {
      await fetch(`${API_BASE}/flows/${run.id}/steps/${step.stepId}/remind`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      // Update reminder count locally
      setSteps(prev => prev.map(s =>
        s.id === step.id ? { ...s, reminderCount: (s.reminderCount || 0) + 1 } : s
      ));
    } catch (err) {
      console.error('Failed to send reminder:', err);
    } finally {
      setSendingReminder(null);
    }
  };

  // Handle coordinator acting on a step - opens task view in new tab
  const handleActOnStep = async (step: FlowRunStep) => {
    if (!run) return;
    setActingOnStep(step.id);
    try {
      const token = await getStepActToken(run.id, step.stepId);
      window.open(`/task/${token}`, '_blank');
    } catch (err) {
      console.error('Failed to get action token:', err);
    } finally {
      setActingOnStep(null);
    }
  };

  // Toggle result data visibility
  const toggleResults = (stepId: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  // Toggle milestone collapse
  const toggleMilestone = (milestoneId: string) => {
    setCollapsedMilestones(prev => {
      const next = new Set(prev);
      if (next.has(milestoneId)) next.delete(milestoneId);
      else next.add(milestoneId);
      return next;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading flow...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !run) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/flows')}
            className="gap-2 text-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Flows
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading flow</p>
          <p className="text-sm mt-1">{error || 'Flow not found'}</p>
        </div>
      </div>
    );
  }

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Collect all unique assignees
  const assignees = steps
    .filter(s => s.assignee)
    .reduce<Map<string, { name: string; type: 'user' | 'contact' }>>((map, s) => {
      if (s.assignee && !map.has(s.assignee.id)) {
        map.set(s.assignee.id, { name: s.assignee.name, type: s.assignee.type });
      }
      return map;
    }, new Map());

  const renderStepRow = (step: FlowRunStep, index: number, isLast: boolean) => (
    <div
      key={step.id}
      className={cn(
        'px-6 py-4 transition-colors',
        step.status === 'IN_PROGRESS' && 'bg-blue-50/50'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Step Number & Timeline Connector */}
        <div className="relative flex flex-col items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step.status === 'COMPLETED' && 'bg-green-100 text-green-700',
              step.status === 'IN_PROGRESS' && 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 ring-offset-2',
              step.status === 'WAITING_FOR_ASSIGNEE' && 'bg-amber-100 text-amber-700',
              step.status === 'PENDING' && 'bg-gray-100 text-gray-500',
              step.status === 'SKIPPED' && 'bg-gray-100 text-gray-400'
            )}
          >
            {step.status === 'COMPLETED' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              index + 1
            )}
          </div>
          {!isLast && (
            <div
              className={cn(
                'absolute top-8 w-0.5 h-full',
                step.status === 'COMPLETED' ? 'bg-green-200' : 'bg-gray-200'
              )}
              style={{ height: 'calc(100% + 1rem)' }}
            />
          )}
        </div>

        {/* Step Type Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            step.status === 'COMPLETED' && 'bg-green-50',
            step.status === 'IN_PROGRESS' && 'bg-blue-100',
            step.status === 'WAITING_FOR_ASSIGNEE' && 'bg-amber-50',
            step.status === 'PENDING' && 'bg-gray-50',
            step.status === 'SKIPPED' && 'bg-gray-50'
          )}
        >
          <StepIcon
            type={step.type}
            className={cn(
              'w-5 h-5',
              step.status === 'COMPLETED' && 'text-green-600',
              step.status === 'IN_PROGRESS' && 'text-blue-600',
              step.status === 'WAITING_FOR_ASSIGNEE' && 'text-amber-600',
              step.status === 'PENDING' && 'text-gray-400',
              step.status === 'SKIPPED' && 'text-gray-300'
            )}
          />
        </div>

        {/* Step Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                'font-medium truncate',
                step.status === 'COMPLETED' && 'text-gray-900',
                step.status === 'IN_PROGRESS' && 'text-blue-900',
                step.status === 'WAITING_FOR_ASSIGNEE' && 'text-amber-900',
                step.status === 'PENDING' && 'text-gray-600',
                step.status === 'SKIPPED' && 'text-gray-400'
              )}
            >
              {step.name}
            </h3>
            {getStepStatusBadge(step.status)}
          </div>

          {/* Assignee */}
          {step.assignee && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span>{step.assignee.name}</span>
              {step.assignee.type === 'contact' && (
                <span className="text-xs text-gray-400">(external)</span>
              )}
            </div>
          )}
        </div>

        {/* Actions & Timestamp */}
        <div className="flex items-center gap-2">
          {/* Act button - coordinator can open the action-taking view */}
          {(step.status === 'IN_PROGRESS' || step.status === 'WAITING_FOR_ASSIGNEE') && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleActOnStep(step)}
              disabled={actingOnStep === step.id}
              className="gap-1.5 text-xs h-7 bg-violet-600 hover:bg-violet-700"
            >
              {actingOnStep === step.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
              Act
            </Button>
          )}

          {/* Send Reminder button - only for active steps with assignees */}
          {(step.status === 'IN_PROGRESS' || step.status === 'WAITING_FOR_ASSIGNEE') && step.assignee && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSendReminder(step)}
              disabled={sendingReminder === step.id}
              className="gap-1.5 text-xs h-7"
            >
              {sendingReminder === step.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Bell className="w-3 h-3" />
              )}
              Remind
              {step.reminderCount ? ` (${step.reminderCount})` : ''}
            </Button>
          )}

          {/* View result data */}
          {step.status === 'COMPLETED' && step.resultData && Object.keys(step.resultData).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleResults(step.id)}
              className="gap-1 text-xs h-7 text-gray-500"
            >
              <Eye className="w-3 h-3" />
              {expandedResults.has(step.id) ? 'Hide' : 'View'}
            </Button>
          )}

          {/* Timestamp */}
          <div className="text-right min-w-[100px]">
            {step.status === 'COMPLETED' && step.completedAt && (
              <div className="text-sm text-gray-500">
                <div className="font-medium text-gray-700">Completed</div>
                <div>{formatTimeAgo(step.completedAt)}</div>
              </div>
            )}
            {step.status === 'IN_PROGRESS' && step.startedAt && (
              <div className="text-sm text-blue-600">
                <div className="font-medium">In progress</div>
                <div className="text-blue-500">Started {formatTimeAgo(step.startedAt)}</div>
              </div>
            )}
            {step.status === 'PENDING' && (
              <div className="text-sm text-gray-400">
                Waiting
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded result data */}
      {expandedResults.has(step.id) && step.resultData && (
        <ResultDataViewer data={step.resultData} />
      )}
    </div>
  );

  return (
    <div className="p-6 relative">
      {/* Sample/Test Flow watermark */}
      {run.isSample && (
        <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-0 overflow-hidden">
          <span className="text-[120px] font-black text-gray-200/40 -rotate-12 select-none whitespace-nowrap">
            TEST FLOW
          </span>
        </div>
      )}

      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/flows')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Flows
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => useFlowRunChatStore.getState().toggle()}
            className="gap-2 text-gray-600"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsSidebar(!showSettingsSidebar)}
            className="gap-2 text-gray-600"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{run.name}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {run.flow?.name || 'Unknown Template'} &middot; Started {formatTimeAgo(run.startedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(run.status)}
                {run.status === 'IN_PROGRESS' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelRun}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Cancel Run'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Progress</span>
                <span className="text-gray-900 font-semibold">
                  {completedSteps} of {totalSteps} steps completed
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    run.status === 'COMPLETED'
                      ? 'bg-green-500'
                      : run.status === 'CANCELLED'
                      ? 'bg-red-400'
                      : 'bg-violet-500'
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>{Math.round(progressPercent)}% complete</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Steps Timeline - with Milestones */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Steps Timeline</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Track the progress of each step in this flow
              </p>
            </div>

            {/* Milestone-grouped view */}
            {milestoneGroups.length > 0 ? (
              <div>
                {milestoneGroups.map((group) => {
                  const isCollapsed = collapsedMilestones.has(group.id);
                  const completedInGroup = group.steps.filter(s => s.status === 'COMPLETED').length;

                  return (
                    <div key={group.id}>
                      {/* Milestone Header */}
                      <button
                        onClick={() => toggleMilestone(group.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-6 py-3 border-b border-gray-100 transition-colors',
                          group.isActive ? 'bg-blue-50/50' : group.isComplete ? 'bg-green-50/30' : 'bg-gray-50/50',
                          'hover:bg-gray-50'
                        )}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center',
                          group.isComplete ? 'bg-green-100' : group.isActive ? 'bg-blue-100' : 'bg-gray-100'
                        )}>
                          {group.isComplete ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <span className={cn(
                              'text-[10px] font-bold',
                              group.isActive ? 'text-blue-600' : 'text-gray-400'
                            )}>
                              {completedInGroup}/{group.steps.length}
                            </span>
                          )}
                        </div>
                        <span className={cn(
                          'text-sm font-semibold',
                          group.isComplete ? 'text-green-700' : group.isActive ? 'text-blue-700' : 'text-gray-600'
                        )}>
                          {group.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">
                          {completedInGroup}/{group.steps.length} steps
                        </span>
                      </button>

                      {/* Steps in this milestone */}
                      {!isCollapsed && (
                        <div className="divide-y divide-gray-100">
                          {group.steps.map((step, i) =>
                            renderStepRow(step, steps.indexOf(step), i === group.steps.length - 1)
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Flat list (no milestones) */
              <div className="divide-y divide-gray-100">
                {steps.map((step, index) =>
                  renderStepRow(step, index, index === steps.length - 1)
                )}
              </div>
            )}

            {steps.length === 0 && (
              <div className="px-6 py-12 text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No steps found for this flow.</p>
              </div>
            )}
          </div>

          {/* Completion Info */}
          {run.status === 'COMPLETED' && run.completedAt && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Flow Completed</p>
                  <p className="text-sm text-green-700 mt-0.5">
                    Completed on {formatDateTime(run.completedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {run.status === 'CANCELLED' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Flow Cancelled</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    This flow was cancelled before completion.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Sidebar */}
        {showSettingsSidebar && (
          <div className="w-80 shrink-0">
            {/* Users Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">Users</h3>
              </div>

              {/* Coordinator */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Coordinators</p>
                {run.startedBy && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-xs font-semibold text-violet-700">
                      {run.startedBy.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{run.startedBy.name}</p>
                      <p className="text-xs text-gray-400">{run.startedBy.email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Assignees */}
              {assignees.size > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Assignees</p>
                  <div className="space-y-2">
                    {Array.from(assignees.entries()).map(([id, a]) => (
                      <div key={id} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.type === 'contact' ? 'External' : 'Team member'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Workspace Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">Info</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-gray-700 font-medium">{run.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Template</p>
                  <p className="text-gray-700">{run.flow?.name || 'Unknown'}</p>
                </div>
                {run.startedAt && (
                  <div>
                    <p className="text-xs text-gray-400">Start Date</p>
                    <p className="text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDateTime(run.startedAt)}
                    </p>
                  </div>
                )}
                {run.completedAt && (
                  <div>
                    <p className="text-xs text-gray-400">Completed</p>
                    <p className="text-gray-700">{formatDateTime(run.completedAt)}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {run.status === 'IN_PROGRESS' && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-gray-600"
                    onClick={handleCancelRun}
                    disabled={isCancelling}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel workspace
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Panel */}
      {id && <FlowRunChatPanel mode="coordinator" flowRunId={id} />}
    </div>
  );
}
