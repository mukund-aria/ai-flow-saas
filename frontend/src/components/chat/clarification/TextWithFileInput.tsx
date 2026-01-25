import { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileDropzone } from './FileDropzone';
import type { FileUploadConfig } from '@/types';

interface TextWithFileInputProps {
  textValue: string;
  onTextChange: (value: string) => void;
  placeholder?: string;
  fileUploadConfig?: FileUploadConfig;
  file: File | undefined;
  filePreviewUrl: string | undefined;
  onFileChange: (file: File | null, previewUrl: string | null) => void;
}

export function TextWithFileInput({
  textValue,
  onTextChange,
  placeholder,
  fileUploadConfig,
  file,
  filePreviewUrl,
  onFileChange,
}: TextWithFileInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [textValue]);

  return (
    <div className="space-y-2">
      {/* Text input */}
      <Textarea
        ref={textareaRef}
        value={textValue}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder || 'Type your answer...'}
        className="min-h-[40px] max-h-[120px] resize-none overflow-y-auto bg-white"
        rows={1}
      />

      {/* File upload area */}
      <FileDropzone
        config={fileUploadConfig}
        file={file}
        filePreviewUrl={filePreviewUrl}
        onFileChange={onFileChange}
      />
    </div>
  );
}
