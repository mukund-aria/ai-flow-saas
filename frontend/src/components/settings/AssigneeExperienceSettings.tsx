/**
 * Assignee Experience Settings
 *
 * Parent component with 4 sub-tabs: Notification Email, Flow Experience,
 * Start Link, and Portals.
 */

import { useState } from 'react';
import { Mail, Sparkles, Link2, Globe } from 'lucide-react';
import { EmailTemplateEditor } from './EmailTemplateEditor';
import { FlowExperienceSettings } from './FlowExperienceSettings';
import { StartLinkSettings } from './StartLinkSettings';
import { PortalManager } from './PortalManager';

const TABS = [
  { id: 'email', label: 'Notification Email', icon: Mail },
  { id: 'experience', label: 'Flow Experience', icon: Sparkles },
  { id: 'start-link', label: 'Start Link', icon: Link2 },
  { id: 'portals', label: 'Portals', icon: Globe },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AssigneeExperienceSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('email');

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'email' && <EmailTemplateEditor />}
        {activeTab === 'experience' && <FlowExperienceSettings />}
        {activeTab === 'start-link' && <StartLinkSettings />}
        {activeTab === 'portals' && <PortalManager />}
      </div>
    </div>
  );
}
