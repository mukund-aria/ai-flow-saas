/**
 * Flow Builder Page
 *
 * The AI-powered flow builder with chat interface and workflow preview.
 * Supports AI mode (chat-based) and Manual mode (visual editor).
 * Supports loading a preview workflow after auth redirect (fromPreview flow).
 */

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, MessageSquare, Sparkles, PenLine } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { useChat } from '@/hooks/useChat';
import { useWorkflowStore } from '@/stores/workflowStore';
import { usePreviewStore } from '@/stores/previewStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { publishTemplate as publishTemplateApi, createTemplate, updateTemplate } from '@/lib/api';

type BuilderMode = 'ai' | 'manual';

export function FlowBuilderPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sendMessage, startNewChat } = useChat();
  const { workflow, savedFlowId, savedFlowStatus, isSaving, setSavedFlow, setWorkflow, setSaving, initEmptyWorkflow } = useWorkflowStore();
  const { previewWorkflow, previewPrompt, clearPreview } = usePreviewStore();
  const { completeBuildTemplate } = useOnboardingStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPreviewToast, setShowPreviewToast] = useState(false);
  const previewLoadedRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Builder mode from URL search params
  const modeParam = searchParams.get('mode') as BuilderMode | null;
  const [builderMode, setBuilderMode] = useState<BuilderMode>(modeParam === 'manual' ? 'manual' : 'ai');
  const [showAIChat, setShowAIChat] = useState(builderMode === 'ai');

  // Check if we have a prompt from navigation state (from Home page)
  const initialPrompt = (location.state as { prompt?: string })?.prompt;
  const fromPreview = searchParams.get('fromPreview') === 'true';

  // Sync builderMode with URL
  const handleModeChange = (mode: BuilderMode) => {
    setBuilderMode(mode);
    setShowAIChat(mode === 'ai');
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('mode', mode);
      return next;
    });

    // Initialize empty workflow when switching to manual mode if none exists
    if (mode === 'manual' && !workflow) {
      initEmptyWorkflow();
    }
  };

  // Start a new chat when component mounts
  useEffect(() => {
    startNewChat();
  }, []);

  // Initialize empty workflow in manual mode on mount
  useEffect(() => {
    if (builderMode === 'manual' && !workflow) {
      initEmptyWorkflow();
    }
  }, []);

  // Load preview workflow if coming from preview flow
  useEffect(() => {
    if (fromPreview && previewWorkflow && !previewLoadedRef.current) {
      previewLoadedRef.current = true;

      // Load the preview workflow into the workflow store
      setWorkflow(previewWorkflow);

      // Auto-save as DRAFT
      setSaving(true);
      createTemplate({
        name: previewWorkflow.name || 'Untitled Template',
        description: previewWorkflow.description || '',
        definition: previewWorkflow as unknown as Record<string, unknown>,
        status: 'DRAFT',
      })
        .then((savedFlow) => {
          setSavedFlow(savedFlow.id, 'DRAFT');
          completeBuildTemplate();
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
  }, [fromPreview, previewWorkflow, setWorkflow, setSaving, setSavedFlow, clearPreview, completeBuildTemplate]);

  // Send initial prompt if provided (from Home page, not preview)
  useEffect(() => {
    if (initialPrompt && !fromPreview) {
      const timer = setTimeout(() => {
        sendMessage(initialPrompt);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [initialPrompt, fromPreview]);

  // Auto-save in manual mode (debounced)
  const autoSave = useCallback(async () => {
    const currentWorkflow = useWorkflowStore.getState().workflow;
    const currentSavedId = useWorkflowStore.getState().savedFlowId;
    if (!currentWorkflow) return;

    setSaving(true);
    try {
      if (currentSavedId) {
        // Update existing template
        const saved = await updateTemplate(currentSavedId, {
          name: currentWorkflow.name || 'Untitled Template',
          description: currentWorkflow.description || '',
          definition: currentWorkflow as unknown as Record<string, unknown>,
        });
        setSavedFlow(saved.id, saved.status);
      } else {
        // Create new template
        const saved = await createTemplate({
          name: currentWorkflow.name || 'Untitled Template',
          description: currentWorkflow.description || '',
          definition: currentWorkflow as unknown as Record<string, unknown>,
          status: 'DRAFT',
        });
        setSavedFlow(saved.id, 'DRAFT');
        completeBuildTemplate();
      }
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaving(false);
    }
  }, [setSaving, setSavedFlow, completeBuildTemplate]);

  // Watch for workflow changes in manual mode and trigger auto-save
  useEffect(() => {
    if (builderMode !== 'manual' || !workflow) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 1000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [workflow, builderMode, autoSave]);

  // Handle publish
  const handlePublish = async () => {
    if (!savedFlowId) return;

    setIsPublishing(true);
    try {
      const published = await publishTemplateApi(savedFlowId);
      setSavedFlow(published.id, 'ACTIVE');
      // Track onboarding: flow published
      useOnboardingStore.getState().completePublishTemplate();
      // Navigate to flows page after publish
      navigate('/templates');
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
            onClick={() => navigate('/templates')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          <div className="h-6 w-px bg-gray-200" />

          {/* Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => handleModeChange('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                builderMode === 'ai'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI
            </button>
            <button
              onClick={() => handleModeChange('manual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                builderMode === 'manual'
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              Manual
            </button>
          </div>

          <div className="h-6 w-px bg-gray-200" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {workflow ? workflowName : 'Create New Template'}
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
              {builderMode === 'manual'
                ? `${workflow?.steps?.length || 0} steps — Visual editor`
                : workflow
                ? `${workflow.steps?.length || 0} steps`
                : 'Describe your workflow and let AI build it'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {savedFlowId && savedFlowStatus === 'ACTIVE' && (
            <span className="text-sm text-green-600 font-medium">Published</span>
          )}
          {builderMode === 'ai' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIChat(!showAIChat)}
              className={`relative ${showAIChat ? 'bg-violet-50 border-violet-200 text-violet-700' : ''}`}
              title={showAIChat ? 'Hide AI Chat' : 'Show AI Chat'}
            >
              <MessageSquare className={`w-4 h-4 ${showAIChat ? 'fill-violet-200' : ''}`} />
            </Button>
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

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {builderMode === 'ai' ? (
          <>
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
          </>
        ) : (
          /* Manual Mode - Full-width workflow editor */
          <div className="w-full bg-gray-50 overflow-auto">
            <WorkflowPanel editMode />
          </div>
        )}
      </div>
    </div>
  );
}
