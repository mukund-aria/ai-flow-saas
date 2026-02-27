/**
 * Integrations Page
 *
 * Catalog/directory of available integrations, grouped by connection status.
 * Includes an aggregate view of outgoing webhooks configured across templates.
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ExternalLink,
  CheckCircle2,
  Plug,
  Loader2,
  Link2,
} from 'lucide-react';
import { listTemplates, getTemplate } from '@/lib/api';
import type { WebhookEndpointConfig } from '@/types';

// ---------- Data ----------

type IntegrationStatus = 'connected' | 'available' | 'coming_soon';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: IntegrationStatus;
  category: string;
  configPath?: string;
  configLabel?: string;
}

const integrations: Integration[] = [
  {
    id: 'webhooks',
    name: 'Outgoing Webhooks',
    description:
      'Send flow events to any URL via signed HTTP POST requests. Connect to Zapier, Make, or your own endpoints.',
    icon: Globe,
    status: 'connected',
    category: 'Notifications',
    configPath: '/home',
    configLabel: 'Configure per-flow',
  },
  {
    id: 'email',
    name: 'Email (SMTP / Resend)',
    description:
      'Transactional emails for task assignments, reminders, and completions. Auto-configured.',
    icon: Mail,
    status: 'connected',
    category: 'Notifications',
  },
  {
    id: 'slack',
    name: 'Slack',
    description:
      'Post flow activity to Slack channels. Create dedicated channels per flow run.',
    icon: Hash,
    status: 'available',
    category: 'Notifications',
    configPath: '/home',
    configLabel: 'Configure per-flow',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description:
      'Sync form submissions and workflow data to Google Sheets automatically.',
    icon: FileSpreadsheet,
    status: 'coming_soon',
    category: 'Data',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Create and update Salesforce records from workflow steps.',
    icon: Database,
    status: 'coming_soon',
    category: 'CRM',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts and deals with HubSpot CRM.',
    icon: Database,
    status: 'coming_soon',
    category: 'CRM',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description:
      'Connect to 5,000+ apps through Zapier triggers and actions.',
    icon: Zap,
    status: 'coming_soon',
    category: 'Automation',
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Read and write Airtable records from workflow steps.',
    icon: Table2,
    status: 'coming_soon',
    category: 'Data',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description:
      'Upload and manage files in Google Drive from workflows.',
    icon: HardDrive,
    status: 'coming_soon',
    category: 'Storage',
  },
  {
    id: 'microsoft-teams',
    name: 'Microsoft Teams',
    description:
      'Post flow updates to Teams channels and send adaptive cards.',
    icon: MessageSquare,
    status: 'coming_soon',
    category: 'Notifications',
  },
];

// ---------- Helpers ----------

const STATUS_ORDER: IntegrationStatus[] = ['connected', 'available', 'coming_soon'];

const STATUS_META: Record<
  IntegrationStatus,
  { label: string; sectionLabel: string; badgeClass: string }
> = {
  connected: {
    label: 'Connected',
    sectionLabel: 'CONNECTED',
    badgeClass:
      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  available: {
    label: 'Available',
    sectionLabel: 'AVAILABLE',
    badgeClass: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  },
  coming_soon: {
    label: 'Coming Soon',
    sectionLabel: 'COMING SOON',
    badgeClass: 'bg-gray-100 text-gray-500 ring-1 ring-gray-300/40',
  },
};

/** Mask a URL to show just the domain + path start */
function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 20
      ? u.pathname.slice(0, 20) + '...'
      : u.pathname;
    return u.host + path;
  } catch {
    return url.length > 40 ? url.slice(0, 40) + '...' : url;
  }
}

/** Count how many events are enabled on an endpoint */
function countEnabledEvents(endpoint: WebhookEndpointConfig): number {
  const e = endpoint.events;
  return [
    e.flowStarted, e.stepCompleted, e.flowCompleted,
    e.flowCancelled, e.stepOverdue, e.stepEscalated, e.chatMessage,
  ].filter(Boolean).length;
}

// ---------- Types for webhook aggregate ----------

interface WebhookSummary {
  endpoint: WebhookEndpointConfig;
  flowName: string;
  flowId: string;
}

// ---------- Components ----------

function IntegrationCard({ integration }: { integration: Integration }) {
  const navigate = useNavigate();
  const meta = STATUS_META[integration.status];
  const Icon = integration.icon;
  const isComingSoon = integration.status === 'coming_soon';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 transition-all ${
        isComingSoon
          ? 'opacity-75'
          : 'hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/40'
      }`}
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center ${
            integration.status === 'connected'
              ? 'bg-emerald-100'
              : integration.status === 'available'
                ? 'bg-blue-100'
                : 'bg-gray-100'
          }`}
        >
          <Icon
            className={`w-5 h-5 ${
              integration.status === 'connected'
                ? 'text-emerald-600'
                : integration.status === 'available'
                  ? 'text-blue-600'
                  : 'text-gray-400'
            }`}
          />
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${meta.badgeClass}`}
        >
          {integration.status === 'connected' && (
            <CheckCircle2 className="w-3 h-3" />
          )}
          {meta.label}
        </span>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">
          {integration.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
          {integration.description}
        </p>
      </div>

      {/* Footer: category pill + action */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-md bg-gray-100 text-gray-500">
          {integration.category}
        </span>

        {integration.status === 'connected' && integration.configPath && (
          <button
            onClick={() => navigate(integration.configPath!)}
            className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            {integration.configLabel || 'Configure'}
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
        {integration.status === 'connected' && !integration.configPath && (
          <span className="text-xs text-emerald-600 font-medium">
            Auto-configured
          </span>
        )}
        {integration.status === 'available' && (
          <button
            onClick={() =>
              integration.configPath && navigate(integration.configPath)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-sm transition-all"
          >
            Set up
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

function WebhookAggregateSection({ webhooks, loading }: { webhooks: WebhookSummary[]; loading: boolean }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Configured Webhooks
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
          <span className="text-sm text-gray-500">Loading webhook configurations...</span>
        </div>
      </section>
    );
  }

  if (webhooks.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Configured Webhooks
      </h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {webhooks.length} webhook endpoint{webhooks.length !== 1 ? 's' : ''} across your templates
            </p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {webhooks.map((wh, idx) => (
            <div
              key={`${wh.flowId}-${wh.endpoint.id}-${idx}`}
              className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                wh.endpoint.enabled ? 'bg-emerald-100' : 'bg-gray-100'
              }`}>
                <Link2 className={`w-4 h-4 ${
                  wh.endpoint.enabled ? 'text-emerald-600' : 'text-gray-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {wh.endpoint.label || 'Unnamed endpoint'}
                  </span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                    wh.endpoint.enabled
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : 'bg-gray-100 text-gray-500 ring-1 ring-gray-300/40'
                  }`}>
                    {wh.endpoint.enabled ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-400 font-mono truncate">
                    {maskUrl(wh.endpoint.url)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {countEnabledEvents(wh.endpoint)} event{countEnabledEvents(wh.endpoint) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-xs text-gray-500">{wh.flowName}</span>
                <button
                  onClick={() => navigate(`/flows/${wh.flowId}`)}
                  className="block text-xs text-violet-600 hover:text-violet-700 font-medium mt-0.5 transition-colors"
                >
                  Edit flow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Page ----------

export function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [webhooks, setWebhooks] = useState<WebhookSummary[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(true);

  // Fetch all templates and extract webhook endpoints from their definitions
  useEffect(() => {
    let cancelled = false;

    async function fetchWebhooks() {
      try {
        const templates = await listTemplates();
        // Fetch full details for each template to get the definition with webhook config
        const details = await Promise.all(
          templates.map((t) => getTemplate(t.id).catch(() => null)),
        );

        if (cancelled) return;

        const summaries: WebhookSummary[] = [];
        for (const tmpl of details) {
          if (!tmpl?.definition) continue;
          const def = tmpl.definition as Record<string, unknown>;
          const settings = def.settings as Record<string, unknown> | undefined;
          const notifs = settings?.notifications as Record<string, unknown> | undefined;
          const channelInt = notifs?.channelIntegrations as Record<string, unknown> | undefined;
          const webhookSettings = channelInt?.webhooks as { endpoints?: WebhookEndpointConfig[] } | undefined;
          const endpoints = webhookSettings?.endpoints;
          if (endpoints && endpoints.length > 0) {
            for (const ep of endpoints) {
              summaries.push({
                endpoint: ep,
                flowName: tmpl.name || 'Untitled',
                flowId: tmpl.id,
              });
            }
          }
        }
        setWebhooks(summaries);
      } catch {
        // Silently fail — the webhook section just won't show
      } finally {
        if (!cancelled) setWebhooksLoading(false);
      }
    }

    fetchWebhooks();
    return () => { cancelled = true; };
  }, []);

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return integrations;
    const q = searchQuery.toLowerCase();
    return integrations.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Group by status
  const grouped = useMemo(() => {
    const map = new Map<IntegrationStatus, Integration[]>();
    for (const status of STATUS_ORDER) {
      const items = filtered.filter((i) => i.status === status);
      if (items.length > 0) map.set(status, items);
    }
    return map;
  }, [filtered]);

  const hasResults = filtered.length > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        </div>
        <p className="text-sm text-gray-500">
          Connect your workflows to external services
        </p>
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

      {/* Grouped sections */}
      {hasResults ? (
        <div className="space-y-10">
          {Array.from(grouped.entries()).map(([status, items]) => (
            <section key={status}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                {STATUS_META[status].sectionLabel}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Webhook aggregate view — only shown when not searching */}
          {!searchQuery.trim() && (
            <WebhookAggregateSection webhooks={webhooks} loading={webhooksLoading} />
          )}
        </div>
      ) : (
        /* Empty search results */
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Plug className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No integrations found
          </h3>
          <p className="text-gray-500 mb-4">
            No integrations match "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
