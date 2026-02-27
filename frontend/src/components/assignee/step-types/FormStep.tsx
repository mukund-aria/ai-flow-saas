/**
 * Form Step
 *
 * Renders form fields for the FORM step type.
 */

import { Loader2 } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormField {
  fieldId: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

interface FormStepProps {
  formFields: FormField[];
  formData: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function FormStep({ formFields, formData, onChange, onSubmit, isSubmitting }: FormStepProps) {
  return (
    <div className="space-y-4">
      {formFields.map(field => (
        <div key={field.fieldId}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === 'TEXT_MULTI_LINE' || field.type === 'textarea' ? (
            <textarea
              value={formData[field.fieldId] || ''}
              onChange={(e) => onChange(field.fieldId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
          ) : field.type === 'SINGLE_SELECT' || field.type === 'DROPDOWN' ? (
            <select
              value={formData[field.fieldId] || ''}
              onChange={(e) => onChange(field.fieldId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Select...</option>
              {(field.options || []).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'MULTI_SELECT' ? (
            <div className="space-y-2">
              {(field.options || []).map(opt => {
                const currentValues = (formData[field.fieldId] || '').split(',').filter(Boolean);
                const isChecked = currentValues.includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-2.5 py-2 px-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        const updated = isChecked
                          ? currentValues.filter(v => v !== opt.value)
                          : [...currentValues, opt.value];
                        onChange(field.fieldId, updated.join(','));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <input
              type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : field.type === 'NUMBER' || field.type === 'CURRENCY' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
              value={formData[field.fieldId] || ''}
              onChange={(e) => onChange(field.fieldId, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      ))}
      <Button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit
      </Button>
    </div>
  );
}
