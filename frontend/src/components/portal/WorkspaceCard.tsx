/**
 * Workspace Card
 *
 * Individual workspace card showing flow run name, status, progress, and action button.
 */

import { ArrowRight, Clock, CheckCircle, AlertTriangle, Pause } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkspaceCardProps {
  workspace: {
    id: string;
    name: string;
    templateName: string;
    status: string;
    progress: { completed: number; total: number };
    dueAt?: string;
    nextTaskToken?: string;
  };
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50' },
  COMPLETED: { label: 'Completed', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50' },
  CANCELLED: { label: 'Cancelled', icon: Pause, color: 'text-gray-600', bg: 'bg-gray-100' },
  PAUSED: { label: 'Paused', icon: Pause, color: 'text-gray-600', bg: 'bg-gray-100' },
};

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[workspace.status] || STATUS_CONFIG.IN_PROGRESS;
  const Icon = config.icon;
  const progressPct = workspace.progress.total > 0
    ? Math.round((workspace.progress.completed / workspace.progress.total) * 100)
    : 0;

  const isOverdue = workspace.dueAt && new Date(workspace.dueAt) < new Date() && workspace.status === 'IN_PROGRESS';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{workspace.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{workspace.templateName}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.bg}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{workspace.progress.completed}/{workspace.progress.total} steps</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progressPct}%`,
              backgroundColor: workspace.status === 'COMPLETED' ? '#22c55e' : '#7c3aed',
            }}
          />
        </div>
      </div>

      {/* Due date + action */}
      <div className="flex items-center justify-between">
        {workspace.dueAt ? (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
            {isOverdue && <AlertTriangle className="w-3 h-3" />}
            {isOverdue ? 'Overdue' : `Due ${new Date(workspace.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        ) : (
          <span />
        )}

        {workspace.nextTaskToken && workspace.status === 'IN_PROGRESS' && (
          <button
            onClick={() => navigate(`/task/${workspace.nextTaskToken}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors"
          >
            Continue
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
