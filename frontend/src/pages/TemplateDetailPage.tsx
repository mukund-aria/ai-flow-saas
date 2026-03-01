/**
 * Template Detail Page
 *
 * Read-only published flow template detail view, similar to Moxo's template detail.
 * Shows template metadata, workflow steps overview, roles summary, and recent runs.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
  Loader2,
  ArrowLeft,
  Play,
  Pencil,
  Link,
  Layers,
  AlertCircle,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Users,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepIcon } from '@/components/workflow/StepIcon';
import { ExecuteFlowDialog } from '@/components/workflow/ExecuteFlowDialog';
import { getTemplate, listFlows, type Template, type Flow } from '@/lib/api';
import {
  STEP_TYPE_META,
  getRoleColor,
  getRoleInitials,
  type Step,
  type Role,
} from '@/types';

// ============================================================================
// Helper Functions
// ============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
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

function getStatusBadgeClasses(status: Template['status']): string {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20';
    case 'DRAFT':
      return 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20';
    case 'ARCHIVED':
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function getStatusLabel(status: Template['status']): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'DRAFT':
      return 'Draft';
    case 'ARCHIVED':
      return 'Archived';
    default:
      return status;
  }
}

function getRunStatusIcon(status: Flow['status']) {
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
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function getRunStatusLabel(status: Flow['status']): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'PAUSED':
      return 'Paused';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

function getRunStatusClasses(status: Flow['status']): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'bg-blue-50 text-blue-700';
    case 'COMPLETED':
      return 'bg-green-50 text-green-700';
    case 'PAUSED':
      return 'bg-amber-50 text-amber-700';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

// ============================================================================
// Main Component
// ============================================================================

export function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<Template | null>(null);
  const [runs, setRuns] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showExecuteDialog, setShowExecuteDialog] = useState(false);

  // Extract flow definition data
  const definition = template?.definition as
    | {
        steps?: Step[];
        roles?: Role[];
        setupInstructions?: string;
      }
    | undefined;
  const steps: Step[] = definition?.steps || [];
  const roles: Role[] = definition?.roles || [];
  const setupInstructions: string | undefined = definition?.setupInstructions;

  // Fetch template and runs
  const fetchData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const [templateData, flowsData] = await Promise.all([
        getTemplate(id),
        listFlows(),
      ]);

      setTemplate(templateData);

      // Filter runs that belong to this template
      const templateRuns = flowsData.filter(
        (flow) => flow.template?.id === id
      );
      setRuns(templateRuns);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load template'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Copy start link to clipboard
  const handleCopyStartLink = async () => {
    const link = `${window.location.origin}/start/${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  // DRAFT templates should open in the builder, not the detail page
  if (!isLoading && template?.status === 'DRAFT') {
    return <Navigate to={`/templates/${id}`} replace />;
  }

  // Error state
  if (error || !template) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/templates')}
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="font-medium text-red-900">Error loading template</p>
          <p className="text-sm text-red-700 mt-1">
            {error || 'Template not found'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showExecuteDialog && (
        <ExecuteFlowDialog
          open={showExecuteDialog}
          onOpenChange={setShowExecuteDialog}
          template={template}
          onFlowStarted={(run) => {
            setShowExecuteDialog(false);
            navigate(`/flows/${run.id}`);
          }}
        />
      )}

      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/templates')}
          className="gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </Button>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          {/* Template Icon */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50 flex-shrink-0">
            <Layers className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>

          {/* Template Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {template.name}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeClasses(template.status)}`}
              >
                {getStatusLabel(template.status)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                V{template.version || '1'}
              </span>
            </div>

            {/* Creator and date */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              {template.createdBy && (
                <span>Created by {template.createdBy.name}</span>
              )}
              {template.createdBy && template.createdAt && (
                <span className="text-gray-300">&middot;</span>
              )}
              {template.createdAt && (
                <span>{formatDate(template.createdAt)}</span>
              )}
            </div>

            {/* Description */}
            {template.description && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {template.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            disabled={template.status !== 'ACTIVE'}
            onClick={() => setShowExecuteDialog(true)}
          >
            <Play className="w-4 h-4" />
            Execute
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/templates/${id}`)}
          >
            <Pencil className="w-4 h-4" />
            Edit Template
          </Button>
          <Button variant="outline" onClick={handleCopyStartLink}>
            <Link className="w-4 h-4" />
            {linkCopied ? 'Copied!' : 'Copy Start Link'}
          </Button>
        </div>
      </div>

      {/* Setup Instructions Banner */}
      {setupInstructions && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Setup Instructions</p>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">{setupInstructions}</p>
          </div>
        </div>
      )}

      {/* Two-column layout for steps and roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Workflow Overview - takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Workflow Steps
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'} in this
              template
            </p>
          </div>

          {steps.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {steps.map((step, index) => {
                const meta = STEP_TYPE_META[step.type] || {
                  label: step.type,
                  color: '#6b7280',
                  category: 'unknown',
                };
                const assigneeRole = step.config.assignee;
                const roleIndex = roles.findIndex(
                  (p) => p.name === assigneeRole
                );

                return (
                  <div
                    key={step.stepId}
                    className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Step Number */}
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-gray-500">
                        {index + 1}
                      </span>
                    </div>

                    {/* Step Type Icon with color dot */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <StepIcon
                        type={step.type}
                        className="w-4.5 h-4.5"
                        style={{ color: meta.color }}
                      />
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {step.config.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {meta.label}
                      </p>
                    </div>

                    {/* Assignee Role */}
                    {assigneeRole && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{
                            backgroundColor: getRoleColor(
                              roleIndex >= 0 ? roleIndex : 0
                            ),
                          }}
                        >
                          {getRoleInitials(assigneeRole)}
                        </div>
                        <span className="text-xs text-gray-500 max-w-[120px] truncate">
                          {assigneeRole}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                No steps defined in this template.
              </p>
            </div>
          )}
        </div>

        {/* Roles Summary - takes 1 column */}
        <div className="bg-white rounded-xl border border-gray-200 h-fit">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Roles</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {roles.length}{' '}
              {roles.length === 1 ? 'role' : 'roles'} defined
            </p>
          </div>

          {roles.length > 0 ? (
            <div className="p-4 space-y-3">
              {roles.map((placeholder, index) => (
                <div
                  key={placeholder.roleId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: getRoleColor(index) }}
                  >
                    {getRoleInitials(placeholder.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {placeholder.name}
                    </p>
                    {placeholder.description && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {placeholder.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-10 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No roles defined.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Runs Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Runs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Recent runs from this template
          </p>
        </div>

        {runs.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {runs.map((run) => (
              <div
                key={run.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/flows/${run.id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRunStatusIcon(run.status)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {run.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Started {formatDateTime(run.startedAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${getRunStatusClasses(run.status)}`}
                >
                  {getRunStatusLabel(run.status)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Play className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No flows yet
            </p>
            <p className="text-xs text-gray-500">
              Execute this template to create your first flow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
