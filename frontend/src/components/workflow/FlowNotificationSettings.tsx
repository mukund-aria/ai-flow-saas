import { Info } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { DeliveryChannel, FlowNotificationSettings } from '@/types';

const defaultSettings: FlowNotificationSettings = {
  mode: 'default',
  assignee: {
    actionAlerts: {
      actionAssigned: true,
      dueDateApproaching: true,
      dueDateApproachingDays: 1,
      actionDue: true,
      actionOverdue: true,
      actionOverdueRepeatDays: 1,
      actionOverdueMaxTimes: 3,
      delivery: 'AUTO',
    },
    flowCompletion: {
      flowCompleted: true,
      delivery: 'AUTO',
    },
  },
  coordinator: {
    actionAlerts: {
      actionCompleted: true,
      delivery: 'AUTO',
    },
    flowAlerts: {
      flowStarted: true,
      flowOverdue: true,
      flowOverdueRepeatDays: 1,
      flowOverdueMaxTimes: 3,
      flowCompleted: true,
      delivery: 'AUTO',
    },
    escalationAlerts: {
      noActivityDays: 3,
      assigneeNotStartedDays: 2,
      automationFailure: true,
      delivery: 'AUTO',
    },
    chatAlerts: {
      newMessage: true,
      delivery: 'AUTO',
    },
    dailyDigest: false,
  },
};

function DeliverySelect({ value, onChange }: { value: DeliveryChannel; onChange: (v: DeliveryChannel) => void }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">Delivery:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as DeliveryChannel)}
        className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-700"
      >
        <option value="AUTO">Auto</option>
        <option value="EMAIL_OR_SMS">Email or SMS</option>
        <option value="EMAIL_AND_SMS">Email and SMS</option>
      </select>
    </div>
  );
}

function NumberInput({ value, onChange, min = 1, max = 30 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || min)}
      className="w-12 px-1.5 py-0.5 text-sm border border-gray-200 rounded text-center focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
    />
  );
}

function Checkbox({ checked, onChange, label, children }: { checked: boolean; onChange: (v: boolean) => void; label: string; children?: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        {label}
      </label>
      {checked && children && <div className="ml-6 mt-1">{children}</div>}
    </div>
  );
}

function InfoCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
      <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
      <p className="text-xs text-blue-700">{children}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h4>
  );
}

function GroupHeader({ title }: { title: string }) {
  return (
    <p className="text-sm font-medium text-gray-800 mb-2">{title}</p>
  );
}

export function FlowNotificationSettingsPanel() {
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateSettings = useWorkflowStore((s) => s.updateNotificationSettings);

  const settings: FlowNotificationSettings =
    (workflow?.settings as { notifications?: FlowNotificationSettings } | undefined)?.notifications || defaultSettings;

  const update = (newSettings: FlowNotificationSettings) => {
    updateSettings(newSettings as unknown as Record<string, unknown>);
  };

  const isCustom = settings.mode === 'custom';

  return (
    <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => update({ ...settings, mode: 'default' })}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                !isCustom
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => update({ ...settings, mode: 'custom' })}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                isCustom
                  ? 'bg-violet-100 text-violet-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Customize
            </button>
          </div>

          {/* Default Mode Summary */}
          {!isCustom && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Assignees will be reminded before due dates and notified of completions.
                Coordinators will be notified of step completions, flow events, and escalations.
              </p>
              <InfoCallout>
                Notifications are automatically batched when users are active.
              </InfoCallout>
            </div>
          )}

          {/* Custom Mode — Full Controls */}
          {isCustom && (
            <div className="space-y-5">
              {/* ===== FOR ASSIGNEES ===== */}
              <div className="space-y-3">
                <SectionHeader title="For Assignees" />

                {/* Assignee Action Alerts */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Action Alerts" />

                  <Checkbox
                    checked={settings.assignee.actionAlerts.actionAssigned}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, actionAssigned: v } },
                    })}
                    label="Action assigned"
                  />

                  <Checkbox
                    checked={settings.assignee.actionAlerts.dueDateApproaching}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, dueDateApproaching: v } },
                    })}
                    label="Due date approaching"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <NumberInput
                        value={settings.assignee.actionAlerts.dueDateApproachingDays}
                        onChange={(v) => update({
                          ...settings,
                          assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, dueDateApproachingDays: v } },
                        })}
                      />
                      <span>days before due</span>
                    </div>
                  </Checkbox>

                  <Checkbox
                    checked={settings.assignee.actionAlerts.actionDue}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, actionDue: v } },
                    })}
                    label="Action is due"
                  />

                  <Checkbox
                    checked={settings.assignee.actionAlerts.actionOverdue}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, actionOverdue: v } },
                    })}
                    label="Action overdue"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>every</span>
                      <NumberInput
                        value={settings.assignee.actionAlerts.actionOverdueRepeatDays}
                        onChange={(v) => update({
                          ...settings,
                          assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, actionOverdueRepeatDays: v } },
                        })}
                      />
                      <span>days, max</span>
                      <NumberInput
                        value={settings.assignee.actionAlerts.actionOverdueMaxTimes}
                        onChange={(v) => update({
                          ...settings,
                          assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, actionOverdueMaxTimes: v } },
                        })}
                      />
                      <span>times</span>
                    </div>
                  </Checkbox>

                  <DeliverySelect
                    value={settings.assignee.actionAlerts.delivery}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, actionAlerts: { ...settings.assignee.actionAlerts, delivery: v } },
                    })}
                  />
                </div>

                {/* Assignee Flow Completion */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Flow Completion" />

                  <Checkbox
                    checked={settings.assignee.flowCompletion.flowCompleted}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, flowCompletion: { ...settings.assignee.flowCompletion, flowCompleted: v } },
                    })}
                    label="Flow completed"
                  />

                  <DeliverySelect
                    value={settings.assignee.flowCompletion.delivery}
                    onChange={(v) => update({
                      ...settings,
                      assignee: { ...settings.assignee, flowCompletion: { ...settings.assignee.flowCompletion, delivery: v } },
                    })}
                  />
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* ===== FOR COORDINATORS ===== */}
              <div className="space-y-3">
                <SectionHeader title="For Coordinators" />

                {/* Coordinator Action Alerts */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Action Alerts" />

                  <Checkbox
                    checked={settings.coordinator.actionAlerts.actionCompleted}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, actionAlerts: { ...settings.coordinator.actionAlerts, actionCompleted: v } },
                    })}
                    label="Action completed"
                  />

                  <DeliverySelect
                    value={settings.coordinator.actionAlerts.delivery}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, actionAlerts: { ...settings.coordinator.actionAlerts, delivery: v } },
                    })}
                  />
                </div>

                {/* Coordinator Flow Alerts */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Flow Alerts" />

                  <Checkbox
                    checked={settings.coordinator.flowAlerts.flowStarted}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, flowStarted: v } },
                    })}
                    label="Flow started"
                  />

                  <Checkbox
                    checked={settings.coordinator.flowAlerts.flowOverdue}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, flowOverdue: v } },
                    })}
                    label="Flow overdue"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span>every</span>
                      <NumberInput
                        value={settings.coordinator.flowAlerts.flowOverdueRepeatDays}
                        onChange={(v) => update({
                          ...settings,
                          coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, flowOverdueRepeatDays: v } },
                        })}
                      />
                      <span>days, max</span>
                      <NumberInput
                        value={settings.coordinator.flowAlerts.flowOverdueMaxTimes}
                        onChange={(v) => update({
                          ...settings,
                          coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, flowOverdueMaxTimes: v } },
                        })}
                      />
                      <span>times</span>
                    </div>
                  </Checkbox>

                  <Checkbox
                    checked={settings.coordinator.flowAlerts.flowCompleted}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, flowCompleted: v } },
                    })}
                    label="Flow completed"
                  />

                  <DeliverySelect
                    value={settings.coordinator.flowAlerts.delivery}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, flowAlerts: { ...settings.coordinator.flowAlerts, delivery: v } },
                    })}
                  />
                </div>

                {/* Coordinator Escalation Alerts */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Escalation Alerts" />

                  <Checkbox
                    checked={settings.coordinator.escalationAlerts.noActivityDays !== null}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, noActivityDays: v ? 3 : null } },
                    })}
                    label="No activity for"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <NumberInput
                        value={settings.coordinator.escalationAlerts.noActivityDays ?? 3}
                        onChange={(v) => update({
                          ...settings,
                          coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, noActivityDays: v } },
                        })}
                      />
                      <span>days</span>
                    </div>
                  </Checkbox>

                  <Checkbox
                    checked={settings.coordinator.escalationAlerts.assigneeNotStartedDays !== null}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, assigneeNotStartedDays: v ? 2 : null } },
                    })}
                    label="Assignee hasn't started for"
                  >
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <NumberInput
                        value={settings.coordinator.escalationAlerts.assigneeNotStartedDays ?? 2}
                        onChange={(v) => update({
                          ...settings,
                          coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, assigneeNotStartedDays: v } },
                        })}
                      />
                      <span>days</span>
                    </div>
                  </Checkbox>

                  <Checkbox
                    checked={settings.coordinator.escalationAlerts.automationFailure}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, automationFailure: v } },
                    })}
                    label="Automation failure"
                  />

                  <DeliverySelect
                    value={settings.coordinator.escalationAlerts.delivery}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, escalationAlerts: { ...settings.coordinator.escalationAlerts, delivery: v } },
                    })}
                  />
                </div>

                {/* Coordinator Chat Alerts */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Chat Alerts" />

                  <Checkbox
                    checked={settings.coordinator.chatAlerts.newMessage}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, chatAlerts: { ...settings.coordinator.chatAlerts, newMessage: v } },
                    })}
                    label="New message from assignee"
                  />

                  <DeliverySelect
                    value={settings.coordinator.chatAlerts.delivery}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, chatAlerts: { ...settings.coordinator.chatAlerts, delivery: v } },
                    })}
                  />
                </div>

                {/* Daily Digest */}
                <div className="ml-1 space-y-2 p-3 bg-gray-50 rounded-lg">
                  <GroupHeader title="Daily Digest" />
                  <Checkbox
                    checked={settings.coordinator.dailyDigest}
                    onChange={(v) => update({
                      ...settings,
                      coordinator: { ...settings.coordinator, dailyDigest: v },
                    })}
                    label="Include in daily summary email"
                  />
                </div>
              </div>

              <InfoCallout>
                Notifications are automatically batched when users are active online.
              </InfoCallout>
            </div>
          )}
    </div>
  );
}
