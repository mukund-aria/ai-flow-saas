/**
 * Flow Preview Timeline
 *
 * Compact vertical timeline showing steps with type icons and role indicators.
 * Used in the ExecuteFlowDialog to preview the flow structure.
 */

import { StepIcon } from './StepIcon';
import { getRoleColor } from '@/types';
import type { AssigneePlaceholder } from '@/types';

interface FlowPreviewTimelineProps {
  steps: Array<{
    stepId: string;
    type: string;
    config?: {
      name?: string;
      assignee?: string;
    };
  }>;
  assigneePlaceholders: AssigneePlaceholder[];
}

export function FlowPreviewTimeline({ steps, assigneePlaceholders }: FlowPreviewTimelineProps) {
  const roleColorMap = new Map<string, string>();
  assigneePlaceholders.forEach((p, i) => {
    roleColorMap.set(p.roleName, getRoleColor(i));
  });

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const roleName = step.config?.assignee;
        const roleColor = roleName ? roleColorMap.get(roleName) : undefined;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.stepId} className="flex items-center gap-2.5 relative">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <StepIcon type={step.type as any} className="w-3.5 h-3.5 text-gray-400" />
              </div>
              {!isLast && (
                <div className="w-px h-2 bg-gray-200" />
              )}
            </div>

            {/* Step name */}
            <span className="text-xs text-gray-600 truncate flex-1 py-1">
              {step.config?.name || `Step ${index + 1}`}
            </span>

            {/* Role color dot */}
            {roleColor && (
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: roleColor }}
                title={roleName}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
