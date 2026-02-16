import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Pencil, Check } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { Flow } from '@/types';
import { getRoleColor, getRoleInitials } from '@/types';

interface WorkflowHeaderProps {
  workflow: Flow;
  editMode?: boolean;
}

export function WorkflowHeader({ workflow, editMode = false }: WorkflowHeaderProps) {
  const assignees = workflow.assigneePlaceholders || [];
  const { updateFlowMetadata } = useWorkflowStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(workflow.name);

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflow.name) {
      updateFlowMetadata({ name: trimmed });
    } else {
      setNameValue(workflow.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setNameValue(workflow.name);
      setIsEditingName(false);
    }
  };

  return (
    <div className="bg-white border-b px-4 py-3">
      {/* Title Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          {editMode && isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-violet-500 focus:outline-none w-full"
                autoFocus
              />
              <button onClick={handleNameSave} className="p-1 text-violet-600 hover:bg-violet-50 rounded">
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{workflow.name}</h2>
              {editMode && (
                <button
                  onClick={() => { setNameValue(workflow.name); setIsEditingName(true); }}
                  className="p-1 text-gray-400 hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                  title="Edit flow name"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {workflow.description && (
            <p className="text-sm text-gray-500 mt-0.5">{workflow.description}</p>
          )}
        </div>
        {!editMode && (
          <Badge variant="success" className="shrink-0">Published</Badge>
        )}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{workflow.steps.length} step{workflow.steps.length !== 1 ? 's' : ''}</span>
        {workflow.milestones.length > 0 && (
          <>
            <span>•</span>
            <span>{workflow.milestones.length} milestones</span>
          </>
        )}
        {assignees.length > 0 && (
          <>
            <span>•</span>
            <span>{assignees.length} role{assignees.length !== 1 ? 's' : ''}</span>
          </>
        )}
      </div>

      {/* Assignee Badges (read-only mode only - edit mode has AssigneeManager) */}
      {!editMode && assignees.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {assignees.map((assignee, index) => (
            <div
              key={assignee.placeholderId}
              className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border"
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: getRoleColor(index) }}
              >
                {getRoleInitials(assignee.roleName)}
              </span>
              <div>
                <p className="text-xs font-medium text-gray-900">{assignee.roleName}</p>
                <p className="text-[10px] text-gray-500">
                  {assignee.description || 'Contact TBD'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
