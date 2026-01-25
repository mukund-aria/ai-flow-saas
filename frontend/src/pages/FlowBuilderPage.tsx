/**
 * Flow Builder Page
 *
 * The AI-powered flow builder with chat interface and workflow preview.
 * This integrates the existing AI Flow Copilot functionality.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';

export function FlowBuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendMessage, startNewChat } = useChat();

  // Check if we have a prompt from navigation state (from Home page)
  const initialPrompt = (location.state as { prompt?: string })?.prompt;

  // Start a new chat when component mounts
  useEffect(() => {
    startNewChat();
  }, []);

  // Send initial prompt if provided
  useEffect(() => {
    if (initialPrompt) {
      // Small delay to ensure chat is ready
      const timer = setTimeout(() => {
        sendMessage(initialPrompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/flows')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Flows
        </Button>
        <div className="h-6 w-px bg-gray-200" />
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Create New Flow
          </h1>
          <p className="text-sm text-gray-500">
            Describe your workflow and let AI build it
          </p>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Panel */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
          <ChatContainer />
        </div>

        {/* Workflow Preview Panel */}
        <div className="w-1/2 bg-gray-50 overflow-auto">
          <WorkflowPanel />
        </div>
      </div>
    </div>
  );
}
