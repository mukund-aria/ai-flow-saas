import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import { StepReminderOverride } from './StepReminderOverride';
import { DDRTextInput } from './DDRTextInput';
import { Plus, X, GripVertical } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { Step, StepConfig, AssigneePlaceholder, FormField, BranchPath, DecisionOutcome, QuestionnaireConfig, QuestionnaireQuestion, ESignConfig, FileRequestConfig } from '@/types';

interface StepConfigPanelProps {
  step: Step;
  assigneePlaceholders: AssigneePlaceholder[];
  onSave: (stepId: string, updates: Partial<StepConfig>) => void;
  onCancel: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ============================================================================
// Branch Paths Editor (for SINGLE_CHOICE_BRANCH, MULTI_CHOICE_BRANCH, PARALLEL_BRANCH)
// ============================================================================

function BranchPathsEditor({
  paths,
  onChange,
  stepType,
}: {
  paths: BranchPath[];
  onChange: (paths: BranchPath[]) => void;
  stepType: string;
}) {
  const addPath = () => {
    onChange([
      ...paths,
      {
        pathId: generateId('path'),
        label: `Branch ${paths.length + 1}`,
        steps: [],
      },
    ]);
  };

  const updatePathLabel = (index: number, label: string) => {
    const updated = paths.map((p, i) => (i === index ? { ...p, label } : p));
    onChange(updated);
  };

  const removePath = (index: number) => {
    if (paths.length <= 2) return; // Need at least 2 branches
    onChange(paths.filter((_, i) => i !== index));
  };

  const labelHint =
    stepType === 'PARALLEL_BRANCH'
      ? 'All branches run simultaneously'
      : stepType === 'SINGLE_CHOICE_BRANCH'
      ? 'Only one branch will be selected'
      : 'Multiple branches can be selected';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">
          Branch Paths
        </label>
        <button
          type="button"
          onClick={addPath}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Branch
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">{labelHint}</p>
      <div className="space-y-2">
        {paths.map((path, index) => (
          <div key={path.pathId} className="flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <input
              type="text"
              value={path.label}
              onChange={(e) => updatePathLabel(index, e.target.value)}
              placeholder={`Branch ${index + 1} label`}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <span className="text-[10px] text-gray-400 shrink-0">
              {path.steps?.length || 0} steps
            </span>
            <button
              type="button"
              onClick={() => removePath(index)}
              disabled={paths.length <= 2}
              className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Decision Outcomes Editor (for DECISION steps)
// ============================================================================

function DecisionOutcomesEditor({
  outcomes,
  onChange,
}: {
  outcomes: DecisionOutcome[];
  onChange: (outcomes: DecisionOutcome[]) => void;
}) {
  const addOutcome = () => {
    onChange([
      ...outcomes,
      {
        outcomeId: generateId('outcome'),
        label: `Option ${outcomes.length + 1}`,
        steps: [],
      },
    ]);
  };

  const updateOutcomeLabel = (index: number, label: string) => {
    const updated = outcomes.map((o, i) => (i === index ? { ...o, label } : o));
    onChange(updated);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length <= 2) return;
    onChange(outcomes.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">
          Decision Outcomes
        </label>
        <button
          type="button"
          onClick={addOutcome}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Outcome
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mb-2">
        The assignee selects one outcome. Each outcome can have follow-up steps.
      </p>
      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div key={outcome.outcomeId} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <input
              type="text"
              value={outcome.label}
              onChange={(e) => updateOutcomeLabel(index, e.target.value)}
              placeholder={`Outcome ${index + 1}`}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <span className="text-[10px] text-gray-400 shrink-0">
              {outcome.steps?.length || 0} steps
            </span>
            <button
              type="button"
              onClick={() => removeOutcome(index)}
              disabled={outcomes.length <= 2}
              className="p-1 text-gray-300 hover:text-red-500 disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Approval Options Editor
// ============================================================================

function ApprovalOptionsEditor({
  options,
  onChange,
}: {
  options: { optionId: string; label: string }[];
  onChange: (options: { optionId: string; label: string }[]) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 block mb-2">
        Approval Options
      </label>
      <p className="text-[11px] text-gray-400 mb-2">
        The assignee will choose one of these responses.
      </p>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.optionId} className="flex items-center gap-2">
            <input
              type="text"
              value={option.label}
              onChange={(e) => {
                const updated = options.map((o, i) =>
                  i === index ? { ...o, label: e.target.value } : o
                );
                onChange(updated);
              }}
              className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onChange(options.filter((_, i) => i !== index))}
                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...options,
            { optionId: generateId('opt'), label: '' },
          ])
        }
        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium mt-2"
      >
        <Plus className="w-3 h-3" />
        Add Option
      </button>
    </div>
  );
}

// ============================================================================
// Questionnaire Config Editor
// ============================================================================

function QuestionnaireConfigEditor({
  config,
  onChange,
}: {
  config: QuestionnaireConfig;
  onChange: (config: QuestionnaireConfig) => void;
}) {
  const addQuestion = () => {
    onChange({
      questions: [
        ...config.questions,
        {
          questionId: generateId('q'),
          question: '',
          answerType: 'SINGLE_SELECT',
          choices: ['Option 1', 'Option 2'],
          required: true,
        },
      ],
    });
  };

  const updateQuestion = (index: number, updates: Partial<QuestionnaireQuestion>) => {
    const updated = config.questions.map((q, i) => (i === index ? { ...q, ...updates } : q));
    onChange({ questions: updated });
  };

  const removeQuestion = (index: number) => {
    onChange({ questions: config.questions.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">Questions</label>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Add Question
        </button>
      </div>

      {config.questions.length === 0 && (
        <p className="text-xs text-gray-400 mb-2">No questions yet. Add questions for the assignee to answer.</p>
      )}

      <div className="space-y-3">
        {config.questions.map((q, index) => (
          <div key={q.questionId} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-start gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, { question: e.target.value })}
                  placeholder="Enter your question..."
                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={q.answerType}
                    onChange={(e) => {
                      const answerType = e.target.value as QuestionnaireQuestion['answerType'];
                      const updates: Partial<QuestionnaireQuestion> = { answerType };
                      if (answerType === 'TEXT' || answerType === 'YES_NO') {
                        updates.choices = undefined;
                      } else if (!q.choices?.length) {
                        updates.choices = ['Option 1', 'Option 2'];
                      }
                      updateQuestion(index, updates);
                    }}
                    className="px-2 py-1 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="SINGLE_SELECT">Single Select</option>
                    <option value="MULTI_SELECT">Multi Select</option>
                    <option value="TEXT">Free Text</option>
                    <option value="YES_NO">Yes / No</option>
                  </select>
                  <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.required ?? true}
                      onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600"
                    />
                    Required
                  </label>
                </div>
                {/* Choices editor for select types */}
                {(q.answerType === 'SINGLE_SELECT' || q.answerType === 'MULTI_SELECT') && (
                  <div className="space-y-1">
                    {(q.choices || []).map((choice, ci) => (
                      <div key={ci} className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 w-4 text-right">{ci + 1}.</span>
                        <input
                          type="text"
                          value={choice}
                          onChange={(e) => {
                            const newChoices = [...(q.choices || [])];
                            newChoices[ci] = e.target.value;
                            updateQuestion(index, { choices: newChoices });
                          }}
                          placeholder={`Choice ${ci + 1}`}
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newChoices = (q.choices || []).filter((_, i) => i !== ci);
                            updateQuestion(index, { choices: newChoices });
                          }}
                          className="p-0.5 text-gray-300 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateQuestion(index, { choices: [...(q.choices || []), ''] })}
                      className="text-[11px] text-violet-600 hover:text-violet-700 font-medium"
                    >
                      + Add choice
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="p-1 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// E-Sign Config Editor
// ============================================================================

function ESignConfigEditor({
  config,
  onChange,
}: {
  config: ESignConfig;
  onChange: (config: ESignConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Document Name</label>
        <input
          type="text"
          value={config.documentName || ''}
          onChange={(e) => onChange({ ...config, documentName: e.target.value || undefined })}
          placeholder="e.g., Non-Disclosure Agreement"
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
        <textarea
          value={config.documentDescription || ''}
          onChange={(e) => onChange({ ...config, documentDescription: e.target.value || undefined })}
          placeholder="Instructions for the signer..."
          rows={2}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Signing Order</label>
        <select
          value={config.signingOrder}
          onChange={(e) => onChange({ ...config, signingOrder: e.target.value as 'SEQUENTIAL' | 'PARALLEL' })}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
        >
          <option value="SEQUENTIAL">Sequential (one after another)</option>
          <option value="PARALLEL">Parallel (all at once)</option>
        </select>
      </div>
    </div>
  );
}

// ============================================================================
// File Request Config Editor
// ============================================================================

function FileRequestConfigEditor({
  config,
  onChange,
}: {
  config: FileRequestConfig;
  onChange: (config: FileRequestConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
        <textarea
          value={config.instructions || ''}
          onChange={(e) => onChange({ ...config, instructions: e.target.value || undefined })}
          placeholder="Describe which files the assignee should upload..."
          rows={2}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Max Files</label>
        <input
          type="number"
          min={1}
          max={20}
          value={config.maxFiles || 5}
          onChange={(e) => onChange({ ...config, maxFiles: parseInt(e.target.value) || 5 })}
          className="w-20 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Due Date Editor
// ============================================================================

function DueDateEditor({
  value,
  onChange,
}: {
  value?: { value: number; unit: 'hours' | 'days' };
  onChange: (v: { value: number; unit: 'hours' | 'days' } | undefined) => void;
}) {
  const [enabled, setEnabled] = useState(!!value);
  const [amount, setAmount] = useState(value?.value || 1);
  const [unit, setUnit] = useState<'hours' | 'days'>(value?.unit || 'days');

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false);
      onChange(undefined);
    } else {
      setEnabled(true);
      onChange({ value: amount, unit });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs font-medium text-gray-600">Due Date</label>
        <button
          type="button"
          onClick={handleToggle}
          className={`relative w-8 h-4.5 rounded-full transition-colors ${
            enabled ? 'bg-violet-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      {enabled && (
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-gray-500">Complete within</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => {
              const v = parseInt(e.target.value) || 1;
              setAmount(v);
              onChange({ value: v, unit });
            }}
            className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <select
            value={unit}
            onChange={(e) => {
              const u = e.target.value as 'hours' | 'days';
              setUnit(u);
              onChange({ value: amount, unit: u });
            }}
            className="px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
          >
            <option value="hours">hours</option>
            <option value="days">days</option>
          </select>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main StepConfigPanel
// ============================================================================

export function StepConfigPanel({ step, assigneePlaceholders, onSave, onCancel }: StepConfigPanelProps) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const [name, setName] = useState(step.config.name || '');
  const [description, setDescription] = useState(step.config.description || '');
  const [assignee, setAssignee] = useState(step.config.assignee || '');
  const [formFields, setFormFields] = useState<FormField[]>(step.config.formFields || []);
  const [reminderOverride, setReminderOverride] = useState(step.config.reminderOverride);

  // Branch paths (for branch step types)
  const isBranchStep = ['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH'].includes(step.type);
  const [branchPaths, setBranchPaths] = useState<BranchPath[]>(
    step.config.paths || (isBranchStep
      ? [
          { pathId: generateId('path'), label: 'Branch 1', steps: [] },
          { pathId: generateId('path'), label: 'Branch 2', steps: [] },
        ]
      : [])
  );

  // Decision outcomes
  const isDecisionStep = step.type === 'DECISION';
  const [decisionOutcomes, setDecisionOutcomes] = useState<DecisionOutcome[]>(
    step.config.outcomes || (isDecisionStep
      ? [
          { outcomeId: generateId('outcome'), label: 'Approve', steps: [] },
          { outcomeId: generateId('outcome'), label: 'Reject', steps: [] },
        ]
      : [])
  );

  // Approval options
  const isApprovalStep = step.type === 'APPROVAL';
  const [approvalOptions, setApprovalOptions] = useState(
    step.config.options || (isApprovalStep
      ? [
          { optionId: generateId('opt'), label: 'Approve' },
          { optionId: generateId('opt'), label: 'Reject' },
        ]
      : [])
  );

  // Questionnaire config
  const isQuestionnaireStep = step.type === 'QUESTIONNAIRE';
  const [questionnaireConfig, setQuestionnaireConfig] = useState<QuestionnaireConfig>(
    step.config.questionnaire || { questions: [] }
  );

  // E-Sign config
  const isESignStep = step.type === 'ESIGN';
  const [esignConfig, setEsignConfig] = useState<ESignConfig>(
    step.config.esign || { signingOrder: 'SEQUENTIAL' }
  );

  // File request config
  const isFileRequestStep = step.type === 'FILE_REQUEST';
  const [fileRequestConfig, setFileRequestConfig] = useState<FileRequestConfig>(
    step.config.fileRequest || { maxFiles: 5 }
  );

  // Due date
  const [dueDate, setDueDate] = useState<{ value: number; unit: 'hours' | 'days' } | undefined>(
    step.config.waitDuration as { value: number; unit: 'hours' | 'days' } | undefined
  );

  // Steps that support assignee selection
  const hasAssignee = !['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT', 'GOTO', 'GOTO_DESTINATION', 'TERMINATE'].includes(step.type);

  // Steps that support due dates
  const hasDueDate = ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'DECISION', 'ACKNOWLEDGEMENT', 'ESIGN'].includes(step.type);

  const handleSave = () => {
    const updates: Partial<StepConfig> = {
      name: name.trim(),
      description: description.trim() || undefined,
    };

    if (hasAssignee) {
      updates.assignee = assignee || undefined;
    }

    if (step.type === 'FORM') {
      updates.formFields = formFields;
    }

    if (isBranchStep) {
      updates.paths = branchPaths;
    }

    if (isDecisionStep) {
      updates.outcomes = decisionOutcomes;
    }

    if (isApprovalStep) {
      updates.options = approvalOptions;
    }

    if (isQuestionnaireStep) {
      updates.questionnaire = questionnaireConfig;
    }

    if (isESignStep) {
      updates.esign = esignConfig;
    }

    if (isFileRequestStep) {
      updates.fileRequest = fileRequestConfig;
    }

    if (hasDueDate && dueDate) {
      updates.waitDuration = dueDate;
    }

    const stepsWithReminders = ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'DECISION', 'ESIGN'];
    if (stepsWithReminders.includes(step.type) && reminderOverride) {
      updates.reminderOverride = reminderOverride;
    }

    onSave(step.stepId, updates);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-2 shadow-sm">
      {/* Name */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Step Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter step name..."
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Description (with DDR support) */}
      <div className="mb-3">
        {workflow ? (
          <DDRTextInput
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Describe what this step does..."
            multiline
            workflow={workflow}
            currentStepIndex={workflow.steps.findIndex((s) => s.stepId === step.stepId)}
          />
        ) : (
          <>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this step does..."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </>
        )}
      </div>

      {/* Assignee (only for steps that need it) */}
      {hasAssignee && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Assignee
          </label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">Unassigned</option>
            {assigneePlaceholders.map((a) => (
              <option key={a.placeholderId} value={a.roleName}>
                {a.roleName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step-type-specific configuration */}

      {/* Form Fields Builder */}
      {step.type === 'FORM' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <FormFieldsBuilder fields={formFields} onChange={setFormFields} />
        </div>
      )}

      {/* Approval Options */}
      {isApprovalStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <ApprovalOptionsEditor options={approvalOptions} onChange={setApprovalOptions} />
        </div>
      )}

      {/* Decision Outcomes */}
      {isDecisionStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <DecisionOutcomesEditor outcomes={decisionOutcomes} onChange={setDecisionOutcomes} />
        </div>
      )}

      {/* Branch Paths */}
      {isBranchStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <BranchPathsEditor paths={branchPaths} onChange={setBranchPaths} stepType={step.type} />
        </div>
      )}

      {/* Due Date */}
      {hasDueDate && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <DueDateEditor value={dueDate} onChange={setDueDate} />
        </div>
      )}

      {step.type === 'TODO' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            The assignee will mark this task as complete when finished.
          </p>
        </div>
      )}

      {step.type === 'ACKNOWLEDGEMENT' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            The assignee must acknowledge they have read and understood the content.
          </p>
        </div>
      )}

      {/* Questionnaire Config */}
      {isQuestionnaireStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <QuestionnaireConfigEditor config={questionnaireConfig} onChange={setQuestionnaireConfig} />
        </div>
      )}

      {/* E-Sign Config */}
      {isESignStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <ESignConfigEditor config={esignConfig} onChange={setEsignConfig} />
        </div>
      )}

      {/* File Request Config */}
      {isFileRequestStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <FileRequestConfigEditor config={fileRequestConfig} onChange={setFileRequestConfig} />
        </div>
      )}

      {step.type === 'WAIT' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Wait Duration
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              defaultValue={step.config.waitDuration?.value || 1}
              className="w-20 px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <select
              defaultValue={step.config.waitDuration?.unit || 'days'}
              className="px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>
      )}

      {/* Reminder & Escalation Override */}
      {['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'DECISION', 'ESIGN'].includes(step.type) && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <StepReminderOverride
            value={reminderOverride as { useFlowDefaults: boolean } | undefined}
            onChange={setReminderOverride as (v: { useFlowDefaults: boolean }) => void}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
