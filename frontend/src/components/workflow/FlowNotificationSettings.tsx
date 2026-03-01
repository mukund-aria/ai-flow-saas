import { useState } from 'react';
import { Info, RotateCcw, Hash, MessageSquare, Check, Globe, Plus, Trash2, Eye, EyeOff, Copy, FlaskConical, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { DeliveryChannel, FlowNotificationSettings, SlackIntegrationSettings, ChannelIntegrations, SlackChannelMode, ChannelVisibility, ChannelInviteGroup, WebhookEndpointConfig, WebhookEventConfig, WebhookIntegrationSettings } from '@/types';

const defaultSlackSettings: SlackIntegrationSettings = {
  enabled: false,
  channelMode: 'SHARED',
  shared: { channelName: '' },
  perFlowRun: {
    namingPattern: '{flowName}-{runId}',
    visibility: 'PRIVATE',
    inviteGroup: 'ALL_COORDINATORS',
    additionalMembers: '',
    autoArchiveOnComplete: true,
  },
  events: {
    actionCompleted: true,
    flowStarted: true,
    flowCompleted: true,
    chatMessages: false,
  },
};

const defaultChannelIntegrations: ChannelIntegrations = {
  slack: defaultSlackSettings,
};

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
  channelIntegrations: defaultChannelIntegrations,
};

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative group">
      <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-52 px-2.5 py-1.5 text-xs leading-snug text-white bg-gray-800 rounded-lg shadow-lg z-50 pointer-events-none">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
      </span>
    </span>
  );
}

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
      {value === 'AUTO' && (
        <InfoTooltip text="Push notification if enabled. Otherwise email or SMS when the user is offline." />
      )}
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
    <div className="flex items-start gap-2 px-3 py-2.5 bg-violet-50 border border-violet-100 rounded-lg">
      <Info className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
      <p className="text-xs text-violet-700">{children}</p>
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

function SegmentedControl<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
            value === opt.value
              ? 'bg-violet-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? 'bg-violet-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

function ChannelIntegrationsSection({
  settings,
  onChange,
}: {
  settings: FlowNotificationSettings;
  onChange: (s: FlowNotificationSettings) => void;
}) {
  const ci = settings.channelIntegrations ?? defaultChannelIntegrations;
  const slack = ci.slack;

  const updateSlack = (partial: Partial<SlackIntegrationSettings>) => {
    onChange({
      ...settings,
      channelIntegrations: {
        ...ci,
        slack: { ...slack, ...partial },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4" />

      <div>
        <h3 className="text-sm font-semibold text-gray-900">Channel Integrations</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Stream all flow updates into a team channel. Everyone in the channel sees real-time activity without needing individual notifications.
        </p>
      </div>

      {/* Slack */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">Slack</span>
          </div>
          <Toggle checked={slack.enabled} onChange={(v) => updateSlack({ enabled: v })} />
        </div>

        {slack.enabled && (
          <div className="px-4 py-3 space-y-4">
            {/* Channel Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Channel mode</label>
              <SegmentedControl<SlackChannelMode>
                value={slack.channelMode}
                onChange={(v) => updateSlack({ channelMode: v })}
                options={[
                  { value: 'SHARED', label: 'Shared channel' },
                  { value: 'PER_FLOW_RUN', label: 'Per flow' },
                ]}
              />
            </div>

            {/* Shared Mode Config */}
            {slack.channelMode === 'SHARED' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Channel name</label>
                <input
                  type="text"
                  value={slack.shared.channelName}
                  onChange={(e) => updateSlack({ shared: { channelName: e.target.value } })}
                  placeholder="#project-updates"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Per Flow Run Config */}
            {slack.channelMode === 'PER_FLOW_RUN' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Naming pattern</label>
                  <input
                    type="text"
                    value={slack.perFlowRun.namingPattern}
                    onChange={(e) => updateSlack({
                      perFlowRun: { ...slack.perFlowRun, namingPattern: e.target.value },
                    })}
                    placeholder="{flowName}-{clientName}"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400">
                    Variables: <code className="text-violet-600">{'{flowName}'}</code> <code className="text-violet-600">{'{clientName}'}</code> <code className="text-violet-600">{'{date}'}</code> <code className="text-violet-600">{'{runId}'}</code>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Channel visibility</label>
                  <SegmentedControl<ChannelVisibility>
                    value={slack.perFlowRun.visibility}
                    onChange={(v) => updateSlack({
                      perFlowRun: { ...slack.perFlowRun, visibility: v },
                    })}
                    options={[
                      { value: 'PRIVATE', label: 'Private' },
                      { value: 'PUBLIC', label: 'Public' },
                    ]}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Invite to channel</label>
                  <select
                    value={slack.perFlowRun.inviteGroup}
                    onChange={(e) => updateSlack({
                      perFlowRun: { ...slack.perFlowRun, inviteGroup: e.target.value as ChannelInviteGroup },
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white text-gray-700"
                  >
                    <option value="ALL_COORDINATORS">All coordinators</option>
                    <option value="COORDINATOR_ASSIGNEES">Coordinators + assignees</option>
                    <option value="FLOW_OWNER_ONLY">Flow owner only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Additional members (optional)</label>
                  <input
                    type="text"
                    value={slack.perFlowRun.additionalMembers}
                    onChange={(e) => updateSlack({
                      perFlowRun: { ...slack.perFlowRun, additionalMembers: e.target.value },
                    })}
                    placeholder="user@example.com, user2@example.com"
                    className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <Checkbox
                  checked={slack.perFlowRun.autoArchiveOnComplete}
                  onChange={(v) => updateSlack({
                    perFlowRun: { ...slack.perFlowRun, autoArchiveOnComplete: v },
                  })}
                  label="Auto-archive channel when flow completes"
                />

                <InfoCallout>
                  A new Slack channel is automatically created when a flow starts.
                </InfoCallout>
              </div>
            )}

            {/* Events to post */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Events to post</label>
              <div className="grid grid-cols-2 gap-2">
                <Checkbox
                  checked={slack.events.actionCompleted}
                  onChange={(v) => updateSlack({
                    events: { ...slack.events, actionCompleted: v },
                  })}
                  label="Action completed"
                />
                <Checkbox
                  checked={slack.events.flowStarted}
                  onChange={(v) => updateSlack({
                    events: { ...slack.events, flowStarted: v },
                  })}
                  label="Flow started"
                />
                <Checkbox
                  checked={slack.events.flowCompleted}
                  onChange={(v) => updateSlack({
                    events: { ...slack.events, flowCompleted: v },
                  })}
                  label="Flow completed"
                />
                <Checkbox
                  checked={slack.events.chatMessages}
                  onChange={(v) => updateSlack({
                    events: { ...slack.events, chatMessages: v },
                  })}
                  label="Chat messages"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Microsoft Teams (coming soon) */}
      <div className="border border-gray-200 rounded-lg overflow-hidden opacity-60">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500">Microsoft Teams</span>
            <span className="px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 rounded">Coming soon</span>
          </div>
          <Toggle checked={false} onChange={() => {}} />
        </div>
      </div>

      {/* Outgoing Webhooks */}
      <OutgoingWebhooksSection settings={settings} onChange={onChange} />
    </div>
  );
}

// ============================================================================
// Outgoing Webhooks Section
// ============================================================================

const DEFAULT_EVENTS: WebhookEventConfig = {
  flowStarted: true,
  stepCompleted: true,
  flowCompleted: true,
  flowCancelled: true,
  stepOverdue: false,
  stepEscalated: false,
  chatMessage: false,
};

function generateSecret(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

function OutgoingWebhooksSection({
  settings,
  onChange,
}: {
  settings: FlowNotificationSettings;
  onChange: (s: FlowNotificationSettings) => void;
}) {
  const savedFlowId = useWorkflowStore((s) => s.savedFlowId);
  const ci = settings.channelIntegrations ?? { slack: { enabled: false, channelMode: 'SHARED' as const, shared: { channelName: '' }, perFlowRun: { namingPattern: '', visibility: 'PRIVATE' as const, inviteGroup: 'ALL_COORDINATORS' as const, additionalMembers: '', autoArchiveOnComplete: true }, events: { actionCompleted: true, flowStarted: true, flowCompleted: true, chatMessages: false } } };
  const webhooks: WebhookIntegrationSettings = ci.webhooks ?? { endpoints: [] };
  const endpoints = webhooks.endpoints;

  const updateEndpoints = (newEndpoints: WebhookEndpointConfig[]) => {
    onChange({
      ...settings,
      channelIntegrations: {
        ...ci,
        webhooks: { endpoints: newEndpoints },
      },
    });
  };

  const addEndpoint = () => {
    const newEndpoint: WebhookEndpointConfig = {
      id: crypto.randomUUID(),
      label: '',
      url: '',
      secret: generateSecret(),
      enabled: true,
      events: { ...DEFAULT_EVENTS },
      createdAt: new Date().toISOString(),
    };
    updateEndpoints([...endpoints, newEndpoint]);
  };

  const updateEndpoint = (id: string, updates: Partial<WebhookEndpointConfig>) => {
    updateEndpoints(endpoints.map((ep) => (ep.id === id ? { ...ep, ...updates } : ep)));
  };

  const removeEndpoint = (id: string) => {
    updateEndpoints(endpoints.filter((ep) => ep.id !== id));
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Outgoing Webhooks</span>
          {endpoints.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium text-violet-600 bg-violet-50 rounded">
              {endpoints.length}
            </span>
          )}
        </div>
        <button
          onClick={addEndpoint}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add endpoint
        </button>
      </div>

      {endpoints.length > 0 && (
        <div className="divide-y divide-gray-100">
          {endpoints.map((ep) => (
            <WebhookEndpointRow
              key={ep.id}
              endpoint={ep}
              templateId={savedFlowId}
              onChange={(updates) => updateEndpoint(ep.id, updates)}
              onRemove={() => removeEndpoint(ep.id)}
            />
          ))}
        </div>
      )}

      {endpoints.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-xs text-gray-400">
            Send flow events to external systems (Zapier, CRMs, internal tools).
          </p>
        </div>
      )}
    </div>
  );
}

const EVENT_LABELS: { key: keyof WebhookEventConfig; label: string }[] = [
  { key: 'flowStarted', label: 'Flow started' },
  { key: 'stepCompleted', label: 'Step completed' },
  { key: 'flowCompleted', label: 'Flow completed' },
  { key: 'flowCancelled', label: 'Flow cancelled' },
  { key: 'stepOverdue', label: 'Step overdue' },
  { key: 'stepEscalated', label: 'Step escalated' },
  { key: 'chatMessage', label: 'Chat message' },
];

function WebhookEndpointRow({
  endpoint,
  templateId,
  onChange,
  onRemove,
}: {
  endpoint: WebhookEndpointConfig;
  templateId: string | null;
  onChange: (updates: Partial<WebhookEndpointConfig>) => void;
  onRemove: () => void;
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; status: number; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTest = async () => {
    if (!templateId || !endpoint.url) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/templates/${templateId}/test-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: endpoint.url, secret: endpoint.secret }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        status: data.data?.status || 0,
        message: data.success ? `HTTP ${data.data?.status}` : (data.data?.body || 'Failed'),
      });
    } catch (err) {
      setTestResult({ success: false, status: 0, message: (err as Error).message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(endpoint.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Row 1: Toggle, Label, URL, Test, Delete */}
      <div className="flex items-center gap-2">
        <Toggle checked={endpoint.enabled} onChange={(v) => onChange({ enabled: v })} />
        <input
          type="text"
          value={endpoint.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="Label (e.g. Zapier)"
          className="w-28 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <input
          type="url"
          value={endpoint.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://hooks.example.com/..."
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-mono text-xs"
        />
        <button
          onClick={handleTest}
          disabled={isTesting || !endpoint.url || !templateId}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Send a test webhook"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          {isTesting ? '...' : 'Test'}
        </button>
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
          title="Remove endpoint"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Row 2: Secret */}
      <div className="flex items-center gap-2 ml-11">
        <span className="text-xs text-gray-500 shrink-0">Secret:</span>
        <code className="flex-1 px-2 py-0.5 text-xs bg-gray-50 border border-gray-200 rounded font-mono truncate">
          {showSecret ? endpoint.secret : '\u2022'.repeat(20)}
        </code>
        <button
          onClick={() => setShowSecret(!showSecret)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          title={showSecret ? 'Hide secret' : 'Reveal secret'}
        >
          {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleCopySecret}
          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          title="Copy secret"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Row 3: Events */}
      <div className="ml-11">
        <label className="text-xs font-medium text-gray-500 mb-1.5 block">Events</label>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {EVENT_LABELS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={endpoint.events[key]}
                onChange={(e) =>
                  onChange({ events: { ...endpoint.events, [key]: e.target.checked } })
                }
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Test result */}
      {testResult && (
        <div className={`ml-11 flex items-center gap-1.5 text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
          {testResult.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          {testResult.success ? 'Test passed' : `Failed: ${testResult.message}`}
        </div>
      )}
    </div>
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

  const handleResetToDefaults = () => {
    update({ ...defaultSettings, mode: 'default' });
  };

  return (
    <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => update({ ...settings, mode: 'default' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  !isCustom
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {!isCustom && <Check className="w-3.5 h-3.5" />}
                Default
              </button>
              <button
                onClick={() => update({ ...settings, mode: 'custom' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                  isCustom
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {isCustom && <Check className="w-3.5 h-3.5" />}
                Custom
              </button>
            </div>
            {isCustom && (
              <button
                onClick={handleResetToDefaults}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                title="Reset all notification settings to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to defaults
              </button>
            )}
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

          {/* Channel Integrations — always visible */}
          <ChannelIntegrationsSection settings={settings} onChange={update} />
    </div>
  );
}
