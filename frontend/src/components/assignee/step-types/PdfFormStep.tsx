/**
 * PDF Form Step
 *
 * PDF document viewer with fillable form fields.
 */

import { Loader2, FileCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfFormField {
  fieldId: string;
  pdfFieldName: string;
  label: string;
  fieldType?: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature';
  required?: boolean;
  options?: string[];
}

interface PdfFormStepProps {
  pdfForm?: {
    documentUrl?: string;
    fields?: PdfFormField[];
  };
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function PdfFormStep({ pdfForm, formData, onChange, onSubmit, isSubmitting }: PdfFormStepProps) {
  return (
    <div className="space-y-4">
      {/* PDF Document Viewer */}
      {pdfForm?.documentUrl ? (
        <>
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
            <iframe
              src={pdfForm.documentUrl}
              className="w-full h-[300px] sm:h-[400px]"
              title="PDF Document"
            />
          </div>
          <a
            href={pdfForm.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3" />
            Open PDF in new tab
          </a>
        </>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <FileCheck className="w-8 h-8 text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">PDF Form</p>
            <p className="text-xs text-gray-500 mt-0.5">Complete the fields below</p>
          </div>
        </div>
      )}

      {/* Fillable Fields Form */}
      {pdfForm?.fields && pdfForm.fields.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Fill in the fields</p>
          {pdfForm.fields.map(field => (
            <div key={field.fieldId}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.fieldType === 'checkbox' ? (
                <label className="flex items-center gap-2.5 py-2 px-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData[field.fieldId] === 'true'}
                    onChange={(e) => onChange(field.fieldId, e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ) : field.fieldType === 'dropdown' || field.fieldType === 'radio' ? (
                <select
                  value={formData[field.fieldId] || ''}
                  onChange={(e) => onChange(field.fieldId, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">Select...</option>
                  {(field.options || []).map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formData[field.fieldId] || ''}
                  onChange={(e) => onChange(field.fieldId, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={() => onSubmit({ pdfCompleted: true, fieldValues: formData })}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit PDF Form
      </Button>
    </div>
  );
}
