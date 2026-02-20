/**
 * Step Palette Sidebar
 *
 * Persistent left sidebar in manual mode showing categorized step types.
 * Items are draggable — drop onto the canvas to insert at a specific position.
 * Click a step type to append it to the end of the flow.
 * "Add with AI..." button switches to AI mode.
 */

import { Sparkles } from 'lucide-react';
import { StepIcon } from './StepIcon';
import { STEP_TYPE_META } from '@/types';
import type { StepType } from '@/types';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useDraggable } from '@dnd-kit/core';

interface StepPaletteProps {
  onSwitchToAI: () => void;
}

interface StepGroup {
  label: string;
  types: StepType[];
}

const STEP_GROUPS: StepGroup[] = [
  {
    label: 'Actions',
    types: ['FORM', 'QUESTIONNAIRE', 'TODO', 'FILE_REQUEST', 'APPROVAL', 'ACKNOWLEDGEMENT', 'DECISION', 'ESIGN'],
  },
  {
    label: 'Flow control',
    types: ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT'],
  },
  {
    label: 'Automations',
    types: ['SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'AI_AUTOMATION'],
  },
];

function DraggablePaletteItem({ type }: { type: StepType }) {
  const meta = STEP_TYPE_META[type];
  const { addStep } = useWorkflowStore();
  const workflow = useWorkflowStore((s) => s.workflow);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { type: 'palette-item', stepType: type },
  });

  const handleClick = () => {
    const insertIndex = workflow?.steps?.length ?? 0;
    addStep(insertIndex, type);
  };

  return (
    <button
      ref={setNodeRef}
      onClick={handleClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left group cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-40' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta.color}15` }}
      >
        <StepIcon type={type} className="w-3.5 h-3.5" style={{ color: meta.color }} />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{meta.label}</span>
      <div
        className="w-1.5 h-1.5 rounded-full ml-auto shrink-0 opacity-60"
        style={{ backgroundColor: meta.color }}
      />
    </button>
  );
}

export function StepPalette({ onSwitchToAI }: StepPaletteProps) {
  return (
    <div className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Add to flow
        </h3>
      </div>

      {/* AI Button */}
      <div className="px-3 pb-2">
        <button
          onClick={onSwitchToAI}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Add with AI...
        </button>
      </div>

      {/* Step types list */}
      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {STEP_GROUPS.map((group) => (
          <div key={group.label} className="mt-2">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {group.label}
            </div>
            {group.types.map((type) => (
              <DraggablePaletteItem key={type} type={type} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
