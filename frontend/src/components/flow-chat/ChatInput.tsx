/**
 * Chat input bar with text input and send button.
 */

import { useState, useRef, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (content: string) => void;
  isSending: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isSending, placeholder }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 px-3 py-2 bg-white">
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Send message... (Shift + Enter for new line)'}
          rows={1}
          className="flex-1 resize-none text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent max-h-24 overflow-y-auto"
          style={{ minHeight: '36px' }}
        />
        <button
          onClick={handleSend}
          disabled={!value.trim() || isSending}
          className="p-2 rounded-lg bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-700 transition-colors shrink-0"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
