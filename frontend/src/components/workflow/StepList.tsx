import { Layers } from 'lucide-react';
import { StepCard } from './StepCard';
import { StepConnector } from './StepConnector';
import { BranchLayout } from './BranchLayout';
import type { Flow, Milestone, Step } from '@/types';

interface StepListProps {
  workflow: Flow;
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

/**
 * Groups steps by their milestones for visual rendering.
 * Milestones act as phase markers - steps after a milestone's afterStepId
 * belong to that milestone until the next milestone.
 */
function groupStepsByMilestones(steps: Step[], milestones: Milestone[]): StepGroup[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  if (!milestones || milestones.length === 0) {
    // No milestones - return all steps ungrouped
    return [{ steps, globalStartIndex: 0 }];
  }

  // Build a map of stepId to index
  const stepIdToIndex = new Map(steps.map((s, i) => [s.stepId, i]));

  // Determine where each milestone starts (the step index AFTER which it appears)
  const milestoneStartPoints = milestones.map(m => ({
    milestone: m,
    startAfterIndex: m.afterStepId ? (stepIdToIndex.get(m.afterStepId) ?? -1) : -1,
  }));

  // Sort by start position
  milestoneStartPoints.sort((a, b) => a.startAfterIndex - b.startAfterIndex);

  const groups: StepGroup[] = [];

  // Check if there are steps before the first milestone
  const firstMilestoneStart = milestoneStartPoints.length > 0
    ? milestoneStartPoints[0].startAfterIndex + 1
    : steps.length;

  if (firstMilestoneStart > 0) {
    groups.push({
      steps: steps.slice(0, firstMilestoneStart),
      globalStartIndex: 0,
    });
  }

  // Add milestone groups
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
}

function MilestoneContainer({
  milestone,
  steps,
  globalStartIndex,
  assigneeIndices,
  isFirst,
}: MilestoneContainerProps) {
  const renderSteps = () => (
    <>
      {steps.map((step, index) => {
        const globalIndex = globalStartIndex + index;
        const assigneeIndex = step.config.assignee
          ? assigneeIndices.get(step.config.assignee) || 0
          : 0;
        const isBranchStep = hasBranchesOrOutcomes(step);

        return (
          <div key={step.stepId}>
            {/* Connector before step (except first in group, unless not first group) */}
            {(index > 0 || !isFirst) && <StepConnector showAddButton />}

            {/* Branch Layout for steps with paths/outcomes */}
            {isBranchStep ? (
              <div>
                <StepCard step={step} index={globalIndex} assigneeIndex={assigneeIndex} />
                <BranchLayout
                  step={step}
                  stepIndex={globalIndex}
                  assigneeIndices={assigneeIndices}
                />
              </div>
            ) : (
              <StepCard step={step} index={globalIndex} assigneeIndex={assigneeIndex} />
            )}
          </div>
        );
      })}
    </>
  );

  // If no milestone, render steps without container
  if (!milestone) {
    return <>{renderSteps()}</>;
  }

  // Render milestone container with dashed border (matching Moxo UI)
  return (
    <div className="relative my-2">
      {/* Milestone header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-300 rounded-t-lg">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{milestone.name}</span>
      </div>

      {/* Steps container with dashed border */}
      <div className="border border-t-0 border-dashed border-gray-300 rounded-b-lg px-4 py-3 bg-gray-50/30">
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

export function StepList({ workflow }: StepListProps) {
  const steps = workflow.steps;
  const milestones = workflow.milestones || [];

  // Group steps by milestones
  const stepGroups = groupStepsByMilestones(steps, milestones);

  // Build assignee index map for consistent colors
  const assigneeIndices = new Map<string, number>();
  workflow.assigneePlaceholders?.forEach((a, i) => {
    assigneeIndices.set(a.roleName, i);
  });

  return (
    <div className="space-y-0">
      {stepGroups.map((group, groupIndex) => (
        <MilestoneContainer
          key={group.milestone?.milestoneId || `group-${groupIndex}`}
          milestone={group.milestone}
          steps={group.steps}
          globalStartIndex={group.globalStartIndex}
          assigneeIndices={assigneeIndices}
          isFirst={groupIndex === 0}
        />
      ))}

      {/* Final connector */}
      {steps.length > 0 && <StepConnector />}

      {/* End indicator */}
      <div className="flex items-center justify-center">
        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-500 font-medium">
          End of Flow
        </div>
      </div>
    </div>
  );
}
