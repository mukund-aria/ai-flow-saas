/**
 * Form Step
 *
 * Renders form fields for the FORM step type with client-side validation.
 */

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AIPrepareNotice } from '@/components/assignee/AIPrepareNotice';
import type { AIPrepareResult } from '@/types';

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
  aiPrepareResult?: AIPrepareResult | null;
}

export function FormStep({ formFields, formData, onChange, onSubmit, isSubmitting, aiPrepareResult }: FormStepProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);

  const requiredFields = formFields.filter(f => f.required);
  const emptyRequired = requiredFields.filter(f => !formData[f.fieldId]?.trim());
  const isValid = emptyRequired.length === 0;

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      // Mark all required as touched
      const allTouched: Record<string, boolean> = {};
      requiredFields.forEach(f => { allTouched[f.fieldId] = true; });
      setTouched(prev => ({ ...prev, ...allTouched }));
      return;
    }
    onSubmit();
  };

  const showFieldError = (field: FormField) =>
    field.required && !formData[field.fieldId]?.trim() && (showErrors || touched[field.fieldId]);

  return (
    <div className="space-y-4">
      {aiPrepareResult && aiPrepareResult.status === 'COMPLETED' && (
        <AIPrepareNotice result={aiPrepareResult} fieldCount={formFields.length} />
      )}
      {formFields.map(field => (
        <div key={field.fieldId} data-testid={`field-${field.fieldId}`}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {aiPrepareResult?.prefilledFields?.[field.fieldId] && (
              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-100 text-violet-600">
                AI
              </span>
            )}
          </label>
          {field.type === 'TEXT_MULTI_LINE' || field.type === 'textarea' ? (
            <textarea
              value={formData[field.fieldId] || ''}
              onChange={(e) => onChange(field.fieldId, e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, [field.fieldId]: true }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                showFieldError(field) ? 'border-red-300' : 'border-gray-200'
              }`}
              rows={3}
            />
          ) : field.type === 'SINGLE_SELECT' || field.type === 'DROPDOWN' ? (
            <select
              value={formData[field.fieldId] || ''}
              onChange={(e) => onChange(field.fieldId, e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, [field.fieldId]: true }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                showFieldError(field) ? 'border-red-300' : 'border-gray-200'
              }`}
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
              onBlur={() => setTouched(prev => ({ ...prev, [field.fieldId]: true }))}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                showFieldError(field) ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          )}
          {showFieldError(field) && (
            <p className="text-xs text-red-500 mt-1">This field is required</p>
          )}
        </div>
      ))}

      {showErrors && !isValid && (
        <p className="text-sm text-red-600 text-center">Please fill in all required fields</p>
      )}

      <Button
        data-testid="form-submit"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit
      </Button>
    </div>
  );
}
