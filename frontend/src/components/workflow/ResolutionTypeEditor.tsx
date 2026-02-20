/**
 * Resolution Type Editor
 *
 * Configures how an assignee role resolves to a real contact at runtime.
 * Each resolution type determines the strategy for mapping a role placeholder
 * to an actual person when a flow is executed.
 */

import { useState } from 'react';
import {
  Users,
  UserCheck,
  PlayCircle,
  FileText,
  Variable,
  GitBranch,
  RefreshCw,
  X,
  Plus,
  Info,
} from 'lucide-react';
import type { Resolution, ResolutionType, KickoffConfig } from '@/types';

interface ResolutionTypeEditorProps {
  resolution: Resolution;
  onChange: (resolution: Resolution) => void;
  kickoff?: KickoffConfig;
}

const RESOLUTION_OPTIONS: {
  type: ResolutionType;
  label: string;
  description: string;
  icon: typeof Users;
}[] = [
  {
    type: 'CONTACT_TBD',
    label: 'Contact (TBD)',
    description: 'Assigned when flow starts',
    icon: Users,
  },
  {
    type: 'FIXED_CONTACT',
    label: 'Fixed Contact',
    description: 'Always the same person',
    icon: UserCheck,
  },
  {
    type: 'WORKSPACE_INITIALIZER',
    label: 'Flow Starter',
    description: 'Person who starts this flow',
    icon: PlayCircle,
  },
  {
    type: 'KICKOFF_FORM_FIELD',
    label: 'From Kickoff Form',
    description: 'Read from a kickoff form field',
    icon: FileText,
  },
  {
    type: 'FLOW_VARIABLE',
    label: 'From Variable',
    description: 'Read from a flow variable',
    icon: Variable,
  },
  {
    type: 'RULES',
    label: 'Rules',
    description: 'Based on conditions',
    icon: GitBranch,
  },
  {
    type: 'ROUND_ROBIN',
    label: 'Round Robin',
    description: 'Rotate among contacts',
    icon: RefreshCw,
  },
];

export function ResolutionTypeEditor({
  resolution,
  onChange,
  kickoff,
}: ResolutionTypeEditorProps) {
  const [newEmail, setNewEmail] = useState('');

  const selectedOption = RESOLUTION_OPTIONS.find(
    (opt) => opt.type === resolution.type
  );

  const handleTypeChange = (type: ResolutionType) => {
    const base: Resolution = { type };

    switch (type) {
      case 'FIXED_CONTACT':
        base.email = resolution.email || '';
        break;
      case 'KICKOFF_FORM_FIELD':
        base.fieldKey = resolution.fieldKey || '';
        break;
      case 'FLOW_VARIABLE':
        base.variableKey = resolution.variableKey || '';
        break;
      case 'ROUND_ROBIN':
        base.emails = resolution.emails || [];
        break;
      default:
        break;
    }

    onChange(base);
  };

  const handleAddRoundRobinEmail = () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;

    // Support comma-separated input
    const newEmails = trimmed
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    const existing = resolution.emails || [];
    const unique = newEmails.filter((e) => !existing.includes(e));

    if (unique.length > 0) {
      onChange({
        ...resolution,
        emails: [...existing, ...unique],
      });
    }

    setNewEmail('');
  };

  const handleRemoveRoundRobinEmail = (email: string) => {
    onChange({
      ...resolution,
      emails: (resolution.emails || []).filter((e) => e !== email),
    });
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddRoundRobinEmail();
    }
  };

  const kickoffFormFields = kickoff?.kickoffFormFields || [];
  const flowVariables = kickoff?.flowVariables || [];

  return (
    <div className="space-y-3">
      {/* Resolution type dropdown */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Resolution Method
        </label>
        <div className="relative">
          <select
            value={resolution.type}
            onChange={(e) => handleTypeChange(e.target.value as ResolutionType)}
            className="w-full appearance-none px-3 py-2 pl-9 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer"
          >
            {RESOLUTION_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label} - {opt.description}
              </option>
            ))}
          </select>
          {/* Icon overlay */}
          {selectedOption && (
            <selectedOption.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-600 pointer-events-none" />
          )}
          {/* Chevron */}
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Type-specific configuration */}
      <div>
        {/* CONTACT_TBD */}
        {resolution.type === 'CONTACT_TBD' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <Info className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500">
              Contact will be assigned when the flow is executed. The coordinator
              will choose the contact at runtime.
            </p>
          </div>
        )}

        {/* FIXED_CONTACT */}
        {resolution.type === 'FIXED_CONTACT' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={resolution.email || ''}
              onChange={(e) =>
                onChange({ ...resolution, email: e.target.value })
              }
              placeholder="name@company.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>
        )}

        {/* WORKSPACE_INITIALIZER */}
        {resolution.type === 'WORKSPACE_INITIALIZER' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-violet-50 rounded-lg border border-violet-100">
            <PlayCircle className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
            <p className="text-xs text-violet-600">
              The person who starts this flow will be assigned automatically.
            </p>
          </div>
        )}

        {/* KICKOFF_FORM_FIELD */}
        {resolution.type === 'KICKOFF_FORM_FIELD' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Kickoff Form Field
            </label>
            {kickoffFormFields.length > 0 ? (
              <select
                value={resolution.fieldKey || ''}
                onChange={(e) =>
                  onChange({ ...resolution, fieldKey: e.target.value })
                }
                className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer"
              >
                <option value="">Select a form field...</option>
                {kickoffFormFields.map((field) => (
                  <option key={field.fieldId} value={field.fieldId}>
                    {field.label} ({field.type.replace(/_/g, ' ').toLowerCase()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600">
                  No kickoff form fields configured. Add form fields to the
                  kickoff configuration first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* FLOW_VARIABLE */}
        {resolution.type === 'FLOW_VARIABLE' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Flow Variable
            </label>
            {flowVariables.length > 0 ? (
              <select
                value={resolution.variableKey || ''}
                onChange={(e) =>
                  onChange({ ...resolution, variableKey: e.target.value })
                }
                className="w-full appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 cursor-pointer"
              >
                <option value="">Select a variable...</option>
                {flowVariables.map((variable) => (
                  <option key={variable.key} value={variable.key}>
                    {variable.key}
                    {variable.description ? ` - ${variable.description}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 rounded-lg border border-amber-100">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-600">
                  No flow variables configured. Add variables to the kickoff
                  configuration first.
                </p>
              </div>
            )}
          </div>
        )}

        {/* RULES */}
        {resolution.type === 'RULES' && (
          <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <GitBranch className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-600">Coming soon</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Rule-based assignment will allow you to route tasks based on
                conditions like form values or flow variables.
              </p>
            </div>
          </div>
        )}

        {/* ROUND_ROBIN */}
        {resolution.type === 'ROUND_ROBIN' && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contacts to rotate
            </label>

            {/* Email list */}
            {(resolution.emails || []).length > 0 && (
              <div className="space-y-1.5 mb-2">
                {(resolution.emails || []).map((email, index) => (
                  <div
                    key={email}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg group"
                  >
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {email}
                    </span>
                    <button
                      onClick={() => handleRemoveRoundRobinEmail(email)}
                      className="p-0.5 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove contact"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add email input */}
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={handleEmailKeyDown}
                placeholder="Add email (comma-separated for multiple)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
              <button
                onClick={handleAddRoundRobinEmail}
                disabled={!newEmail.trim()}
                className="flex items-center gap-1 px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:bg-violet-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {(resolution.emails || []).length === 0 && (
              <p className="text-xs text-gray-400 mt-1.5">
                Add at least two contacts to enable round-robin rotation.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
