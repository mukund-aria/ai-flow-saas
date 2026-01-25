/**
 * Flow Builder Page
 *
 * The AI-powered flow builder with chat interface and workflow preview.
 * This integrates the existing AI Flow Copilot functionality.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { useChat } from '@/hooks/useChat';
import { useWorkflowStore } from '@/stores/workflowStore';
import { Button } from '@/components/ui/button';
import { publishFlow } from '@/lib/api';

export function FlowBuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sendMessage, startNewChat } = useChat();
  const { workflow, savedFlowId, savedFlowStatus, isSaving, setSavedFlow } = useWorkflowStore();
  const [isPublishing, setIsPublishing] = useState(false);

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

  // Handle publish
  const handlePublish = async () => {
    if (!savedFlowId) return;

    setIsPublishing(true);
    try {
      const published = await publishFlow(savedFlowId);
      setSavedFlow(published.id, 'ACTIVE');
      // Navigate to flows page after publish
      navigate('/flows');
    } catch (err) {
      console.error('Failed to publish flow:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const workflowName = workflow?.name || 'New Flow';
  const canPublish = savedFlowId && savedFlowStatus === 'DRAFT' && !isSaving && !isPublishing;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {workflow ? workflowName : 'Create New Flow'}
              </h1>
              {savedFlowStatus && (
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    savedFlowStatus === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : savedFlowStatus === 'DRAFT'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {savedFlowStatus}
                </span>
              )}
              {isSaving && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {workflow ? `${workflow.steps?.length || 0} steps` : 'Describe your workflow and let AI build it'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {savedFlowId && savedFlowStatus === 'ACTIVE' && (
            <span className="text-sm text-green-600 font-medium">Published</span>
          )}
          <Button
            onClick={handlePublish}
            disabled={!canPublish}
            className="bg-gray-900 hover:bg-gray-800"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
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
