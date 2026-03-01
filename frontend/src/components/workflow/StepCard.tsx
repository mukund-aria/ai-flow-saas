import { Card } from '@/components/ui/card';
import { StepIcon } from './StepIcon';
import { ChangeStatusBadge } from './ChangeStatusBadge';
import { GripVertical, Pencil, Trash2, Copy, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { Step, Role } from '@/types';
import type { StepChangeStatus } from '@/lib/proposal-utils';
import { STEP_TYPE_META, getRoleColor, getRoleInitials } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Steps that auto-complete or have no assignee don't need one
const NO_ASSIGNEE_TYPES = new Set([
  'SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH',
  'GOTO', 'GOTO_DESTINATION', 'TERMINATE', 'WAIT', 'SUB_FLOW',
  'SYSTEM_WEBHOOK', 'SYSTEM_EMAIL', 'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE',
  'BUSINESS_RULE',
  'AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE',
  'REST_API', 'MCP_SERVER',
]);

function getStepWarnings(step: Step): string[] {
  const warnings: string[] = [];
  if (!step.config.name) warnings.push('Missing step name');
  if (!NO_ASSIGNEE_TYPES.has(step.type) && !step.config.assignee) {
    warnings.push('No assignee');
  }
  return warnings;
}

interface StepCardProps {
  step: Step;
  index: number;
  assigneeIndex?: number;
  editMode?: boolean;
  roles?: Role[];
  /** Display string like "1", "9.1", "9.2.1" for nested numbering */
  stepNumber?: string;
  /** Change status from proposal mode diff */
  changeStatus?: StepChangeStatus;
  /** Callback when step is clicked in edit mode (opens slide-over config) */
  onStepClick?: (stepId: string) => void;
}

export function StepCard({ step, index, assigneeIndex = 0, editMode, roles = [], stepNumber, changeStatus, onStepClick }: StepCardProps) {
  const { removeStep, duplicateStep } = useWorkflowStore();

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
      <div ref={setNodeRef} style={style} className={cn(changeStatus === 'unchanged' && 'opacity-60')}>
        <div
          className={cn(
            'flex items-center gap-2 py-1.5 px-2 group',
            editMode && 'cursor-pointer',
          )}
          onClick={editMode ? () => onStepClick?.(step.stepId) : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
            {step.config.name?.replace('Point ', '') || '?'}
          </div>
          <div className="h-0.5 w-6 bg-amber-300" />
          <span className="text-xs font-medium text-amber-700">{step.config.name || 'Go To Destination'}</span>
          {editMode && (
            <div className="flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); onStepClick?.(step.stepId); }} className="p-1 rounded text-gray-400 hover:text-violet-600"><Pencil className="w-3 h-3" /></button>
              <button onClick={(e) => { e.stopPropagation(); removeStep(step.stepId); }} className="p-1 rounded text-gray-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const warnings = getStepWarnings(step);
  const hasWarnings = warnings.length > 0;
  const isAutomation = meta.category === 'automation';
  const isDecision = step.type === 'DECISION';
  const displayNumber = stepNumber || String(index + 1);

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
    onStepClick?.(step.stepId);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={cn(
          'w-[320px] border-l-4 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200 group border-gray-100',
          isAutomation && 'border-dashed border-gray-300',
          editMode && 'cursor-pointer',
          isDragging && 'opacity-50 shadow-lg ring-2 ring-violet-300',
          changeStatus === 'unchanged' && 'opacity-60',
          changeStatus === 'added' && 'ring-1 ring-green-200',
          changeStatus === 'modified' && 'ring-1 ring-amber-200',
          changeStatus === 'moved' && 'ring-1 ring-blue-200',
        )}
        style={{
          borderLeftColor: changeStatus === 'added' ? '#22c55e'
            : changeStatus === 'modified' ? '#f59e0b'
            : changeStatus === 'moved' ? '#3b82f6'
            : isAutomation ? '#9ca3af' : meta.color,
        }}
        onClick={editMode ? () => onStepClick?.(step.stepId) : undefined}
      >
        {/* Header row */}
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 border-b border-gray-100',
            isDecision && 'bg-amber-50/60',
          )}
          style={!isDecision ? { backgroundColor: `${meta.color}0a` } : undefined}
        >
          {editMode && (
            <div
              className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500 transition-colors shrink-0"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <StepIcon type={step.type} className="w-4 h-4 shrink-0" style={{ color: meta.color }} />
          <span className="text-sm font-medium text-gray-600 truncate">{meta.label}</span>
          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {changeStatus && changeStatus !== 'unchanged' && (
              <ChangeStatusBadge status={changeStatus} />
            )}
            {hasWarnings && (
              <span title={warnings.join(', ')}>
                <AlertCircle className="w-3 h-3 text-amber-500" />
              </span>
            )}
            <span className="text-xs font-semibold" style={{ color: meta.color }}>
              Step {displayNumber}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          <div className="flex items-start gap-1.5">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {step.config.name || (editMode ? 'Click to configure...' : 'Untitled Step')}
              </h4>
              {step.config.assignee && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs text-gray-500">Assigned to:</span>
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
              <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={handleEdit}
                  className="p-1 rounded text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                  title="Edit step"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Duplicate step"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
