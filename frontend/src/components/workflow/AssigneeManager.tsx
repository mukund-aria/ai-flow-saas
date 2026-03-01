/**
 * Assignee Manager
 *
 * Panel for managing assignee roles (placeholders) in the flow builder.
 * Each role represents a person who will be assigned tasks when the flow runs.
 * At runtime, coordinators map roles to actual contacts.
 * Now supports resolution type configuration (how roles resolve to contacts).
 */

import { useState } from 'react';
import { Plus, X, UserPlus, Users, ChevronDown, ChevronUp, Shield, UsersRound } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { Resolution, RoleOptions } from '@/types';
import { ResolutionTypeEditor } from './ResolutionTypeEditor';

const RESOLUTION_LABELS: Record<string, string> = {
  CONTACT_TBD: 'Assigned at start',
  FIXED_CONTACT: 'Fixed contact',
  WORKSPACE_INITIALIZER: 'Flow starter',
  KICKOFF_FORM_FIELD: 'From kickoff',
  FLOW_VARIABLE: 'From variable',
  RULES: 'Rules-based',
  ROUND_ROBIN: 'Round robin',
};

export function AssigneeManager() {
  const { workflow, addRole, removeRole, updateRole, setWorkflow } = useWorkflowStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

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

  const handleResolutionChange = (roleId: string, resolution: Resolution) => {
    if (!workflow) return;
    const updatedRoles = assignees.map(a =>
      a.roleId === roleId ? { ...a, resolution } : a
    );
    setWorkflow({ ...workflow, roles: updatedRoles });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-500" />
          Assignee Roles
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Role
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Define roles for people who will complete tasks in this flow. Configure how each role resolves to a contact.
      </p>

      {/* Assignee list */}
      <div className="space-y-2">
        {assignees.map((assignee, index) => (
          <div key={assignee.roleId} className="border border-gray-200 rounded-lg overflow-hidden">
            <div
              className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedRole(expandedRole === assignee.roleId ? null : assignee.roleId)}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: getRoleColor(index) }}
              >
                {getRoleInitials(assignee.name)}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-800 truncate block">
                  {assignee.name}
                </span>
                <span className="text-[11px] text-gray-400">
                  {RESOLUTION_LABELS[assignee.resolution?.type || 'CONTACT_TBD']}
                </span>
              </div>
              {(assignee.roleType || 'assignee') === 'coordinator' && (
                <span className="text-[10px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" />
                  Coord
                </span>
              )}
              {expandedRole === assignee.roleId ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRole(assignee.roleId);
                }}
                className="p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                title="Remove role"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resolution type editor + Advanced options */}
            {expandedRole === assignee.roleId && (
              <div className="px-3 py-3 border-t border-gray-100 bg-white space-y-3">
                <ResolutionTypeEditor
                  resolution={assignee.resolution || { type: 'CONTACT_TBD' }}
                  onChange={(resolution) => handleResolutionChange(assignee.roleId, resolution)}
                  kickoff={workflow.kickoff}
                />

                {/* Advanced (Optional) section */}
                <AdvancedRoleOptions
                  roleOptions={assignee.roleOptions || { coordinatorToggle: false, allowViewAllActions: false }}
                  onChange={(roleOptions) => updateRole(assignee.roleId, { roleOptions })}
                />
              </div>
            )}
          </div>
        ))}

        {assignees.length === 0 && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 w-full px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:text-violet-500 hover:border-violet-300 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-sm">Add your first assignee role (e.g., "Client", "Reviewer")</span>
          </button>
        )}
      </div>

      {/* Add role input - inline */}
      {isAdding && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="text"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='e.g., "Client", "Manager", "Legal"'
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={!newRoleName.trim()}
            className="px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
          >
            Add
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewRoleName(''); }}
            className="px-3 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Advanced Role Options (Collapsible)
// ============================================================================

function AdvancedRoleOptions({
  roleOptions,
  onChange,
}: {
  roleOptions: RoleOptions;
  onChange: (options: RoleOptions) => void;
}) {
  const [isOpen, setIsOpen] = useState(
    roleOptions.coordinatorToggle || roleOptions.allowViewAllActions
  );

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Advanced (Optional)</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-3">
          {/* Coordinator toggle */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={roleOptions.coordinatorToggle}
                onChange={(e) =>
                  onChange({ ...roleOptions, coordinatorToggle: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-[18px] bg-gray-200 peer-checked:bg-violet-600 rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm peer-checked:translate-x-[14px] transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <Shield className="w-3.5 h-3.5 text-gray-400" />
                Coordinator
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Grant "Coordinate" permission to allow the assignee to monitor progress and manage actions.
              </p>
            </div>
          </label>

          {/* Allow viewing other assignee's actions toggle */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={roleOptions.allowViewAllActions}
                onChange={(e) =>
                  onChange({ ...roleOptions, allowViewAllActions: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-8 h-[18px] bg-gray-200 peer-checked:bg-violet-600 rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm peer-checked:translate-x-[14px] transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                <UsersRound className="w-3.5 h-3.5 text-gray-400" />
                Allow viewing other assignee's actions
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                Once enabled, the assignee can see all user actions, helping them track the current progress of the flow.
              </p>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
