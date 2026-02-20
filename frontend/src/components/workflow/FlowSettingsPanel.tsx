import { useState } from 'react';
import { X, Settings, Shield, Users, Bell } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { FlowPermissionsEditor } from './FlowPermissionsEditor';
import { AssigneeExperienceEditor } from './AssigneeExperienceEditor';
import { FlowNotificationSettingsPanel } from './FlowNotificationSettings';

interface FlowSettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = 'general' | 'permissions' | 'assignee' | 'notifications';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'assignee', label: 'Assignee Experience', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export function FlowSettingsPanel({ onClose }: FlowSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateFlowMetadata = useWorkflowStore((s) => s.updateFlowMetadata);
  const updateFlowSettings = useWorkflowStore((s) => s.updateFlowSettings);

  if (!workflow) return null;

  const settings = workflow.settings || {};

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Template Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 px-2 gap-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'general' && (
          <GeneralTab
            workspaceNameTemplate={workflow.workspaceNameTemplate || ''}
            description={workflow.description || ''}
            autoArchiveEnabled={settings.autoArchiveEnabled ?? false}
            chatAssistanceEnabled={settings.chatAssistanceEnabled ?? false}
            onUpdateMetadata={updateFlowMetadata}
            onUpdateSettings={updateFlowSettings}
          />
        )}

        {activeTab === 'permissions' && <FlowPermissionsEditor />}

        {activeTab === 'assignee' && <AssigneeExperienceEditor />}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <FlowNotificationSettingsPanel />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// General Tab
// ============================================================================

interface GeneralTabProps {
  workspaceNameTemplate: string;
  description: string;
  autoArchiveEnabled: boolean;
  chatAssistanceEnabled: boolean;
  onUpdateMetadata: (updates: Partial<Pick<import('@/types').Flow, 'name' | 'description' | 'workspaceNameTemplate'>>) => void;
  onUpdateSettings: (settings: Partial<import('@/types').FlowSettings>) => void;
}

function GeneralTab({
  workspaceNameTemplate,
  description,
  autoArchiveEnabled,
  chatAssistanceEnabled,
  onUpdateMetadata,
  onUpdateSettings,
}: GeneralTabProps) {
  return (
    <div className="space-y-5">
      {/* Workspace Name Template */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Workspace Name Template
        </label>
        <input
          type="text"
          value={workspaceNameTemplate}
          onChange={(e) => onUpdateMetadata({ workspaceNameTemplate: e.target.value })}
          placeholder="e.g. Onboarding - {Kickoff / Client Name}"
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <p className="mt-1 text-[11px] text-gray-400">
          Use {'{Kickoff / Field}'} for dynamic naming
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => onUpdateMetadata({ description: e.target.value })}
          placeholder="Describe what this template is used for..."
          rows={3}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="border-t border-gray-100" />

      {/* Auto-Archive Toggle */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={autoArchiveEnabled}
          onChange={(e) => onUpdateSettings({ autoArchiveEnabled: e.target.checked })}
          className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Auto-archive completed flows</span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Automatically archive flow runs after they are completed
          </p>
        </div>
      </label>

      {/* Chat Assistance Toggle */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={chatAssistanceEnabled}
          onChange={(e) => onUpdateSettings({ chatAssistanceEnabled: e.target.checked })}
          className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Enable chat assistance</span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Allow AI chat assistance within flow runs for coordinators
          </p>
        </div>
      </label>
    </div>
  );
}
