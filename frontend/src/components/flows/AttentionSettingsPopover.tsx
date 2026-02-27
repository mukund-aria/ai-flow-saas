/**
 * AttentionSettingsPopover — Gear icon that opens a popover
 * letting coordinators configure which attention reasons they care about.
 */

import { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import type { AttentionSettings } from '@/hooks/useAttentionSettings';

interface AttentionSettingsPopoverProps {
  settings: AttentionSettings;
  onUpdate: <K extends keyof AttentionSettings>(key: K, value: AttentionSettings[K]) => void;
  onReset: () => void;
}

export function AttentionSettingsPopover({ settings, onUpdate, onReset }: AttentionSettingsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        title="Attention settings"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-3 px-4 z-50 w-[260px]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            What needs your attention?
          </p>

          {/* ACTIONS */}
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1.5">
            Actions
          </p>
          <Checkbox
            label="Your turn"
            checked={settings.yourTurn}
            onChange={(v) => onUpdate('yourTurn', v)}
          />
          <Checkbox
            label="Your action overdue"
            checked={settings.yourActionOverdue}
            onChange={(v) => onUpdate('yourActionOverdue', v)}
          />

          {/* FLOW */}
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1.5">
            Flow
          </p>
          <Checkbox
            label="Overdue"
            checked={settings.flowOverdue}
            onChange={(v) => onUpdate('flowOverdue', v)}
          />
          <Checkbox
            label="Off-Track"
            checked={settings.offTrack}
            onChange={(v) => onUpdate('offTrack', v)}
          />

          {/* MESSAGES */}
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1.5">
            Messages
          </p>
          <RadioOption
            label="All new"
            selected={settings.messageFilter === 'all_new'}
            onChange={() => onUpdate('messageFilter', 'all_new')}
          />
          <RadioOption
            label="All unresolved"
            selected={settings.messageFilter === 'all_unresolved'}
            onChange={() => onUpdate('messageFilter', 'all_unresolved')}
          />
          <RadioOption
            label="@mentions only"
            selected={settings.messageFilter === 'mentions_only'}
            onChange={() => onUpdate('messageFilter', 'mentions_only')}
          />
          <RadioOption
            label="None"
            selected={settings.messageFilter === 'none'}
            onChange={() => onUpdate('messageFilter', 'none')}
          />

          {/* Reset */}
          <div className="border-t border-gray-100 mt-3 pt-2">
            <button
              onClick={onReset}
              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-1 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

function RadioOption({ label, selected, onChange }: { label: string; selected: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer group">
      <input
        type="radio"
        checked={selected}
        onChange={onChange}
        className="w-3.5 h-3.5 border-gray-300 text-violet-600 focus:ring-violet-500 focus:ring-1 cursor-pointer"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}
