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

// Control flow step types to hide in preview mode
const CONTROL_FLOW_TYPES = new Set([
  'GOTO', 'GOTO_DESTINATION', 'TERMINATE', 'WAIT', 'SUB_FLOW',
]);

interface AnimatedWorkflowPanelProps {
  workflow: Flow;
  isBuilding?: boolean;
  /** Hide GOTO, GOTO_DESTINATION, TERMINATE etc. from preview */
  hideControlFlow?: boolean;
}

export function AnimatedWorkflowPanel({ workflow, isBuilding, hideControlFlow }: AnimatedWorkflowPanelProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  // Reveal steps one by one
  useEffect(() => {
    if (!workflow?.steps?.length) return;

    // Start from 0 and reveal one at a time
    setVisibleCount(0);
    const stepsToShow = hideControlFlow
      ? workflow.steps.filter(s => !CONTROL_FLOW_TYPES.has(s.type))
      : workflow.steps;
    const totalSteps = stepsToShow.length;

    let current = 0;
    const timer = setInterval(() => {
      current++;
      setVisibleCount(current);
      if (current >= totalSteps) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [workflow, hideControlFlow]);

  if (!workflow) return null;

  // Filter out control flow steps if requested (cleaner preview for public page)
  const allSteps = hideControlFlow
    ? (workflow.steps || []).filter(s => !CONTROL_FLOW_TYPES.has(s.type))
    : (workflow.steps || []);

  const visibleSteps = allSteps.slice(0, visibleCount);
  const allRevealed = visibleCount >= allSteps.length;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Flow Start */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <FlowStartCard workflow={workflow} />
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
              roles={workflow.roles}
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
