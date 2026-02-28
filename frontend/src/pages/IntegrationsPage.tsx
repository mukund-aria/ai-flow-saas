/**
 * Integrations Page
 *
 * Full CRUD for org-level integrations (Slack, Teams, Custom Webhook)
 * plus a catalog of available/coming-soon integrations.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Globe,
  Hash,
  Mail,
  FileSpreadsheet,
  Database,
  Zap,
  Table2,
  HardDrive,
  MessageSquare,
  CheckCircle2,
  Plug,
  Loader2,
  Plus,
  Trash2,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ---------- API helpers ----------

interface OrgIntegration {
  id: string;
  type: 'SLACK_WEBHOOK' | 'TEAMS_WEBHOOK' | 'CUSTOM_WEBHOOK';
  name: string;
  config: {
    webhookUrl?: string;
    events?: string[];
    [key: string]: unknown;
  };
  enabled: boolean;
  lastDeliveryAt?: string;
  lastDeliveryStatus?: string;
  createdAt: string;
}

async function fetchIntegrations(): Promise<OrgIntegration[]> {
  const res = await fetch(`${API_BASE}/integrations`, { credentials: 'include' });
  const data = await res.json();
  return data.success ? data.data : [];
}

async function createIntegration(body: {
  type: string;
  name: string;
  config: Record<string, unknown>;
}): Promise<OrgIntegration> {
  const res = await fetch(`${API_BASE}/integrations`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to create');
  return data.data;
}

async function updateIntegration(
  id: string,
  body: Partial<{ name: string; config: Record<string, unknown>; enabled: boolean }>
): Promise<OrgIntegration> {
  const res = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to update');
  return data.data;
}

async function deleteIntegration(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/integrations/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to delete');
}

async function testIntegration(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/integrations/${id}/test`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  return { success: data.success, message: data.data?.message || data.error?.message };
}

// ---------- Catalog data ----------

type CatalogStatus = 'available' | 'coming_soon';

interface CatalogIntegration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: CatalogStatus;
  category: string;
}

const CATALOG_INTEGRATIONS: CatalogIntegration[] = [
  { id: 'email', name: 'Email (SMTP / Resend)', description: 'Transactional emails for task assignments, reminders, and completions. Auto-configured.', icon: Mail, status: 'available', category: 'Notifications' },
  { id: 'google-sheets', name: 'Google Sheets', description: 'Sync form submissions and workflow data to Google Sheets automatically.', icon: FileSpreadsheet, status: 'coming_soon', category: 'Data' },
  { id: 'salesforce', name: 'Salesforce', description: 'Create and update Salesforce records from workflow steps.', icon: Database, status: 'coming_soon', category: 'CRM' },
  { id: 'hubspot', name: 'HubSpot', description: 'Sync contacts and deals with HubSpot CRM.', icon: Database, status: 'coming_soon', category: 'CRM' },
  { id: 'zapier', name: 'Zapier', description: 'Connect to 5,000+ apps through Zapier triggers and actions.', icon: Zap, status: 'coming_soon', category: 'Automation' },
  { id: 'airtable', name: 'Airtable', description: 'Read and write Airtable records from workflow steps.', icon: Table2, status: 'coming_soon', category: 'Data' },
  { id: 'google-drive', name: 'Google Drive', description: 'Upload and manage files in Google Drive from workflows.', icon: HardDrive, status: 'coming_soon', category: 'Storage' },
];

const INTEGRATION_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  SLACK_WEBHOOK: { label: 'Slack', icon: Hash, color: 'bg-purple-100 text-purple-600' },
  TEAMS_WEBHOOK: { label: 'Teams', icon: MessageSquare, color: 'bg-blue-100 text-blue-600' },
  CUSTOM_WEBHOOK: { label: 'Custom', icon: Globe, color: 'bg-gray-100 text-gray-600' },
};

const SUBSCRIBABLE_EVENTS = [
  { id: 'flow.started', label: 'Flow Started' },
  { id: 'step.completed', label: 'Step Completed' },
  { id: 'flow.completed', label: 'Flow Completed' },
  { id: 'step.overdue', label: 'Step Overdue' },
];

// ---------- Config Dialog ----------

interface ConfigDialogProps {
  integration?: OrgIntegration | null;
  onSave: (data: { type: string; name: string; config: Record<string, unknown> }) => Promise<void>;
  onClose: () => void;
  onTest?: (id: string) => void;
}

function ConfigDialog({ integration, onSave, onClose, onTest }: ConfigDialogProps) {
  const [type, setType] = useState(integration?.type || 'SLACK_WEBHOOK');
  const [name, setName] = useState(integration?.name || '');
  const [webhookUrl, setWebhookUrl] = useState((integration?.config?.webhookUrl as string) || '');
  const [events, setEvents] = useState<string[]>((integration?.config?.events as string[]) || ['flow.started', 'step.completed', 'flow.completed']);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);

  const toggleEvent = (eventId: string) => {
    setEvents((prev) => prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ type, name, config: { webhookUrl, events } });
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!integration?.id) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testIntegration(integration.id);
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, message: (err as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {integration ? 'Edit Integration' : 'Add Integration'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Type selector (only for new) */}
          {!integration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SLACK_WEBHOOK', 'TEAMS_WEBHOOK', 'CUSTOM_WEBHOOK'] as const).map((t) => {
                  const meta = INTEGRATION_TYPE_META[t];
                  const Icon = meta.icon;
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        type === t
                          ? 'border-violet-500 bg-violet-50 text-violet-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., #engineering-alerts"
            />
          </div>

          {/* Webhook URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Webhook URL</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://hooks.slack.com/services/..."
            />
          </div>

          {/* Events */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Events to subscribe to</label>
            <div className="space-y-2">
              {SUBSCRIBABLE_EVENTS.map((evt) => (
                <label key={evt.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={events.includes(evt.id)}
                    onChange={() => toggleEvent(evt.id)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">{evt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Test button (only for existing) */}
          {integration && (
            <div>
              <Button
                variant="outline"
                onClick={handleTest}
                disabled={testing}
                className="w-full"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send Test Message
              </Button>
              {testResult && (
                <div className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResult.success ? 'Test message sent successfully!' : `Failed: ${testResult.message}`}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !webhookUrl.trim()}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {integration ? 'Save Changes' : 'Create Integration'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Integration Card ----------

function OrgIntegrationCard({
  integration,
  onEdit,
  onDelete,
  onToggle,
}: {
  integration: OrgIntegration;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const meta = INTEGRATION_TYPE_META[integration.type] || INTEGRATION_TYPE_META.CUSTOM_WEBHOOK;
  const Icon = meta.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/40 transition-all">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${meta.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
            integration.enabled
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
              : 'bg-gray-100 text-gray-500 ring-1 ring-gray-300/40'
          }`}>
            {integration.enabled && <CheckCircle2 className="w-3 h-3" />}
            {integration.enabled ? 'Active' : 'Disabled'}
          </span>
          {/* Enable/disable toggle */}
          <button
            onClick={onToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              integration.enabled ? 'bg-violet-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                integration.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
              style={{ transform: integration.enabled ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
        <p className="text-xs text-gray-500 mt-1 font-mono truncate">
          {(integration.config?.webhookUrl as string) || 'No URL configured'}
        </p>
        {integration.lastDeliveryAt && (
          <p className="text-xs text-gray-400 mt-1">
            Last delivery: {new Date(integration.lastDeliveryAt).toLocaleDateString()} - {integration.lastDeliveryStatus}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-500">
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Configure
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Catalog Card ----------

function CatalogCard({ integration }: { integration: CatalogIntegration }) {
  const Icon = integration.icon;
  const isComingSoon = integration.status === 'coming_soon';

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 transition-all ${
      isComingSoon ? 'opacity-75' : 'hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/40'
    }`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${
          isComingSoon ? 'bg-gray-100' : 'bg-blue-100'
        }`}>
          <Icon className={`w-5 h-5 ${isComingSoon ? 'text-gray-400' : 'text-blue-600'}`} />
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
          isComingSoon
            ? 'bg-gray-100 text-gray-500 ring-1 ring-gray-300/40'
            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
        }`}>
          {isComingSoon ? 'Coming Soon' : 'Auto-configured'}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{integration.description}</p>
      </div>
      <div className="flex items-center">
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-500">
          {integration.category}
        </span>
      </div>
    </div>
  );
}

// ---------- Page ----------

export function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [orgIntegrations, setOrgIntegrations] = useState<OrgIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<OrgIntegration | null>(null);

  const loadIntegrations = useCallback(async () => {
    try {
      const items = await fetchIntegrations();
      setOrgIntegrations(items);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleCreate = async (data: { type: string; name: string; config: Record<string, unknown> }) => {
    await createIntegration(data);
    await loadIntegrations();
  };

  const handleUpdate = async (data: { type: string; name: string; config: Record<string, unknown> }) => {
    if (!editingIntegration) return;
    await updateIntegration(editingIntegration.id, { name: data.name, config: data.config });
    await loadIntegrations();
  };

  const handleDelete = async (id: string) => {
    await deleteIntegration(id);
    await loadIntegrations();
  };

  const handleToggle = async (integration: OrgIntegration) => {
    await updateIntegration(integration.id, { enabled: !integration.enabled });
    await loadIntegrations();
  };

  // Filter catalog by search
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return CATALOG_INTEGRATIONS;
    const q = searchQuery.toLowerCase();
    return CATALOG_INTEGRATIONS.filter(
      (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-sm text-gray-500 mt-1">Connect your workflows to Slack, Teams, and custom webhooks</p>
          </div>
          <Button onClick={() => { setEditingIntegration(null); setDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Integration
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        />
      </div>

      <div className="space-y-10">
        {/* Configured integrations */}
        {loading ? (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Integrations</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Loading integrations...</span>
            </div>
          </section>
        ) : orgIntegrations.length > 0 ? (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Your Integrations ({orgIntegrations.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orgIntegrations.map((integration) => (
                <OrgIntegrationCard
                  key={integration.id}
                  integration={integration}
                  onEdit={() => { setEditingIntegration(integration); setDialogOpen(true); }}
                  onDelete={() => handleDelete(integration.id)}
                  onToggle={() => handleToggle(integration)}
                />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Your Integrations</h2>
            <div className="bg-white rounded-xl border border-gray-200 border-dashed p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <Plug className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">No integrations configured</p>
              <p className="text-xs text-gray-500 mb-4">Add a Slack, Teams, or custom webhook integration to get flow event notifications.</p>
              <Button
                variant="outline"
                onClick={() => { setEditingIntegration(null); setDialogOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Integration
              </Button>
            </div>
          </section>
        )}

        {/* Catalog of other integrations */}
        {filteredCatalog.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              More Integrations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCatalog.map((integration) => (
                <CatalogCard key={integration.id} integration={integration} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Config Dialog */}
      {dialogOpen && (
        <ConfigDialog
          integration={editingIntegration}
          onSave={editingIntegration ? handleUpdate : handleCreate}
          onClose={() => { setDialogOpen(false); setEditingIntegration(null); }}
        />
      )}
    </div>
  );
}
