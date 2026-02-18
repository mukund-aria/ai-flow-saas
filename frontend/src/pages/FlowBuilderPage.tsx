/**
 * Flow Builder Page
 *
 * The AI-powered flow builder with chat interface and workflow preview.
 * Supports AI mode (chat-based) and Manual mode (visual editor with step palette sidebar).
 * Supports loading a preview workflow after auth redirect (fromPreview flow).
 */

import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Loader2, Sparkles, PenLine, Settings, X, Play } from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { AssigneeBar } from '@/components/workflow/AssigneeBar';
import { StepPalette } from '@/components/workflow/StepPalette';
import { useChat } from '@/hooks/useChat';
import { useWorkflowStore } from '@/stores/workflowStore';
import { usePreviewStore } from '@/stores/previewStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { publishTemplate as publishTemplateApi, createTemplate, updateTemplate, getTemplate, startTestFlow } from '@/lib/api';
import type { Flow, StepType } from '@/types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { STEP_TYPE_META } from '@/types';
import { StepIcon } from '@/components/workflow/StepIcon';

type BuilderMode = 'ai' | 'manual';

export function FlowBuilderPage() {
  const { id: templateId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { sendMessage, startNewChat } = useChat();
  const { workflow, savedFlowId, savedFlowStatus, isSaving, setSavedFlow, setWorkflow, setSaving, initEmptyWorkflow, updateFlowMetadata } = useWorkflowStore();
  const { previewWorkflow, previewPrompt, clearPreview } = usePreviewStore();
  const { completeBuildTemplate } = useOnboardingStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);
  const [showPreviewToast, setShowPreviewToast] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const previewLoadedRef = useRef(false);
  const templateLoadedRef = useRef(false);
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

  // Load existing template if we have an :id param
  useEffect(() => {
    if (!templateId || templateId === 'new' || templateLoadedRef.current) return;
    templateLoadedRef.current = true;

    setIsLoadingTemplate(true);
    getTemplate(templateId)
      .then((template) => {
        // Load the workflow definition into the store
        if (template.definition) {
          const flowDef = template.definition as unknown as Flow;
          setWorkflow({
            flowId: flowDef.flowId || templateId,
            name: flowDef.name || template.name,
            description: flowDef.description || template.description || '',
            steps: flowDef.steps || [],
            milestones: flowDef.milestones || [],
            assigneePlaceholders: flowDef.assigneePlaceholders || [],
            parameters: flowDef.parameters,
            triggerConfig: flowDef.triggerConfig,
            settings: flowDef.settings,
          });
        } else {
          // No definition yet, initialize with template metadata
          initEmptyWorkflow(template.name);
        }
        setSavedFlow(template.id, template.status);
        // Default to manual mode when editing existing template
        if (!modeParam) {
          setBuilderMode('manual');
          setShowAIChat(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load template:', err);
      })
      .finally(() => {
        setIsLoadingTemplate(false);
      });
  }, [templateId]);

  // Initialize empty workflow in manual mode on mount (only for new templates)
  useEffect(() => {
    if (builderMode === 'manual' && !workflow && !templateId) {
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
        const saved = await updateTemplate(currentSavedId, {
          name: currentWorkflow.name || 'Untitled Template',
          description: currentWorkflow.description || '',
          definition: currentWorkflow as unknown as Record<string, unknown>,
        });
        setSavedFlow(saved.id, saved.status);
      } else {
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
      useOnboardingStore.getState().completePublishTemplate();
      navigate('/templates');
    } catch (err) {
      console.error('Failed to publish flow:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle test run — saves the draft first, then starts a test flow
  const handleTestRun = async () => {
    if (!savedFlowId || !workflow || workflow.steps.length === 0) return;

    setIsTesting(true);
    try {
      // Ensure latest changes are saved first
      await autoSave();
      const runName = `${workflow.name} - Test ${new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;
      const run = await startTestFlow(savedFlowId, runName);
      navigate(`/flows/${run.id}`);
    } catch (err) {
      console.error('Failed to start test run:', err);
    } finally {
      setIsTesting(false);
    }
  };

  // DnD setup for manual mode (shared context for palette drag + step reorder)
  const { addStep, moveStep } = useWorkflowStore.getState();
  const [activeDragType, setActiveDragType] = useState<StepType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: { active: { id: string | number; data: { current?: { type?: string; stepType?: StepType } } } }) => {
    const data = event.active.data.current;
    if (data?.type === 'palette-item' && data.stepType) {
      setActiveDragType(data.stepType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragType(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Case 1: Palette item dropped onto a drop zone
    if (activeId.startsWith('palette:') && overId.startsWith('drop-zone-')) {
      const stepType = activeId.replace('palette:', '') as StepType;
      const dropIndex = parseInt(overId.replace('drop-zone-', ''), 10);
      if (!isNaN(dropIndex)) {
        useWorkflowStore.getState().addStep(dropIndex, stepType);
      }
      return;
    }

    // Case 2: Step reorder (sortable)
    if (!activeId.startsWith('palette:') && !overId.startsWith('drop-zone-') && !overId.startsWith('palette:')) {
      if (activeId === overId) return;
      const steps = useWorkflowStore.getState().workflow?.steps || [];
      const oldIndex = steps.findIndex((s) => s.stepId === activeId);
      const newIndex = steps.findIndex((s) => s.stepId === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        useWorkflowStore.getState().moveStep(steps[oldIndex].stepId, newIndex);
      }
    }
  };

  // Inline name editing
  const handleNameClick = () => {
    if (workflow) {
      setNameValue(workflow.name);
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== workflow?.name) {
      updateFlowMetadata({ name: trimmed });
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') {
      setIsEditingName(false);
    }
  };

  const workflowName = workflow?.name || 'Untitled Template';
  const canPublish = savedFlowId && savedFlowStatus === 'DRAFT' && !isSaving && !isPublishing;

  // Loading state for existing template
  if (isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading template...</p>
        </div>
      </div>
    );
  }

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

      {/* Header - Slim design */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white">
        {/* Left: Close + Name + Badges */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => navigate('/templates')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
            title="Back to Templates"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-gray-200 shrink-0" />

          {/* Editable flow name */}
          {isEditingName ? (
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={handleNameKeyDown}
              className="text-sm font-semibold text-gray-900 bg-transparent border-b-2 border-violet-500 focus:outline-none min-w-[120px] max-w-[300px]"
              autoFocus
            />
          ) : (
            <button
              onClick={handleNameClick}
              className="text-sm font-semibold text-gray-900 hover:text-violet-700 transition-colors truncate max-w-[300px]"
              title="Click to rename"
            >
              {workflowName}
            </button>
          )}

          {/* Version + Status badges */}
          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-100 text-gray-500 shrink-0">
            V1
          </span>
          {savedFlowStatus && (
            <span
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded shrink-0 ${
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
            <span className="flex items-center gap-1 text-[11px] text-gray-400 shrink-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving
            </span>
          )}
        </div>

        {/* Center: AI/Manual toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => handleModeChange('ai')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              builderMode === 'ai'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            AI
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              builderMode === 'manual'
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <PenLine className="w-3 h-3" />
            Manual
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {savedFlowId && savedFlowStatus === 'ACTIVE' && (
            <span className="text-xs text-green-600 font-medium">Published</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestRun}
            disabled={!savedFlowId || !workflow || workflow.steps.length === 0 || isTesting}
            className="text-xs h-8 gap-1.5"
            title="Start a test run of this flow"
          >
            {isTesting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            Test
          </Button>
          <button
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!canPublish}
            className="bg-gray-900 hover:bg-gray-800 text-xs h-8 px-4"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      {/* Assignee Bar - always visible when workflow exists */}
      {workflow && <AssigneeBar />}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {builderMode === 'ai' ? (
          <>
            {/* AI mode: Chat panel + Canvas */}
            <div
              className={`border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                showAIChat ? 'w-1/2 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              {showAIChat && <ChatContainer />}
            </div>
            <div
              className={`bg-gray-50 overflow-auto transition-all duration-300 ease-in-out ${
                showAIChat ? 'w-1/2' : 'w-full'
              }`}
            >
              <WorkflowPanel />
            </div>
          </>
        ) : (
          /* Manual mode: Shared DndContext for palette drag + step reorder */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <StepPalette onSwitchToAI={() => handleModeChange('ai')} />
            <div className="flex-1 bg-gray-50 overflow-auto">
              <WorkflowPanel editMode />
            </div>

            {/* Drag overlay for palette items */}
            <DragOverlay>
              {activeDragType && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border bg-white opacity-90"
                  style={{ borderColor: STEP_TYPE_META[activeDragType].color }}
                >
                  <StepIcon type={activeDragType} className="w-4 h-4" style={{ color: STEP_TYPE_META[activeDragType].color }} />
                  <span className="text-sm font-medium text-gray-700">
                    {STEP_TYPE_META[activeDragType].label}
                  </span>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}
