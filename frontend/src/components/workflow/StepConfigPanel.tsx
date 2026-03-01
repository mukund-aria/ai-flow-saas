import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import { PDFFormConfigEditor } from './PDFFormConfigEditor';
import { StepReminderOverride } from './StepReminderOverride';
import { DDRTextInput } from './DDRTextInput';
import { Plus, X, GripVertical, Sparkles, ChevronUp, ChevronDown, Info, ExternalLink, Play } from 'lucide-react';
import { AITestDialog } from './AITestDialog';
import { useWorkflowStore } from '@/stores/workflowStore';
import type {
  Step, StepConfig, Role, FormField, BranchPath, DecisionOutcome,
  QuestionnaireConfig, QuestionnaireQuestion, ESignConfig, FileRequestConfig,
  PDFFormConfig,
  AIAutomationConfig, AIInputField, AIOutputField, AIActionType, AIFieldType,
  SystemEmailConfig, SystemWebhookConfig, SystemChatMessageConfig,
  SystemUpdateWorkspaceConfig, BusinessRuleConfig, BusinessRuleInput,
  SubFlowConfig,
  StepDue, DueUnit,
} from '@/types';

interface StepConfigPanelProps {
  step: Step;
  roles: Role[];
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
// Due Date Editor (Enhanced with mode switching)
// ============================================================================

type DueDateMode = 'RELATIVE' | 'FIXED' | 'BEFORE_FLOW_DUE';

function inferMode(value?: StepDue): DueDateMode {
  if (!value) return 'RELATIVE';
  return value.type;
}

function DueDateEditor({
  value,
  onChange,
  hasFlowDue,
}: {
  value?: StepDue;
  onChange: (v: StepDue | undefined) => void;
  hasFlowDue?: boolean;
}) {
  const [enabled, setEnabled] = useState(!!value);
  const [mode, setMode] = useState<DueDateMode>(inferMode(value));

  // State for Relative mode
  const [relativeAmount, setRelativeAmount] = useState(
    value && value.type === 'RELATIVE' ? value.value : 1
  );
  const [relativeUnit, setRelativeUnit] = useState<DueUnit>(
    value && value.type === 'RELATIVE' ? value.unit : 'DAYS'
  );

  // State for Fixed date mode
  const [fixedDate, setFixedDate] = useState(
    value && value.type === 'FIXED' ? value.date : ''
  );

  // State for Before Flow Due mode
  const [beforeAmount, setBeforeAmount] = useState(
    value && value.type === 'BEFORE_FLOW_DUE' ? value.value : 1
  );
  const [beforeUnit, setBeforeUnit] = useState<DueUnit>(
    value && value.type === 'BEFORE_FLOW_DUE' ? value.unit : 'DAYS'
  );

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false);
      onChange(undefined);
    } else {
      setEnabled(true);
      emitValue(mode);
    }
  };

  const emitValue = (m: DueDateMode) => {
    switch (m) {
      case 'RELATIVE':
        onChange({ type: 'RELATIVE', value: relativeAmount, unit: relativeUnit });
        break;
      case 'FIXED':
        if (fixedDate) {
          onChange({ type: 'FIXED', date: fixedDate });
        }
        break;
      case 'BEFORE_FLOW_DUE':
        onChange({ type: 'BEFORE_FLOW_DUE', value: beforeAmount, unit: beforeUnit });
        break;
    }
  };

  const handleModeChange = (newMode: DueDateMode) => {
    setMode(newMode);
    emitValueForMode(newMode);
  };

  const emitValueForMode = (m: DueDateMode) => {
    switch (m) {
      case 'RELATIVE':
        onChange({ type: 'RELATIVE', value: relativeAmount, unit: relativeUnit });
        break;
      case 'FIXED':
        if (fixedDate) {
          onChange({ type: 'FIXED', date: fixedDate });
        } else {
          onChange(undefined);
        }
        break;
      case 'BEFORE_FLOW_DUE':
        onChange({ type: 'BEFORE_FLOW_DUE', value: beforeAmount, unit: beforeUnit });
        break;
    }
  };

  const modes: { id: DueDateMode; label: string }[] = [
    { id: 'RELATIVE', label: 'Relative' },
    { id: 'FIXED', label: 'Fixed Date' },
    ...(hasFlowDue ? [{ id: 'BEFORE_FLOW_DUE' as DueDateMode, label: 'Before Flow Due' }] : []),
  ];

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
        <div className="mt-1.5 space-y-2.5">
          {/* Mode Segmented Control */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id)}
                className={`flex-1 px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  mode === m.id
                    ? 'bg-violet-50 text-violet-700 border-violet-200'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                } ${m.id !== modes[0].id ? 'border-l border-gray-200' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Relative Mode */}
          {mode === 'RELATIVE' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Complete within</span>
              <input
                type="number"
                min={1}
                value={relativeAmount}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setRelativeAmount(v);
                  onChange({ type: 'RELATIVE', value: v, unit: relativeUnit });
                }}
                className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <select
                value={relativeUnit}
                onChange={(e) => {
                  const u = e.target.value as DueUnit;
                  setRelativeUnit(u);
                  onChange({ type: 'RELATIVE', value: relativeAmount, unit: u });
                }}
                className="px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="HOURS">hours</option>
                <option value="DAYS">days</option>
                <option value="WEEKS">weeks</option>
              </select>
            </div>
          )}

          {/* Fixed Date Mode */}
          {mode === 'FIXED' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Due by</span>
              <input
                type="date"
                value={fixedDate}
                onChange={(e) => {
                  setFixedDate(e.target.value);
                  if (e.target.value) {
                    onChange({ type: 'FIXED', date: e.target.value });
                  }
                }}
                className="flex-1 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}

          {/* Before Flow Due Mode */}
          {mode === 'BEFORE_FLOW_DUE' && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min={1}
                value={beforeAmount}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 1;
                  setBeforeAmount(v);
                  onChange({ type: 'BEFORE_FLOW_DUE', value: v, unit: beforeUnit });
                }}
                className="w-16 px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <select
                value={beforeUnit}
                onChange={(e) => {
                  const u = e.target.value as DueUnit;
                  setBeforeUnit(u);
                  onChange({ type: 'BEFORE_FLOW_DUE', value: beforeAmount, unit: u });
                }}
                className="px-2 py-1 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              >
                <option value="HOURS">hours</option>
                <option value="DAYS">days</option>
                <option value="WEEKS">weeks</option>
              </select>
              <span className="text-xs text-gray-500">before the flow deadline</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// AI Assignee Config Section
// ============================================================================

function AIAssigneeConfigSection({
  step,
  aiPrepare,
  aiAdvise,
  aiReview,
  onAiPrepareChange,
  onAiAdviseChange,
  onAiReviewChange,
  onTestClick,
}: {
  step: Step;
  aiPrepare: { enabled: boolean; prompt?: string };
  aiAdvise: { enabled: boolean; prompt?: string };
  aiReview: { enabled: boolean; criteria?: string };
  onAiPrepareChange: (config: { enabled: boolean; prompt?: string }) => void;
  onAiAdviseChange: (config: { enabled: boolean; prompt?: string }) => void;
  onAiReviewChange: (config: { enabled: boolean; criteria?: string }) => void;
  onTestClick: (feature: 'review' | 'prepare' | 'advise') => void;
}) {
  const stepType = step.type;
  const showPrepare = stepType === 'FORM';
  const showAdvise = ['DECISION', 'APPROVAL', 'FORM', 'FILE_REQUEST'].includes(stepType);
  const showReview = ['FORM', 'FILE_REQUEST', 'QUESTIONNAIRE'].includes(stepType);

  if (!showPrepare && !showAdvise && !showReview) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">AI Assistants</h4>
      </div>

      {showPrepare && (
        <div className="border border-violet-100 rounded-lg p-3 bg-violet-50/30">
          <div className="flex items-center justify-between">
            <label className="flex items-center justify-between cursor-pointer flex-1">
              <div>
                <span className="text-sm font-medium text-gray-700">AI Prepare</span>
                <p className="text-[11px] text-gray-500">Pre-fill form fields from prior step data</p>
              </div>
              <input
                type="checkbox"
                checked={aiPrepare.enabled}
                onChange={(e) => onAiPrepareChange({ ...aiPrepare, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>
          {aiPrepare.enabled && (
            <>
              <textarea
                value={aiPrepare.prompt || ''}
                onChange={(e) => onAiPrepareChange({ ...aiPrepare, prompt: e.target.value || undefined })}
                placeholder="Optional: Add instructions for AI preparation (e.g., 'Use the client name from step 1 to fill the Name field')"
                rows={2}
                className="mt-2 w-full px-2.5 py-1.5 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none bg-white"
              />
              <button
                type="button"
                onClick={() => onTestClick('prepare')}
                className="mt-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Test with sample data
              </button>
            </>
          )}
        </div>
      )}

      {showAdvise && (
        <div className="border border-violet-100 rounded-lg p-3 bg-violet-50/30">
          <div className="flex items-center justify-between">
            <label className="flex items-center justify-between cursor-pointer flex-1">
              <div>
                <span className="text-sm font-medium text-gray-700">AI Advise</span>
                <p className="text-[11px] text-gray-500">Show AI recommendation before assignee acts</p>
              </div>
              <input
                type="checkbox"
                checked={aiAdvise.enabled}
                onChange={(e) => onAiAdviseChange({ ...aiAdvise, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>
          {aiAdvise.enabled && (
            <>
              <textarea
                value={aiAdvise.prompt || ''}
                onChange={(e) => onAiAdviseChange({ ...aiAdvise, prompt: e.target.value || undefined })}
                placeholder="Optional: Add context for AI recommendations (e.g., 'Consider budget constraints and timeline')"
                rows={2}
                className="mt-2 w-full px-2.5 py-1.5 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none bg-white"
              />
              <button
                type="button"
                onClick={() => onTestClick('advise')}
                className="mt-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Test with sample data
              </button>
            </>
          )}
        </div>
      )}

      {showReview && (
        <div className="border border-violet-100 rounded-lg p-3 bg-violet-50/30">
          <div className="flex items-center justify-between">
            <label className="flex items-center justify-between cursor-pointer flex-1">
              <div>
                <span className="text-sm font-medium text-gray-700">AI Review</span>
                <p className="text-[11px] text-gray-500">Validate submission before completing step</p>
              </div>
              <input
                type="checkbox"
                checked={aiReview.enabled}
                onChange={(e) => onAiReviewChange({ ...aiReview, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
            </label>
          </div>
          {aiReview.enabled && (
            <>
              <textarea
                value={aiReview.criteria || ''}
                onChange={(e) => onAiReviewChange({ ...aiReview, criteria: e.target.value || undefined })}
                placeholder="Optional: Specify review criteria (e.g., 'Ensure all financial fields are filled and amounts are reasonable')"
                rows={2}
                className="mt-2 w-full px-2.5 py-1.5 border border-violet-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none bg-white"
              />
              <button
                type="button"
                onClick={() => onTestClick('review')}
                className="mt-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Test with sample data
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main StepConfigPanel
// ============================================================================

export function StepConfigPanel({ step, roles, onSave, onCancel }: StepConfigPanelProps) {
  const workflow = useWorkflowStore((s) => s.workflow);
  const [name, setName] = useState(step.config.name || '');
  const [description, setDescription] = useState(step.config.description || '');
  const [assignee, setAssignee] = useState(step.config.assignee || '');
  const [formFields, setFormFields] = useState<FormField[]>(step.config.formFields || []);
  const [reminderOverride, setReminderOverride] = useState(step.config.reminderOverride);

  // Skip sequential order (for human action steps)
  const [skipSequentialOrder, setSkipSequentialOrder] = useState(step.config.skipSequentialOrder || false);
  const [showAdditional, setShowAdditional] = useState(!!step.config.skipSequentialOrder || !!(step.config as any).skipCondition);

  // Skip condition (conditional step skip)
  const existingSkipCondition = (step.config as any).skipCondition as { source: string; operator: string; value?: string } | undefined;
  const [skipConditionEnabled, setSkipConditionEnabled] = useState(!!existingSkipCondition);
  const [skipConditionSource, setSkipConditionSource] = useState(existingSkipCondition?.source || '');
  const [skipConditionOperator, setSkipConditionOperator] = useState(existingSkipCondition?.operator || 'equals');
  const [skipConditionValue, setSkipConditionValue] = useState(existingSkipCondition?.value || '');

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

  // Sub-Flow config
  const isSubFlow = step.type === 'SUB_FLOW';
  const [subFlowConfig, setSubFlowConfig] = useState<SubFlowConfig>(
    step.config.subFlow || {
      flowTemplateId: '',
      assigneeMappings: [],
      variableMappings: [],
      inputMappings: [],
      outputMappings: [],
      waitForCompletion: true,
    }
  );
  const [availableTemplates, setAvailableTemplates] = useState<Array<{ id: string; name: string }>>([]);

  // AI Assignee configs
  const [aiPrepare, setAiPrepare] = useState<{ enabled: boolean; prompt?: string }>(
    step.config.aiPrepare || { enabled: false }
  );
  const [aiAdvise, setAiAdvise] = useState<{ enabled: boolean; prompt?: string }>(
    step.config.aiAdvise || { enabled: false }
  );
  const [aiReview, setAiReview] = useState<{ enabled: boolean; criteria?: string }>(
    step.config.aiReview || { enabled: false }
  );

  // AI Test dialog state
  const [aiTestOpen, setAiTestOpen] = useState(false);
  const [aiTestInitialTab, setAiTestInitialTab] = useState<'review' | 'prepare' | 'advise'>('review');

  // Fetch available templates for SUB_FLOW selector
  useEffect(() => {
    if (isSubFlow) {
      const API_BASE = import.meta.env.VITE_API_URL || '/api';
      fetch(`${API_BASE}/templates`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            setAvailableTemplates(data.data.map((t: any) => ({ id: t.id, name: t.name })));
          }
        })
        .catch(() => {});
    }
  }, [isSubFlow]);

  // Due date (supports StepDue type; legacy waitDuration is migrated to RELATIVE)
  const [dueDate, setDueDate] = useState<StepDue | undefined>(() => {
    if (step.config.stepDue) return step.config.stepDue;
    // Legacy migration: old waitDuration -> RELATIVE StepDue
    if (step.config.waitDuration) {
      const legacy = step.config.waitDuration as { value: number; unit: string };
      return {
        type: 'RELATIVE' as const,
        value: legacy.value,
        unit: (legacy.unit === 'hours' ? 'HOURS' : legacy.unit === 'days' ? 'DAYS' : 'DAYS') as DueUnit,
      };
    }
    return undefined;
  });

  // Automation step types don't have assignees
  const automationTypes = ['AI_CUSTOM_PROMPT', 'AI_EXTRACT', 'AI_SUMMARIZE', 'AI_TRANSCRIBE', 'AI_TRANSLATE', 'AI_WRITE', 'SYSTEM_EMAIL', 'SYSTEM_WEBHOOK', 'SYSTEM_CHAT_MESSAGE', 'SYSTEM_UPDATE_WORKSPACE', 'BUSINESS_RULE', 'REST_API', 'MCP_SERVER'];

  // Steps that support assignee selection
  const hasAssignee = !['SINGLE_CHOICE_BRANCH', 'MULTI_CHOICE_BRANCH', 'PARALLEL_BRANCH', 'WAIT', 'GOTO', 'GOTO_DESTINATION', 'TERMINATE', 'SUB_FLOW', ...automationTypes].includes(step.type);

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

    if (isSubFlow) {
      updates.subFlow = subFlowConfig;
    }

    if (hasDueDate) {
      updates.stepDue = dueDate;
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

    // AI Assignee configs (for human action steps)
    if (isHumanAction) {
      updates.aiPrepare = aiPrepare;
      updates.aiAdvise = aiAdvise;
      updates.aiReview = aiReview;
    }

    // Skip condition
    if (skipConditionEnabled && skipConditionSource) {
      (updates as any).skipCondition = {
        source: skipConditionSource,
        operator: skipConditionOperator,
        ...(skipConditionOperator !== 'is_empty' && skipConditionOperator !== 'not_empty'
          ? { value: skipConditionValue }
          : {}),
      };
    } else {
      (updates as any).skipCondition = undefined;
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
            {roles.map((a) => (
              <option key={a.roleId} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Step-type-specific configuration */}

      {/* Form Fields Builder */}
      {step.type === 'FORM' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          {/* Prominent Form Builder button */}
          <button
            onClick={() => {
              const templateId = useWorkflowStore.getState().savedFlowId;
              if (templateId) {
                window.location.href = `/templates/${templateId}/form/${step.stepId}`;
              }
            }}
            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-200 rounded-lg text-violet-700 font-medium text-sm hover:bg-violet-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open Form Builder
          </button>
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
          <DueDateEditor value={dueDate} onChange={setDueDate} hasFlowDue={!!workflow?.dueDates?.flowDue} />
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

      {/* Sub-Flow Config */}
      {isSubFlow && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <label className="text-xs font-semibold text-gray-600 block mb-3">Sub-Flow Configuration</label>

          {/* Template Selector */}
          <div className="mb-3">
            <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">
              Flow Template *
            </label>
            <select
              value={subFlowConfig.flowTemplateId}
              onChange={(e) => setSubFlowConfig({ ...subFlowConfig, flowTemplateId: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
            >
              <option value="">Select a flow template...</option>
              {availableTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wait for completion toggle */}
          <div className="mb-3">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={subFlowConfig.waitForCompletion !== false}
                onChange={(e) => setSubFlowConfig({ ...subFlowConfig, waitForCompletion: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Wait for sub-flow to complete</span>
            </label>
            <p className="text-[11px] text-gray-400 mt-1 ml-6.5">
              Parent flow pauses until the sub-flow finishes
            </p>
          </div>

          {/* Input Mappings */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Input Mappings
              </label>
              <button
                type="button"
                onClick={() => setSubFlowConfig({
                  ...subFlowConfig,
                  inputMappings: [...subFlowConfig.inputMappings, { parentRef: '', subFlowField: '' }],
                })}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">
              Pass data from parent flow into the sub-flow's kickoff fields
            </p>
            {subFlowConfig.inputMappings.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No input mappings configured</p>
            ) : (
              <div className="space-y-2">
                {subFlowConfig.inputMappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mapping.parentRef}
                      onChange={(e) => {
                        const updated = [...subFlowConfig.inputMappings];
                        updated[idx] = { ...updated[idx], parentRef: e.target.value };
                        setSubFlowConfig({ ...subFlowConfig, inputMappings: updated });
                      }}
                      placeholder="{Kickoff / Field}"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                    />
                    <span className="text-gray-400 text-xs shrink-0">-&gt;</span>
                    <input
                      type="text"
                      value={mapping.subFlowField}
                      onChange={(e) => {
                        const updated = [...subFlowConfig.inputMappings];
                        updated[idx] = { ...updated[idx], subFlowField: e.target.value };
                        setSubFlowConfig({ ...subFlowConfig, inputMappings: updated });
                      }}
                      placeholder="Child kickoff field"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = subFlowConfig.inputMappings.filter((_, i) => i !== idx);
                        setSubFlowConfig({ ...subFlowConfig, inputMappings: updated });
                      }}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Output Mappings */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                Output Mappings
              </label>
              <button
                type="button"
                onClick={() => setSubFlowConfig({
                  ...subFlowConfig,
                  outputMappings: [...subFlowConfig.outputMappings, { subFlowOutputRef: '', parentOutputKey: '' }],
                })}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">
              Capture data from the sub-flow back into the parent flow
            </p>
            {subFlowConfig.outputMappings.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No output mappings configured</p>
            ) : (
              <div className="space-y-2">
                {subFlowConfig.outputMappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={mapping.subFlowOutputRef}
                      onChange={(e) => {
                        const updated = [...subFlowConfig.outputMappings];
                        updated[idx] = { ...updated[idx], subFlowOutputRef: e.target.value };
                        setSubFlowConfig({ ...subFlowConfig, outputMappings: updated });
                      }}
                      placeholder="StepName / FieldName"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                    />
                    <span className="text-gray-400 text-xs shrink-0">-&gt;</span>
                    <input
                      type="text"
                      value={mapping.parentOutputKey}
                      onChange={(e) => {
                        const updated = [...subFlowConfig.outputMappings];
                        updated[idx] = { ...updated[idx], parentOutputKey: e.target.value };
                        setSubFlowConfig({ ...subFlowConfig, outputMappings: updated });
                      }}
                      placeholder="Parent result key"
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = subFlowConfig.outputMappings.filter((_, i) => i !== idx);
                        setSubFlowConfig({ ...subFlowConfig, outputMappings: updated });
                      }}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {/* AI Assistants */}
      {['FORM', 'QUESTIONNAIRE', 'FILE_REQUEST', 'TODO', 'APPROVAL', 'ACKNOWLEDGEMENT', 'ESIGN', 'DECISION'].includes(step.type) && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <AIAssigneeConfigSection
            step={{ ...step, config: { ...step.config, aiPrepare, aiAdvise, aiReview, formFields } }}
            aiPrepare={aiPrepare}
            aiAdvise={aiAdvise}
            aiReview={aiReview}
            onAiPrepareChange={setAiPrepare}
            onAiAdviseChange={setAiAdvise}
            onAiReviewChange={setAiReview}
            onTestClick={(feature) => {
              setAiTestInitialTab(feature);
              setAiTestOpen(true);
            }}
          />
          <AITestDialog
            open={aiTestOpen}
            onClose={() => setAiTestOpen(false)}
            step={{ ...step, config: { ...step.config, aiPrepare, aiAdvise, aiReview, formFields } }}
            initialTab={aiTestInitialTab}
          />
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

              {/* Skip Condition */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipConditionEnabled}
                    onChange={(e) => setSkipConditionEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-700">Skip this step when...</span>
                  <span className="relative group">
                    <Info className="w-3.5 h-3.5 text-gray-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      Conditionally skip this step based on data from prior steps.
                    </span>
                  </span>
                </label>

                {skipConditionEnabled && (
                  <div className="mt-2 ml-6.5 space-y-2 pl-1 border-l-2 border-violet-200">
                    <div className="pl-3">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Source (DDR token)</label>
                      <input
                        type="text"
                        value={skipConditionSource}
                        onChange={(e) => setSkipConditionSource(e.target.value)}
                        placeholder="{Kickoff / Country}"
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                      />
                    </div>
                    <div className="pl-3">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">Operator</label>
                      <select
                        value={skipConditionOperator}
                        onChange={(e) => setSkipConditionOperator(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="not_contains">does not contain</option>
                        <option value="greater_than">greater than</option>
                        <option value="less_than">less than</option>
                        <option value="is_empty">is empty</option>
                        <option value="not_empty">is not empty</option>
                        <option value="in">in list</option>
                        <option value="not_in">not in list</option>
                      </select>
                    </div>
                    {skipConditionOperator !== 'is_empty' && skipConditionOperator !== 'not_empty' && (
                      <div className="pl-3">
                        <label className="block text-[11px] font-medium text-gray-500 mb-1">Value</label>
                        <input
                          type="text"
                          value={skipConditionValue}
                          onChange={(e) => setSkipConditionValue(e.target.value)}
                          placeholder={skipConditionOperator === 'in' || skipConditionOperator === 'not_in' ? 'value1, value2, value3' : 'Value to compare'}
                          className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
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
