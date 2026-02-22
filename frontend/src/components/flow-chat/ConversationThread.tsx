/**
 * Message thread view with header, message list, and input bar.
 * Used by both coordinator (with back button + resolve toggle) and assignee (simple header).
 */

import { useRef, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Loader2, X } from 'lucide-react';
import { ChatMessageBubble, formatDate } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatMessage } from '@/stores/flowRunChatStore';

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  onSend: (content: string) => void;
  // Coordinator-specific
  contactName?: string;
  onBack?: () => void;
  isResolved?: boolean;
  onToggleResolved?: (resolved: boolean) => void;
  onClose?: () => void;
  // Determines if "own" messages are user (coordinator) or contact (assignee)
  ownSenderType: 'user' | 'contact';
}

export function ConversationThread({
  messages,
  isLoading,
  isSending,
  onSend,
  contactName,
  onBack,
  isResolved,
  onToggleResolved,
  onClose,
  ownSenderType,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {(onBack || contactName) && (
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          {contactName && (
            <span className="text-sm font-medium text-gray-900 flex-1">{contactName}</span>
          )}
          {onToggleResolved && (
            <button
              onClick={() => onToggleResolved(!isResolved)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full transition-colors ${
                isResolved
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isResolved ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Resolved
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3" />
                  Mark resolved
                </>
              )}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              {ownSenderType === 'contact'
                ? 'Reach out by sending a message. Our team will respond promptly.'
                : 'You can send a message or share files.'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = i > 0 ? messages[i - 1] : null;
            const msgDate = formatDate(msg.createdAt);
            const prevDate = prevMsg ? formatDate(prevMsg.createdAt) : null;
            const showSeparator = msgDate !== prevDate ? msgDate : null;

            return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.senderType === ownSenderType}
                showDateSeparator={showSeparator}
              />
            );
          })
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} isSending={isSending} />
    </div>
  );
}
