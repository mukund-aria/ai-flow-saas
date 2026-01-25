/**
 * Integrations Page
 *
 * Coming soon placeholder for third-party integrations.
 */

import { Plug, Zap, Database, Mail } from 'lucide-react';

export function IntegrationsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">
          Connect your favorite tools and services
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-24">
        <div className="w-20 h-20 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-6">
          <Plug className="w-10 h-10 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Connect your workflows to external services like Salesforce, Slack,
          Google Workspace, and more. Automate data syncing and notifications.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>Webhooks</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            <span>CRM sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>Email triggers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
