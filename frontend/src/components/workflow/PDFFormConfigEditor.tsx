/**
 * PDF Form Config Editor
 *
 * Upload a PDF, auto-detect fillable fields, edit labels and required flags.
 * Used in the StepConfigPanel for PDF_FORM step type.
 */

import { useState, useRef } from 'react';
import { Upload, FileText, RefreshCw, Loader2, X, Type, CheckSquare, List, Radio, PenTool } from 'lucide-react';
import { uploadPDF } from '@/lib/api';
import type { PDFFormConfig, PDFFormField } from '@/types';

interface PDFFormConfigEditorProps {
  config: PDFFormConfig;
  onChange: (config: PDFFormConfig) => void;
}

const FIELD_TYPE_ICONS: Record<string, React.ElementType> = {
  text: Type,
  checkbox: CheckSquare,
  dropdown: List,
  radio: Radio,
  signature: PenTool,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  radio: 'Radio',
  signature: 'Signature',
};

export function PDFFormConfigEditor({ config, onChange }: PDFFormConfigEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadPDF(file);

      // Map detected fields to PDFFormField format
      const fields: PDFFormField[] = result.fields.map((f) => ({
        fieldId: f.fieldId,
        pdfFieldName: f.pdfFieldName,
        label: f.label,
        fieldType: f.fieldType,
        required: f.required,
        options: f.options,
      }));

      setPageCount(result.pageCount);
      onChange({
        documentUrl: result.documentUrl,
        fields,
      });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const updateField = (index: number, updates: Partial<PDFFormField>) => {
    const updated = config.fields.map((f, i) => (i === index ? { ...f, ...updates } : f));
    onChange({ ...config, fields: updated });
  };

  const removeField = (index: number) => {
    onChange({ ...config, fields: config.fields.filter((_, i) => i !== index) });
  };

  const hasDocument = !!config.documentUrl;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          // Reset so same file can be re-selected
          e.target.value = '';
        }}
      />

      {/* Upload Zone or Document Info */}
      {!hasDocument ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isUploading
              ? 'border-violet-300 bg-violet-50/50'
              : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/30'
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-violet-400 mx-auto mb-2 animate-spin" />
              <p className="text-sm text-violet-600 font-medium">Uploading & detecting fields...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Upload a fillable PDF</p>
              <p className="text-xs text-gray-400 mt-1">Drag & drop or click to browse (max 20MB)</p>
            </>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 truncate">
                PDF uploaded
              </p>
              <p className="text-xs text-green-600">
                {pageCount} {pageCount === 1 ? 'page' : 'pages'} &middot; {config.fields.length} {config.fields.length === 1 ? 'field' : 'fields'} detected
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Replace
            </button>
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}

      {/* Detected Fields List */}
      {config.fields.length > 0 && (
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-2">
            Detected Fields ({config.fields.length})
          </label>
          <div className="space-y-2">
            {config.fields.map((field, index) => {
              const FieldIcon = FIELD_TYPE_ICONS[field.fieldType || 'text'] || Type;
              return (
                <div
                  key={field.fieldId}
                  className="border border-gray-200 rounded-lg p-3 bg-white"
                >
                  <div className="flex items-start gap-2.5">
                    {/* Field type icon */}
                    <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FieldIcon className="w-3.5 h-3.5 text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Editable label */}
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />

                      {/* PDF field name chip + type */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-mono rounded">
                          {field.pdfFieldName}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {FIELD_TYPE_LABELS[field.fieldType || 'text']}
                        </span>
                        {field.options && field.options.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            ({field.options.length} options)
                          </span>
                        )}
                      </div>

                      {/* Required toggle */}
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required ?? false}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600"
                        />
                        <span className="text-xs text-gray-500">Required</span>
                      </label>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No fields message */}
      {hasDocument && config.fields.length === 0 && (
        <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700 font-medium">No fillable fields detected</p>
          <p className="text-xs text-amber-600 mt-1">
            This PDF has no fillable form fields. The assignee will view the PDF and confirm completion.
          </p>
        </div>
      )}
    </div>
  );
}
