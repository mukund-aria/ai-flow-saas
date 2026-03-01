import { useRef, useEffect, useState } from 'react';
import { Flag, Search } from 'lucide-react';
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
    label: 'Actions',
    types: ['FORM', 'QUESTIONNAIRE', 'APPROVAL', 'FILE_REQUEST', 'TODO', 'ACKNOWLEDGEMENT', 'DECISION', 'ESIGN', 'PDF_FORM'],
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
];

export function AddStepPopover({ open, onOpenChange, onSelect, onAddMilestone }: AddStepPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      return;
    }

    // Focus search input on open
    setTimeout(() => searchRef.current?.focus(), 50);

    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  if (!open) return null;

  const query = searchQuery.toLowerCase().trim();

  // Filter groups based on search
  const filteredGroups = STEP_GROUPS.map((group) => ({
    ...group,
    types: group.types.filter((type) => {
      const meta = STEP_TYPE_META[type];
      return meta.label.toLowerCase().includes(query);
    }),
  })).filter((group) => group.types.length > 0);

  const showMilestone = onAddMilestone && (!query || 'milestone'.includes(query));
  const hasResults = filteredGroups.length > 0 || showMilestone;

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 left-1/2 -translate-x-1/2 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col"
    >
      {/* Search input */}
      <div className="px-3 pt-1 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search steps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {!query && (
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Add Step
          </div>
        )}

        {hasResults ? (
          <>
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                        isComingSoon ? 'opacity-50 cursor-default' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${meta.color}15` }}
                      >
                        <StepIcon type={type} className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{meta.label}</span>
                      {isComingSoon ? (
                        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
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
            {showMilestone && (
              <div>
                <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-t border-gray-100 mt-1">
                  Layout
                </div>
                <button
                  onClick={() => {
                    onAddMilestone!();
                    onOpenChange(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
                    <Flag className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">Milestone</span>
                  <div className="w-2 h-2 rounded-full ml-auto shrink-0 bg-gray-400" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-400">No steps match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
