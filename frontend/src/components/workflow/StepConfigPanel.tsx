import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import { PDFFormConfigEditor } from './PDFFormConfigEditor';
import { StepReminderOverride } from './StepReminderOverride';
import { DDRTextInput } from './DDRTextInput';
import { Plus, X, GripVertical, Sparkles, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import type {
  Step, StepConfig, AssigneePlaceholder, FormField, BranchPath, DecisionOutcome,
  QuestionnaireConfig, QuestionnaireQuestion, ESignConfig, FileRequestConfig,
  PDFFormConfig,
  AIAutomationConfig, AIInputField, AIOutputField, AIActionType, AIFieldType,
  SystemEmailConfig, SystemWebhookConfig, SystemChatMessageConfig,
  SystemUpdateWorkspaceConfig, BusinessRuleConfig, BusinessRuleInput,
} from '@/types';

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
// AI Automation Config Editor (matches Moxo "Configure your prompt" panel)
// ============================================================================

const AI_ACTION_TYPES: { value: AIActionType; label: string; icon: string }[] = [
  { value: 'CUSTOM_PROMPT', label: 'Custom prompt', icon: '✦' },
  { value: 'EXTRACT', label: 'Extract', icon: '⇥' },
  { value: 'SUMMARIZE', label: 'Summarize', icon: '≡' },
  { value: 'TRANSCRIBE', label: 'Transcribe', icon: '🎤' },
  { value: 'TRANSLATE', label: 'Translate', icon: '🌐' },
  { value: 'WRITE', label: 'Write', icon: '✍' },
];

const AI_FIELD_TYPES: { value: AIFieldType; label: string }[] = [
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE', label: 'Phone number' },
  { value: 'URL', label: 'URL' },
  { value: 'DATE', label: 'Date' },
  { value: 'FILE', label: 'File' },
];

const FILE_FORMATS = ['CSV', 'JSON', 'PDF', 'XLSX', 'TXT', 'XML'];

function AIAutomationConfigEditor({
  config,
  onChange,
}: {
  config: AIAutomationConfig;
  onChange: (config: AIAutomationConfig) => void;
}) {
  const [editingInputIndex, setEditingInputIndex] = useState<number | null>(null);
  const [editingOutputIndex, setEditingOutputIndex] = useState<number | null>(null);

  const addInputField = () => {
    onChange({
      ...config,
      inputFields: [
        ...config.inputFields,
        { fieldId: generateId('in'), name: '', type: 'TEXT', value: '' },
      ],
    });
    setEditingInputIndex(config.inputFields.length);
  };

  const updateInputField = (index: number, updates: Partial<AIInputField>) => {
    const updated = config.inputFields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange({ ...config, inputFields: updated });
  };

  const removeInputField = (index: number) => {
    onChange({ ...config, inputFields: config.inputFields.filter((_, i) => i !== index) });
    setEditingInputIndex(null);
  };

  const addOutputField = () => {
    onChange({
      ...config,
      outputFields: [
        ...config.outputFields,
        { fieldId: generateId('out'), name: '', type: 'TEXT', required: false },
      ],
    });
    setEditingOutputIndex(config.outputFields.length);
  };

  const updateOutputField = (index: number, updates: Partial<AIOutputField>) => {
    const updated = config.outputFields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange({ ...config, outputFields: updated });
  };

  const removeOutputField = (index: number) => {
    onChange({ ...config, outputFields: config.outputFields.filter((_, i) => i !== index) });
    setEditingOutputIndex(null);
  };

  const addKnowledgeSource = () => {
    const name = prompt('Document name:');
    if (name?.trim()) {
      onChange({ ...config, knowledgeSources: [...config.knowledgeSources, name.trim()] });
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Type */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Action type</label>
        <select
          value={config.actionType}
          onChange={(e) => onChange({ ...config, actionType: e.target.value as AIActionType })}
          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
        >
          {AI_ACTION_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </select>
      </div>

      {/* Input Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Input fields</label>
        </div>
        {config.inputFields.length > 0 && (
          <div className="space-y-2 mb-2">
            {config.inputFields.map((field, index) => (
              <div key={field.fieldId}>
                {editingInputIndex === index ? (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateInputField(index, { name: e.target.value })}
                      placeholder="Field name"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      autoFocus
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateInputField(index, { type: e.target.value as AIFieldType })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                    >
                      {AI_FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateInputField(index, { value: e.target.value })}
                      placeholder="Enter text or insert data reference {..}"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => removeInputField(index)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      <button type="button" onClick={() => setEditingInputIndex(null)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Done</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingInputIndex(index)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-xs text-gray-400 font-mono">{field.type}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{field.name || 'Unnamed field'}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeInputField(index); }}
                      className="p-0.5 text-gray-300 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addInputField}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Select a field to update
        </button>
      </div>

      {/* Knowledge Sources */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-2">Knowledge sources</label>
        {config.knowledgeSources.length > 0 && (
          <div className="space-y-1 mb-2">
            {config.knowledgeSources.map((source, index) => (
              <div key={index} className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-700 flex-1">{source}</span>
                <button
                  type="button"
                  onClick={() => onChange({ ...config, knowledgeSources: config.knowledgeSources.filter((_, i) => i !== index) })}
                  className="p-0.5 text-gray-300 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addKnowledgeSource}
          className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
        >
          <Plus className="w-3 h-3" />
          Add document
        </button>
      </div>

      {/* Extra Prompt */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Extra prompt</label>
        <textarea
          value={config.prompt}
          onChange={(e) => onChange({ ...config, prompt: e.target.value })}
          placeholder="Write your own prompt you want AI to perform."
          rows={3}
          className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Output Fields */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">
            Output fields <span className="text-red-500">*</span>
          </label>
        </div>
        {config.outputFields.length > 0 && (
          <div className="space-y-2 mb-2">
            {config.outputFields.map((field, index) => (
              <div key={field.fieldId}>
                {editingOutputIndex === index ? (
                  <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateOutputField(index, { name: e.target.value })}
                      placeholder="Name for the output field"
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      autoFocus
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateOutputField(index, { type: e.target.value as AIFieldType })}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                    >
                      {AI_FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {field.type === 'FILE' && (
                      <select
                        value={field.fileFormat || 'CSV'}
                        onChange={(e) => updateOutputField(index, { fileFormat: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                      >
                        {FILE_FORMATS.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    )}
                    <textarea
                      value={field.description || ''}
                      onChange={(e) => updateOutputField(index, { description: e.target.value || undefined })}
                      placeholder="Enter a description of what values the output field should create."
                      rows={2}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required ?? false}
                        onChange={(e) => updateOutputField(index, { required: e.target.checked })}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600"
                      />
                      Is this output field required?
                    </label>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => removeOutputField(index)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                      <button type="button" onClick={() => setEditingOutputIndex(null)} className="text-xs text-violet-600 hover:text-violet-700 font-medium">Done</button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingOutputIndex(index)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <span className="text-xs text-gray-400 font-mono">{field.type}{field.type === 'FILE' && field.fileFormat ? `/${field.fileFormat}` : ''}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{field.name || 'Unnamed field'}</span>
                    {field.required && <span className="text-[10px] text-red-400">required</span>}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeOutputField(index); }}
                      className="p-0.5 text-gray-300 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addOutputField}
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            <Plus className="w-3 h-3" />
            Select a field to update
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// System Email Config Editor
// ============================================================================

function SystemEmailConfigEditor({
  config,
  onChange,
}: {
  config: SystemEmailConfig;
  onChange: (config: SystemEmailConfig) => void;
}) {
  const updateTo = (index: number, value: string) => {
    const updated = [...config.to];
    updated[index] = value;
    onChange({ ...config, to: updated });
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-gray-600">To</label>
          <button
            type="button"
            onClick={() => onChange({ ...config, to: [...config.to, ''] })}
            className="text-xs text-violet-600 hover:text-violet-700 font-medium"
          >
            + Add recipient
          </button>
        </div>
        <div className="space-y-1.5">
          {config.to.map((addr, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type="text"
                value={addr}
                onChange={(e) => updateTo(index, e.target.value)}
                placeholder="Email or {Role: Client / Email}"
                className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              {config.to.length > 1 && (
                <button type="button" onClick={() => onChange({ ...config, to: config.to.filter((_, i) => i !== index) })} className="p-0.5 text-gray-300 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
        <input
          type="text"
          value={config.subject}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          placeholder="Email subject (supports {data references})"
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
        <textarea
          value={config.body}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder="Email body (supports {data references})"
          rows={4}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  );
}

// ============================================================================
// System Webhook Config Editor
// ============================================================================

function SystemWebhookConfigEditor({
  config,
  onChange,
}: {
  config: SystemWebhookConfig;
  onChange: (config: SystemWebhookConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
        <input
          type="text"
          value={config.url}
          onChange={(e) => onChange({ ...config, url: e.target.value })}
          placeholder="https://api.example.com/webhook"
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Method</label>
        <select
          value={config.method}
          onChange={(e) => onChange({ ...config, method: e.target.value as SystemWebhookConfig['method'] })}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Payload (JSON)</label>
        <textarea
          value={config.payload || ''}
          onChange={(e) => onChange({ ...config, payload: e.target.value || undefined })}
          placeholder='{"key": "{Step 1 / Field Name}", ...}'
          rows={4}
          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none font-mono"
        />
      </div>
    </div>
  );
}

// ============================================================================
// System Chat Message Config Editor
// ============================================================================

function SystemChatMessageConfigEditor({
  config,
  onChange,
}: {
  config: SystemChatMessageConfig;
  onChange: (config: SystemChatMessageConfig) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
      <textarea
        value={config.message}
        onChange={(e) => onChange({ ...config, message: e.target.value })}
        placeholder="Chat message to send (supports {data references})"
        rows={3}
        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
      />
    </div>
  );
}

// ============================================================================
// System Update Workspace Config Editor
// ============================================================================

function SystemUpdateWorkspaceConfigEditor({
  config,
  onChange,
}: {
  config: SystemUpdateWorkspaceConfig;
  onChange: (config: SystemUpdateWorkspaceConfig) => void;
}) {
  const entries = Object.entries(config.updates);

  const addEntry = () => {
    onChange({ updates: { ...config.updates, '': '' } });
  };

  const updateEntry = (oldKey: string, newKey: string, value: string) => {
    const newUpdates: Record<string, string> = {};
    for (const [k, v] of Object.entries(config.updates)) {
      if (k === oldKey) {
        newUpdates[newKey] = value;
      } else {
        newUpdates[k] = v;
      }
    }
    onChange({ updates: newUpdates });
  };

  const removeEntry = (key: string) => {
    const newUpdates = { ...config.updates };
    delete newUpdates[key];
    onChange({ updates: newUpdates });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-600">Fields to update</label>
        <button type="button" onClick={addEntry} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
          <Plus className="w-3 h-3" />
          Add field
        </button>
      </div>
      <div className="space-y-2">
        {entries.map(([key, value], index) => (
          <div key={index} className="flex items-center gap-1.5">
            <input
              type="text"
              value={key}
              onChange={(e) => updateEntry(key, e.target.value, value)}
              placeholder="Field name"
              className="w-1/3 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => updateEntry(key, key, e.target.value)}
              placeholder="Value or {data reference}"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button type="button" onClick={() => removeEntry(key)} className="p-0.5 text-gray-300 hover:text-red-500">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Business Rule Config Editor
// ============================================================================

function BusinessRuleConfigEditor({
  config,
  onChange,
}: {
  config: BusinessRuleConfig;
  onChange: (config: BusinessRuleConfig) => void;
}) {
  const addInput = () => {
    onChange({ ...config, inputs: [...config.inputs, { key: '', ref: '' }] });
  };

  const updateInput = (index: number, updates: Partial<BusinessRuleInput>) => {
    const updated = config.inputs.map((inp, i) => (i === index ? { ...inp, ...updates } : inp));
    onChange({ ...config, inputs: updated });
  };

  const addRule = () => {
    onChange({ ...config, rules: [...config.rules, { when: { '': '' }, set: { '': '' } }] });
  };

  const removeRule = (index: number) => {
    onChange({ ...config, rules: config.rules.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Inputs</label>
          <button type="button" onClick={addInput} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
            <Plus className="w-3 h-3" />
            Add input
          </button>
        </div>
        <div className="space-y-1.5">
          {config.inputs.map((inp, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <input
                type="text"
                value={inp.key}
                onChange={(e) => updateInput(index, { key: e.target.value })}
                placeholder="Variable name"
                className="w-1/3 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <input
                type="text"
                value={inp.ref}
                onChange={(e) => updateInput(index, { ref: e.target.value })}
                placeholder="Data reference {..}"
                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <button type="button" onClick={() => onChange({ ...config, inputs: config.inputs.filter((_, i) => i !== index) })} className="p-0.5 text-gray-300 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Rules */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-600">Rules</label>
          <button type="button" onClick={addRule} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium">
            <Plus className="w-3 h-3" />
            Add rule
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mb-2">When conditions match, set output values.</p>
        <div className="space-y-2">
          {config.rules.map((rule, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-2.5 bg-gray-50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Rule {index + 1}</span>
                <button type="button" onClick={() => removeRule(index)} className="p-0.5 text-gray-300 hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mb-1">WHEN: (condition key = value)</p>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  defaultValue={Object.keys(rule.when)[0] || ''}
                  placeholder="field"
                  className="w-1/3 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <input
                  type="text"
                  defaultValue={Object.values(rule.when)[0] || ''}
                  placeholder="value"
                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <p className="text-[11px] text-gray-500 mb-1">SET: (output key = value)</p>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  defaultValue={Object.keys(rule.set)[0] || ''}
                  placeholder="output"
                  className="w-1/3 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <input
                  type="text"
                  defaultValue={Object.values(rule.set)[0] || ''}
                  placeholder="value"
                  className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>
          ))}
        </div>
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

  // Skip sequential order (for human action steps)
  const [skipSequentialOrder, setSkipSequentialOrder] = useState(step.config.skipSequentialOrder || false);
  const [showAdditional, setShowAdditional] = useState(!!step.config.skipSequentialOrder);

  // GoTo target step
  const [targetStepId, setTargetStepId] = useState(step.config.targetStepId || '');

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

  // AI Automation config
  const isAIAutomation = ['AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE'].includes(step.type);
  const [aiAutomationConfig, setAiAutomationConfig] = useState<AIAutomationConfig>(
    step.config.aiAutomation || { actionType: 'CUSTOM_PROMPT', inputFields: [], knowledgeSources: [], prompt: '', outputFields: [] }
  );

  // System Email config
  const isSystemEmail = step.type === 'SYSTEM_EMAIL';
  const [systemEmailConfig, setSystemEmailConfig] = useState<SystemEmailConfig>(
    step.config.systemEmail || { to: [''], subject: '', body: '' }
  );

  // System Webhook config
  const isSystemWebhook = step.type === 'SYSTEM_WEBHOOK';
  const [systemWebhookConfig, setSystemWebhookConfig] = useState<SystemWebhookConfig>(
    step.config.systemWebhook || { url: '', method: 'POST' }
  );

  // System Chat Message config
  const isSystemChatMessage = step.type === 'SYSTEM_CHAT_MESSAGE';
  const [systemChatMessageConfig, setSystemChatMessageConfig] = useState<SystemChatMessageConfig>(
    step.config.systemChatMessage || { message: '' }
  );

  // System Update Workspace config
  const isSystemUpdateWorkspace = step.type === 'SYSTEM_UPDATE_WORKSPACE';
  const [systemUpdateWorkspaceConfig, setSystemUpdateWorkspaceConfig] = useState<SystemUpdateWorkspaceConfig>(
    step.config.systemUpdateWorkspace || { updates: {} }
  );

  // PDF Form config
  const isPDFFormStep = step.type === 'PDF_FORM';
  const [pdfFormConfig, setPdfFormConfig] = useState<PDFFormConfig>(
    step.config.pdfForm || { fields: [] }
  );

  // Business Rule config
  const isBusinessRule = step.type === 'BUSINESS_RULE';
  const [businessRuleConfig, setBusinessRuleConfig] = useState<BusinessRuleConfig>(
    step.config.businessRule || { inputs: [], rules: [], outputs: [] }
  );

  // Due date
  const [dueDate, setDueDate] = useState<{ value: number; unit: 'hours' | 'days' } | undefined>(
    step.config.waitDuration as { value: number; unit: 'hours' | 'days' } | undefined
  );

  // Automation step types don't have assignees
  const automationTypes = ['AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE', 'SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE', 'BUSINESS_RULE', 'INTEGRATION_AIRTABLE', 'INTEGRATION_CLICKUP', 'INTEGRATION_DROPBOX', 'INTEGRATION_GMAIL', 'INTEGRATION_GOOGLE_DRIVE', 'INTEGRATION_GOOGLE_SHEETS', 'INTEGRATION_WRIKE'];

  // Steps that support assignee selection
  const hasAssignee = !['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT', 'GOTO', 'GOTO_DESTINATION', 'TERMINATE', ...automationTypes].includes(step.type);

  // Steps that support due dates
  const hasDueDate = ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'DECISION', 'ACKNOWLEDGEMENT', 'ESIGN', 'PDF_FORM'].includes(step.type);

  // Human action steps that can skip sequential order
  const isHumanAction = ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'ACKNOWLEDGEMENT', 'ESIGN', 'DECISION', 'CUSTOM_ACTION', 'WEB_APP', 'PDF_FORM'].includes(step.type);

  // GoTo destinations available for targeting
  const gotoDestinations = workflow?.steps.filter(s => s.type === 'GOTO_DESTINATION') || [];

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

    if (isAIAutomation) {
      updates.aiAutomation = aiAutomationConfig;
    }

    if (isSystemEmail) {
      updates.systemEmail = systemEmailConfig;
    }

    if (isSystemWebhook) {
      updates.systemWebhook = systemWebhookConfig;
    }

    if (isSystemChatMessage) {
      updates.systemChatMessage = systemChatMessageConfig;
    }

    if (isSystemUpdateWorkspace) {
      updates.systemUpdateWorkspace = systemUpdateWorkspaceConfig;
    }

    if (isPDFFormStep) {
      updates.pdfForm = pdfFormConfig;
    }

    if (isBusinessRule) {
      updates.businessRule = businessRuleConfig;
    }

    if (hasDueDate && dueDate) {
      updates.waitDuration = dueDate;
    }

    const stepsWithReminders = ['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'DECISION', 'ESIGN'];
    if (stepsWithReminders.includes(step.type) && reminderOverride) {
      updates.reminderOverride = reminderOverride;
    }

    if (isHumanAction) {
      updates.skipSequentialOrder = skipSequentialOrder || undefined;
    }

    if (step.type === 'GOTO') {
      updates.targetStepId = targetStepId || undefined;
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

      {/* PDF Form Config */}
      {isPDFFormStep && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">PDF Form Configuration</label>
          <PDFFormConfigEditor config={pdfFormConfig} onChange={setPdfFormConfig} />
        </div>
      )}

      {/* AI Automation Config */}
      {isAIAutomation && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-gray-600">Configure your prompt</span>
          </div>
          <AIAutomationConfigEditor config={aiAutomationConfig} onChange={setAiAutomationConfig} />
        </div>
      )}

      {/* System Email Config */}
      {isSystemEmail && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Email Configuration</label>
          <SystemEmailConfigEditor config={systemEmailConfig} onChange={setSystemEmailConfig} />
        </div>
      )}

      {/* System Webhook Config */}
      {isSystemWebhook && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Webhook Configuration</label>
          <SystemWebhookConfigEditor config={systemWebhookConfig} onChange={setSystemWebhookConfig} />
        </div>
      )}

      {/* System Chat Message Config */}
      {isSystemChatMessage && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Chat Message</label>
          <SystemChatMessageConfigEditor config={systemChatMessageConfig} onChange={setSystemChatMessageConfig} />
        </div>
      )}

      {/* System Update Workspace Config */}
      {isSystemUpdateWorkspace && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Workspace Update</label>
          <SystemUpdateWorkspaceConfigEditor config={systemUpdateWorkspaceConfig} onChange={setSystemUpdateWorkspaceConfig} />
        </div>
      )}

      {/* Business Rule Config */}
      {isBusinessRule && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Business Rule</label>
          <BusinessRuleConfigEditor config={businessRuleConfig} onChange={setBusinessRuleConfig} />
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

      {/* GoTo Target Selector */}
      {step.type === 'GOTO' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Target Go To Destination *
          </label>
          {gotoDestinations.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No Go To Destination steps in this flow. Add one first.</p>
          ) : (
            <select
              value={targetStepId}
              onChange={(e) => setTargetStepId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <option value="">Select destination...</option>
              {gotoDestinations.map(dest => (
                <option key={dest.stepId} value={dest.stepId}>
                  {dest.config.name || 'Unnamed destination'}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* GoTo Destination info */}
      {step.type === 'GOTO_DESTINATION' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            This is a destination marker. Go To steps inside branches can jump back to this point.
          </p>
        </div>
      )}

      {/* Additional Options (for human action steps) */}
      {isHumanAction && (
        <div className="pt-3 border-t border-gray-100 mb-4">
          <button
            type="button"
            onClick={() => setShowAdditional(!showAdditional)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showAdditional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            Additional options
          </button>
          {showAdditional && (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipSequentialOrder}
                  onChange={(e) => setSkipSequentialOrder(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">Skip sequential order</span>
                <span className="relative group">
                  <Info className="w-3.5 h-3.5 text-gray-400" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    This step starts immediately without waiting for the previous step to finish.
                  </span>
                </span>
              </label>
            </div>
          )}
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
