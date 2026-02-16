/**
 * Flow Builder Page
 *
 * The AI-powered flow builder with chat interface and workflow preview.
 * This integrates the existing AI Flow Copilot functionality.
 * Supports loading a preview workflow after auth redirect (fromPreview flow).
 */

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { useChat } from '@/hooks/useChat';
import { useWorkflowStore } from '@/stores/workflowStore';
import { usePreviewStore } from '@/stores/previewStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { publishFlow as publishFlowApi, createFlow } from '@/lib/api';

export function FlowBuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendMessage, startNewChat } = useChat();
  const { workflow, savedFlowId, savedFlowStatus, isSaving, setSavedFlow, setWorkflow, setSaving } = useWorkflowStore();
  const { previewWorkflow, previewPrompt, clearPreview } = usePreviewStore();
  const { completeBuildFlow } = useOnboardingStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(true);
  const [showPreviewToast, setShowPreviewToast] = useState(false);
  const previewLoadedRef = useRef(false);

  // Check if we have a prompt from navigation state (from Home page)
  const initialPrompt = (location.state as { prompt?: string })?.prompt;
  const fromPreview = searchParams.get('fromPreview') === 'true';

  // Start a new chat when component mounts
  useEffect(() => {
    startNewChat();
  }, []);

  // Load preview workflow if coming from preview flow
  useEffect(() => {
    if (fromPreview && previewWorkflow && !previewLoadedRef.current) {
      previewLoadedRef.current = true;

      // Load the preview workflow into the workflow store
      setWorkflow(previewWorkflow);

      // Auto-save as DRAFT
      setSaving(true);
      createFlow({
        name: previewWorkflow.name || 'Untitled Flow',
        description: previewWorkflow.description || '',
        definition: previewWorkflow as unknown as Record<string, unknown>,
        status: 'DRAFT',
      })
        .then((savedFlow) => {
          setSavedFlow(savedFlow.id, 'DRAFT');
          completeBuildFlow();
          setShowPreviewToast(true);
          // Auto-dismiss toast after 5 seconds
          setTimeout(() => setShowPreviewToast(false), 5000);
        })
        .catch((err) => {
          console.error('Failed to save preview flow:', err);
        });

      // Clear the preview store
      clearPreview();
    }
  }, [fromPreview, previewWorkflow, setWorkflow, setSaving, setSavedFlow, clearPreview, completeBuildFlow]);

  // Send initial prompt if provided (from Home page, not preview)
  useEffect(() => {
    if (initialPrompt && !fromPreview) {
      const timer = setTimeout(() => {
        sendMessage(initialPrompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, fromPreview]);

  // Handle publish
  const handlePublish = async () => {
    if (!savedFlowId) return;

    setIsPublishing(true);
    try {
      const published = await publishFlowApi(savedFlowId);
      setSavedFlow(published.id, 'ACTIVE');
      // Track onboarding: flow published
      useOnboardingStore.getState().completePublishFlow();
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
      {/* Preview Toast */}
      {showPreviewToast && (
        <div className="absolute top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg max-w-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <p className="text-sm font-medium text-green-900">Your workflow has been saved!</p>
          <p className="text-sm text-green-700 mt-1">You can now edit and run it.</p>
          <button
            onClick={() => setShowPreviewToast(false)}
            className="mt-2 text-xs text-green-600 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

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
            Back to Flow Templates
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {workflow ? workflowName : 'Create New Flow Template'}
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
            variant="outline"
            size="sm"
            onClick={() => setShowAIChat(!showAIChat)}
            className={`relative ${showAIChat ? 'bg-violet-50 border-violet-200 text-violet-700' : ''}`}
            title={showAIChat ? 'Hide AI Chat' : 'Show AI Chat'}
          >
            <MessageSquare className={`w-4 h-4 ${showAIChat ? 'fill-violet-200' : ''}`} />
          </Button>
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
        <div
          className={`border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            showAIChat ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {showAIChat && <ChatContainer />}
        </div>

        {/* Workflow Preview Panel */}
        <div
          className={`bg-gray-50 overflow-auto transition-all duration-300 ease-in-out ${
            showAIChat ? 'w-1/2' : 'w-full'
          }`}
        >
          <WorkflowPanel />
        </div>
      </div>
    </div>
  );
}
