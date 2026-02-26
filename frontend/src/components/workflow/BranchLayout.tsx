import { Plus } from 'lucide-react';
import { StepConnector } from './StepConnector';
import { cn } from '@/lib/utils';
import type { Step, BranchPath, DecisionOutcome } from '@/types';

interface BranchLayoutProps {
  step: Step;
  stepIndex: number;
  assigneeIndices: Map<string, number>;
  allSteps?: Step[];
}

type PathOrOutcome = BranchPath | DecisionOutcome;

function getPathId(path: PathOrOutcome): string {
  return 'pathId' in path ? path.pathId : path.outcomeId;
}

export function BranchLayout({ step, stepIndex, assigneeIndices, allSteps }: BranchLayoutProps) {
  const paths = step.config?.paths || step.config?.outcomes || [];
  const isDecision = step.type === 'DECISION';
  const isParallel = step.type === 'PARALLEL_BRANCH';

  if (paths.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Branch Split Node */}
      <div className="flex flex-col items-center">
        {/* Diamond connector */}
        <div className="w-0.5 h-4 bg-gray-300" />
        <div className="relative">
          <div
            className={cn(
              'w-8 h-8 rotate-45 border-2 border-dashed flex items-center justify-center',
              isParallel ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-white'
            )}
          >
            <Plus className="w-3 h-3 -rotate-45 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Branch Columns Container */}
      <div className="relative flex justify-center">
        {/* Horizontal connecting line */}
        <div
          className="absolute top-0 h-0.5 bg-gray-300"
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
              <div key={pathId} className="flex flex-col items-center min-w-[200px]">
                {/* Vertical line from horizontal connector */}
                <div className="w-0.5 h-6 bg-gray-300" />

                {/* Branch Label */}
                <div className="text-xs text-gray-500 font-medium mb-2">
                  {path.label || `${isDecision ? 'Outcome' : 'Branch'} ${pathIndex + 1}`}
                </div>

                {/* Add button at top of branch */}
                <button className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors mb-2">
                  <Plus className="w-3 h-3" />
                </button>

                {/* Steps in this branch */}
                {pathSteps.map((nestedStep, nestedIndex) => {
                  const assigneeIndex = nestedStep.config?.assignee
                    ? assigneeIndices.get(nestedStep.config.assignee) || 0
                    : 0;

                  // Calculate step number as "parentIndex.nestedIndex"
                  const stepNumber = `${stepIndex + 1}.${nestedIndex + 1}`;

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

                  return (
                    <div key={nestedStep.stepId} className="w-full">
                      {/* Connector before step */}
                      {nestedIndex > 0 && <StepConnector showAddButton />}

                      {/* Step Card with branch-specific numbering */}
                      <BranchStepCard
                        step={nestedStep}
                        stepNumber={stepNumber}
                        assigneeIndex={assigneeIndex}
                      />
                    </div>
                  );
                })}

                {/* Connector after last step */}
                {pathSteps.length > 0 && <StepConnector showAddButton />}

                {/* Empty state for branches with no steps */}
                {pathSteps.length === 0 && (
                  <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-400">
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
            className="w-8 h-8 rotate-45 border-2 border-dashed border-green-400 bg-green-50 flex items-center justify-center"
          >
            <Plus className="w-3 h-3 -rotate-45 text-green-500" />
          </div>
          <div className="w-0.5 h-4 bg-gray-300" />
        </div>
      )}
    </div>
  );
}

// Simplified step card for branch steps with custom numbering
interface BranchStepCardProps {
  step: Step;
  stepNumber: string;
  assigneeIndex: number;
}

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StepIcon } from './StepIcon';
import { GripVertical } from 'lucide-react';
import { STEP_TYPE_META, getRoleColor, getRoleInitials } from '@/types';

function BranchStepCard({ step, stepNumber, assigneeIndex }: BranchStepCardProps) {
  const meta = STEP_TYPE_META[step.type] || {
    label: step.type,
    color: '#6b7280',
    category: 'unknown',
  };

  return (
    <Card
      className={cn(
        'relative bg-white shadow-sm hover:shadow-md transition-shadow',
        'border-l-4'
      )}
      style={{ borderLeftColor: meta.color }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div className="flex items-center mt-1 text-gray-300 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Icon */}
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${meta.color}15` }}
          >
            <StepIcon type={step.type} className="w-3.5 h-3.5" style={{ color: meta.color }} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] shrink-0"
                style={{ borderColor: meta.color, color: meta.color }}
              >
                {meta.label}
              </Badge>
              <span className="text-xs text-gray-400">Step {stepNumber}</span>
            </div>

            <h4 className="font-medium text-gray-900 mt-1 text-sm truncate">
              {step.config.name}
            </h4>

            {/* Assignee */}
            {step.config.assignee && (
              <div className="flex items-center gap-1 mt-1.5">
                <span className="text-[10px] text-gray-500">Assigned to:</span>
                <div
                  className="flex items-center gap-1 px-1 py-0.5 rounded-full text-[10px]"
                  style={{
                    backgroundColor: `${getRoleColor(assigneeIndex)}15`,
                    color: getRoleColor(assigneeIndex),
                  }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                    style={{ backgroundColor: getRoleColor(assigneeIndex) }}
                  >
                    {getRoleInitials(step.config.assignee)}
                  </span>
                  <span className="font-medium">{step.config.assignee}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
