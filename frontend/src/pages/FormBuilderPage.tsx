/**
 * FormBuilderPage
 *
 * Dedicated full-page form builder for FORM step types.
 * Split layout: FormFieldPalette (left) + FormPreview (right).
 * Reads workflow from workflowStore, finds the target step by URL param,
 * and writes form field changes back via updateStep.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormFieldPalette } from '@/components/workflow/FormFieldPalette';
import { FormPreview } from '@/components/workflow/FormPreview';
import { useWorkflowStore } from '@/stores/workflowStore';
import { getTemplate, updateTemplate } from '@/lib/api';
import { FORM_FIELD_TYPES } from '@/types';
import type { FormField, FormFieldType, Flow } from '@/types';

function generateFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getDefaultLabel(type: FormFieldType): string {
  const meta = FORM_FIELD_TYPES.find((ft) => ft.value === type);
  return meta?.label || 'Untitled Field';
}

export function FormBuilderPage() {
  const { id: templateId, stepId } = useParams<{ id: string; stepId: string }>();
  const navigate = useNavigate();

  const {
    workflow,
    savedFlowId,
    setWorkflow,
    setSavedFlow,
    updateStep,
    isSaving,
    setSaving,
  } = useWorkflowStore();

  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [fields, setFields] = useState<FormField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load template if workflow is not already in store
  useEffect(() => {
    if (workflow || !templateId) return;

    setIsLoadingTemplate(true);
    getTemplate(templateId)
      .then((template) => {
        if (template.definition) {
          const flowDef = template.definition as unknown as Flow;
          setWorkflow({
            flowId: flowDef.flowId || templateId,
            name: flowDef.name || template.name,
            description: flowDef.description || template.description || '',
            steps: flowDef.steps || [],
            milestones: flowDef.milestones || [],
            assigneePlaceholders: flowDef.assigneePlaceholders || [],
            parameters: flowDef.parameters,
            triggerConfig: flowDef.triggerConfig,
            settings: flowDef.settings,
          });
        }
        setSavedFlow(template.id, template.status);
      })
      .catch((err) => {
        console.error('Failed to load template:', err);
      })
      .finally(() => {
        setIsLoadingTemplate(false);
      });
  }, [templateId, workflow, setWorkflow, setSavedFlow]);

  // Find the target step and initialize local field state
  const step = workflow?.steps.find((s) => s.stepId === stepId);

  useEffect(() => {
    if (!step) return;
    setFields(step.config.formFields || []);
    setFormName(step.config.name || 'Untitled Form');
  }, [step?.stepId]); // Only re-init when stepId changes, not on every step update

  // Track changes
  useEffect(() => {
    if (!step) return;
    const original = JSON.stringify(step.config.formFields || []);
    const current = JSON.stringify(fields);
    const nameChanged = formName !== (step.config.name || 'Untitled Form');
    setHasChanges(original !== current || nameChanged);
  }, [fields, formName, step]);

  // Save handler: writes back to workflowStore and persists to API
  const handleSave = useCallback(async () => {
    if (!stepId || !step) return;

    // Update the step in the workflow store
    updateStep(stepId, { formFields: fields, name: formName });

    // Persist to backend
    const currentSavedId = savedFlowId || templateId;
    if (currentSavedId) {
      setSaving(true);
      try {
        // We need to get the latest workflow state after the store update
        const latestWorkflow = useWorkflowStore.getState().workflow;
        if (latestWorkflow) {
          const saved = await updateTemplate(currentSavedId, {
            name: latestWorkflow.name || 'Untitled Template',
            description: latestWorkflow.description || '',
            definition: latestWorkflow as unknown as Record<string, unknown>,
          });
          setSavedFlow(saved.id, saved.status);
        }
      } catch (err) {
        console.error('Failed to save form:', err);
      }
    }

    setHasChanges(false);
  }, [stepId, step, fields, formName, savedFlowId, templateId, updateStep, setSaving, setSavedFlow]);

  // Add a new field
  const handleAddField = useCallback((type: FormFieldType) => {
    const newField: FormField = {
      fieldId: generateFieldId(),
      label: getDefaultLabel(type),
      type,
      required: false,
    };

    // Pre-populate options for select types
    if (['SINGLE_SELECT', 'MULTI_SELECT', 'DROPDOWN', 'DYNAMIC_DROPDOWN'].includes(type)) {
      newField.options = [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
      ];
    }

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.fieldId);
  }, []);

  // Update a field
  const handleUpdateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => (f.fieldId === id ? { ...f, ...updates } : f))
    );
  }, []);

  // Remove a field
  const handleRemoveField = useCallback(
    (id: string) => {
      setFields((prev) => prev.filter((f) => f.fieldId !== id));
      if (selectedFieldId === id) {
        setSelectedFieldId(null);
      }
    },
    [selectedFieldId]
  );

  // Reorder a field
  const handleReorderField = useCallback((id: string, direction: 'up' | 'down') => {
    setFields((prev) => {
      const index = prev.findIndex((f) => f.fieldId === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  }, []);

  // Navigate back
  const handleBack = useCallback(() => {
    navigate(`/templates/${templateId}`);
  }, [navigate, templateId]);

  // Inline name editing
  const handleNameClick = () => {
    setNameValue(formName);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed) {
      setFormName(trimmed);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  // Loading state
  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

  // Step not found
  if (workflow && !step) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">Step not found in this template.</p>
          <Button variant="outline" size="sm" onClick={handleBack}>
            Back to Template
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
        {/* Left: Close + Form name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            title="Back to Template"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-gray-200 shrink-0" />

          {/* Editable form name */}
          {isEditingName ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-violet-500 focus:outline-none min-w-[120px] max-w-[300px]"
              autoFocus
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-sm font-semibold text-gray-900 hover:text-violet-700 transition-colors truncate max-w-[300px]"
              title="Click to rename"
            >
              {formName || 'Untitled Form'}
            </button>
          )}

          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-violet-100 text-violet-700 shrink-0">
            FORM
          </span>

          {isSaving && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>
          )}
        </div>

        {/* Right: Back + Save */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 mr-2">
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </span>
          <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleBack}>
            Back
          </Button>
          <Button
            size="sm"
            className="bg-gray-900 hover:bg-gray-800 text-xs h-8 px-4"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>

      {/* Split panel: Palette + Preview */}
      <div className="flex flex-1 overflow-hidden">
        <FormFieldPalette onAddField={handleAddField} />
        <FormPreview
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          onUpdateField={handleUpdateField}
          onRemoveField={handleRemoveField}
          onReorderField={handleReorderField}
        />
      </div>
    </div>
  );
}
