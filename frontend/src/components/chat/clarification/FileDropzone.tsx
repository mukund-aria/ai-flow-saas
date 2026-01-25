import { useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X } from 'lucide-react';
import type { FileUploadConfig } from '@/types';

const DEFAULT_ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface FileDropzoneProps {
  config?: FileUploadConfig;
  file: File | undefined;
  filePreviewUrl: string | undefined;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
}

export function FileDropzone({
  config,
  file,
  filePreviewUrl,
  onFileChange,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = config?.acceptedTypes || DEFAULT_ACCEPTED_TYPES;
  const placeholder = config?.placeholder || 'Upload a file (optional)';
  const helpText = config?.helpText;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return 'File type not supported. Please use PNG, JPG, or PDF.';
      }
      if (file.size > MAX_FILE_SIZE) {
        return 'File is too large. Maximum size is 10MB.';
      }
      return null;
    },
    [acceptedTypes]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      // Create preview URL for images
      let previewUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }

      onFileChange(file, previewUrl);
    },
    [validateFile, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    onFileChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [filePreviewUrl, onFileChange]);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // File selected - show preview
  if (file) {
    const isImage = file.type.startsWith('image/');

    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-2">
        <div className="flex items-center gap-3">
          {/* Thumbnail or icon */}
          {isImage && filePreviewUrl ? (
            <img
              src={filePreviewUrl}
              alt={file.name}
              className="w-10 h-10 rounded object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
          )}

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-700 truncate">
              {file.name}
            </p>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Remove file"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    );
  }

  // No file - show dropzone
  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'w-full rounded-lg border-2 border-dashed p-3 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-1',
          isDragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isDragging ? 'bg-violet-100' : 'bg-gray-200'
            )}
          >
            <Upload
              className={cn(
                'w-4 h-4',
                isDragging ? 'text-violet-600' : 'text-gray-500'
              )}
            />
          </div>
          <span
            className={cn(
              'text-sm',
              isDragging ? 'text-violet-600' : 'text-gray-500'
            )}
          >
            {placeholder}
          </span>
          <span className="text-xs text-gray-400">PNG, JPG, or PDF (max 10MB)</span>
        </div>
      </button>

      {helpText && (
        <p className="text-xs text-gray-500 px-1">{helpText}</p>
      )}

      {error && (
        <p className="text-sm text-red-500 px-1">{error}</p>
      )}
    </div>
  );
}
