import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepIcon } from './StepIcon';
import { StepConfigPanel } from './StepConfigPanel';
import { GripVertical, GitBranch, Pencil, Trash2, Copy, Columns2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { Step, AssigneePlaceholder } from '@/types';
import { STEP_TYPE_META, getRoleColor, getRoleInitials } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StepCardProps {
  step: Step;
  index: number;
  assigneeIndex?: number;
  editMode?: boolean;
  assigneePlaceholders?: AssigneePlaceholder[];
}

export function StepCard({ step, index, assigneeIndex = 0, editMode, assigneePlaceholders = [] }: StepCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { removeStep, updateStep, duplicateStep } = useWorkflowStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: step.stepId,
    disabled: !editMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const meta = STEP_TYPE_META[step.type] || {
    label: step.type,
    color: '#6b7280',
    category: 'unknown',
  };

  // GoTo Destination — render as compact gold marker
  if (step.type === 'GOTO_DESTINATION') {
    return (
      <div ref={setNodeRef} style={style}>
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 group',
            editMode && 'cursor-pointer',
          )}
          onClick={editMode ? () => setIsEditing(!isEditing) : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
            {step.config.name?.replace('Point ', '') || '?'}
          </div>
          <div className="h-0.5 w-6 bg-amber-300" />
          <span className="text-xs font-medium text-amber-700">{step.config.name || 'Go To Destination'}</span>
          {editMode && (
            <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }} className="p-1 rounded text-gray-400 hover:text-violet-600"><Pencil className="w-3 h-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); removeStep(step.stepId); }} className="p-1 rounded text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>
        {editMode && isEditing && (
          <StepConfigPanel
            step={step}
            assigneePlaceholders={assigneePlaceholders}
            onSave={(stepId, updates) => { updateStep(stepId, updates); setIsEditing(false); }}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
    );
  }

  const hasBranches =
    'paths' in step.config && Array.isArray(step.config.paths) && step.config.paths.length > 0;
  const hasOutcomes =
    'outcomes' in step.config &&
    Array.isArray(step.config.outcomes) &&
    step.config.outcomes.length > 0;
  const isComplex = hasBranches || hasOutcomes;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeStep(step.stepId);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateStep(step.stepId);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          'relative bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden',
          editMode && 'cursor-pointer',
          isDragging && 'opacity-50 shadow-lg ring-2 ring-violet-300',
        )}
        onClick={editMode ? () => setIsEditing(!isEditing) : undefined}
      >
        {/* Colored header band */}
        <div
          className="flex items-center gap-2 px-3 py-1.5"
          style={{ backgroundColor: meta.color }}
        >
          <StepIcon type={step.type} className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-semibold text-white tracking-wide">
            {meta.label}
          </span>
          {step.config.skipSequentialOrder && (
            <span title="Skip sequential order"><Columns2 className="w-3 h-3 text-white/80 ml-auto" /></span>
          )}
          {isComplex && (
            <GitBranch className="w-3 h-3 text-white/80 ml-auto" />
          )}
        </div>

        {/* Card body */}
        <div className="p-3">
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
            {editMode && (
              <div
                className="flex items-center mt-0.5 text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-gray-400">
                  Step {index + 1}
                </span>
              </div>

              <h4 className="font-medium text-gray-900 mt-0.5 truncate text-sm">
                {step.config.name || (editMode ? 'Click to configure...' : 'Untitled Step')}
              </h4>

              {step.config.description && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {step.config.description}
                </p>
              )}

              {/* Form fields count */}
              {step.type === 'FORM' && step.config.formFields && step.config.formFields.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {step.config.formFields.length} form field{step.config.formFields.length !== 1 ? 's' : ''}
                </p>
              )}

              {/* Assignee */}
              {step.config.assignee && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-gray-400">Assigned to:</span>
                  <div
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: `${getRoleColor(assigneeIndex)}15`,
                      color: getRoleColor(assigneeIndex),
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                      style={{ backgroundColor: getRoleColor(assigneeIndex) }}
                    >
                      {getRoleInitials(step.config.assignee)}
                    </span>
                    <span className="font-medium">{step.config.assignee}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Edit/Delete buttons */}
            {editMode && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={handleEdit}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                  title="Edit step"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Duplicate step"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Branch/Decision Preview */}
          {hasBranches && step.config.paths && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">
                {step.config.paths.length} branches:
              </p>
              <div className="flex flex-wrap gap-1">
                {step.config.paths.map((path) => (
                  <Badge key={path.pathId} variant="secondary" className="text-[10px]">
                    {path.label} ({path.steps?.length || 0} steps)
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {hasOutcomes && step.config.outcomes && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">
                {step.config.outcomes.length} outcomes:
              </p>
              <div className="flex flex-wrap gap-1">
                {step.config.outcomes.map((outcome) => (
                  <Badge key={outcome.outcomeId} variant="secondary" className="text-[10px]">
                    {outcome.label} ({outcome.steps?.length || 0} steps)
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Inline Config Panel */}
      {editMode && isEditing && (
        <StepConfigPanel
          step={step}
          assigneePlaceholders={assigneePlaceholders}
          onSave={(stepId, updates) => {
            updateStep(stepId, updates);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
