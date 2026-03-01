import { useRef, useEffect } from 'react';
import { Flag } from 'lucide-react';
import { StepIcon } from './StepIcon';
import { STEP_TYPE_META } from '@/types';
import type { StepType } from '@/types';

interface AddStepPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (stepType: StepType) => void;
  onAddMilestone?: () => void;
}

interface StepGroup {
  label: string;
  types: StepType[];
}

const STEP_GROUPS: StepGroup[] = [
  {
    label: 'Human Actions',
    types: ['FORM', 'QUESTIONNAIRE', 'APPROVAL', 'FILE_REQUEST', 'TODO', 'ACKNOWLEDGEMENT', 'DECISION', 'ESIGN', 'PDF_FORM'],
  },
  {
    label: 'Control Flow',
    types: ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT', 'GOTO_DESTINATION', 'GOTO', 'TERMINATE', 'SUB_FLOW'],
  },
  {
    label: 'Automations',
    types: ['SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE', 'BUSINESS_RULE', 'AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE', 'REST_API', 'MCP_SERVER'],
  },
];

export function AddStepPopover({ open, onOpenChange, onSelect, onAddMilestone }: AddStepPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 left-1/2 -translate-x-1/2 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Add Step
      </div>
      {STEP_GROUPS.map((group) => (
        <div key={group.label}>
          <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">
            {group.label}
          </div>
          {group.types.map((type) => {
            const meta = STEP_TYPE_META[type];
            const isComingSoon = type === 'ESIGN' || type === 'AI_TRANSCRIBE';
            return (
              <button
                key={type}
                onClick={() => {
                  if (isComingSoon) return;
                  onSelect(type);
                  onOpenChange(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 transition-colors text-left ${
                  isComingSoon ? 'opacity-50 cursor-default' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${meta.color}15` }}
                >
                  <StepIcon type={type} className="w-3.5 h-3.5" style={{ color: meta.color }} />
                </div>
                <span className="text-sm text-gray-700 font-medium">{meta.label}</span>
                {isComingSoon ? (
                  <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                    Soon
                  </span>
                ) : (
                  <div
                    className="w-2 h-2 rounded-full ml-auto shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      ))}

      {/* Layout section */}
      {onAddMilestone && (
        <div>
          <div className="px-3 py-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">
            Layout
          </div>
          <button
            onClick={() => {
              onAddMilestone();
              onOpenChange(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
              <Flag className="w-3.5 h-3.5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-700 font-medium">Milestone</span>
            <div className="w-2 h-2 rounded-full ml-auto shrink-0 bg-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
