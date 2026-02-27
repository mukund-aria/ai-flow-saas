import { useState, useRef, useEffect } from 'react';
import { Milestone as MilestoneIcon, Pencil, Trash2, Check, X, CheckCircle2 } from 'lucide-react';
import { StepCard } from './StepCard';
import { StepConnector } from './StepConnector';
import { BranchLayout } from './BranchLayout';
import { AddStepPopover } from './AddStepPopover';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { Flow, Milestone, Step, StepType } from '@/types';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface StepListProps {
  workflow: Flow;
  editMode?: boolean;
}

// Check if a step has branches or outcomes (nested steps)
function hasBranchesOrOutcomes(step: Step): boolean {
  const hasPaths = !!(step.config?.paths && Array.isArray(step.config.paths) && step.config.paths.length > 0);
  const hasOutcomes = !!(step.config?.outcomes && Array.isArray(step.config.outcomes) && step.config.outcomes.length > 0);
  return hasPaths || hasOutcomes;
}

// ============================================================================
// Milestone Grouping
// ============================================================================

interface StepGroup {
  milestone?: Milestone;
  steps: Step[];
  globalStartIndex: number;
}

function groupStepsByMilestones(steps: Step[], milestones: Milestone[]): StepGroup[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  if (!milestones || milestones.length === 0) {
    return [{ steps, globalStartIndex: 0 }];
  }

  const stepIdToIndex = new Map(steps.map((s, i) => [s.stepId, i]));

  const milestoneStartPoints = milestones.map(m => ({
    milestone: m,
    startAfterIndex: m.afterStepId ? (stepIdToIndex.get(m.afterStepId) ?? -1) : -1,
  }));

  milestoneStartPoints.sort((a, b) => a.startAfterIndex - b.startAfterIndex);

  const groups: StepGroup[] = [];

  const firstMilestoneStart = milestoneStartPoints.length > 0
    ? milestoneStartPoints[0].startAfterIndex + 1
    : steps.length;

  if (firstMilestoneStart > 0) {
    groups.push({
      steps: steps.slice(0, firstMilestoneStart),
      globalStartIndex: 0,
    });
  }

  for (let i = 0; i < milestoneStartPoints.length; i++) {
    const current = milestoneStartPoints[i];
    const next = milestoneStartPoints[i + 1];

    const startIndex = current.startAfterIndex + 1;
    const endIndex = next ? next.startAfterIndex + 1 : steps.length;

    if (startIndex <= endIndex) {
      groups.push({
        milestone: current.milestone,
        steps: steps.slice(startIndex, endIndex),
        globalStartIndex: startIndex,
      });
    }
  }

  return groups;
}

// ============================================================================
// Milestone Container Component
// ============================================================================

interface MilestoneContainerProps {
  milestone?: Milestone;
  steps: Step[];
  globalStartIndex: number;
  assigneeIndices: Map<string, number>;
  isFirst: boolean;
  editMode?: boolean;
  addPopoverIndex: number | null;
  onSetAddPopoverIndex: (index: number | null) => void;
  onAddStep: (index: number, stepType: StepType) => void;
  onAddMilestone?: (afterIndex: number) => void;
  assigneePlaceholders: Flow['assigneePlaceholders'];
  workflow: Flow;
  totalSteps: number;
  lastStepRef: React.RefObject<HTMLDivElement | null>;
}

function MilestoneContainer({
  milestone,
  steps,
  globalStartIndex,
  assigneeIndices,
  isFirst,
  editMode,
  addPopoverIndex,
  onSetAddPopoverIndex,
  onAddStep,
  onAddMilestone,
  assigneePlaceholders,
  workflow,
  totalSteps,
  lastStepRef,
}: MilestoneContainerProps) {
  const { updateMilestone, removeMilestone } = useWorkflowStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const renderSteps = () => (
    <>
      {steps.map((step, index) => {
        const globalIndex = globalStartIndex + index;
        const assigneeIndex = step.config.assignee
          ? assigneeIndices.get(step.config.assignee) || 0
          : 0;
        const isBranchStep = hasBranchesOrOutcomes(step);
        const isLastStepOverall = globalIndex === totalSteps - 1;

        return (
          <div key={step.stepId} ref={isLastStepOverall ? lastStepRef : undefined}>
            {/* Connector before step */}
            {(index > 0 || !isFirst) && (
              <div className="relative">
                <StepConnector
                  showAddButton={!!editMode}
                  onAdd={() => onSetAddPopoverIndex(globalIndex)}
                  dropId={editMode ? `drop-zone-${globalIndex}` : undefined}
                />
                {editMode && addPopoverIndex === globalIndex && (
                  <AddStepPopover
                    open
                    onOpenChange={(open) => { if (!open) onSetAddPopoverIndex(null); }}
                    onSelect={(type) => onAddStep(globalIndex, type)}
                    onAddMilestone={() => onAddMilestone?.(globalIndex)}
                  />
                )}
              </div>
            )}

            {/* Branch Layout for steps with paths/outcomes */}
            {isBranchStep ? (
              <div>
                <div className="flex justify-center">
                  <StepCard
                    step={step}
                    index={globalIndex}
                    assigneeIndex={assigneeIndex}
                    editMode={editMode}
                    assigneePlaceholders={assigneePlaceholders}
                    stepNumber={String(globalIndex + 1)}
                  />
                </div>
                <BranchLayout
                  step={step}
                  stepIndex={globalIndex}
                  assigneeIndices={assigneeIndices}
                  allSteps={workflow.steps}
                  editMode={editMode}
                  parentNumber={String(globalIndex + 1)}
                />
              </div>
            ) : (
              <div className="flex justify-center">
                <StepCard
                  step={step}
                  index={globalIndex}
                  assigneeIndex={assigneeIndex}
                  editMode={editMode}
                  assigneePlaceholders={assigneePlaceholders}
                  stepNumber={String(globalIndex + 1)}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  if (!milestone) {
    return <>{renderSteps()}</>;
  }

  const handleStartEdit = () => {
    setEditName(milestone.name);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateMilestone(milestone.milestoneId, editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="relative my-2">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-solid border-gray-300 border-l-4 border-l-amber-400 rounded-t-lg">
        <MilestoneIcon className="w-4 h-4 text-amber-500 shrink-0" />
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') handleCancelEdit(); }}
              className="flex-1 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
              autoFocus
            />
            <button onClick={handleSaveEdit} className="p-0.5 rounded hover:bg-green-50 text-green-600">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleCancelEdit} className="p-0.5 rounded hover:bg-gray-100 text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 truncate">{milestone.name}</span>
            {editMode && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={handleStartEdit} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Rename milestone">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => removeMilestone(milestone.milestoneId)} className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete milestone">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="border border-t-0 border-solid border-gray-300 border-l-4 border-l-amber-400 rounded-b-lg px-4 py-3 bg-amber-50/30">
        {steps.length > 0 ? (
          renderSteps()
        ) : (
          <p className="text-xs text-gray-400 italic text-center py-4">No steps in this phase</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main StepList Component
// ============================================================================

export function StepList({ workflow, editMode = false }: StepListProps) {
  const steps = workflow.steps;
  const milestones = workflow.milestones || [];
  const [addPopoverIndex, setAddPopoverIndex] = useState<number | null>(null);
  const [endPopoverOpen, setEndPopoverOpen] = useState(false);
  const { addStep, addMilestone } = useWorkflowStore();

  // Scroll-to-step on add
  const prevStepCountRef = useRef(steps.length);
  const lastStepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (steps.length > prevStepCountRef.current && lastStepRef.current) {
      lastStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    prevStepCountRef.current = steps.length;
  }, [steps.length]);

  const stepGroups = groupStepsByMilestones(steps, milestones);

  // Build assignee index map for consistent colors
  const assigneeIndices = new Map<string, number>();
  workflow.assigneePlaceholders?.forEach((a, i) => {
    assigneeIndices.set(a.roleName, i);
  });

  const handleAddStep = (index: number, stepType: StepType) => {
    addStep(index, stepType);
    setAddPopoverIndex(null);
    setEndPopoverOpen(false);
  };

  const handleAddMilestone = (afterIndex: number) => {
    // afterIndex is the position in the step array; the milestone goes after the step at afterIndex - 1
    addMilestone(afterIndex - 1);
    setAddPopoverIndex(null);
    setEndPopoverOpen(false);
  };

  const stepIds = steps.map((s) => s.stepId);

  const content = (
    <div className="space-y-0">
      {stepGroups.map((group, groupIndex) => (
        <MilestoneContainer
          key={group.milestone?.milestoneId || `group-${groupIndex}`}
          milestone={group.milestone}
          steps={group.steps}
          globalStartIndex={group.globalStartIndex}
          assigneeIndices={assigneeIndices}
          isFirst={groupIndex === 0}
          editMode={editMode}
          addPopoverIndex={addPopoverIndex}
          onSetAddPopoverIndex={setAddPopoverIndex}
          onAddStep={handleAddStep}
          onAddMilestone={handleAddMilestone}
          assigneePlaceholders={workflow.assigneePlaceholders || []}
          workflow={workflow}
          totalSteps={steps.length}
          lastStepRef={lastStepRef}
        />
      ))}

      {/* Final connector with add button */}
      {steps.length > 0 && (
        <div className="relative">
          <StepConnector
            showAddButton={!!editMode}
            onAdd={() => setEndPopoverOpen(true)}
            dropId={editMode ? `drop-zone-${steps.length}` : undefined}
          />
          {editMode && endPopoverOpen && (
            <AddStepPopover
              open
              onOpenChange={setEndPopoverOpen}
              onSelect={(type) => handleAddStep(steps.length, type)}
              onAddMilestone={() => handleAddMilestone(steps.length)}
            />
          )}
        </div>
      )}

      {/* End indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500 font-medium shadow-sm border border-gray-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
          End of Flow
        </div>
      </div>
    </div>
  );

  // Wrap in SortableContext for reorder support (parent DndContext lives in FlowBuilderPage)
  if (editMode) {
    return (
      <SortableContext items={stepIds} strategy={verticalListSortingStrategy}>
        {content}
      </SortableContext>
    );
  }

  return content;
}
