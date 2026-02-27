/**
 * FormPreview
 *
 * Live preview of a form being built. Renders each field type with appropriate
 * input controls. Supports click-to-select with an inline property editor.
 */

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Upload,
  GripVertical,
} from 'lucide-react';
import type { FormField, FormFieldType } from '@/types';

interface FormPreviewProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onUpdateField: (id: string, updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
  onReorderField: (id: string, direction: 'up' | 'down') => void;
}

// Render the preview visualization for a single form field
function renderFormField(field: FormField): React.ReactNode {
  const baseLabel = (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {field.label || 'Untitled Field'}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const helpText = field.helpText ? (
    <p className="text-xs text-gray-400 mt-1">{field.helpText}</p>
  ) : null;

  switch (field.type) {
    case 'TEXT_SINGLE_LINE':
      return (
        <div>
          {baseLabel}
          <input
            type="text"
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );

    case 'TEXT_MULTI_LINE':
      return (
        <div>
          {baseLabel}
          <textarea
            placeholder={field.placeholder || 'Enter text...'}
            disabled
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 resize-none"
          />
          {helpText}
        </div>
      );

    case 'SINGLE_SELECT':
      return (
        <div>
          {baseLabel}
          <div className="space-y-1.5">
            {(field.options && field.options.length > 0
              ? field.options
              : [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]
            ).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                {opt.label}
              </label>
            ))}
          </div>
          {helpText}
        </div>
      );

    case 'MULTI_SELECT':
      return (
        <div>
          {baseLabel}
          <div className="space-y-1.5">
            {(field.options && field.options.length > 0
              ? field.options
              : [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2' }]
            ).map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 rounded border-2 border-gray-300" />
                {opt.label}
              </label>
            ))}
          </div>
          {helpText}
        </div>
      );

    case 'DROPDOWN':
    case 'DYNAMIC_DROPDOWN':
      return (
        <div>
          {baseLabel}
          <select
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 appearance-none"
          >
            <option>{field.placeholder || 'Select an option...'}</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {helpText}
        </div>
      );

    case 'FILE_UPLOAD':
      return (
        <div>
          {baseLabel}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
            <Upload className="w-6 h-6 mx-auto text-gray-300 mb-2" />
            <p className="text-xs text-gray-400">Drag & drop or click to upload</p>
          </div>
          {helpText}
        </div>
      );

    case 'DATE':
      return (
        <div>
          {baseLabel}
          <input
            type="date"
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );

    case 'NUMBER':
      return (
        <div>
          {baseLabel}
          <input
            type="number"
            placeholder={field.placeholder || '0'}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );

    case 'EMAIL':
      return (
        <div>
          {baseLabel}
          <input
            type="email"
            placeholder={field.placeholder || 'email@example.com'}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );

    case 'PHONE':
      return (
        <div>
          {baseLabel}
          <input
            type="tel"
            placeholder={field.placeholder || '+1 (555) 000-0000'}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );

    case 'CURRENCY':
      return (
        <div>
          {baseLabel}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              type="number"
              placeholder={field.placeholder || '0.00'}
              disabled
              className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            />
          </div>
          {helpText}
        </div>
      );

    case 'NAME':
      return (
        <div>
          {baseLabel}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="First name"
              disabled
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            />
            <input
              type="text"
              placeholder="Last name"
              disabled
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            />
          </div>
          {helpText}
        </div>
      );

    case 'ADDRESS':
      return (
        <div>
          {baseLabel}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Street address"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            />
            <input
              type="text"
              placeholder="Address line 2"
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="City"
                disabled
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
              />
              <input
                type="text"
                placeholder="State"
                disabled
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
              />
              <input
                type="text"
                placeholder="ZIP"
                disabled
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
              />
            </div>
          </div>
          {helpText}
        </div>
      );

    case 'SIGNATURE':
      return (
        <div>
          {baseLabel}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
            <p className="text-xs text-gray-400">Signature pad</p>
          </div>
          {helpText}
        </div>
      );

    case 'HEADING':
      return (
        <h2 className="text-lg font-semibold text-gray-900">
          {field.label || 'Heading'}
        </h2>
      );

    case 'PARAGRAPH':
      return (
        <p className="text-sm text-gray-600 leading-relaxed">
          {field.label || 'Paragraph text goes here. Use this to provide instructions or context.'}
        </p>
      );

    case 'IMAGE':
      return (
        <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
          <div className="w-12 h-12 mx-auto rounded bg-gray-200 flex items-center justify-center mb-2">
            <span className="text-gray-400 text-xs">IMG</span>
          </div>
          <p className="text-xs text-gray-400">{field.label || 'Image placeholder'}</p>
        </div>
      );

    case 'PAGE_BREAK':
      return (
        <div className="py-2 flex items-center gap-3">
          <div className="flex-1 border-t-2 border-dashed border-gray-300" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Page Break</span>
          <div className="flex-1 border-t-2 border-dashed border-gray-300" />
        </div>
      );

    case 'LINE_SEPARATOR':
      return <hr className="border-gray-200 my-1" />;

    default:
      return (
        <div>
          {baseLabel}
          <input
            type="text"
            placeholder={field.placeholder || '...'}
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400"
          />
          {helpText}
        </div>
      );
  }
}

// Check if this field type supports options (select/dropdown types)
function fieldTypeHasOptions(type: FormFieldType): boolean {
  return ['SINGLE_SELECT', 'MULTI_SELECT', 'DROPDOWN', 'DYNAMIC_DROPDOWN'].includes(type);
}

// Check if this is a layout element (no label/required/placeholder editing)
function isLayoutField(type: FormFieldType): boolean {
  return ['HEADING', 'PARAGRAPH', 'IMAGE', 'PAGE_BREAK', 'LINE_SEPARATOR'].includes(type);
}

export function FormPreview({
  fields,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onRemoveField,
  onReorderField,
}: FormPreviewProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <GripVertical className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">No fields yet</h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Click elements from the palette on the left to start building your form.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const isSelected = selectedFieldId === field.fieldId;
                return (
                  <div key={field.fieldId}>
                    {/* Field wrapper */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectField(isSelected ? null : field.fieldId);
                      }}
                      className={`relative group rounded-lg p-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-violet-500 bg-violet-50/30'
                          : 'hover:bg-gray-50 hover:ring-1 hover:ring-gray-200'
                      }`}
                    >
                      {/* Floating action bar */}
                      <div
                        className={`absolute -top-2 right-2 flex items-center gap-0.5 bg-white border border-gray-200 rounded-md shadow-sm px-1 py-0.5 z-10 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        } transition-opacity`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderField(field.fieldId, 'up');
                          }}
                          disabled={index === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onReorderField(field.fieldId, 'down');
                          }}
                          disabled={index === fields.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          title="Move down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-3 bg-gray-200 mx-0.5" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveField(field.fieldId);
                          }}
                          className="p-0.5 text-gray-400 hover:text-red-500"
                          title="Remove field"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Field preview */}
                      {renderFormField(field)}
                    </div>

                    {/* Inline property editor (shown below selected field) */}
                    {isSelected && (
                      <div className="mt-2 ml-3 mr-3 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Field Properties
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{field.type}</span>
                        </div>

                        {/* Label */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {isLayoutField(field.type) ? 'Content' : 'Label'}
                          </label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => onUpdateField(field.fieldId, { label: e.target.value })}
                            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                            placeholder={isLayoutField(field.type) ? 'Enter content...' : 'Field label'}
                          />
                        </div>

                        {/* Placeholder (for input types only) */}
                        {!isLayoutField(field.type) && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) =>
                                onUpdateField(field.fieldId, { placeholder: e.target.value || undefined })
                              }
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                              placeholder="Placeholder text"
                            />
                          </div>
                        )}

                        {/* Help Text (for input types only) */}
                        {!isLayoutField(field.type) && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Help Text</label>
                            <input
                              type="text"
                              value={field.helpText || ''}
                              onChange={(e) =>
                                onUpdateField(field.fieldId, { helpText: e.target.value || undefined })
                              }
                              className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                              placeholder="Additional instructions for the user"
                            />
                          </div>
                        )}

                        {/* Required toggle (for input types only) */}
                        {!isLayoutField(field.type) && (
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required || false}
                              onChange={(e) => onUpdateField(field.fieldId, { required: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className="text-sm text-gray-600">Required</span>
                          </label>
                        )}

                        {/* Options editor (for select/dropdown types) */}
                        {fieldTypeHasOptions(field.type) && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1.5">Options</label>
                            <div className="space-y-1.5">
                              {(field.options || []).map((opt, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions[optIndex] = {
                                        ...opt,
                                        label: e.target.value,
                                        value: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                                      };
                                      onUpdateField(field.fieldId, { options: newOptions });
                                    }}
                                    className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    placeholder={`Option ${optIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => {
                                      const newOptions = (field.options || []).filter(
                                        (_, i) => i !== optIndex
                                      );
                                      onUpdateField(field.fieldId, { options: newOptions });
                                    }}
                                    className="p-1 text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [
                                    ...(field.options || []),
                                    {
                                      label: `Option ${(field.options?.length || 0) + 1}`,
                                      value: `option_${(field.options?.length || 0) + 1}`,
                                    },
                                  ];
                                  onUpdateField(field.fieldId, { options: newOptions });
                                }}
                                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
