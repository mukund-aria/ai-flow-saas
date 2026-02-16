import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormFieldsBuilder } from './FormFieldsBuilder';
import type { Step, StepConfig, AssigneePlaceholder, FormField } from '@/types';

interface StepConfigPanelProps {
  step: Step;
  assigneePlaceholders: AssigneePlaceholder[];
  onSave: (stepId: string, updates: Partial<StepConfig>) => void;
  onCancel: () => void;
}

export function StepConfigPanel({ step, assigneePlaceholders, onSave, onCancel }: StepConfigPanelProps) {
  const [name, setName] = useState(step.config.name || '');
  const [description, setDescription] = useState(step.config.description || '');
  const [assignee, setAssignee] = useState(step.config.assignee || '');
  const [formFields, setFormFields] = useState<FormField[]>(step.config.formFields || []);

  const handleSave = () => {
    const updates: Partial<StepConfig> = {
      name: name.trim(),
      description: description.trim() || undefined,
      assignee: assignee || undefined,
    };

    // Include form fields for FORM steps
    if (step.type === 'FORM') {
      updates.formFields = formFields;
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

      {/* Description */}
      <div className="mb-3">
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
      </div>

      {/* Assignee */}
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

      {/* Step-type-specific configuration */}
      {step.type === 'FORM' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <FormFieldsBuilder fields={formFields} onChange={setFormFields} />
        </div>
      )}

      {step.type === 'APPROVAL' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            The assignee will be asked to approve or reject. Configure the approval details in the step name and description.
          </p>
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

      {step.type === 'FILE_REQUEST' && (
        <div className="mb-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            The assignee will be asked to upload the requested files.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
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
