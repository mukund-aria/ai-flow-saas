import { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface ThinkingIndicatorProps {
  status?: 'thinking' | 'analyzing' | 'creating' | 'editing' | 'refining';
}

// Progress steps for each mode - designed to feel like a real SE thinking through the problem
// Inspired by Claude Code's creative, varied status messages
const STATUS_CONFIG: Record<string, { steps: string[] }> = {
  thinking: {
    steps: [
      'Pondering the possibilities...',
      'Mulling this over...',
      'Chewing on that...',
      'Connecting the dots...',
      'Piecing things together...',
      'Letting ideas percolate...',
      'Noodling on this...',
      'Giving this some thought...',
      'Turning this over in my mind...',
      'Considering the angles...',
    ]
  },
  analyzing: {
    steps: [
      'Squinting at the diagram...',
      'Tracing the flow lines...',
      'Decoding the shapes...',
      'Spotting the decision points...',
      'Mapping roles to swimlanes...',
      'Translating visual to logical...',
      'Extracting the essence...',
    ]
  },
  creating: {
    steps: [
      'Sketching the blueprint...',
      'Drafting the flow...',
      'Weaving the steps together...',
      'Assigning the right people...',
      'Adding the finishing touches...',
      'Building something beautiful...',
      'Architecting your workflow...',
      'Crafting the perfect process...',
    ]
  },
  editing: {
    steps: [
      'Reviewing the current setup...',
      'Mapping out the changes...',
      'Rearranging the pieces...',
      'Polishing the edges...',
      'Making it just right...',
      'Fine-tuning the details...',
      'Applying the tweaks...',
    ]
  },
  refining: {
    steps: [
      'Absorbing your input...',
      'Incorporating the feedback...',
      'Shaping the workflow...',
      'Dialing it in...',
      'Making it shine...',
      'Bringing it all together...',
    ]
  },
};

export function ThinkingIndicator({ status = 'thinking' }: ThinkingIndicatorProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.thinking;
  const steps = config.steps;

  // Progress through steps over time
  useEffect(() => {
    if (steps.length <= 1) return;

    // For 'thinking' status, loop through steps; for others, stop at last step
    const shouldLoop = status === 'thinking';

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        const next = prev + 1;
        if (next < steps.length) {
          // Only add if not already in completed (prevents duplicates from re-renders)
          if (!shouldLoop) {
            setCompletedSteps(completed => {
              if (completed.includes(prev)) {
                return completed;
              }
              return [...completed, prev];
            });
          }
          return next;
        }
        // Loop back for 'thinking', stay on last for others
        return shouldLoop ? 0 : prev;
      });
    }, 1800); // Move to next step every 1.8 seconds

    return () => clearInterval(interval);
  }, [steps.length, status]);

  // Reset when status changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setCompletedSteps([]);
  }, [status]);

  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Progress display */}
      <div className="flex-1 max-w-sm">
        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md">
          {/* Show completed steps */}
          {completedSteps.length > 0 && (
            <div className="space-y-1 mb-2">
              {completedSteps.slice(-2).map((stepIdx) => (
                <div key={stepIdx} className="flex items-center gap-2 text-sm text-gray-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span>{steps[stepIdx]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Current step with animation */}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
            </div>
            <span className="text-base text-gray-600 font-medium">
              {steps[currentStepIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
