import { useState, useEffect, useRef } from 'react';
import { X, Settings, Shield, Users, Bell, Clock, Code2, Search, Check } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';
import { FlowPermissionsEditor } from './FlowPermissionsEditor';
import { AssigneeExperienceEditor } from './AssigneeExperienceEditor';
import { FlowNotificationSettingsPanel } from './FlowNotificationSettings';
import { EmbedConfig } from './EmbedConfig';
import { listTeamMembers, type TeamMember } from '@/lib/api';
import type { FlowDueDates, DueUnit } from '@/types';

interface FlowSettingsPanelProps {
  onClose: () => void;
}

type SettingsTab = 'general' | 'permissions' | 'assignee' | 'notifications' | 'duedates' | 'embed';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'assignee', label: 'Assignee', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'duedates', label: 'Due Dates', icon: Clock },
  { id: 'embed', label: 'Embed', icon: Code2 },
];

export function FlowSettingsPanel({ onClose }: FlowSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateFlowMetadata = useWorkflowStore((s) => s.updateFlowMetadata);
  const updateFlowSettings = useWorkflowStore((s) => s.updateFlowSettings);
  const updateFlowDueDates = useWorkflowStore((s) => s.updateFlowDueDates);

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

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <FlowPermissionsEditor />
            <div className="border-t border-gray-100" />
            <TemplateCoordinatorsEditor />
          </div>
        )}

        {activeTab === 'assignee' && <AssigneeExperienceEditor />}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <FlowNotificationSettingsPanel />
          </div>
        )}

        {activeTab === 'duedates' && (
          <FlowDueDatesTab
            dueDates={workflow.dueDates || {}}
            onUpdate={updateFlowDueDates}
          />
        )}

        {activeTab === 'embed' && workflow.flowId && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Enable embedding to let external users start this flow from your website or via a shareable link.
            </p>
            <EmbedConfig
              templateId={workflow.flowId}
              existingEmbedId={(workflow as any).embedId}
            />
          </div>
        )}

        {activeTab === 'embed' && !workflow.flowId && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Save the template first to enable embedding.</p>
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
          <FeatureTooltip content="Auto-name runs using form data. Example: 'Onboarding - {Kickoff / Client Name}'" side="right">
            <span>Workspace Name Template</span>
          </FeatureTooltip>
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
            Automatically archive flows after they are completed
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
            Allow AI chat assistance within flows for coordinators
          </p>
        </div>
      </label>
    </div>
  );
}

// ============================================================================
// Due Dates Tab
// ============================================================================

type FlowDueMode = 'RELATIVE' | 'FIXED';

interface FlowDueDatesTabProps {
  dueDates: FlowDueDates;
  onUpdate: (dueDates: FlowDueDates) => void;
}

function FlowDueDatesTab({ dueDates, onUpdate }: FlowDueDatesTabProps) {
  const hasFlowDue = !!dueDates.flowDue;
  const currentMode: FlowDueMode = dueDates.flowDue?.type || 'RELATIVE';

  // Local state for relative mode
  const [relativeValue, setRelativeValue] = useState(
    dueDates.flowDue?.type === 'RELATIVE' ? dueDates.flowDue.value : 7
  );
  const [relativeUnit, setRelativeUnit] = useState<DueUnit>(
    dueDates.flowDue?.type === 'RELATIVE' ? dueDates.flowDue.unit : 'DAYS'
  );

  // Local state for fixed mode
  const [fixedDate, setFixedDate] = useState(
    dueDates.flowDue?.type === 'FIXED' ? dueDates.flowDue.date : ''
  );

  const [mode, setMode] = useState<FlowDueMode>(currentMode);

  const handleToggle = (checked: boolean) => {
    if (checked) {
      if (mode === 'RELATIVE') {
        onUpdate({ flowDue: { type: 'RELATIVE', value: relativeValue, unit: relativeUnit } });
      } else if (fixedDate) {
        onUpdate({ flowDue: { type: 'FIXED', date: fixedDate } });
      } else {
        // Default to relative if no date set yet
        setMode('RELATIVE');
        onUpdate({ flowDue: { type: 'RELATIVE', value: relativeValue, unit: relativeUnit } });
      }
    } else {
      onUpdate({ flowDue: undefined });
    }
  };

  const handleModeChange = (newMode: FlowDueMode) => {
    setMode(newMode);
    if (newMode === 'RELATIVE') {
      onUpdate({ flowDue: { type: 'RELATIVE', value: relativeValue, unit: relativeUnit } });
    } else {
      if (fixedDate) {
        onUpdate({ flowDue: { type: 'FIXED', date: fixedDate } });
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Enable/disable toggle */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={hasFlowDue}
          onChange={(e) => handleToggle(e.target.checked)}
          className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Set a flow-level deadline</span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Define when this flow should be completed by
          </p>
        </div>
      </label>

      {hasFlowDue && (
        <div className="space-y-4 pl-1">
          {/* Mode selector */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
            <button
              type="button"
              onClick={() => handleModeChange('RELATIVE')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors ${
                mode === 'RELATIVE'
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Relative
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('FIXED')}
              className={`px-4 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${
                mode === 'FIXED'
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Fixed Date
            </button>
          </div>

          {/* Relative mode */}
          {mode === 'RELATIVE' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">This flow should complete within:</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={relativeValue}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 1;
                    setRelativeValue(v);
                    onUpdate({ flowDue: { type: 'RELATIVE', value: v, unit: relativeUnit } });
                  }}
                  className="w-20 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <select
                  value={relativeUnit}
                  onChange={(e) => {
                    const u = e.target.value as DueUnit;
                    setRelativeUnit(u);
                    onUpdate({ flowDue: { type: 'RELATIVE', value: relativeValue, unit: u } });
                  }}
                  className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="HOURS">hours</option>
                  <option value="DAYS">days</option>
                  <option value="WEEKS">weeks</option>
                </select>
                <span className="text-xs text-gray-500">of starting</span>
              </div>
            </div>
          )}

          {/* Fixed date mode */}
          {mode === 'FIXED' && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">This flow must complete by:</p>
              <input
                type="date"
                value={fixedDate}
                onChange={(e) => {
                  setFixedDate(e.target.value);
                  if (e.target.value) {
                    onUpdate({ flowDue: { type: 'FIXED', date: e.target.value } });
                  }
                }}
                className="px-3 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}

          <div className="border-t border-gray-100" />

          {/* Info text */}
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Step-level due dates can reference this deadline using the &quot;Before Flow Due&quot; mode in each step&apos;s due date settings.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Template Coordinators Editor
// ============================================================================

function TemplateCoordinatorsEditor() {
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateTemplateCoordinators = useWorkflowStore((s) => s.updateTemplateCoordinators);

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedIds = workflow?.templateCoordinatorIds || [];

  useEffect(() => {
    listTeamMembers()
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const toggleMember = (memberId: string) => {
    if (selectedIds.includes(memberId)) {
      updateTemplateCoordinators(selectedIds.filter(id => id !== memberId));
    } else {
      updateTemplateCoordinators([...selectedIds, memberId]);
    }
  };

  const removeMember = (memberId: string) => {
    updateTemplateCoordinators(selectedIds.filter(id => id !== memberId));
  };

  const q = search.toLowerCase();
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  );

  const selectedMembers = members.filter(m => selectedIds.includes(m.id));

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Template Coordinators
        </h4>
        <p className="text-[11px] text-gray-400">
          These users can see ALL runs of this template and view template-level reports.
        </p>
      </div>

      {/* Selected coordinators as chips */}
      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedMembers.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 border border-violet-200 rounded-md text-xs text-violet-700">
              <span className="w-4 h-4 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center text-[9px] font-bold shrink-0">
                {m.name.charAt(0).toUpperCase()}
              </span>
              {m.name}
              <button onClick={() => removeMember(m.id)} className="text-violet-400 hover:text-red-500 ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Multi-select dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-sm"
        >
          <span className="text-gray-400">
            {loading ? 'Loading members...' : 'Select org members...'}
          </span>
          <Search className="w-4 h-4 text-gray-400" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">
                  {loading ? 'Loading...' : 'No members found'}
                </div>
              ) : (
                filteredMembers.map((m) => {
                  const isSelected = selectedIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                        isSelected ? 'bg-violet-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-gray-900 truncate block">{m.name}</span>
                        <span className="text-gray-400 text-xs truncate block">{m.email}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded shrink-0">
                        {m.role}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-violet-600 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
