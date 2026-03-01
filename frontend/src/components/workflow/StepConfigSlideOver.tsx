/**
 * Step Config Slide-Over
 *
 * Right-side slide-over panel for step configuration.
 * Wraps the existing StepConfigPanel in a slide-over that matches
 * the RoleConfigPanel and FlowStartConfigPanel patterns.
 */

import { X } from 'lucide-react';
import { StepIcon } from './StepIcon';
import { StepConfigPanel } from './StepConfigPanel';
import { useWorkflowStore } from '@/stores/workflowStore';
import { STEP_TYPE_META } from '@/types';

interface StepConfigSlideOverProps {
  stepId: string;
  onClose: () => void;
}

export function StepConfigSlideOver({ stepId, onClose }: StepConfigSlideOverProps) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const { updateStep } = useWorkflowStore();

  if (!workflow) return null;

  const step = workflow.steps.find((s) => s.stepId === stepId);
  if (!step) return null;

  const meta = STEP_TYPE_META[step.type] || {
    label: step.type,
    color: '#6b7280',
    category: 'unknown',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${meta.color}15` }}
        >
          <StepIcon type={step.type} className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {step.config.name || 'Untitled Step'}
          </h3>
          <p className="text-xs text-gray-500">{meta.label}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body — scrollable config form */}
      <div className="flex-1 overflow-y-auto">
        <StepConfigPanel
          step={step}
          roles={workflow.roles || []}
          onSave={(sid, updates) => {
            updateStep(sid, updates);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
