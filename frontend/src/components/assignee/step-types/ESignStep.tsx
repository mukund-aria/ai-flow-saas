/**
 * E-Sign Step
 *
 * Document signing with typed signature input.
 */

import { Loader2, FileText, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ESignStepProps {
  esign?: {
    documentName?: string;
    documentDescription?: string;
    signingOrder?: string;
  };
  formData: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function ESignStep({ esign, formData, onChange, onSubmit, isSubmitting }: ESignStepProps) {
  return (
    <div className="space-y-4">
      {esign?.documentName && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <FileText className="w-8 h-8 text-violet-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{esign.documentName}</p>
            {esign.documentDescription && (
              <p className="text-xs text-gray-500 mt-0.5">{esign.documentDescription}</p>
            )}
          </div>
        </div>
      )}
      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type your full name to sign
        </label>
        <input
          type="text"
          value={formData['signature'] || ''}
          onChange={(e) => onChange('signature', e.target.value)}
          placeholder="Full legal name"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        {formData['signature'] && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-lg font-serif italic text-gray-800">{formData['signature']}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>
      <Button
        onClick={() => onSubmit({
          signed: true,
          signature: formData['signature'],
          signedAt: new Date().toISOString(),
        })}
        disabled={isSubmitting || !formData['signature']?.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base gap-2"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        <PenTool className="w-4 h-4" />
        Sign Document
      </Button>
    </div>
  );
}
