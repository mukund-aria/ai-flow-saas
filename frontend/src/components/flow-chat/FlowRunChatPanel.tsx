/**
 * Flow Run Chat Panel
 *
 * Right-side slide panel for in-flow messaging.
 * Two modes:
 * - Coordinator: Multi-conversation (contact list → individual thread)
 * - Assignee: Single conversation thread
 */

import { useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useFlowRunChatStore } from '@/stores/flowRunChatStore';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';

interface CoordinatorProps {
  mode: 'coordinator';
  flowRunId: string;
}

interface AssigneeProps {
  mode: 'assignee';
  token: string;
}

type Props = CoordinatorProps | AssigneeProps;

export function FlowRunChatPanel(props: Props) {
  const {
    isOpen,
    setOpen,
    conversations,
    activeConversationId,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    fetchConversations,
    selectConversation,
    backToList,
    sendMessage,
    toggleResolved,
    fetchAssigneeMessages,
    sendAssigneeMessage,
    startPolling,
    stopPolling,
    reset,
  } = useFlowRunChatStore();

  // Fetch initial data and set up polling
  useEffect(() => {
    if (!isOpen) return;

    if (props.mode === 'coordinator') {
      fetchConversations(props.flowRunId);
      startPolling(() => fetchConversations(props.flowRunId));
    } else {
      fetchAssigneeMessages(props.token);
      startPolling(() => fetchAssigneeMessages(props.token));
    }

    return () => stopPolling();
  }, [isOpen, props.mode, props.mode === 'coordinator' ? props.flowRunId : (props as AssigneeProps).token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => reset();
  }, []);

  if (!isOpen) return null;

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <MessageSquare className="w-4 h-4 text-violet-600" />
        <h3 className="text-sm font-semibold text-gray-900 flex-1">Chat & updates</h3>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded hover:bg-gray-200 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {props.mode === 'coordinator' ? (
        // Coordinator: two-level navigation
        activeConversationId && activeConversation ? (
          <ConversationThread
            messages={messages}
            isLoading={isLoadingMessages}
            isSending={isSending}
            onSend={(content) => sendMessage(props.flowRunId, activeConversationId, content)}
            contactName={activeConversation.contact.name}
            onBack={backToList}
            isResolved={!!activeConversation.resolvedAt}
            onToggleResolved={(resolved) => toggleResolved(props.flowRunId, activeConversationId, resolved)}
            onClose={() => setOpen(false)}
            ownSenderType="user"
          />
        ) : (
          <ConversationList
            conversations={conversations}
            isLoading={isLoadingConversations}
            onSelect={(id) => selectConversation(id, props.flowRunId)}
          />
        )
      ) : (
        // Assignee: single conversation
        <ConversationThread
          messages={messages}
          isLoading={isLoadingMessages}
          isSending={isSending}
          onSend={(content) => sendAssigneeMessage((props as AssigneeProps).token, content)}
          ownSenderType="contact"
        />
      )}
    </div>
  );
}
