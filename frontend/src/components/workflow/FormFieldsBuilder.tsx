import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FormField, FormFieldType } from '@/types';
import { FORM_FIELD_TYPES } from '@/types';

interface FormFieldsBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const hasOptions = (type: FormFieldType) =>
  ['SINGLE_SELECT', 'MULTI_SELECT', 'DROPDOWN', 'DYNAMIC_DROPDOWN'].includes(type);

const isLayoutField = (type: FormFieldType) =>
  ['HEADING', 'PARAGRAPH', 'IMAGE', 'PAGE_BREAK', 'LINE_SEPARATOR'].includes(type);

function generateFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function FieldEditor({
  field,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  field: FormField;
  index: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const fieldMeta = FORM_FIELD_TYPES.find((f) => f.value === field.type);

  return (
    <div className="border border-gray-200 rounded-lg bg-white">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-t-lg border-b border-gray-100">
        <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
        <span className="text-xs font-medium text-gray-500 w-5 text-center">{index + 1}</span>
        <span className="text-sm font-medium text-gray-700 flex-1 truncate">
          {field.label || 'Untitled field'}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {fieldMeta?.label || field.type}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Remove field"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="p-3 space-y-3">
          {/* Label */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Field label..."
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select
              value={field.type}
              onChange={(e) => {
                const newType = e.target.value as FormFieldType;
                const updates: Partial<FormField> = { type: newType };
                // Clear options when switching away from select types
                if (!hasOptions(newType)) {
                  updates.options = undefined;
                } else if (!field.options?.length) {
                  updates.options = [
                    { label: 'Option 1', value: 'option_1' },
                    { label: 'Option 2', value: 'option_2' },
                  ];
                }
                onUpdate(updates);
              }}
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
            >
              <optgroup label="Basic">
                {FORM_FIELD_TYPES.filter((f) => f.category === 'basic').map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </optgroup>
              <optgroup label="Predefined">
                {FORM_FIELD_TYPES.filter((f) => f.category === 'predefined').map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </optgroup>
              <optgroup label="Layout">
                {FORM_FIELD_TYPES.filter((f) => f.category === 'layout').map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Placeholder (for text-like fields) */}
          {['TEXT_SINGLE_LINE', 'TEXT_MULTI_LINE', 'EMAIL', 'PHONE', 'NUMBER', 'CURRENCY', 'NAME', 'ADDRESS'].includes(field.type) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value || undefined })}
                placeholder="Placeholder text..."
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Options (for select types) */}
          {hasOptions(field.type) && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Options</label>
              <div className="space-y-1.5">
                {(field.options || []).map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={opt.label}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[optIdx] = {
                          ...opt,
                          label: e.target.value,
                          value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                        };
                        onUpdate({ options: newOptions });
                      }}
                      placeholder={`Option ${optIdx + 1}`}
                      className="flex-1 px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const newOptions = (field.options || []).filter((_, i) => i !== optIdx);
                        onUpdate({ options: newOptions });
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [
                      ...(field.options || []),
                      { label: '', value: '' },
                    ];
                    onUpdate({ options: newOptions });
                  }}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  + Add option
                </button>
              </div>
            </div>
          )}

          {/* Help text */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Help Text</label>
            <input
              type="text"
              value={field.helpText || ''}
              onChange={(e) => onUpdate({ helpText: e.target.value || undefined })}
              placeholder="Additional instructions for this field..."
              className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Layout field previews */}
          {field.type === 'IMAGE' && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div className="text-gray-400 text-xs">Image element — displays a static image in the form</div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value || undefined })}
                  placeholder="https://example.com/image.png"
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {field.type === 'PAGE_BREAK' && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
              <span className="text-xs text-gray-400 font-medium">PAGE BREAK</span>
              <div className="flex-1 border-t-2 border-dashed border-gray-300" />
            </div>
          )}

          {field.type === 'LINE_SEPARATOR' && (
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 border-t border-gray-300" />
              <span className="text-xs text-gray-400 font-medium">SEPARATOR</span>
              <div className="flex-1 border-t border-gray-300" />
            </div>
          )}

          {field.type === 'SIGNATURE' && (
            <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50">
              <div className="text-xs text-gray-500 font-medium">Signature capture area</div>
              <div className="h-12 border-b border-gray-300 mt-2" />
              <div className="text-xs text-gray-400 mt-1 text-center">Sign above</div>
            </div>
          )}

          {field.type === 'DYNAMIC_DROPDOWN' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Data Source</label>
              <input
                type="text"
                value={field.helpText || ''}
                onChange={(e) => onUpdate({ helpText: e.target.value || undefined })}
                placeholder="Reference a prior step output for dynamic options..."
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-400 mt-1">Options will be populated from a prior step's output data</p>
            </div>
          )}

          {/* Required toggle (not for layout fields) */}
          {!isLayoutField(field.type) && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={field.required ?? false}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-600">Required</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}

export function FormFieldsBuilder({ fields, onChange }: FormFieldsBuilderProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      fieldId: generateFieldId(),
      label: '',
      type,
      required: false,
      ...(hasOptions(type)
        ? { options: [{ label: 'Option 1', value: 'option_1' }, { label: 'Option 2', value: 'option_2' }] }
        : {}),
    };
    onChange([...fields, newField]);
    setShowAddMenu(false);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange(updated);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange(updated);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">
        Form Fields ({fields.length})
      </label>

      {fields.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">No fields yet. Add fields to build your form.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addField('TEXT_SINGLE_LINE')}
            className="text-violet-600 border-violet-200 hover:bg-violet-50"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add first field
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <FieldEditor
              key={field.fieldId}
              field={field}
              index={index}
              onUpdate={(updates) => updateField(index, updates)}
              onRemove={() => removeField(index)}
              onMoveUp={() => moveField(index, -1)}
              onMoveDown={() => moveField(index, 1)}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
            />
          ))}
        </div>
      )}

      {/* Add field button with quick-pick */}
      <div className="mt-3 relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full text-gray-600 border-dashed"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Field
        </Button>

        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white rounded-lg border border-gray-200 shadow-lg z-20 max-h-64 overflow-y-auto">
              <div className="p-1.5">
                <p className="text-xs font-medium text-gray-400 px-2 py-1">Basic</p>
                {FORM_FIELD_TYPES.filter((f) => f.category === 'basic').map((f) => (
                  <button
                    key={f.value}
                    onClick={() => addField(f.value)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-md"
                  >
                    {f.label}
                  </button>
                ))}
                <p className="text-xs font-medium text-gray-400 px-2 py-1 mt-1">Predefined</p>
                {FORM_FIELD_TYPES.filter((f) => f.category === 'predefined').map((f) => (
                  <button
                    key={f.value}
                    onClick={() => addField(f.value)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-md"
                  >
                    {f.label}
                  </button>
                ))}
                <p className="text-xs font-medium text-gray-400 px-2 py-1 mt-1">Layout</p>
                {FORM_FIELD_TYPES.filter((f) => f.category === 'layout').map((f) => (
                  <button
                    key={f.value}
                    onClick={() => addField(f.value)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-md"
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
