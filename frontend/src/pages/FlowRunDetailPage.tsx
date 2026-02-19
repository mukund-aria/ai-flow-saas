/**
 * Flow Run Detail Page
 *
 * Displays the detailed progress and status of a single flow run,
 * including a timeline of all steps with their current state.
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIcon } from '@/components/workflow/StepIcon';
import { getFlow, cancelFlow, type Flow } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useOnboardingStore } from '@/stores/onboardingStore';
import type { StepType } from '@/types';

// ============================================================================
// Types
// ============================================================================

type StepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'SKIPPED' | 'WAITING_FOR_ASSIGNEE';

interface FlowRunStep {
  id: string;
  stepId: string;
  name: string;
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
// Main Component
// ============================================================================

export function FlowRunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [run, setRun] = useState<Flow | null>(null);
  const [steps, setSteps] = useState<FlowRunStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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
        const definition = (data as any).flow?.definition as { steps?: Array<{ stepId: string; type: string; config?: { name?: string; description?: string } }> } | undefined;
        const defSteps = definition?.steps || [];

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
            type: (defStep?.type || 'TODO') as StepType,
            status: se.status as StepStatus,
            assignee,
            resultData: se.resultData,
            completedAt: se.completedAt,
            startedAt: se.startedAt,
          };
        });

        setSteps(mappedSteps);
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
      // Re-map steps from the updated run
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
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/flows')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Flows
        </Button>
      </div>

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

      {/* Steps Timeline */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Steps Timeline</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Track the progress of each step in this workflow run
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {steps.map((step, index) => (
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
                  {index < steps.length - 1 && (
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

                {/* Timestamp */}
                <div className="text-right">
                  {step.status === 'COMPLETED' && step.completedAt && (
                    <div className="text-sm text-gray-500">
                      <div className="font-medium text-gray-700">Completed</div>
                      <div>{formatDateTime(step.completedAt)}</div>
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
          ))}
        </div>

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
  );
}
