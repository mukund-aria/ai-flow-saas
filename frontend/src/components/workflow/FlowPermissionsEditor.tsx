import { useWorkflowStore } from '@/stores/workflowStore';
import type { PermissionType, PermissionConfig, FlowPermissions } from '@/types';

const PERMISSION_ROWS: { key: keyof FlowPermissions; label: string; description: string }[] = [
  {
    key: 'execute',
    label: 'Execute',
    description: 'Who can start new flows from this template',
  },
  {
    key: 'edit',
    label: 'Edit',
    description: 'Who can modify this template and its steps',
  },
  {
    key: 'coordinate',
    label: 'Coordinate',
    description: 'Who can manage active flows and reassign tasks',
  },
];

const PERMISSION_OPTIONS: { value: PermissionType; label: string }[] = [
  { value: 'ALL_MEMBERS', label: 'All Members' },
  { value: 'ADMINS_ONLY', label: 'Admins Only' },
  { value: 'EXPLICIT_USERS', label: 'Specific Users' },
];

const DEFAULT_PERMISSIONS: FlowPermissions = {
  execute: { type: 'ALL_MEMBERS' },
  edit: { type: 'ADMINS_ONLY' },
  coordinate: { type: 'ALL_MEMBERS' },
};

export function FlowPermissionsEditor() {
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateFlowPermissions = useWorkflowStore((s) => s.updateFlowPermissions);

  if (!workflow) return null;

  const permissions: FlowPermissions = {
    ...DEFAULT_PERMISSIONS,
    ...(workflow.permissions || {}),
  };

  const handleTypeChange = (key: keyof FlowPermissions, type: PermissionType) => {
    const updated: PermissionConfig = { type };
    if (type === 'EXPLICIT_USERS') {
      updated.principals = permissions[key].principals || [];
    }
    updateFlowPermissions({ [key]: updated });
  };

  const handlePrincipalsChange = (key: keyof FlowPermissions, value: string) => {
    const principals = value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    updateFlowPermissions({
      [key]: { ...permissions[key], principals },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Access Control
        </h4>
        <p className="text-xs text-gray-400">
          Control who can execute, edit, and coordinate this template
        </p>
      </div>

      {PERMISSION_ROWS.map((row) => {
        const config = permissions[row.key];
        return (
          <div key={row.key} className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-700">{row.label}</label>
              <p className="text-xs text-gray-400">{row.description}</p>
            </div>

            <div className="space-y-1.5 ml-1">
              {PERMISSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`perm-${row.key}`}
                    checked={config.type === option.value}
                    onChange={() => handleTypeChange(row.key, option.value)}
                    className="border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {config.type === 'EXPLICIT_USERS' && (
              <div className="ml-6">
                <input
                  type="text"
                  value={(config.principals || []).join(', ')}
                  onChange={(e) => handlePrincipalsChange(row.key, e.target.value)}
                  placeholder="user@example.com, user2@example.com"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Comma-separated email addresses or user IDs
                </p>
              </div>
            )}

            {row.key !== 'coordinate' && (
              <div className="border-t border-gray-100 mt-4" />
            )}
          </div>
        );
      })}
    </div>
  );
}
