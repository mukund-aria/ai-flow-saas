/**
 * Conversation list for coordinator view.
 * Shows all assignees/contacts with last message preview and resolved status.
 */

import { Loader2, CheckCircle2, MessageCircle } from 'lucide-react';
import type { Conversation } from '@/stores/flowRunChatStore';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface Props {
  conversations: Conversation[];
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
}

export function ConversationList({ conversations, isLoading, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200 -ml-2" />
          </div>
          <p className="text-sm text-gray-500">
            No conversations yet. Conversations will appear when assignees send messages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left"
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
            {getInitials(conv.contact.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate">{conv.contact.name}</span>
              {conv.lastMessageAt && (
                <span className="text-[10px] text-gray-400 shrink-0 ml-2">
                  {formatTimeAgo(conv.lastMessageAt)}
                </span>
              )}
            </div>
            {conv.lastMessage && (
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {conv.lastMessage.senderType === 'user' ? 'You: ' : ''}
                {conv.lastMessage.content || 'Attachment'}
              </p>
            )}
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-1 shrink-0">
            {conv.resolvedAt ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <MessageCircle className="w-4 h-4 text-gray-300" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
