import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { ThinkingIndicator } from './ThinkingIndicator';
import { StreamingMessage } from './StreamingMessage';
import { WelcomeMessage } from './WelcomeMessage';
import type { Message, Clarification, SuggestedAction } from '@/types';
import type { ThinkingStatus } from '@/stores/chatStore';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
  thinkingStatus: ThinkingStatus;
  isStreaming: boolean;
  streamingContent: string;
  onApprovePlan: (planId: string) => void;
  onRequestChanges: (changes: string) => void;
  onAnswerClarification: (answers: Record<string, string>, questions: Clarification[]) => void;
  onPhase2Submit: (messageId: string, selections: Record<string, string | Record<string, string>>) => void;
  onPhase2Skip: (messageId: string) => void;
  onSendMessage?: (message: string) => void;
  onSuggestedAction: (action: SuggestedAction) => void;
}

export function MessageList({
  messages,
  isThinking,
  thinkingStatus,
  isStreaming,
  streamingContent,
  onApprovePlan,
  onRequestChanges,
  onAnswerClarification,
  onPhase2Submit,
  onPhase2Skip,
  onSendMessage,
  onSuggestedAction,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, messages.length, streamingContent, isThinking]);

  // Check if conversation has started (user has sent a message)
  const conversationStarted = messages.length > 0;

  // Find any pending plan ID (from messages that have a pending plan not yet published)
  const pendingPlanId = messages.find(
    (m) => m.pendingPlan && !m.planPublished
  )?.pendingPlan?.planId;

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-1">
        {/* Welcome message is always the first message in the conversation */}
        {/* Only show example prompts before conversation starts */}
        <WelcomeMessage onSelectExample={conversationStarted ? undefined : onSendMessage} />

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onApprovePlan={onApprovePlan}
            onRequestChanges={onRequestChanges}
            onAnswerClarification={onAnswerClarification}
            onPhase2Submit={onPhase2Submit}
            onPhase2Skip={onPhase2Skip}
            onSuggestedAction={onSuggestedAction}
            pendingPlanId={pendingPlanId}
          />
        ))}

        {/* Streaming content */}
        {isStreaming && streamingContent && !isThinking && (
          <StreamingMessage content={streamingContent} />
        )}

        {/* Thinking indicator */}
        {isThinking && <ThinkingIndicator status={thinkingStatus} />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
