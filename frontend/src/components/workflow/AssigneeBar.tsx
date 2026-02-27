/**
 * Assignee Bar
 *
 * Compact horizontal bar showing assignee role avatars below the builder header.
 * Shows resolution type indicators for each role.
 */

import { useState } from 'react';
import { Plus, X, UserCheck, PlayCircle, FileText, RefreshCw, UserPlus, Variable, GitBranch, Shield, Eye } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { ResolutionType } from '@/types';

const RESOLUTION_ICONS: Record<ResolutionType, typeof UserCheck> = {
  CONTACT_TBD: UserPlus,
  FIXED_CONTACT: UserCheck,
  WORKSPACE_INITIALIZER: PlayCircle,
  KICKOFF_FORM_FIELD: FileText,
  FLOW_VARIABLE: Variable,
  RULES: GitBranch,
  ROUND_ROBIN: RefreshCw,
};

const RESOLUTION_LABELS: Record<ResolutionType, string> = {
  CONTACT_TBD: 'Contact TBD',
  FIXED_CONTACT: 'Fixed Contact',
  WORKSPACE_INITIALIZER: 'Flow Starter',
  KICKOFF_FORM_FIELD: 'From Kickoff',
  FLOW_VARIABLE: 'From Variable',
  RULES: 'Rules',
  ROUND_ROBIN: 'Round Robin',
};

export function AssigneeBar() {
  const { workflow, addAssigneePlaceholder, removeAssigneePlaceholder } = useWorkflowStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  if (!workflow) return null;

  const assignees = workflow.assigneePlaceholders || [];

  const handleAdd = () => {
    if (!newRoleName.trim()) return;
    if (assignees.some(a => a.roleName.toLowerCase() === newRoleName.trim().toLowerCase())) {
      return;
    }
    addAssigneePlaceholder(newRoleName.trim());
    setNewRoleName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewRoleName('');
    }
  };

  return (
    <div className="flex items-center gap-2 px-6 py-2 bg-gray-50 border-b border-gray-200 min-h-[44px]">
      <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Roles:</span>

      {/* Assignee avatars */}
      {assignees.map((assignee, index) => {
        const resType = assignee.resolution?.type || 'CONTACT_TBD';
        const ResIcon = RESOLUTION_ICONS[resType];
        const resLabel = RESOLUTION_LABELS[resType];
        const isCoordinator = assignee.roleOptions?.coordinatorToggle;
        const canViewAll = assignee.roleOptions?.allowViewAllActions;

        return (
          <div
            key={assignee.placeholderId}
            className="group relative flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              style={{ backgroundColor: getRoleColor(index) }}
            >
              {getRoleInitials(assignee.roleName)}
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-xs font-medium text-gray-700">{assignee.roleName}</span>
              <span className="text-[9px] text-gray-400">{resLabel}</span>
            </div>
            {ResIcon && (
              <ResIcon className="w-3 h-3 text-gray-400" />
            )}
            {isCoordinator && (
              <Shield className="w-3 h-3 text-violet-500" title="This assignee is a coordinator" />
            )}
            {canViewAll && (
              <Eye className="w-3 h-3 text-blue-500" title="This assignee can view all user actions" />
            )}
            <button
              onClick={() => removeAssigneePlaceholder(assignee.placeholderId)}
              className="p-0.5 rounded-full text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              title="Remove role"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      {/* Add role */}
      {isAdding ? (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newRoleName.trim()) {
                setIsAdding(false);
                setNewRoleName('');
              }
            }}
            placeholder='e.g., "Client"'
            className="w-32 px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newRoleName.trim()}
            className="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded-md hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewRoleName(''); }}
            className="px-1.5 py-1 text-gray-400 text-xs hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-gray-300 text-xs text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add role
        </button>
      )}
    </div>
  );
}
