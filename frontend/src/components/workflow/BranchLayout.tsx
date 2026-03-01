import { Plus, GitFork, LayoutGrid, GitMerge } from 'lucide-react';
import { StepConnector } from './StepConnector';
import { StepCard } from './StepCard';
import { cn } from '@/lib/utils';
import type { Step, BranchPath, DecisionOutcome, ChangeInfo } from '@/types';
import { getStepChangeStatus } from '@/lib/proposal-utils';

interface BranchLayoutProps {
  step: Step;
  stepIndex: number;
  assigneeIndices: Map<string, number>;
  allSteps?: Step[];
  /** Nesting depth for step numbering (0 = top level) */
  depth?: number;
  /** Parent step number prefix, e.g. "9" so children become "9.1", "9.2" */
  parentNumber?: string;
  editMode?: boolean;
  roles?: Step['config']['assignee'][];
  /** Change info map for proposal mode diff badges */
  proposalChangeMap?: Map<string, ChangeInfo>;
  /** Callback when a step is clicked in edit mode */
  onStepClick?: (stepId: string) => void;
}

type PathOrOutcome = BranchPath | DecisionOutcome;

function getPathId(path: PathOrOutcome): string {
  return 'pathId' in path ? path.pathId : path.outcomeId;
}

function hasBranchesOrOutcomes(step: Step): boolean {
  const hasPaths = !!(step.config?.paths && Array.isArray(step.config.paths) && step.config.paths.length > 0);
  const hasOutcomes = !!(step.config?.outcomes && Array.isArray(step.config.outcomes) && step.config.outcomes.length > 0);
  return hasPaths || hasOutcomes;
}

const MAX_DEPTH = 3;

export function BranchLayout({
  step,
  stepIndex,
  assigneeIndices,
  allSteps,
  depth = 0,
  parentNumber,
  editMode,
  roles,
  proposalChangeMap,
  onStepClick,
}: BranchLayoutProps) {
  const paths = step.config?.paths || step.config?.outcomes || [];
  const isParallel = step.type === 'PARALLEL_BRANCH';
  const isDecision = step.type === 'DECISION';
  const baseNumber = parentNumber || String(stepIndex + 1);

  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Branch Split Node */}
      <div className="flex flex-col items-center">
        {/* Diamond connector */}
        <div className="w-[2px] h-4 bg-gray-300" />
        <div className="relative">
          <div
            className={cn(
              'w-10 h-10 rotate-45 border-2 border-dashed flex items-center justify-center shadow-sm',
              isParallel ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white'
            )}
          >
            {step.type === 'SINGLE_CHOICE_BRANCH' ? (
              <GitFork className="w-4 h-4 -rotate-45 text-gray-500" />
            ) : (
              <LayoutGrid className="w-4 h-4 -rotate-45 text-gray-500" />
            )}
          </div>
        </div>
      </div>

      {/* Branch Columns Container */}
      <div className="relative flex justify-center">
        {/* Horizontal connecting line */}
        <div
          className="absolute top-0 h-[2px] bg-gray-300"
          style={{
            left: `${100 / (paths.length * 2)}%`,
            right: `${100 / (paths.length * 2)}%`,
          }}
        />

        {/* Branch Columns */}
        <div className="flex gap-4 pt-0">
          {paths.map((path, pathIndex) => {
            const pathSteps = path.steps || [];
            const pathId = getPathId(path);

            return (
              <div key={pathId} className="flex flex-col items-center min-w-[340px]">
                {/* Vertical line from horizontal connector */}
                <div className="w-[2px] h-8 bg-gray-300" />

                {/* Branch Label */}
                <div className="text-gray-600 text-sm font-medium px-3 py-1 mb-2">
                  {path.label || `${isDecision ? 'Outcome' : 'Branch'} ${pathIndex + 1}`}
                </div>

                {/* Add button at top of branch */}
                <button className="w-7 h-7 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors mb-2">
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Steps in this branch */}
                {pathSteps.map((nestedStep, nestedIndex) => {
                  const assigneeIndex = nestedStep.config?.assignee
                    ? assigneeIndices.get(nestedStep.config.assignee) || 0
                    : 0;

                  // Build nested step number: "9.1", "9.1.1", etc.
                  const nestedStepNumber = `${baseNumber}.${nestedIndex + 1}`;

                  // GoTo — render as compact gold circle matching target label
                  if (nestedStep.type === 'GOTO') {
                    const targetDest = allSteps?.find(s => s.stepId === nestedStep.config?.targetStepId);
                    const label = targetDest?.config?.name?.replace('Point ', '') || '?';
                    return (
                      <div key={nestedStep.stepId} className="w-full">
                        {nestedIndex > 0 && <StepConnector showAddButton />}
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-sm" title={`Go To ${targetDest?.config?.name || 'destination'}`}>
                            {label}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // GoTo Destination inside branch (rare but handle it)
                  if (nestedStep.type === 'GOTO_DESTINATION') {
                    return (
                      <div key={nestedStep.stepId} className="w-full">
                        {nestedIndex > 0 && <StepConnector showAddButton />}
                        <div className="flex justify-center">
                          <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-amber-700 font-bold text-sm">
                            {nestedStep.config?.name?.replace('Point ', '') || '?'}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const nestedHasBranches = hasBranchesOrOutcomes(nestedStep);

                  return (
                    <div key={nestedStep.stepId} className="w-full">
                      {/* Connector before step */}
                      {nestedIndex > 0 && <StepConnector showAddButton />}

                      {/* Step Card — same component as main steps */}
                      <div className="flex justify-center">
                        <StepCard
                          step={nestedStep}
                          index={nestedIndex}
                          assigneeIndex={assigneeIndex}
                          stepNumber={nestedStepNumber}
                          editMode={editMode}
                          changeStatus={proposalChangeMap ? getStepChangeStatus(nestedStep, proposalChangeMap) : undefined}
                          onStepClick={onStepClick}
                        />
                      </div>

                      {/* Recursive: if this nested step has branches, render them */}
                      {nestedHasBranches && depth < MAX_DEPTH && (
                        <BranchLayout
                          step={nestedStep}
                          stepIndex={nestedIndex}
                          assigneeIndices={assigneeIndices}
                          allSteps={allSteps}
                          depth={depth + 1}
                          parentNumber={nestedStepNumber}
                          editMode={editMode}
                          roles={roles}
                          proposalChangeMap={proposalChangeMap}
                          onStepClick={onStepClick}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Connector after last step */}
                {pathSteps.length > 0 && <StepConnector showAddButton />}

                {/* Empty state for branches with no steps */}
                {pathSteps.length === 0 && (
                  <div className="w-full p-4 border-2 border-dashed border-gray-300 bg-white/80 rounded-lg py-6 text-center text-sm text-gray-400">
                    No steps yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Merge Node (only for parallel branches) */}
      {isParallel && paths.length > 0 && (
        <div className="flex flex-col items-center mt-2">
          <div
            className="w-10 h-10 rotate-45 border-2 border-dashed border-green-400 bg-green-50 flex items-center justify-center shadow-sm"
          >
            <GitMerge className="w-4 h-4 -rotate-45 text-green-500" />
          </div>
          <div className="w-[2px] h-4 bg-gray-300" />
        </div>
      )}
    </div>
  );
}
