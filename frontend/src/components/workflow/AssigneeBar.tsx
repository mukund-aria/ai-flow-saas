/**
 * Assignee Bar
 *
 * Compact horizontal bar showing assignee role avatars below the builder header.
 * Shows resolution type indicators for each role.
 * Click a role chip to open the role configuration panel.
 */

import { useState } from 'react';
import { Plus, X, UserCheck, PlayCircle, FileText, RefreshCw, UserPlus, Variable, GitBranch, Shield, Eye, ScanEye } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { ResolutionType } from '@/types';
import { RolePreviewDialog } from './RolePreviewDialog';

export const RESOLUTION_ICONS: Record<ResolutionType, typeof UserCheck> = {
  CONTACT_TBD: UserPlus,
  FIXED_CONTACT: UserCheck,
  WORKSPACE_INITIALIZER: PlayCircle,
  KICKOFF_FORM_FIELD: FileText,
  FLOW_VARIABLE: Variable,
  RULES: GitBranch,
  ROUND_ROBIN: RefreshCw,
  CONTACT_GROUP: Shield,
  ACCOUNT_CONTACTS: ScanEye,
};

export const RESOLUTION_LABELS: Record<ResolutionType, string> = {
  CONTACT_TBD: 'Contact TBD',
  FIXED_CONTACT: 'Fixed Contact',
  WORKSPACE_INITIALIZER: 'Workspace initializer',
  KICKOFF_FORM_FIELD: 'Kickoff form',
  FLOW_VARIABLE: 'Flow variable',
  RULES: 'Rules',
  ROUND_ROBIN: 'Round Robin',
  CONTACT_GROUP: 'Contact Group',
  ACCOUNT_CONTACTS: 'Account Contacts',
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
  onRoleClick?: (roleId: string) => void;
  selectedRoleId?: string | null;
}

export function AssigneeBar({ onRoleClick, selectedRoleId }: AssigneeBarProps) {
  const { workflow, addRole, removeRole } = useWorkflowStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [previewRoleId, setPreviewRoleId] = useState<string | null>(null);

  if (!workflow) return null;

  const assignees = workflow.roles || [];

  const handleAdd = () => {
    if (!newRoleName.trim()) return;
    if (assignees.some(a => a.name.toLowerCase() === newRoleName.trim().toLowerCase())) {
      return;
    }
    addRole(newRoleName.trim());
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
    <div className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 border-b border-gray-200 min-h-[52px]">
      <span
        className="text-sm font-medium text-gray-500 mr-1 shrink-0"
        title="Roles represent the participants in your workflow. Click a role to configure who fills it."
      >
        Roles:
      </span>

      {/* Assignee avatars */}
      {assignees.map((assignee, index) => {
        const resType = assignee.resolution?.type || 'CONTACT_TBD';
        const ResIcon = RESOLUTION_ICONS[resType];
        const chipLabel = getChipResolutionLabel(resType, assignee.resolution);
        const isCoordinator = assignee.roleOptions?.coordinatorToggle;
        const canViewAll = assignee.roleOptions?.allowViewAllActions;
        const isSelected = selectedRoleId === assignee.roleId;

        return (
          <div
            key={assignee.roleId}
            onClick={() => onRoleClick?.(assignee.roleId)}
            className={`group relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              isSelected
                ? 'bg-violet-50 border border-violet-300 shadow-sm'
                : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: getRoleColor(index) }}
            >
              {getRoleInitials(assignee.name)}
            </span>
            <div className="flex flex-col leading-tight">
              <span className={`text-sm font-semibold ${isSelected ? 'text-violet-700' : 'text-gray-800'}`}>
                {assignee.name}
              </span>
              <span className="text-xs text-gray-400">{chipLabel}</span>
            </div>
            {ResIcon && (
              <ResIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            )}
            {isCoordinator && (
              <Shield className="w-3.5 h-3.5 text-violet-500 shrink-0" aria-label="Coordinator" />
            )}
            {canViewAll && (
              <Eye className="w-3.5 h-3.5 text-violet-500 shrink-0" aria-label="Can view all actions" />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setPreviewRoleId(assignee.roleId); }}
              className="p-0.5 rounded-full text-gray-300 hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              title={`Preview ${assignee.name}'s experience`}
            >
              <ScanEye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); removeRole(assignee.roleId); }}
              className="p-0.5 rounded-full text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0"
              title="Remove role"
            >
              <X className="w-3.5 h-3.5" />
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add role
        </button>
      )}

      {/* Role Preview Dialog */}
      {previewRoleId && (() => {
        const role = assignees.find(a => a.roleId === previewRoleId);
        const roleIdx = assignees.findIndex(a => a.roleId === previewRoleId);
        if (!role) return null;
        return (
          <RolePreviewDialog
            open={true}
            onOpenChange={(open) => { if (!open) setPreviewRoleId(null); }}
            steps={workflow.steps}
            role={role}
            roleIndex={roleIdx}
          />
        );
      })()}
    </div>
  );
}
