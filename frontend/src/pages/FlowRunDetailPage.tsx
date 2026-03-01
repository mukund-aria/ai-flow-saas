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
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  Users,
  Settings,
  Calendar,
  MessageSquare,
  ExternalLink,
  UserPlus,
  GitBranch,
  Sparkles,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIcon } from '@/components/workflow/StepIcon';
import { getFlow, cancelFlow, getStepActToken, approveAIDraft, type Flow } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { FlowRunChatPanel } from '@/components/flow-chat/FlowRunChatPanel';
import { useFlowRunChatStore } from '@/stores/flowRunChatStore';
import { AuditTimeline } from '@/components/flows/AuditTimeline';
import { FlowCompletionSummary } from '@/components/flows/FlowCompletionSummary';
import { ReassignStepDialog } from '@/components/flows/ReassignStepDialog';
import type { StepType } from '@/types';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================================================
// Types
// ============================================================================

type StepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED' | 'WAITING_FOR_ASSIGNEE';

interface GroupAssigneeInfo {
  id: string;
  contactId?: string | null;
  userId?: string | null;
  name: string;
  email?: string;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string | null;
}

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
  isGroupAssignment?: boolean;
  completionMode?: string;
  groupAssignees?: GroupAssigneeInfo[];
  resultData?: Record<string, unknown>;
  completedAt?: string;
  startedAt?: string;
  dueAt?: string;
  reminderCount?: number;
  milestoneId?: string;
  branchPath?: string | null;
  parallelGroupId?: string | null;
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
// AI Review Panel
// ============================================================================

function AIReviewPanel({
  runId,
  stepId,
  draft,
  onApproved,
}: {
  runId: string;
  stepId: string;
  draft: Record<string, unknown>;
  onApproved: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [isApproving, setIsApproving] = useState(false);

  // Filter out internal fields (executedAt, etc.)
  const outputEntries = Object.entries(draft).filter(
    ([key]) => !key.startsWith('_') && key !== 'executedAt' && key !== 'skipped' && key !== 'reason'
  );

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const editedOutput = isEditing && Object.keys(editedValues).length > 0
        ? { ...draft, ...editedValues }
        : undefined;
      await approveAIDraft(runId, stepId, editedOutput);
      onApproved();
    } catch (err) {
      console.error('Failed to approve AI output:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="mt-2 ml-12 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg border border-violet-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-violet-600" />
        </div>
        <span className="text-sm font-semibold text-violet-900">AI Output — Awaiting Review</span>
      </div>

      <div className="space-y-2 mb-4">
        {outputEntries.map(([key, value]) => (
          <div key={key}>
            <label className="text-xs font-medium text-gray-500 capitalize block mb-0.5">
              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
            </label>
            {isEditing ? (
              <textarea
                value={editedValues[key] ?? String(value ?? '')}
                onChange={(e) => setEditedValues({ ...editedValues, [key]: e.target.value })}
                rows={typeof value === 'string' && value.length > 100 ? 4 : 2}
                className="w-full px-2.5 py-1.5 border border-violet-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            ) : (
              <p className="text-sm text-gray-700 bg-white/60 rounded px-2.5 py-1.5 border border-violet-100">
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '')}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleApprove}
          disabled={isApproving}
          size="sm"
          className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
        >
          {isApproving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          Approve & Continue
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          className="gap-1.5 text-xs"
        >
          <Pencil className="w-3 h-3" />
          {isEditing ? 'Cancel Edit' : 'Edit Output'}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Branch Grouping Helpers
// ============================================================================

interface BranchGroup {
  type: 'parallel' | 'branch';
  parallelGroupId?: string;
  paths: Map<string, FlowRunStep[]>;
}

/**
 * Separate steps into normal (non-branched) steps and branch groups.
 * Returns an ordered list of segments: either a single step or a branch group.
 */
function segmentSteps(steps: FlowRunStep[]): Array<{ kind: 'step'; step: FlowRunStep } | { kind: 'branch'; group: BranchGroup }> {
  const segments: Array<{ kind: 'step'; step: FlowRunStep } | { kind: 'branch'; group: BranchGroup }> = [];
  const branchSteps = new Set<string>();

  // Group branched steps by parallelGroupId or branchPath
  const parallelGroups = new Map<string, Map<string, FlowRunStep[]>>();
  const branchPathSteps = new Map<string, FlowRunStep[]>();

  for (const step of steps) {
    if (step.parallelGroupId) {
      branchSteps.add(step.id);
      if (!parallelGroups.has(step.parallelGroupId)) {
        parallelGroups.set(step.parallelGroupId, new Map());
      }
      const group = parallelGroups.get(step.parallelGroupId)!;
      const pathKey = step.branchPath || 'default';
      if (!group.has(pathKey)) {
        group.set(pathKey, []);
      }
      group.get(pathKey)!.push(step);
    } else if (step.branchPath) {
      branchSteps.add(step.id);
      const pathKey = step.branchPath;
      if (!branchPathSteps.has(pathKey)) {
        branchPathSteps.set(pathKey, []);
      }
      branchPathSteps.get(pathKey)!.push(step);
    }
  }

  // Build segments in order
  const processedParallelGroups = new Set<string>();
  const processedBranchPaths = new Set<string>();

  for (const step of steps) {
    if (branchSteps.has(step.id)) {
      if (step.parallelGroupId && !processedParallelGroups.has(step.parallelGroupId)) {
        processedParallelGroups.add(step.parallelGroupId);
        segments.push({
          kind: 'branch',
          group: {
            type: 'parallel',
            parallelGroupId: step.parallelGroupId,
            paths: parallelGroups.get(step.parallelGroupId)!,
          },
        });
      } else if (step.branchPath && !step.parallelGroupId && !processedBranchPaths.has(step.branchPath)) {
        processedBranchPaths.add(step.branchPath);
        const paths = new Map<string, FlowRunStep[]>();
        paths.set(step.branchPath, branchPathSteps.get(step.branchPath)!);
        segments.push({
          kind: 'branch',
          group: {
            type: 'branch',
            paths,
          },
        });
      }
    } else {
      segments.push({ kind: 'step', step });
    }
  }

  return segments;
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
  const [reassigningStep, setReassigningStep] = useState<{ stepId: string; currentAssignee?: { name: string; type: 'contact' | 'user' } } | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [rolesByPerson, setRolesByPerson] = useState<Map<string, { name: string; roleType: string }[]>>(new Map());

  // Onboarding: step 4 is completed when the coordinator actually acts on a step
  // (see handleActOnStep below)

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
          roles?: Array<{ roleId: string; name: string; roleType?: string }>;
        } | undefined;

        // Build reverse map: personId → role info (for sidebar role badges)
        const roleAssignments = (data as any).roleAssignments as Record<string, string> | undefined;
        const defRoles = definition?.roles || [];
        const personRoleMap = new Map<string, { name: string; roleType: string }[]>();
        if (roleAssignments && defRoles.length > 0) {
          for (const [roleName, personId] of Object.entries(roleAssignments)) {
            if (!personId) continue;
            const roleDef = defRoles.find(r => r.name === roleName);
            const roleType = roleDef?.roleType || 'assignee';
            const existing = personRoleMap.get(personId) || [];
            existing.push({ name: roleName, roleType });
            personRoleMap.set(personId, existing);
          }
        }
        setRolesByPerson(personRoleMap);
        const defSteps = definition?.steps || [];
        const defMilestones = definition?.milestones || [];

        const mappedSteps: FlowRunStep[] = (data.stepExecutions || []).map((se) => {
          const defStep = defSteps.find((d) => d.stepId === se.stepId);
          const assignee = se.assignedToUser
            ? { id: se.assignedToUser.id, name: se.assignedToUser.name, type: 'user' as const }
            : se.assignedToContact
            ? { id: se.assignedToContact.id, name: se.assignedToContact.name, type: 'contact' as const }
            : undefined;

          // Map group assignees if present
          const groupAssignees: GroupAssigneeInfo[] | undefined = (se as any).assignees?.map((a: any) => ({
            id: a.id,
            contactId: a.contactId,
            userId: a.userId,
            name: a.contact?.name || a.user?.name || 'Unknown',
            email: a.contact?.email || a.user?.email,
            status: a.status,
            completedAt: a.completedAt,
          }));

          return {
            id: se.id,
            stepId: se.stepId,
            name: defStep?.config?.name || `Step ${se.stepIndex + 1}`,
            description: defStep?.config?.description,
            type: (defStep?.type || 'TODO') as StepType,
            status: se.status as StepStatus,
            assignee,
            isGroupAssignment: (se as any).isGroupAssignment || false,
            completionMode: (se as any).completionMode,
            groupAssignees: groupAssignees?.length ? groupAssignees : undefined,
            resultData: se.resultData,
            completedAt: se.completedAt,
            startedAt: se.startedAt,
            dueAt: se.dueAt,
            reminderCount: se.reminderCount,
            branchPath: (se as any).branchPath || null,
            parallelGroupId: (se as any).parallelGroupId || null,
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
  }, [id, refetchKey]);

  // Real-time updates via SSE — auto-refresh step statuses for current run
  useRealtimeUpdates({
    onStepCompleted: (data) => {
      if (data.flowRunId === id) {
        setRefetchKey((k) => k + 1);
      }
    },
    onRunCompleted: (data) => {
      if (data.flowRunId === id) {
        setRefetchKey((k) => k + 1);
      }
    },
    onStepAIReviewReady: (data) => {
      if (data.flowRunId === id) {
        setRefetchKey((k) => k + 1);
      }
    },
    onRunStarted: (data) => {
      if (data.flowRunId === id) {
        setRefetchKey((k) => k + 1);
      }
    },
  });

  // Handle cancel run
  const handleCancelRun = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelRun = async () => {
    if (!run) return;
    setShowCancelConfirm(false);
    setActionError(null);
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
    } catch {
      setActionError('Failed to cancel flow. Please try again.');
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
    } catch {
      setActionError('Failed to send reminder.');
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
      useOnboardingStore.getState().completeCompleteAction();
      window.open(`/task/${token}`, '_blank');
    } catch {
      setActionError('Failed to open task. Please try again.');
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
          <button
            onClick={() => setRefetchKey((k) => k + 1)}
            className="mt-3 px-4 py-1.5 text-sm font-medium bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Try Again
          </button>
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
            {step.status === 'IN_PROGRESS' && step.resultData?._awaitingReview ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                <Sparkles className="w-3 h-3" />
                AI Review
              </span>
            ) : (
              getStepStatusBadge(step.status)
            )}
            {step.status === 'COMPLETED' && step.resultData && (
              <span className="text-xs text-gray-400 ml-1">
                {step.type === 'FORM' ? `${Object.keys(step.resultData).filter(k => k !== '_meta').length} fields submitted` :
                 step.type === 'APPROVAL' ? (step.resultData.decision === 'APPROVED' ? '\u2713 Approved' : '\u2717 Rejected') :
                 step.type === 'FILE_REQUEST' ? `${step.resultData.filesUploaded || 0} files uploaded` :
                 step.type === 'QUESTIONNAIRE' ? `${Object.keys((step.resultData as any).answers || step.resultData).length} answers` :
                 null}
              </span>
            )}
          </div>

          {/* Assignee - single */}
          {step.assignee && !step.isGroupAssignment && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-[10px] font-bold text-violet-700">
                {step.assignee.name.charAt(0).toUpperCase()}
              </div>
              <span>{step.assignee.name}</span>
              {step.assignee.type === 'contact' && (
                <span className="text-xs text-gray-400">(external)</span>
              )}
            </div>
          )}

          {/* Group assignees */}
          {step.isGroupAssignment && step.groupAssignees && step.groupAssignees.length > 0 && (
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="font-medium">
                  {step.groupAssignees.filter(a => a.status === 'COMPLETED').length} of {step.groupAssignees.length} completed
                </span>
                <span className="text-gray-400">
                  ({step.completionMode === 'ALL' ? 'needs all' : step.completionMode === 'MAJORITY' ? 'needs majority' : 'needs any one'})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {step.groupAssignees.map((ga) => (
                  <div
                    key={ga.id}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                      ga.status === 'COMPLETED'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                    title={ga.email}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-[8px] font-bold text-violet-700">
                      {ga.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{ga.name}</span>
                    {ga.status === 'COMPLETED' && <span className="text-green-500">✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due date */}
          {step.dueAt && (
            <div className={cn(
              'flex items-center gap-1 mt-0.5 text-xs',
              new Date(step.dueAt) < new Date() ? 'text-red-500' :
              new Date(step.dueAt).getTime() - Date.now() < 2 * 86400000 ? 'text-amber-500' : 'text-gray-400'
            )}>
              <Calendar className="w-3 h-3" />
              <span>Due {formatTimeAgo(step.dueAt)}</span>
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
              {step.reminderCount ? (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full">
                  {step.reminderCount}
                </span>
              ) : null}
            </Button>
          )}

          {/* Reassign button - for non-completed, non-skipped steps */}
          {step.status !== 'COMPLETED' && step.status !== 'SKIPPED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReassigningStep({
                stepId: step.stepId,
                currentAssignee: step.assignee ? { name: step.assignee.name, type: step.assignee.type } : undefined,
              })}
              className="gap-1.5 text-xs h-7"
            >
              <UserPlus className="w-3 h-3" />
              Reassign
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

      {/* AI Review Panel — shown when step is IN_PROGRESS with AI draft awaiting review */}
      {step.status === 'IN_PROGRESS' && step.resultData?._awaitingReview && step.resultData._aiDraft && run && (
        <AIReviewPanel
          runId={run.id}
          stepId={step.stepId}
          draft={step.resultData._aiDraft as Record<string, unknown>}
          onApproved={() => setRefetchKey((k) => k + 1)}
        />
      )}

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

      {/* Action error banner */}
      {actionError && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cancel confirmation dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCancelConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancel Flow</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this flow? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Keep Running
              </button>
              <button
                onClick={confirmCancelRun}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancel Flow
              </button>
            </div>
          </div>
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
              /* Flat list (no milestones) - with branch awareness */
              <div className="divide-y divide-gray-100">
                {(() => {
                  const segments = segmentSteps(steps);
                  let stepCounter = 0;

                  return segments.map((segment, segIdx) => {
                    if (segment.kind === 'step') {
                      const idx = stepCounter++;
                      return renderStepRow(segment.step, idx, segIdx === segments.length - 1);
                    }

                    // Branch group rendering
                    const { group } = segment;
                    const isParallel = group.type === 'parallel';
                    const pathEntries = Array.from(group.paths.entries());

                    return (
                      <div key={group.parallelGroupId || `branch-${segIdx}`} className="py-3 px-4">
                        {/* Branch header */}
                        <div className="flex items-center gap-2 mb-3 pl-2">
                          <GitBranch className="w-4 h-4 text-violet-500" />
                          <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">
                            {isParallel ? 'Parallel Paths' : 'Branch Path'}
                          </span>
                          {isParallel && (
                            <span className="text-[10px] text-gray-400">
                              ({pathEntries.length} paths running simultaneously)
                            </span>
                          )}
                        </div>

                        {/* Render paths side by side for parallel, stacked for branch */}
                        <div className={cn(
                          isParallel ? 'grid gap-3' : 'space-y-2',
                          isParallel && pathEntries.length === 2 && 'grid-cols-2',
                          isParallel && pathEntries.length >= 3 && 'grid-cols-3',
                        )}>
                          {pathEntries.map(([pathId, pathSteps]) => {
                            const allPathComplete = pathSteps.every(s => s.status === 'COMPLETED');
                            const anyActive = pathSteps.some(
                              s => s.status === 'IN_PROGRESS' || s.status === 'WAITING_FOR_ASSIGNEE'
                            );

                            return (
                              <div
                                key={pathId}
                                className={cn(
                                  'border rounded-lg overflow-hidden',
                                  allPathComplete && 'border-green-200 bg-green-50/30',
                                  anyActive && 'border-blue-200 bg-blue-50/30',
                                  !allPathComplete && !anyActive && 'border-gray-200 bg-gray-50/30'
                                )}
                              >
                                {/* Path label */}
                                <div className={cn(
                                  'px-3 py-1.5 text-xs font-medium border-b',
                                  allPathComplete && 'bg-green-100/50 text-green-700 border-green-200',
                                  anyActive && 'bg-blue-100/50 text-blue-700 border-blue-200',
                                  !allPathComplete && !anyActive && 'bg-gray-100/50 text-gray-500 border-gray-200'
                                )}>
                                  {pathId}
                                  {allPathComplete && (
                                    <CheckCircle2 className="w-3 h-3 inline ml-1.5 -mt-0.5" />
                                  )}
                                </div>

                                {/* Path steps */}
                                <div className="divide-y divide-gray-100">
                                  {pathSteps.map((pathStep, pIdx) => {
                                    const idx = stepCounter++;
                                    return renderStepRow(pathStep, idx, pIdx === pathSteps.length - 1);
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
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

          {/* AI Completion Summary */}
          {run.status === 'COMPLETED' && id && (
            <FlowCompletionSummary runId={id} />
          )}

          {/* Audit Timeline */}
          {id && <AuditTimeline runId={id} />}
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
                      {rolesByPerson.get(run.startedBy.id)?.map((role, i) => (
                        <span
                          key={i}
                          className={cn(
                            'inline-block text-xs px-1.5 py-0.5 rounded mr-1 mt-1',
                            role.roleType === 'coordinator'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-blue-100 text-blue-700'
                          )}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignees */}
              {assignees.size > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Assignees</p>
                  <div className="space-y-2">
                    {Array.from(assignees.entries()).map(([personId, a]) => (
                      <div key={personId} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{a.name}</p>
                          <p className="text-xs text-gray-400">{a.type === 'contact' ? 'External' : 'Team member'}</p>
                          {rolesByPerson.get(personId)?.map((role, i) => (
                            <span
                              key={i}
                              className={cn(
                                'inline-block text-xs px-1.5 py-0.5 rounded mr-1 mt-1',
                                role.roleType === 'coordinator'
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-blue-100 text-blue-700'
                              )}
                            >
                              {role.name}
                            </span>
                          ))}
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

      {/* Reassign Step Dialog */}
      {reassigningStep && id && (
        <ReassignStepDialog
          open={!!reassigningStep}
          onOpenChange={(open) => { if (!open) setReassigningStep(null); }}
          runId={id}
          stepId={reassigningStep.stepId}
          currentAssignee={reassigningStep.currentAssignee}
          onReassigned={() => setRefetchKey((k) => k + 1)}
        />
      )}

      {/* Chat Panel */}
      {id && <FlowRunChatPanel mode="coordinator" flowRunId={id} />}
    </div>
  );
}
