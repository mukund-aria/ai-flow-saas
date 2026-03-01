/**
 * Step Palette Sidebar
 *
 * Persistent left sidebar in manual mode showing categorized step types.
 * Items are draggable — drop onto the canvas to insert at a specific position.
 * Click a step type to append it to the end of the flow.
 * "Add with AI..." button switches to AI mode.
 *
 * Groups: Actions, AI, Automations, Layout, Integrations
 */

import { useState } from 'react';
import { Sparkles, Flag, ChevronDown, ChevronRight } from 'lucide-react';
import { StepIcon } from './StepIcon';
import { STEP_TYPE_META } from '@/types';
import type { StepType } from '@/types';
import { useWorkflowStore } from '@/stores/workflowStore';
import { useDraggable } from '@dnd-kit/core';
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';

interface StepPaletteProps {
  onSwitchToAI: () => void;
}

interface StepGroup {
  label: string;
  types: StepType[];
  hasMilestone?: boolean;
}

const STEP_GROUPS: StepGroup[] = [
  {
    label: 'Actions',
    types: ['FORM', 'QUESTIONNAIRE', 'TODO', 'FILE_REQUEST', 'APPROVAL', 'ACKNOWLEDGEMENT', 'DECISION', 'ESIGN', 'PDF_FORM'],
  },
  {
    label: 'AI',
    types: ['AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE'],
  },
  {
    label: 'Automations',
    types: ['SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE', 'BUSINESS_RULE', 'REST_API', 'MCP_SERVER'],
  },
  {
    label: 'Controls',
    types: ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT', 'GOTO_DESTINATION', 'GOTO', 'TERMINATE', 'SUB_FLOW'],
  },
  {
    label: 'Layout',
    types: [],
    hasMilestone: true,
  },
];

// Step types that are not yet fully implemented
const COMING_SOON_TYPES = new Set<StepType>(['ESIGN']);

function DraggablePaletteItem({ type }: { type: StepType }) {
  const meta = STEP_TYPE_META[type];
  const { addStep } = useWorkflowStore();
  const workflow = useWorkflowStore((s) => s.workflow);
  const isComingSoon = COMING_SOON_TYPES.has(type);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { type: 'palette-item', stepType: type },
    disabled: isComingSoon,
  });

  const handleClick = () => {
    if (isComingSoon) return;
    const insertIndex = workflow?.steps?.length ?? 0;
    addStep(insertIndex, type);
  };

  return (
    <button
      ref={setNodeRef}
      onClick={handleClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors text-left group ${
        isComingSoon
          ? 'opacity-50 cursor-default'
          : 'hover:bg-gray-50 cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-40' : ''}`}
      {...(isComingSoon ? {} : { ...listeners, ...attributes })}
    >
      <div
        className="w-6 h-6 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta.color}15` }}
      >
        <StepIcon type={type} className="w-3.5 h-3.5" style={{ color: meta.color }} />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{meta.label}</span>
      {isComingSoon ? (
        <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
          Soon
        </span>
      ) : (
        <div
          className="w-1.5 h-1.5 rounded-full ml-auto shrink-0 opacity-60"
          style={{ backgroundColor: meta.color }}
        />
      )}
    </button>
  );
}

function MilestonePaletteItem() {
  const { addMilestone } = useWorkflowStore();
  const workflow = useWorkflowStore((s) => s.workflow);

  const handleClick = () => {
    const lastIndex = (workflow?.steps?.length ?? 1) - 1;
    addMilestone(lastIndex);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors text-left group"
    >
      <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-gray-100">
        <Flag className="w-3.5 h-3.5 text-gray-600" />
      </div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">Milestone</span>
      <div className="w-1.5 h-1.5 rounded-full ml-auto shrink-0 opacity-60 bg-gray-400" />
    </button>
  );
}

const GROUP_TOOLTIPS: Record<string, string> = {
  Actions: 'Steps that require a person to do something — fill a form, approve, upload files.',
  AI: 'AI-powered steps that run automatically — extract data, summarize, generate content.',
  Automations: 'System steps that execute without human input — send emails, call APIs, apply business rules.',
  Controls: 'Flow logic — conditional branching, parallel paths, loops, and sub-flows.',
};

export function StepPalette({ onSwitchToAI }: StepPaletteProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

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
        {STEP_GROUPS.map((group) => {
          const isCollapsed = collapsedGroups.has(group.label);

          return (
            <div key={group.label} className="mt-2">
              {/* Collapsible group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                ) : (
                  <ChevronDown className="w-3 h-3 shrink-0" />
                )}
                {GROUP_TOOLTIPS[group.label] ? (
                  <FeatureTooltip content={GROUP_TOOLTIPS[group.label]} side="right">
                    <span>{group.label}</span>
                  </FeatureTooltip>
                ) : (
                  group.label
                )}
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <>
                  {group.types.map((type) => (
                    <DraggablePaletteItem key={type} type={type} />
                  ))}
                  {group.hasMilestone && <MilestonePaletteItem />}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
