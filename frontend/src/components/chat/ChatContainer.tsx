import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

interface ChatContainerProps {
  hasWorkflow?: boolean;
  workflowName?: string;
}

export function ChatContainer({ hasWorkflow, workflowName }: ChatContainerProps = {}) {
  const {
    messages,
    isStreaming,
    isThinking,
    thinkingStatus,
    streamingContent,
    sendMessage,
    handleFileUpload,
    handleApprovePlan,
    handleRequestChanges,
    handleAnswerClarification,
    handlePhase2Submit,
    handlePhase2Skip,
    handleSuggestedAction,
    cancelGeneration,
  } = useChat();

  return (
    <div className="flex flex-col h-full">
      {/* Message List */}
      <MessageList
        messages={messages}
        isThinking={isThinking}
        thinkingStatus={thinkingStatus}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        onApprovePlan={handleApprovePlan}
        onRequestChanges={handleRequestChanges}
        onAnswerClarification={handleAnswerClarification}
        onPhase2Submit={handlePhase2Submit}
        onPhase2Skip={handlePhase2Skip}
        onSendMessage={sendMessage}
        onSuggestedAction={handleSuggestedAction}
        hasWorkflow={hasWorkflow}
        workflowName={workflowName}
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
