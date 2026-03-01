import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './MessageItem';
import { ThinkingIndicator } from './ThinkingIndicator';
import { StreamingMessage } from './StreamingMessage';
import { WelcomeMessage } from './WelcomeMessage';
import type { Message, Clarification, SuggestedAction, AnalysisResult, ThinkingStepInfo } from '@/types';

interface MessageListProps {
  messages: Message[];
  isThinking: boolean;
  thinkingSteps: ThinkingStepInfo[];
  isStreaming: boolean;
  streamingContent: string;
  onApprovePlan: (planId: string) => void;
  onRequestChanges: (changes: string) => void;
  onAnswerClarification: (answers: Record<string, string>, questions: Clarification[]) => void;
  onEnhancementSubmit: (messageId: string, selections: Record<string, string | Record<string, string>>) => void;
  onEnhancementSkip: (messageId: string) => void;
  onSendMessage?: (message: string) => void;
  onSuggestedAction: (action: SuggestedAction) => void;
  hasWorkflow?: boolean;
  workflowName?: string;
  analysis?: AnalysisResult | null;
}

export function MessageList({
  messages,
  isThinking,
  thinkingSteps,
  isStreaming,
  streamingContent,
  onApprovePlan,
  onRequestChanges,
  onAnswerClarification,
  onEnhancementSubmit,
  onEnhancementSkip,
  onSendMessage,
  onSuggestedAction,
  hasWorkflow,
  workflowName,
  analysis,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, messages.length, streamingContent, isThinking, thinkingSteps.length]);

  // Check if conversation has started (user has sent a message)
  const conversationStarted = messages.length > 0;

  // Find any pending plan ID (from messages that have a pending plan not yet published)
  const pendingPlanId = messages.find(
    (m) => m.pendingPlan && !m.planPublished
  )?.pendingPlan?.planId;

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="py-4 space-y-3">
        {/* Welcome message is always the first message in the conversation */}
        {/* Only show example prompts before conversation starts */}
        <WelcomeMessage
          onSelectExample={conversationStarted ? undefined : onSendMessage}
          hasWorkflow={hasWorkflow}
          workflowName={workflowName}
          analysis={analysis}
        />

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onApprovePlan={onApprovePlan}
            onRequestChanges={onRequestChanges}
            onAnswerClarification={onAnswerClarification}
            onEnhancementSubmit={onEnhancementSubmit}
            onEnhancementSkip={onEnhancementSkip}
            onSuggestedAction={onSuggestedAction}
            pendingPlanId={pendingPlanId}
            analysis={analysis}
          />
        ))}

        {/* Streaming content */}
        {isStreaming && streamingContent && !isThinking && (
          <StreamingMessage content={streamingContent} />
        )}

        {/* Thinking indicator */}
        {isThinking && <ThinkingIndicator steps={thinkingSteps} />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
