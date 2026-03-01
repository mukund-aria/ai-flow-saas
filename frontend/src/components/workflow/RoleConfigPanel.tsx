/**
 * Role Configuration Panel
 *
 * Right-side panel for configuring an assignee role.
 * - Editable role name
 * - Resolution type dropdown (grouped: direct, data sources, advanced logic)
 * - Resolution-specific sub-config (email, field key, variable, etc.)
 * - Advanced: Coordinator toggle, View all actions toggle
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  X, ChevronUp, ChevronDown, Search, Plus, Trash2,
  UserPlus, UserCheck, PlayCircle, FileText,
  Variable, GitBranch, RefreshCw, Database,
  Shield, UserCircle, Eye, Users, Building2,
} from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getRoleColor, getRoleInitials } from '@/types';
import type { ResolutionType, Resolution, FormField, FlowVariable, CompletionMode } from '@/types';
import { listContacts, listContactGroups, listAccounts } from '@/lib/api';
import type { Contact, ContactGroup, Account } from '@/lib/api';
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';
import { RolePreviewDialog } from './RolePreviewDialog';

interface RoleConfigPanelProps {
  roleId: string;
  onClose: () => void;
}

interface ResolutionOption {
  type: ResolutionType;
  label: string;
  icon: typeof UserPlus;
  description: string;
}

const DIRECT_OPTIONS: ResolutionOption[] = [
  {
    type: 'CONTACT_TBD',
    label: 'Contact TBD',
    icon: UserPlus,
    description: 'This assignee can be selected when the flow starts, or added later during the flow',
  },
  {
    type: 'FIXED_CONTACT',
    label: 'Contact',
    icon: UserCheck,
    description: 'This assignee is always assigned to the same user in every flow',
  },
];

const DATA_SOURCE_OPTIONS: ResolutionOption[] = [
  {
    type: 'WORKSPACE_INITIALIZER',
    label: 'Workspace initializer',
    icon: PlayCircle,
    description: 'This assignee will be the person who starts the flow',
  },
  {
    type: 'KICKOFF_FORM_FIELD',
    label: 'From kickoff form',
    icon: FileText,
    description: 'This assignee is determined from a form field in the kickoff form when it is used to start the flow',
  },
  {
    type: 'FLOW_VARIABLE',
    label: 'From variable',
    icon: Variable,
    description: 'This assignee is determined using a variable provided when the flow starts',
  },
];

const GROUP_OPTIONS: ResolutionOption[] = [
  {
    type: 'CONTACT_GROUP',
    label: 'Contact group',
    icon: Users,
    description: 'Assign to all members of a contact group. Configure completion mode (any one, all, or majority).',
  },
  {
    type: 'ACCOUNT_CONTACTS',
    label: 'Account contacts',
    icon: Building2,
    description: 'Assign to all active contacts in an account. Configure completion mode.',
  },
];

const ADVANCED_OPTIONS: ResolutionOption[] = [
  {
    type: 'RULES',
    label: 'Based on rule',
    icon: GitBranch,
    description: 'This assignee is selected automatically based on rule conditions you define',
  },
  {
    type: 'ROUND_ROBIN',
    label: 'Round robin',
    icon: RefreshCw,
    description: 'This assignee rotates across a predefined group of users for each new flow',
  },
];

const ALL_OPTIONS = [...DIRECT_OPTIONS, ...DATA_SOURCE_OPTIONS, ...GROUP_OPTIONS, ...ADVANCED_OPTIONS];

export function RoleConfigPanel({ roleId, onClose }: RoleConfigPanelProps) {
  const { workflow, updateRole } = useWorkflowStore();
  const assignees = workflow?.roles || [];
  const assignee = assignees.find(a => a.roleId === roleId);
  const assigneeIndex = assignees.findIndex(a => a.roleId === roleId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [assigneeExpanded, setAssigneeExpanded] = useState(true);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Data sources for sub-configs
  const kickoffFields: FormField[] = useMemo(
    () => (workflow?.kickoff?.kickoffFormFields ?? []).filter(f => f.type !== 'HEADING' && f.type !== 'PARAGRAPH'),
    [workflow?.kickoff?.kickoffFormFields]
  );
  const flowVariables: FlowVariable[] = useMemo(
    () => workflow?.kickoff?.flowVariables ?? [],
    [workflow?.kickoff?.flowVariables]
  );

  // Fetch contacts for Round Robin and Rules
  const [contacts, setContacts] = useState<Contact[]>([]);
  useEffect(() => {
    listContacts()
      .then((data) => setContacts(data.filter(c => c.status === 'ACTIVE')))
      .catch(() => setContacts([]));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Focus name input
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  if (!assignee) return null;

  const resType = assignee.resolution?.type || 'CONTACT_TBD';
  const currentOption = ALL_OPTIONS.find(o => o.type === resType) || ALL_OPTIONS[0];

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && !assignees.some(a => a.roleId !== roleId && a.name.toLowerCase() === trimmed.toLowerCase())) {
      updateRole(roleId, { name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleResolutionSelect = (type: ResolutionType) => {
    const newResolution: Resolution = { type };
    // Preserve existing sub-config if same type
    if (type === assignee.resolution?.type) {
      setDropdownOpen(false);
      return;
    }
    updateRole(roleId, { resolution: newResolution });
    setDropdownOpen(false);
  };

  const handleResolutionUpdate = (updates: Partial<Resolution>) => {
    updateRole(roleId, {
      resolution: { ...assignee.resolution, type: resType, ...updates },
    });
  };

  const handleToggleCoordinator = () => {
    updateRole(roleId, {
      roleOptions: {
        coordinatorToggle: !assignee.roleOptions?.coordinatorToggle,
        allowViewAllActions: assignee.roleOptions?.allowViewAllActions || false,
      },
    });
  };

  const handleToggleViewAll = () => {
    updateRole(roleId, {
      roleOptions: {
        coordinatorToggle: assignee.roleOptions?.coordinatorToggle || false,
        allowViewAllActions: !assignee.roleOptions?.allowViewAllActions,
      },
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: getRoleColor(assigneeIndex) }}
          >
            {getRoleInitials(assignee.name)}
          </span>
          <div>
            <div className="text-[11px] text-gray-400 font-medium">Assignee configuration</div>
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="text-base font-semibold text-gray-900 bg-transparent border-b-2 border-violet-500 outline-none w-full"
              />
            ) : (
              <button
                onClick={() => { setNameValue(assignee.name); setIsEditingName(true); }}
                className="text-base font-semibold text-gray-900 hover:text-violet-700 transition-colors text-left"
              >
                {assignee.name}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            className="p-1 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
            title={`Preview ${assignee.name}'s experience`}
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Role Type Section */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="text-xs text-gray-500 font-medium mb-2">
            <FeatureTooltip content="Coordinators see the full run dashboard. Assignees only see their assigned tasks via secure email links." side="right">
              <span>Role type</span>
            </FeatureTooltip>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => updateRole(roleId, { roleType: 'coordinator' })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                (assignee.roleType || 'assignee') === 'coordinator'
                  ? 'bg-violet-50 text-violet-700 border-r border-gray-200'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border-r border-gray-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              Coordinator
            </button>
            <button
              onClick={() => updateRole(roleId, { roleType: 'assignee' })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                (assignee.roleType || 'assignee') === 'assignee'
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <UserCircle className="w-4 h-4" />
              Assignee
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            {(assignee.roleType || 'assignee') === 'coordinator'
              ? 'Full access to this flow run. Can view all steps, reassign, and chat.'
              : 'Can only complete their assigned tasks. Accessed via magic link.'}
          </p>
        </div>

        {/* Assignee Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => setAssigneeExpanded(!assigneeExpanded)}
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <span className="text-sm font-semibold text-gray-900">Assignee</span>
            {assigneeExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {assigneeExpanded && (
            <div className="px-6 pb-5 space-y-4">
              <div className="text-xs text-gray-500 font-medium">
                <FeatureTooltip content="How this role maps to a real person when the flow starts. 'Contact TBD' lets the coordinator choose at runtime." side="right">
                  <span>Select assignee</span>
                </FeatureTooltip>
              </div>

              {/* Resolution dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <currentOption.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{currentOption.label}</span>
                  </div>
                  {dropdownOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg py-1 max-h-[360px] overflow-y-auto">
                    {/* Direct options */}
                    {DIRECT_OPTIONS.map((opt) => (
                      <DropdownItem
                        key={opt.type}
                        option={opt}
                        isActive={opt.type === resType}
                        onClick={() => handleResolutionSelect(opt.type)}
                      />
                    ))}

                    {/* Data sources group */}
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100 mt-1">
                      From data sources
                    </div>
                    {DATA_SOURCE_OPTIONS.map((opt) => (
                      <DropdownItem
                        key={opt.type}
                        option={opt}
                        isActive={opt.type === resType}
                        onClick={() => handleResolutionSelect(opt.type)}
                      />
                    ))}

                    {/* Group assignment */}
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">
                      Group assignment
                    </div>
                    {GROUP_OPTIONS.map((opt) => (
                      <DropdownItem
                        key={opt.type}
                        option={opt}
                        isActive={opt.type === resType}
                        onClick={() => handleResolutionSelect(opt.type)}
                      />
                    ))}

                    {/* Advanced logic group */}
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 border-t border-b border-gray-100">
                      Advanced logic
                    </div>
                    {ADVANCED_OPTIONS.map((opt) => (
                      <DropdownItem
                        key={opt.type}
                        option={opt}
                        isActive={opt.type === resType}
                        onClick={() => handleResolutionSelect(opt.type)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Resolution-specific sub-config */}
              <ResolutionSubConfig
                resType={resType}
                resolution={assignee.resolution}
                onUpdate={handleResolutionUpdate}
                kickoffFields={kickoffFields}
                flowVariables={flowVariables}
                contacts={contacts}
              />
            </div>
          )}
        </div>

        {/* Advanced Section */}
        <div className="border-b border-gray-100">
          <button
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="w-full flex items-center justify-between px-6 py-4"
          >
            <span className="text-sm font-semibold text-gray-900">Advanced (Optional)</span>
            {advancedExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {advancedExpanded && (
            <div className="px-6 pb-5 space-y-5">
              {/* Coordinator toggle */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Coordinator</div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Grant 'Coordinate' permission to allow the assignee to monitor progress and manage actions.
                  </p>
                </div>
                <button
                  onClick={handleToggleCoordinator}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
                    assignee.roleOptions?.coordinatorToggle ? 'bg-violet-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      assignee.roleOptions?.coordinatorToggle ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* View all actions toggle */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Allow viewing other assignee's actions</div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Once enabled, the assignee can see all user actions, helping them track the current progress of the flow.
                  </p>
                </div>
                <button
                  onClick={handleToggleViewAll}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
                    assignee.roleOptions?.allowViewAllActions ? 'bg-violet-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      assignee.roleOptions?.allowViewAllActions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Preview Dialog */}
      <RolePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        steps={workflow?.steps || []}
        role={assignee}
        roleIndex={assigneeIndex}
      />
    </div>
  );
}

// ============================================================================
// Dropdown Item
// ============================================================================

function DropdownItem({ option, isActive, onClick }: { option: ResolutionOption; isActive: boolean; onClick: () => void }) {
  const Icon = option.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
        isActive ? 'bg-violet-50' : 'hover:bg-gray-50'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-600' : 'text-gray-400'}`} />
      <span className={`text-sm ${isActive ? 'text-violet-700 font-medium' : 'text-gray-700'}`}>
        {option.label}
      </span>
    </button>
  );
}

// ============================================================================
// Resolution Sub-Config (type-specific fields)
// ============================================================================

interface SubConfigProps {
  resType: ResolutionType;
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
  kickoffFields: FormField[];
  flowVariables: FlowVariable[];
  contacts: Contact[];
}

function ResolutionSubConfig({ resType, resolution, onUpdate, kickoffFields, flowVariables, contacts }: SubConfigProps) {
  switch (resType) {
    case 'CONTACT_TBD':
      return (
        <p className="text-xs text-gray-400 italic">
          The contact will be selected when the flow starts or assigned later.
        </p>
      );

    case 'FIXED_CONTACT':
      return (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contact email</label>
          <input
            type="email"
            value={resolution?.email || ''}
            onChange={(e) => onUpdate({ email: e.target.value })}
            placeholder="name@example.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
          />
        </div>
      );

    case 'WORKSPACE_INITIALIZER':
      return (
        <p className="text-xs text-gray-400 italic">
          This role will be assigned to the person who starts the flow.
        </p>
      );

    case 'KICKOFF_FORM_FIELD':
      return <KickoffFieldPicker resolution={resolution} onUpdate={onUpdate} kickoffFields={kickoffFields} />;

    case 'FLOW_VARIABLE':
      return <FlowVariablePicker resolution={resolution} onUpdate={onUpdate} flowVariables={flowVariables} />;

    case 'ROUND_ROBIN':
      return <RoundRobinConfig resolution={resolution} onUpdate={onUpdate} contacts={contacts} />;

    case 'RULES':
      return (
        <RulesConfig
          resolution={resolution}
          onUpdate={onUpdate}
          contacts={contacts}
          kickoffFields={kickoffFields}
          flowVariables={flowVariables}
        />
      );

    case 'CONTACT_GROUP':
      return <ContactGroupConfig resolution={resolution} onUpdate={onUpdate} />;

    case 'ACCOUNT_CONTACTS':
      return <AccountContactsConfig resolution={resolution} onUpdate={onUpdate} />;

    default:
      return null;
  }
}

// ============================================================================
// Insert Data Picker (shared popover for kickoff fields + variables)
// ============================================================================

interface InsertDataPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string, label: string) => void;
  kickoffFields?: FormField[];
  flowVariables?: FlowVariable[];
  anchorRef: React.RefObject<HTMLElement | null>;
}

function InsertDataPicker({ open, onClose, onSelect, kickoffFields, flowVariables, anchorRef }: InsertDataPickerProps) {
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const q = search.toLowerCase();
  const filteredFields = (kickoffFields || []).filter(f => f.label.toLowerCase().includes(q));
  const filteredVars = (flowVariables || []).filter(v => v.key.toLowerCase().includes(q));
  const hasItems = filteredFields.length > 0 || filteredVars.length > 0;

  return (
    <div ref={ref} className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-900">Insert data</span>
        <button onClick={onClose} className="p-0.5 text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {!hasItems && (
          <div className="px-4 py-6 text-center">
            <p className="text-sm font-medium text-gray-700">No data source found</p>
            <p className="text-xs text-gray-400 mt-1">Available reference data will appear here.</p>
          </div>
        )}
        {filteredFields.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Kickoff Form
            </div>
            {filteredFields.map((f) => (
              <button
                key={f.fieldId}
                onClick={() => { onSelect(f.fieldId, f.label); onClose(); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-violet-50 transition-colors flex items-center gap-2"
              >
                <span className="truncate">{f.label}</span>
                <span className="text-[10px] text-gray-400 shrink-0">{f.type}</span>
              </button>
            ))}
          </>
        )}
        {filteredVars.length > 0 && (
          <>
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 flex items-center gap-1.5">
              <Database className="w-3 h-3" /> Workspace
            </div>
            {filteredVars.map((v) => (
              <button
                key={v.key}
                onClick={() => { onSelect(v.key, v.key); onClose(); }}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-violet-50 transition-colors flex items-center gap-2"
              >
                <Variable className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{v.key}</span>
                <span className="text-[10px] text-gray-400 shrink-0">{v.type}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Kickoff Form Field Picker
// ============================================================================

function KickoffFieldPicker({
  resolution,
  onUpdate,
  kickoffFields,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
  kickoffFields: FormField[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selectedField = kickoffFields.find(f => f.fieldId === resolution?.fieldKey);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setPickerOpen(!pickerOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-sm"
      >
        <span className={selectedField ? 'text-gray-700' : 'text-gray-400'}>
          {selectedField ? selectedField.label : 'Select kickoff form...'}
        </span>
        {pickerOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <InsertDataPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(key) => onUpdate({ fieldKey: key })}
        kickoffFields={kickoffFields}
        anchorRef={btnRef}
      />
    </div>
  );
}

// ============================================================================
// Flow Variable Picker
// ============================================================================

function FlowVariablePicker({
  resolution,
  onUpdate,
  flowVariables,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
  flowVariables: FlowVariable[];
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const selectedVar = flowVariables.find(v => v.key === resolution?.variableKey);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setPickerOpen(!pickerOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-sm"
      >
        <span className={selectedVar ? 'text-gray-700' : 'text-gray-400'}>
          {selectedVar ? selectedVar.key : 'Select workspace variable...'}
        </span>
        {pickerOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <InsertDataPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(key) => onUpdate({ variableKey: key })}
        flowVariables={flowVariables}
        anchorRef={btnRef}
      />
    </div>
  );
}

// ============================================================================
// Round Robin Multi-Contact Selector
// ============================================================================

function RoundRobinConfig({
  resolution,
  onUpdate,
  contacts,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
  contacts: Contact[];
}) {
  const [search, setSearch] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedEmails = resolution?.emails || [];
  const selectedSet = new Set(selectedEmails.map(e => e.toLowerCase()));

  const q = search.toLowerCase();
  const filtered = contacts.filter(c =>
    !selectedSet.has(c.email.toLowerCase()) &&
    (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  );

  const toggleContact = (email: string) => {
    if (selectedSet.has(email.toLowerCase())) {
      onUpdate({ emails: selectedEmails.filter(e => e.toLowerCase() !== email.toLowerCase()) });
    } else {
      onUpdate({ emails: [...selectedEmails, email] });
    }
  };

  const removeEmail = (email: string) => {
    onUpdate({ emails: selectedEmails.filter(e => e.toLowerCase() !== email.toLowerCase()) });
  };

  useEffect(() => {
    if (!dropOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropOpen]);

  return (
    <div className="space-y-2">
      {/* Selected contacts as chips */}
      {selectedEmails.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedEmails.map((email) => {
            const contact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
            return (
              <span key={email} className="inline-flex items-center gap-1 px-2 py-1 bg-violet-50 border border-violet-200 rounded-md text-xs text-violet-700">
                {contact?.name || email}
                <button onClick={() => removeEmail(email)} className="text-violet-400 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Multi-select dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setDropOpen(!dropOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors text-sm"
        >
          <span className="text-gray-400">Select multiple contacts</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {dropOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">No contacts found</div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { toggleContact(c.email); setSearch(''); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-violet-50 transition-colors"
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate text-gray-700">{c.name}</span>
                    <span className="text-xs text-gray-400 truncate">{c.email}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400">
        Each new flow will rotate the assignment to the next contact in the list.
      </p>
    </div>
  );
}

// ============================================================================
// Rules Config Builder
// ============================================================================

interface RuleItem {
  source?: 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD';
  sourceKey?: string;
  operator?: 'equals' | 'contains' | 'notEmpty';
  value?: string;
  contactEmail?: string;
}

function RulesConfig({
  resolution,
  onUpdate,
  contacts,
  kickoffFields,
  flowVariables,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
  contacts: Contact[];
  kickoffFields: FormField[];
  flowVariables: FlowVariable[];
}) {
  // Parse existing config
  const config = resolution?.config;
  const existingRules: RuleItem[] = (config?.rules || []).map(r => ({
    source: config?.source as 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD' | undefined,
    sourceKey: config?.source === 'FLOW_VARIABLE' ? config?.variableKey : config?.fieldKey,
    operator: r.if.equals !== undefined ? 'equals' : r.if.contains !== undefined ? 'contains' : 'notEmpty',
    value: r.if.equals ?? r.if.contains ?? '',
    contactEmail: r.then?.email,
  }));

  const [rules, setRules] = useState<RuleItem[]>(existingRules.length > 0 ? existingRules : [{ operator: 'equals' }]);
  const [defaultEnabled, setDefaultEnabled] = useState(!!config?.default?.email);
  const [defaultEmail, setDefaultEmail] = useState(config?.default?.email || '');

  // Build source options
  const sourceOptions: { key: string; label: string; source: 'KICKOFF_FORM_FIELD' | 'FLOW_VARIABLE' }[] = [
    ...kickoffFields.map(f => ({ key: f.fieldId, label: `Kickoff: ${f.label}`, source: 'KICKOFF_FORM_FIELD' as const })),
    ...flowVariables.map(v => ({ key: v.key, label: `Variable: ${v.key}`, source: 'FLOW_VARIABLE' as const })),
  ];

  // Sync to resolution on changes
  const syncConfig = (updatedRules: RuleItem[], defEnabled: boolean, defEmail: string) => {
    const firstRule = updatedRules[0];
    const source = firstRule?.source || 'KICKOFF_FORM_FIELD';
    const sourceKey = firstRule?.sourceKey || '';

    const builtRules = updatedRules.filter(r => r.sourceKey && r.contactEmail).map(r => ({
      if: r.operator === 'equals' ? { equals: r.value || '' }
        : r.operator === 'contains' ? { contains: r.value || '' }
        : { notEmpty: true },
      then: { type: 'FIXED_CONTACT' as const, email: r.contactEmail || '' },
    }));

    onUpdate({
      config: {
        source,
        ...(source === 'FLOW_VARIABLE' ? { variableKey: sourceKey } : { fieldKey: sourceKey }),
        rules: builtRules,
        default: defEnabled && defEmail
          ? { type: 'FIXED_CONTACT', email: defEmail }
          : { type: 'CONTACT_TBD' },
      },
    });
  };

  const updateRule = (index: number, updates: Partial<RuleItem>) => {
    const updated = rules.map((r, i) => i === index ? { ...r, ...updates } : r);
    setRules(updated);
    syncConfig(updated, defaultEnabled, defaultEmail);
  };

  const addRule = () => {
    const updated = [...rules, { operator: 'equals' as const }];
    setRules(updated);
  };

  const removeRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated.length > 0 ? updated : [{ operator: 'equals' }]);
    syncConfig(updated.length > 0 ? updated : [{ operator: 'equals' }], defaultEnabled, defaultEmail);
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-gray-600">Configure rules</div>

      {/* Rules list */}
      {rules.map((rule, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-2.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">If</span>
            <button onClick={() => removeRule(index)} className="p-0.5 text-gray-300 hover:text-red-500">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Source selector */}
          <select
            value={rule.sourceKey ? `${rule.source}:${rule.sourceKey}` : ''}
            onChange={(e) => {
              const [src, key] = e.target.value.split(':');
              updateRule(index, { source: src as 'FLOW_VARIABLE' | 'KICKOFF_FORM_FIELD', sourceKey: key });
            }}
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Choose from variables</option>
            {sourceOptions.map(s => (
              <option key={`${s.source}:${s.key}`} value={`${s.source}:${s.key}`}>{s.label}</option>
            ))}
          </select>

          {/* Operator + value */}
          <div className="flex gap-2">
            <select
              value={rule.operator || 'equals'}
              onChange={(e) => updateRule(index, { operator: e.target.value as 'equals' | 'contains' | 'notEmpty' })}
              className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="equals">Equals</option>
              <option value="contains">Contains</option>
              <option value="notEmpty">Not empty</option>
            </select>
            {rule.operator !== 'notEmpty' && (
              <input
                type="text"
                value={rule.value || ''}
                onChange={(e) => updateRule(index, { value: e.target.value })}
                placeholder="Enter value"
                className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            )}
          </div>

          {/* Contact selector */}
          <select
            value={rule.contactEmail || ''}
            onChange={(e) => updateRule(index, { contactEmail: e.target.value })}
            className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="">Select contact</option>
            {contacts.map(c => (
              <option key={c.id} value={c.email}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>
      ))}

      {/* Add rule button */}
      <button
        onClick={addRule}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add new rule
      </button>

      {/* Default fallback */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          checked={defaultEnabled}
          onChange={(e) => {
            setDefaultEnabled(e.target.checked);
            syncConfig(rules, e.target.checked, defaultEmail);
          }}
          className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <span className="text-xs text-gray-600">If no rule matches, assign to</span>
        <select
          value={defaultEmail}
          onChange={(e) => {
            setDefaultEmail(e.target.value);
            syncConfig(rules, defaultEnabled, e.target.value);
          }}
          disabled={!defaultEnabled}
          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
        >
          <option value="">Select contact</option>
          {contacts.map(c => (
            <option key={c.id} value={c.email}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// Contact Group Config
// ============================================================================

function ContactGroupConfig({
  resolution,
  onUpdate,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
}) {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listContactGroups()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-gray-400 italic">Loading groups...</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Contact group</label>
        <select
          value={resolution?.groupId || ''}
          onChange={(e) => onUpdate({ groupId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Select a group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} ({g.memberCount ?? 0} members)
            </option>
          ))}
        </select>
      </div>

      <CompletionModeSelector
        value={(resolution?.completionMode || 'ANY_ONE') as CompletionMode}
        onChange={(mode) => onUpdate({ completionMode: mode })}
      />

      <p className="text-xs text-gray-400 italic">
        All members of the selected group will be assigned this step.
      </p>
    </div>
  );
}

// ============================================================================
// Account Contacts Config
// ============================================================================

function AccountContactsConfig({
  resolution,
  onUpdate,
}: {
  resolution?: Resolution;
  onUpdate: (updates: Partial<Resolution>) => void;
}) {
  const [accountsList, setAccountsList] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAccounts()
      .then(setAccountsList)
      .catch(() => setAccountsList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-xs text-gray-400 italic">Loading accounts...</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Account</label>
        <select
          value={resolution?.accountId || ''}
          onChange={(e) => onUpdate({ accountId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="">Select an account</option>
          {accountsList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} {a.domain ? `(${a.domain})` : ''}
            </option>
          ))}
        </select>
      </div>

      <CompletionModeSelector
        value={(resolution?.completionMode || 'ANY_ONE') as CompletionMode}
        onChange={(mode) => onUpdate({ completionMode: mode })}
      />

      <p className="text-xs text-gray-400 italic">
        All active contacts in the selected account will be assigned this step.
      </p>
    </div>
  );
}

// ============================================================================
// Completion Mode Selector (shared by group assignment types)
// ============================================================================

function CompletionModeSelector({
  value,
  onChange,
}: {
  value: CompletionMode;
  onChange: (mode: CompletionMode) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Completion mode</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CompletionMode)}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
      >
        <option value="ANY_ONE">Any one completes</option>
        <option value="ALL">All must complete</option>
        <option value="MAJORITY">Majority must complete</option>
      </select>
      <p className="text-xs text-gray-400 mt-1">
        {value === 'ANY_ONE' && 'Step advances when any single assignee completes it.'}
        {value === 'ALL' && 'Step advances only when every assignee completes it.'}
        {value === 'MAJORITY' && 'Step advances when more than half of assignees complete it.'}
      </p>
    </div>
  );
}
