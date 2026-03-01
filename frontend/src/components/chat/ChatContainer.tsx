import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';
import type { AnalysisResult } from '@/types';

interface ChatContainerProps {
  hasWorkflow?: boolean;
  workflowName?: string;
  analysis?: AnalysisResult | null;
}

export function ChatContainer({ hasWorkflow, workflowName, analysis }: ChatContainerProps = {}) {
  const {
    messages,
    isStreaming,
    isThinking,
    thinkingSteps,
    streamingContent,
    sendMessage,
    handleFileUpload,
    handleApprovePlan,
    handleRequestChanges,
    handleAnswerClarification,
    handleEnhancementSubmit,
    handleEnhancementSkip,
    handleSuggestedAction,
    cancelGeneration,
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <MessageList
        messages={messages}
        isThinking={isThinking}
        thinkingSteps={thinkingSteps}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onApprovePlan={handleApprovePlan}
        onRequestChanges={handleRequestChanges}
        onAnswerClarification={handleAnswerClarification}
        onEnhancementSubmit={handleEnhancementSubmit}
        onEnhancementSkip={handleEnhancementSkip}
        onSendMessage={sendMessage}
        onSuggestedAction={handleSuggestedAction}
        hasWorkflow={hasWorkflow}
        workflowName={workflowName}
        analysis={analysis}
      />

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onFileUpload={handleFileUpload}
        onStop={cancelGeneration}
        disabled={isStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
}
