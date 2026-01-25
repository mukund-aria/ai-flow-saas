import { Badge } from '@/components/ui/badge';
import type { Flow } from '@/types';
import { getRoleColor, getRoleInitials } from '@/types';

interface WorkflowHeaderProps {
  workflow: Flow;
}

export function WorkflowHeader({ workflow }: WorkflowHeaderProps) {
  const assignees = workflow.assigneePlaceholders || [];

  return (
    <div className="bg-white border-b px-4 py-3">
      {/* Title Row */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{workflow.name}</h2>
          {workflow.description && (
            <p className="text-sm text-gray-500 mt-0.5">{workflow.description}</p>
          )}
        </div>
        <Badge variant="success" className="shrink-0">Published</Badge>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{workflow.steps.length} steps</span>
        {workflow.milestones.length > 0 && (
          <>
            <span>•</span>
            <span>{workflow.milestones.length} milestones</span>
          </>
        )}
        {assignees.length > 0 && (
          <>
            <span>•</span>
            <span>{assignees.length} roles</span>
          </>
        )}
      </div>

      {/* Assignee Badges */}
      {assignees.length > 0 && (
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
