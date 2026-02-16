/**
 * Animated Workflow Panel
 *
 * Reveals workflow steps one-by-one with staggered animations.
 * Reuses existing StepCard and FlowStartCard components.
 */

import { useState, useEffect } from 'react';
import { StepCard } from '@/components/workflow/StepCard';
import { FlowStartCard } from '@/components/workflow/FlowStartCard';
import { StepConnector } from '@/components/workflow/StepConnector';
import type { Flow } from '@/types';

interface AnimatedWorkflowPanelProps {
  workflow: Flow;
  isBuilding?: boolean;
}

export function AnimatedWorkflowPanel({ workflow, isBuilding }: AnimatedWorkflowPanelProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Reveal steps one by one
  useEffect(() => {
    if (!workflow?.steps?.length) return;

    // Start from 0 and reveal one at a time
    setVisibleCount(0);
    const totalSteps = workflow.steps.length;

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= totalSteps) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [workflow]);

  if (!workflow) return null;

  const visibleSteps = workflow.steps?.slice(0, visibleCount) || [];
  const allRevealed = visibleCount >= (workflow.steps?.length || 0);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Flow Start */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <FlowStartCard
          parameters={workflow.parameters}
          triggerConfig={workflow.triggerConfig}
        />
      </div>

      {visibleSteps.length > 0 && <StepConnector />}

      {/* Steps */}
      <div className="space-y-3">
        {visibleSteps.map((step, index) => (
          <div
            key={step.stepId || index}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StepCard
              step={step}
              index={index}
              assigneePlaceholders={workflow.assigneePlaceholders}
            />
            {index < visibleSteps.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-0.5 h-4 bg-gray-200" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Building indicator */}
      {(isBuilding || !allRevealed) && (
        <div className="flex items-center justify-center py-6 gap-2 text-violet-600">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm font-medium">Building workflow...</span>
        </div>
      )}
    </div>
  );
}
