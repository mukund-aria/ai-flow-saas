/**
 * Assignee Manager
 *
 * Panel for managing assignee roles (placeholders) in the flow builder.
 * Each role represents a person who will be assigned tasks when the flow runs.
 * At runtime, coordinators map roles to actual contacts.
 * Now supports resolution type configuration (how roles resolve to contacts).
 */

import { useState } from 'react';
import { Plus, X, UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { Resolution } from '@/types';
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
  const { workflow, addAssigneePlaceholder, removeAssigneePlaceholder, setWorkflow } = useWorkflowStore();
  const [newRoleName, setNewRoleName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

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

  const handleResolutionChange = (placeholderId: string, resolution: Resolution) => {
    if (!workflow) return;
    const updatedPlaceholders = assignees.map(a =>
      a.placeholderId === placeholderId ? { ...a, resolution } : a
    );
    setWorkflow({ ...workflow, assigneePlaceholders: updatedPlaceholders });
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
          <div key={assignee.placeholderId} className="border border-gray-100 rounded-lg overflow-hidden">
            <div
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setExpandedRole(expandedRole === assignee.placeholderId ? null : assignee.placeholderId)}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: getRoleColor(index) }}
              >
                {getRoleInitials(assignee.roleName)}
              </span>
              <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                {assignee.roleName}
              </span>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {RESOLUTION_LABELS[assignee.resolution?.type || 'CONTACT_TBD']}
              </span>
              {expandedRole === assignee.placeholderId ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAssigneePlaceholder(assignee.placeholderId);
                }}
                className="p-1 rounded text-gray-400 hover:text-red-500 transition-all"
                title="Remove role"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resolution type editor */}
            {expandedRole === assignee.placeholderId && (
              <div className="px-3 py-3 border-t border-gray-100 bg-white">
                <ResolutionTypeEditor
                  resolution={assignee.resolution || { type: 'CONTACT_TBD' }}
                  onChange={(resolution) => handleResolutionChange(assignee.placeholderId, resolution)}
                  kickoff={workflow.kickoff}
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

      {/* Add role input */}
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
