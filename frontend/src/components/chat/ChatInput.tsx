import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore';
import type { MessageAttachment } from '@/types';

interface ChatInputProps {
  onSend: (message: string, attachment?: MessageAttachment) => void;
  onFileUpload: (file: File, message?: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  onFileUpload,
  disabled,
  placeholder = 'Describe your workflow or ask a question...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Listen for prefill messages from suggested actions
  const prefillMessage = useChatStore((state) => state.prefillMessage);
  const setPrefillMessage = useChatStore((state) => state.setPrefillMessage);

  // When a prefill message is set, populate the input and clear the prefill
  useEffect(() => {
    if (prefillMessage) {
      setMessage(prefillMessage);
      setPrefillMessage(null);
      // Focus the textarea so user can edit
      textareaRef.current?.focus();
    }
  }, [prefillMessage, setPrefillMessage]);

  // Auto-grow textarea as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (!message.trim() && !pendingFile) return;

    if (pendingFile) {
      // If there's a file, upload it with optional message as context/prompt
      onFileUpload(pendingFile, message.trim() || undefined);
      clearFile();
    } else {
      // Text-only message
      onSend(message.trim());
    }

    setMessage('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image (PNG, JPG, GIF, WebP) or PDF file.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return;
    }

    setPendingFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    // Reset input
    e.target.value = '';
  };

  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingFile(null);
    setPreviewUrl(null);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const hasContent = message.trim() || pendingFile;

  return (
    <div className="bg-white px-4 py-3">
      {/* File Preview - Floating card above input */}
      {pendingFile && (
        <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-14 h-14 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Image className="w-6 h-6 text-purple-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {pendingFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(pendingFile.size / 1024).toFixed(1)} KB • Ready to analyze
              </p>
            </div>
            <button
              onClick={clearFile}
              className="shrink-0 p-1.5 rounded-full hover:bg-white/80 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modern Input Container */}
      <div
        className={cn(
          'flex items-end gap-2 p-2 rounded-2xl border bg-gray-50/80 transition-all duration-200',
          'hover:bg-gray-50 hover:border-gray-300',
          'focus-within:bg-white focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100',
          'shadow-sm hover:shadow',
          disabled && 'opacity-60 pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File Upload Button - Integrated */}
        <button
          onClick={openFilePicker}
          disabled={disabled}
          title="Upload diagram or document"
          className={cn(
            'shrink-0 p-2 rounded-xl transition-all duration-200',
            'text-gray-400 hover:text-purple-500 hover:bg-purple-50',
            'focus:outline-none focus:ring-2 focus:ring-purple-200'
          )}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea - Borderless, integrated */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={pendingFile ? 'Add context about this diagram (optional)...' : placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 min-h-[40px] max-h-[200px] resize-none overflow-y-auto',
            'bg-transparent border-0 shadow-none focus-visible:ring-0',
            'text-gray-700 placeholder:text-gray-400',
            'py-2 px-1'
          )}
          rows={1}
        />

        {/* Send Button - Circular with dynamic color */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !hasContent}
          className={cn(
            'shrink-0 p-2.5 rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-purple-200',
            hasContent
              ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Hint Text */}
      <p className="mt-2 text-xs text-gray-400 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
