/**
 * Journey Panel
 *
 * Slide-over panel showing all steps in the flow with their statuses.
 * Allows assignees to see where they are in the full journey.
 */

import { X, CheckCircle2 } from 'lucide-react';
import { getStepTypeIcon, getStepTypeLabel } from './utils';
import type { JourneyStep } from '@/types';

interface JourneyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  journeySteps: JourneyStep[];
  currentStepIndex: number;
  onSelectStep: (stepIndex: number) => void;
}

function getStatusLabel(step: JourneyStep): string {
  if (step.status === 'COMPLETED') return 'Completed';
  if (step.status === 'IN_PROGRESS') return 'In Progress';
  return 'Pending';
}

export function JourneyPanel({ isOpen, onClose, journeySteps, currentStepIndex, onSelectStep }: JourneyPanelProps) {
  if (!isOpen) return null;

  const completedCount = journeySteps.filter(s => s.status === 'COMPLETED').length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Flow Journey</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {journeySteps.length > 0
                ? `${completedCount} of ${journeySteps.length} completed`
                : 'No steps yet'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${journeySteps.length > 0 ? (completedCount / journeySteps.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Step list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {journeySteps.map((step) => {
            const isCurrent = step.stepIndex === currentStepIndex;
            const isClickable = step.assignedToMe;
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';

            return (
              <button
                key={step.stepIndex}
                onClick={() => isClickable ? onSelectStep(step.stepIndex) : undefined}
                disabled={!isClickable}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  isCurrent ? 'bg-blue-50 ring-1 ring-blue-200' :
                  isClickable ? 'hover:bg-gray-50 cursor-pointer' :
                  'cursor-default'
                }`}
              >
                {/* Step number / status circle */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isCompleted ? 'bg-green-100 text-green-600' :
                  isInProgress ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-300' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.stepIndex + 1
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      isCompleted ? 'text-gray-700' :
                      isInProgress ? 'text-blue-800' :
                      'text-gray-500'
                    }`}>
                      {step.stepName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-3.5 h-3.5 opacity-60">
                      {getStepTypeIcon(step.stepType, 'w-3.5 h-3.5 text-gray-400')}
                    </div>
                    <span className="text-xs text-gray-400">
                      {getStepTypeLabel(step.stepType)}
                    </span>
                  </div>
                  {!step.assignedToMe && step.status !== 'COMPLETED' && (
                    <p className="text-xs text-gray-400 mt-0.5 italic">
                      Assigned to another participant
                    </p>
                  )}
                </div>

                {/* Status label */}
                <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 mt-1 ${
                  isCompleted ? 'text-green-500' :
                  isInProgress ? 'text-blue-500' :
                  'text-gray-300'
                }`}>
                  {getStatusLabel(step)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
