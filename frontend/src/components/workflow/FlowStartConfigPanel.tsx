import { X, UserCircle, FileText, Link, Webhook, Clock, Puzzle, Plus, Trash2, Variable } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import type { StartMode, KickoffConfig, FlowVariable, FormField } from '@/types';

interface FlowStartConfigPanelProps {
  onClose: () => void;
}

interface StartModeOption {
  mode: StartMode;
  label: string;
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
  comingSoon?: boolean;
}

const START_MODE_OPTIONS: StartModeOption[] = [
  {
    mode: 'MANUAL_EXECUTE',
    label: 'Manual Execute',
    description: 'Coordinator starts this flow manually',
    icon: <UserCircle className="w-4 h-4" />,
  },
  {
    mode: 'KICKOFF_FORM',
    label: 'Kickoff Form',
    description: 'Collect information before the flow starts',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    mode: 'START_LINK',
    label: 'Start Link',
    description: 'Generate a shareable link to start this flow',
    icon: <Link className="w-4 h-4" />,
  },
  {
    mode: 'WEBHOOK',
    label: 'Webhook',
    description: 'Trigger via external API call',
    icon: <Webhook className="w-4 h-4" />,
    disabled: true,
    comingSoon: true,
  },
  {
    mode: 'SCHEDULE',
    label: 'Schedule',
    description: 'Run on a recurring schedule',
    icon: <Clock className="w-4 h-4" />,
    disabled: true,
    comingSoon: true,
  },
  {
    mode: 'INTEGRATION',
    label: 'Integration',
    description: 'Triggered by an external integration',
    icon: <Puzzle className="w-4 h-4" />,
    disabled: true,
    comingSoon: true,
  },
];

const defaultKickoff: KickoffConfig = {
  defaultStartMode: 'MANUAL_EXECUTE',
  supportedStartModes: ['MANUAL_EXECUTE'],
  flowVariables: [],
};

export function FlowStartConfigPanel({ onClose }: FlowStartConfigPanelProps) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateKickoffConfig = useWorkflowStore((s) => s.updateKickoffConfig);

  const kickoff: KickoffConfig = workflow?.kickoff || defaultKickoff;

  const selectedMode = kickoff.defaultStartMode;
  const kickoffFormEnabled = kickoff.kickoffFormEnabled ?? false;
  const kickoffFormFields = kickoff.kickoffFormFields ?? [];
  const flowVariables = kickoff.flowVariables ?? [];

  // -----------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------

  const handleStartModeChange = (mode: StartMode) => {
    const updates: Partial<KickoffConfig> = {
      defaultStartMode: mode,
      supportedStartModes: [mode],
    };

    // Auto-enable kickoff form when selecting KICKOFF_FORM mode
    if (mode === 'KICKOFF_FORM') {
      updates.kickoffFormEnabled = true;
    }

    // Auto-enable start link when selecting START_LINK mode
    if (mode === 'START_LINK') {
      updates.startLinkEnabled = true;
    }

    updateKickoffConfig(updates);
  };

  const handleKickoffFormToggle = (enabled: boolean) => {
    updateKickoffConfig({ kickoffFormEnabled: enabled });
  };

  const handleFormFieldsChange = (fields: FormField[]) => {
    updateKickoffConfig({ kickoffFormFields: fields });
  };

  // -----------------------------------------------------------
  // Flow Variables
  // -----------------------------------------------------------

  const handleAddVariable = () => {
    const newVar: FlowVariable = {
      key: '',
      type: 'TEXT',
      required: false,
    };
    updateKickoffConfig({ flowVariables: [...flowVariables, newVar] });
  };

  const handleUpdateVariable = (index: number, updates: Partial<FlowVariable>) => {
    const updated = flowVariables.map((v, i) => (i === index ? { ...v, ...updates } : v));
    updateKickoffConfig({ flowVariables: updated });
  };

  const handleRemoveVariable = (index: number) => {
    updateKickoffConfig({ flowVariables: flowVariables.filter((_, i) => i !== index) });
  };

  // -----------------------------------------------------------
  // Render
  // -----------------------------------------------------------

  return (
    <div className="w-[380px] bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900">Flow Start Configuration</h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">

          {/* ============================================================ */}
          {/* Start Mode Selector                                          */}
          {/* ============================================================ */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Start Mode
            </h3>
            <div className="space-y-2">
              {START_MODE_OPTIONS.map((option) => (
                <label
                  key={option.mode}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    option.disabled
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : selectedMode === option.mode
                      ? 'border-violet-300 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="startMode"
                    value={option.mode}
                    checked={selectedMode === option.mode}
                    onChange={() => handleStartModeChange(option.mode)}
                    disabled={option.disabled}
                    className="mt-0.5 border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div className={`mt-0.5 ${
                    selectedMode === option.mode ? 'text-violet-600' : 'text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      {option.comingSoon && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          Coming soon
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* ============================================================ */}
          {/* Kickoff Form Builder (when mode is KICKOFF_FORM)             */}
          {/* ============================================================ */}
          {selectedMode === 'KICKOFF_FORM' && (
            <section>
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Kickoff Form
                </h3>

                {/* Toggle */}
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={kickoffFormEnabled}
                    onClick={() => handleKickoffFormToggle(!kickoffFormEnabled)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      kickoffFormEnabled ? 'bg-violet-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        kickoffFormEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">Enable kickoff form</span>
                </label>

                {/* Form Fields Builder */}
                {kickoffFormEnabled && (
                  <FormFieldsBuilder
                    fields={kickoffFormFields}
                    onChange={handleFormFieldsChange}
                  />
                )}
              </div>
            </section>
          )}

          {/* ============================================================ */}
          {/* Flow Variables                                                */}
          {/* ============================================================ */}
          <section>
            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Flow Variables
                </h3>
                <button
                  onClick={handleAddVariable}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Add Variable
                </button>
              </div>

              {flowVariables.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                  <Variable className="w-5 h-5 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    No variables defined. Variables let you pass dynamic data into the flow at start time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {flowVariables.map((variable, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 bg-white space-y-2"
                    >
                      {/* Key input */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                          Key
                        </label>
                        <input
                          type="text"
                          value={variable.key}
                          onChange={(e) => handleUpdateVariable(index, { key: e.target.value })}
                          placeholder="variable_name"
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      {/* Type + Required row */}
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-medium text-gray-500 mb-1">
                            Type
                          </label>
                          <select
                            value={variable.type}
                            onChange={(e) =>
                              handleUpdateVariable(index, {
                                type: e.target.value as 'TEXT' | 'FILE',
                              })
                            }
                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
                          >
                            <option value="TEXT">Text</option>
                            <option value="FILE">File</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-1.5 pb-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={variable.required}
                            onChange={(e) =>
                              handleUpdateVariable(index, { required: e.target.checked })
                            }
                            className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-xs text-gray-600">Required</span>
                        </label>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={variable.description || ''}
                          onChange={(e) =>
                            handleUpdateVariable(index, {
                              description: e.target.value || undefined,
                            })
                          }
                          placeholder="Optional description..."
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                      </div>

                      {/* Remove button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRemoveVariable(index)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
