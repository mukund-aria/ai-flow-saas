/**
 * File Request Step
 *
 * File upload with drag-and-drop area, file list, and optional AI review.
 */

import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, X, File as FileIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface FileRequestStepProps {
  fileRequest?: {
    maxFiles?: number;
    allowedTypes?: string[];
    instructions?: string;
    aiReview?: {
      enabled: boolean;
      criteria?: string;
    };
  };
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
  token?: string;
  aiReviewPending?: boolean;
}

interface AIReviewState {
  status: 'PENDING' | 'APPROVED' | 'REVISION_NEEDED';
  feedback?: string;
  issues?: string[];
}

export function FileRequestStep({
  fileRequest,
  uploadedFiles,
  setUploadedFiles,
  fileInputRef,
  onSubmit,
  isSubmitting,
  token,
  aiReviewPending,
}: FileRequestStepProps) {
  const [aiReview, setAiReview] = useState<AIReviewState | null>(
    aiReviewPending ? { status: 'PENDING' } : null
  );
  const pollingRef = useRef<ReturnType<typeof setInterval>>();

  // Poll for AI review results
  useEffect(() => {
    if (!aiReviewPending || !token) return;
    setAiReview({ status: 'PENDING' });
    const abortController = new AbortController();

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/public/task/${token}/ai-review`, {
          signal: abortController.signal,
        });
        const data = await res.json();
        if (data.success && data.data.status !== 'PENDING') {
          setAiReview(data.data);
          clearInterval(pollingRef.current);
        }
      } catch {
        // Continue polling (or aborted on cleanup)
      }
    }, 3000);

    return () => {
      abortController.abort();
      clearInterval(pollingRef.current);
    };
  }, [aiReviewPending, token]);

  // AI Review pending state
  if (aiReview?.status === 'PENDING') {
    return (
      <div className="text-center py-6">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">AI is reviewing your files...</p>
        <p className="text-xs text-gray-400 mt-1">This usually takes a few seconds</p>
      </div>
    );
  }

  // AI Review result
  if (aiReview && aiReview.status !== 'PENDING') {
    return (
      <div className={`rounded-lg border p-4 ${
        aiReview.status === 'APPROVED'
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-start gap-3">
          {aiReview.status === 'APPROVED' ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-medium ${
              aiReview.status === 'APPROVED' ? 'text-green-800' : 'text-amber-800'
            }`}>
              {aiReview.status === 'APPROVED' ? 'Your files have been approved' : 'Revision needed'}
            </p>
            {aiReview.feedback && (
              <p className="text-sm text-gray-600 mt-1">{aiReview.feedback}</p>
            )}
            {aiReview.issues && aiReview.issues.length > 0 && (
              <ul className="mt-2 space-y-1">
                {aiReview.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <span className="mt-0.5">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {fileRequest?.instructions && (
        <p className="text-sm text-gray-600 mb-4">{fileRequest.instructions}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
          }
        }}
      />
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 text-center">Drag & drop or click to upload</p>
        <p className="text-xs text-gray-400 mt-1 text-center">
          Max {fileRequest?.maxFiles || 5} files
        </p>
      </div>
      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2 mb-4">
          {uploadedFiles.map((file, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
              <button
                onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                className="p-0.5 text-gray-400 hover:text-red-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <Button
        onClick={() => onSubmit({
          filesUploaded: uploadedFiles.length,
          fileNames: uploadedFiles.map(f => f.name),
        })}
        disabled={isSubmitting || uploadedFiles.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})` : ''}
      </Button>
    </div>
  );
}
