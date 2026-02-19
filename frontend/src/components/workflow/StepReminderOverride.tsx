import { useState } from 'react';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';

interface DueUnit {
  value: number;
  unit: 'HOURS' | 'DAYS' | 'WEEKS';
}

interface ReminderConfig {
  enabled: boolean;
  firstReminderBefore: DueUnit;
  repeatAfterDue: boolean;
  repeatInterval: DueUnit;
  maxReminders: number;
}

interface EscalationConfig {
  enabled: boolean;
  escalateAfter: DueUnit;
  escalateTo: 'COORDINATOR' | 'CUSTOM_EMAIL';
  customEmail?: string;
}

interface StepReminderOverrideData {
  useFlowDefaults: boolean;
  reminder?: ReminderConfig;
  escalation?: EscalationConfig;
}

interface StepReminderOverrideProps {
  value?: StepReminderOverrideData;
  onChange: (value: StepReminderOverrideData) => void;
}

export function StepReminderOverride({ value, onChange }: StepReminderOverrideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const overrideData: StepReminderOverrideData = value || { useFlowDefaults: true };
  const useDefaults = overrideData.useFlowDefaults;

  const summaryText = useDefaults
    ? 'Reminders: 24h before due | Escalation: 48h overdue to coordinator'
    : 'Custom reminder settings';

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-3.5 h-3.5 text-gray-400" />
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span className="flex-1 text-xs font-medium text-gray-600">Reminder & Escalation</span>
      </button>

      {!isExpanded && (
        <div className="px-3 pb-2">
          <p className="text-xs text-gray-400">{summaryText}</p>
        </div>
      )}

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3">
          <label className="flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={useDefaults}
              onChange={(e) =>
                onChange({
                  ...overrideData,
                  useFlowDefaults: e.target.checked,
                })
              }
              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            Use flow defaults
          </label>

          {!useDefaults && (
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Custom reminder and escalation settings for this step. Configure in the flow-level
                Notifications & Reminders settings for defaults.
              </p>
              {/* Full custom controls would go here - for now show a message */}
              <p className="text-xs text-gray-400 italic">
                Step-level custom reminders coming soon. Flow defaults will be used.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
