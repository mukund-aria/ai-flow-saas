/**
 * Assignee Bar
 *
 * Compact horizontal bar showing assignee role avatars below the builder header.
 * Shows resolution type indicators for each role.
 * Click a role chip to open the role configuration panel.
 */

import { useState } from 'react';
import { Plus, X, UserCheck, PlayCircle, FileText, RefreshCw, UserPlus, Variable, GitBranch, Shield, Eye } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { ResolutionType } from '@/types';

export const RESOLUTION_ICONS: Record<ResolutionType, typeof UserCheck> = {
  CONTACT_TBD: UserPlus,
  FIXED_CONTACT: UserCheck,
  WORKSPACE_INITIALIZER: PlayCircle,
  KICKOFF_FORM_FIELD: FileText,
  FLOW_VARIABLE: Variable,
  RULES: GitBranch,
  ROUND_ROBIN: RefreshCw,
};

export const RESOLUTION_LABELS: Record<ResolutionType, string> = {
  CONTACT_TBD: 'Contact TBD',
  FIXED_CONTACT: 'Fixed Contact',
  WORKSPACE_INITIALIZER: 'Workspace initializer',
  KICKOFF_FORM_FIELD: 'Kickoff form',
  FLOW_VARIABLE: 'Flow variable',
  RULES: 'Rules',
  ROUND_ROBIN: 'Round Robin',
};

/** Short label for the chip (includes detail where applicable) */
function getChipResolutionLabel(resType: ResolutionType, resolution?: { email?: string; fieldKey?: string; variableKey?: string }): string {
  switch (resType) {
    case 'FIXED_CONTACT':
      return resolution?.email ? `Fixed: ${resolution.email}` : 'Fixed Contact';
    case 'WORKSPACE_INITIALIZER':
      return 'by: Workspace initializer';
    case 'KICKOFF_FORM_FIELD':
      return resolution?.fieldKey ? `Kickoff form: ${resolution.fieldKey}` : 'From Kickoff';
    case 'FLOW_VARIABLE':
      return resolution?.variableKey ? `Var: ${resolution.variableKey}` : 'From Variable';
    default:
      return RESOLUTION_LABELS[resType];
  }
}

interface AssigneeBarProps {
  onRoleClick?: (placeholderId: string) => void;
  selectedRoleId?: string | null;
}

export function AssigneeBar({ onRoleClick, selectedRoleId }: AssigneeBarProps) {
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
        const chipLabel = getChipResolutionLabel(resType, assignee.resolution);
        const isCoordinator = assignee.roleOptions?.coordinatorToggle;
        const canViewAll = assignee.roleOptions?.allowViewAllActions;
        const isSelected = selectedRoleId === assignee.placeholderId;

        return (
          <div
            key={assignee.placeholderId}
            onClick={() => onRoleClick?.(assignee.placeholderId)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'bg-violet-50 border border-violet-300 shadow-sm'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
              style={{ backgroundColor: getRoleColor(index) }}
            >
              {getRoleInitials(assignee.roleName)}
            </span>
            <div className="flex flex-col leading-tight">
              <span className={`text-xs font-semibold ${isSelected ? 'text-violet-700' : 'text-gray-800'}`}>
                {assignee.roleName}
              </span>
              <span className="text-[9px] text-gray-400">{chipLabel}</span>
            </div>
            {ResIcon && (
              <ResIcon className="w-3 h-3 text-gray-400 shrink-0" />
            )}
            {isCoordinator && (
              <Shield className="w-3 h-3 text-violet-500 shrink-0" title="Coordinator" />
            )}
            {canViewAll && (
              <Eye className="w-3 h-3 text-blue-500 shrink-0" title="Can view all actions" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); removeAssigneePlaceholder(assignee.placeholderId); }}
              className="p-0.5 rounded-full text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
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
