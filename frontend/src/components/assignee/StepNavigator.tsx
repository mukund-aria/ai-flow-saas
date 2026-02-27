/**
 * Step Navigator
 *
 * Milestone badge, prev/next buttons, step counter, and progress dots.
 */

import { ChevronLeft, ChevronRight, List } from 'lucide-react';

interface StepNavigatorProps {
  stepIndex: number;
  totalSteps: number;
  milestoneName?: string;
  onPrev: () => void;
  onNext: () => void;
  onToggleJourney: () => void;
}

export function StepNavigator({
  stepIndex,
  totalSteps,
  milestoneName,
  onPrev,
  onNext,
  onToggleJourney,
}: StepNavigatorProps) {
  return (
    <div className="py-4">
      {milestoneName && (
        <div className="text-center mb-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-violet-700 bg-violet-50 rounded-full">
            {milestoneName}
          </span>
        </div>
      )}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onPrev}
          className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">Step {stepIndex}/{totalSteps}</span>
          <button
            onClick={onToggleJourney}
            className="p-0.5 rounded hover:bg-gray-100 transition-colors"
            title="View all steps"
          >
            <List className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
        <button
          onClick={onNext}
          className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {/* Step progress dots */}
      {totalSteps > 1 && totalSteps <= 20 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i + 1 < stepIndex
                  ? 'bg-green-400'
                  : i + 1 === stepIndex
                  ? 'bg-blue-500 ring-2 ring-blue-200'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
