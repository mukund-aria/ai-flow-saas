import { useState } from 'react';
import { Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';

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

interface CoordinatorNotificationPrefs {
  stepCompleted: boolean;
  stepOverdue: boolean;
  flowCompleted: boolean;
  flowStalled: boolean;
  dailyDigest: boolean;
}

interface FlowNotificationSettings {
  defaultReminder: ReminderConfig;
  escalation: EscalationConfig;
  coordinatorNotifications: CoordinatorNotificationPrefs;
}

const defaultSettings: FlowNotificationSettings = {
  defaultReminder: {
    enabled: true,
    firstReminderBefore: { value: 24, unit: 'HOURS' },
    repeatAfterDue: true,
    repeatInterval: { value: 24, unit: 'HOURS' },
    maxReminders: 3,
  },
  escalation: {
    enabled: true,
    escalateAfter: { value: 48, unit: 'HOURS' },
    escalateTo: 'COORDINATOR',
  },
  coordinatorNotifications: {
    stepCompleted: true,
    stepOverdue: true,
    flowCompleted: true,
    flowStalled: true,
    dailyDigest: false,
  },
};

function DueUnitInput({ value, onChange }: { value: DueUnit; onChange: (v: DueUnit) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={1}
        value={value.value}
        onChange={(e) => onChange({ ...value, value: parseInt(e.target.value) || 1 })}
        className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
      />
      <select
        value={value.unit}
        onChange={(e) => onChange({ ...value, unit: e.target.value as 'HOURS' | 'DAYS' | 'WEEKS' })}
        className="px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
      >
        <option value="HOURS">hours</option>
        <option value="DAYS">days</option>
        <option value="WEEKS">weeks</option>
      </select>
    </div>
  );
}

export function FlowNotificationSettingsPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateSettings = useWorkflowStore((s) => s.updateNotificationSettings);

  const settings: FlowNotificationSettings =
    (workflow?.settings as { notifications?: FlowNotificationSettings } | undefined)?.notifications || defaultSettings;

  const update = (partial: Partial<FlowNotificationSettings>) => {
    updateSettings({ ...settings, ...partial });
  };

  const updateReminder = (partial: Partial<ReminderConfig>) => {
    update({ defaultReminder: { ...settings.defaultReminder, ...partial } });
  };

  const updateEscalation = (partial: Partial<EscalationConfig>) => {
    update({ escalation: { ...settings.escalation, ...partial } });
  };

  const updateCoordinator = (partial: Partial<CoordinatorNotificationPrefs>) => {
    update({ coordinatorNotifications: { ...settings.coordinatorNotifications, ...partial } });
  };

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-4 h-4 text-violet-500" />
        <span className="flex-1 text-sm font-medium text-gray-900">Notifications & Reminders</span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-5">
          {/* Reminders Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reminders</h4>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.defaultReminder.enabled}
                onChange={(e) => updateReminder({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Send reminders for tasks with due dates
            </label>

            {settings.defaultReminder.enabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Send first reminder</span>
                  <DueUnitInput
                    value={settings.defaultReminder.firstReminderBefore}
                    onChange={(v) => updateReminder({ firstReminderBefore: v })}
                  />
                  <span>before due</span>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={settings.defaultReminder.repeatAfterDue}
                    onChange={(e) => updateReminder({ repeatAfterDue: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  Repeat reminders after due date
                </label>

                {settings.defaultReminder.repeatAfterDue && (
                  <div className="ml-6 flex items-center gap-2 text-sm text-gray-600">
                    <span>Every</span>
                    <DueUnitInput
                      value={settings.defaultReminder.repeatInterval}
                      onChange={(v) => updateReminder({ repeatInterval: v })}
                    />
                    <span>, up to</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={settings.defaultReminder.maxReminders}
                      onChange={(e) => updateReminder({ maxReminders: parseInt(e.target.value) || 1 })}
                      className="w-12 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <span>times</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Escalation Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Escalation</h4>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={settings.escalation.enabled}
                onChange={(e) => updateEscalation({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              Escalate overdue tasks
            </label>

            {settings.escalation.enabled && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Escalate if overdue by</span>
                  <DueUnitInput
                    value={settings.escalation.escalateAfter}
                    onChange={(v) => updateEscalation({ escalateAfter: v })}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Notify:</p>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="escalateTo"
                      checked={settings.escalation.escalateTo === 'COORDINATOR'}
                      onChange={() => updateEscalation({ escalateTo: 'COORDINATOR' })}
                      className="border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    Flow coordinator
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="escalateTo"
                      checked={settings.escalation.escalateTo === 'CUSTOM_EMAIL'}
                      onChange={() => updateEscalation({ escalateTo: 'CUSTOM_EMAIL' })}
                      className="border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    Custom email
                  </label>
                  {settings.escalation.escalateTo === 'CUSTOM_EMAIL' && (
                    <input
                      type="email"
                      value={settings.escalation.customEmail || ''}
                      onChange={(e) => updateEscalation({ customEmail: e.target.value })}
                      placeholder="escalation@company.com"
                      className="ml-6 w-64 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Coordinator Updates Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordinator Updates</h4>
            <p className="text-xs text-gray-500">Notify me (in-app) when:</p>
            <div className="space-y-2">
              {[
                { key: 'stepCompleted' as const, label: 'A step is completed' },
                { key: 'stepOverdue' as const, label: 'A step becomes overdue' },
                { key: 'flowCompleted' as const, label: 'The flow is completed' },
                { key: 'flowStalled' as const, label: 'The flow is stalled (no progress for 72h)' },
                { key: 'dailyDigest' as const, label: 'Daily digest of all active flows' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={settings.coordinatorNotifications[key]}
                    onChange={(e) => updateCoordinator({ [key]: e.target.checked })}
                    className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
