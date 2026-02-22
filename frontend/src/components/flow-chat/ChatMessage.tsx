/**
 * Individual chat message bubble.
 */

import { Paperclip } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/stores/flowRunChatStore';

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  message: ChatMessageType;
  isOwnMessage: boolean;
  showDateSeparator?: string | null;
}

export function ChatMessageBubble({ message, isOwnMessage, showDateSeparator }: Props) {
  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">{showDateSeparator}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}
      <div className={`flex gap-2.5 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
          isOwnMessage
            ? 'bg-violet-100 text-violet-700'
            : 'bg-gray-200 text-gray-600'
        }`}>
          {getInitials(message.senderName)}
        </div>

        {/* Message content */}
        <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-medium text-gray-700">{message.senderName}</span>
            <span className="text-[10px] text-gray-400">{formatTime(message.createdAt)}</span>
          </div>
          <div className={`rounded-xl px-3 py-2 text-sm ${
            isOwnMessage
              ? 'bg-violet-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}>
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
            {message.attachments.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {message.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs ${
                      isOwnMessage ? 'text-violet-200 hover:text-white' : 'text-violet-600 hover:text-violet-800'
                    }`}
                  >
                    <Paperclip className="w-3 h-3" />
                    {att.fileName}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export { formatDate };
