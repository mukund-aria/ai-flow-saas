/**
 * Assignee Task Page
 *
 * Public page accessed via magic link.
 * External assignees complete tasks here without an account.
 * Orchestrator component: manages state and composes UI from assignee/ components.
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { FlowRunChatPanel } from '@/components/flow-chat/FlowRunChatPanel';
import { useFlowRunChatStore } from '@/stores/flowRunChatStore';
import { AssigneeHeader } from '@/components/assignee/AssigneeHeader';
import { StepNavigator } from '@/components/assignee/StepNavigator';
import { StepCard } from '@/components/assignee/StepCard';
import { AssigneeFooter } from '@/components/assignee/AssigneeFooter';
import { CompletionDialog } from '@/components/assignee/CompletionDialog';
import { JourneyPanel } from '@/components/assignee/JourneyPanel';
import { NeedHelpButton } from '@/components/assignee/NeedHelpButton';
import { ActivitySection } from '@/components/assignee/ActivitySection';
import { AIAdviseCard } from '@/components/assignee/AIAdviseCard';
import { AIReviewFeedback } from '@/components/assignee/AIReviewFeedback';
import { FormChatAssistant } from '@/components/assignee/FormChatAssistant';
import { SandboxBanner } from '@/components/assignee/SandboxBanner';
import type { JourneyStep, AIPrepareResult, AIAdviseResult, AIReviewResult } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface BrandingConfig {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  faviconUrl?: string;
  emailFooter?: string;
}

interface TaskContext {
  token: string;
  flowName: string;
  runName: string;
  stepName: string;
  stepDescription?: string;
  stepType: string;
  stepIndex?: number;
  totalSteps?: number;
  milestoneName?: string;
  contactName: string;
  formFields?: Array<{ fieldId: string; label: string; type: string; required?: boolean; options?: Array<{ label: string; value: string }> }>;
  questionnaire?: { questions: Array<{ questionId: string; question: string; answerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXT' | 'YES_NO'; choices?: string[]; required?: boolean }> };
  esign?: { documentName?: string; documentDescription?: string; signingOrder?: string };
  fileRequest?: { maxFiles?: number; allowedTypes?: string[]; instructions?: string; aiReview?: { enabled: boolean; criteria?: string } };
  pdfForm?: { documentUrl?: string; fields?: Array<{ fieldId: string; pdfFieldName: string; label: string; fieldType?: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature'; required?: boolean; options?: string[] }> };
  outcomes?: Array<{ outcomeId: string; label: string }>;
  options?: Array<{ optionId: string; label: string }>;
  expired: boolean;
  completed: boolean;
  alreadyCompleted?: boolean;
  journeySteps?: JourneyStep[];
  branding?: BrandingConfig;
  portalSlug?: string;
  isSandbox?: boolean;
}

export function AssigneeTaskPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const chatStore = useFlowRunChatStore();

  // Core state
  const [task, setTask] = useState<TaskContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionState, setCompletionState] = useState<{ completed: boolean; nextTaskToken?: string | null; aiReviewPending?: boolean }>({ completed: false });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI results state
  const [aiResults, setAiResults] = useState<{
    aiPrepare: AIPrepareResult | null;
    aiAdvise: AIAdviseResult | null;
    aiReview: AIReviewResult | null;
  }>({ aiPrepare: null, aiAdvise: null, aiReview: null });

  // Journey & navigation state
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [viewingStepIndex, setViewingStepIndex] = useState<number | null>(null);

  // Fetch task
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/public/task/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTask(data.data);
          if (data.data.alreadyCompleted) setCompletionState({ completed: true });
        } else {
          setError(data.error?.message || 'Task not found');
        }
      })
      .catch(() => setError('Failed to load task'))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Poll for AI results
  useEffect(() => {
    if (!token || completionState.completed) return;

    let attempts = 0;
    const maxAttempts = 10; // 30 seconds at 3s intervals
    let cancelled = false;

    const poll = async () => {
      if (cancelled) return;
      try {
        const res = await fetch(`${API_BASE}/public/task/${token}/ai-results`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setAiResults(data.data);

            // Pre-populate form data from AI Prepare
            if (data.data.aiPrepare?.status === 'COMPLETED' && data.data.aiPrepare.prefilledFields) {
              setFormData(prev => {
                const merged = { ...prev };
                for (const [key, value] of Object.entries(data.data.aiPrepare.prefilledFields)) {
                  if (!merged[key]) { // Don't overwrite user edits
                    merged[key] = value as string;
                  }
                }
                return merged;
              });
            }

            // Stop polling if all expected results are in
            if (data.data.aiPrepare || data.data.aiAdvise) return;
          }
        }
      } catch {
        // Silently retry
      }

      attempts++;
      if (attempts < maxAttempts && !cancelled) {
        setTimeout(poll, 3000);
      }
    };

    // Start polling after a brief delay to let the backend process
    const timer = setTimeout(poll, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [token, completionState.completed]);

  const handleSubmit = async (resultData?: Record<string, unknown>) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/public/task/${token}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultData: resultData || formData }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.revisionNeeded) {
          // AI Review requested revision
          setAiResults(prev => ({
            ...prev,
            aiReview: {
              status: 'REVISION_NEEDED',
              feedback: data.data.feedback,
              issues: data.data.issues,
              reviewedAt: new Date().toISOString(),
            },
          }));
          return; // Don't show completion dialog
        }
        setCompletionState({
          completed: true,
          nextTaskToken: data.data?.nextTaskToken,
          aiReviewPending: data.data?.aiReviewPending,
        });
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to submit');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextAction = () => {
    if (completionState.nextTaskToken) {
      navigate(`/task/${completionState.nextTaskToken}`);
      setCompletionState({ completed: false });
      setFormData({});
      setQuestionnaireAnswers({});
      setUploadedFiles([]);
      setError('');
      setIsLoading(true);
      setTask(null);
      setViewingStepIndex(null);
    }
  };

  // Navigation helpers
  const journeySteps = task?.journeySteps || [];
  const activeStepIndex = (task?.stepIndex ?? 1) - 1; // 0-based
  const currentViewIndex = viewingStepIndex ?? activeStepIndex;

  const handlePrev = () => {
    if (currentViewIndex > 0) setViewingStepIndex(currentViewIndex - 1);
  };
  const handleNext = () => {
    if (currentViewIndex < journeySteps.length - 1) setViewingStepIndex(currentViewIndex + 1);
  };
  const handleSelectStep = (idx: number) => {
    setViewingStepIndex(idx === activeStepIndex ? null : idx);
    setIsJourneyOpen(false);
  };

  // Determine step card mode
  const getStepMode = (): 'active' | 'locked' | 'completed-review' => {
    if (viewingStepIndex === null) return 'active';
    const step = journeySteps[viewingStepIndex];
    if (!step) return 'active';
    if (step.status === 'COMPLETED' && step.assignedToMe) return 'completed-review';
    if (viewingStepIndex === activeStepIndex && step.status === 'IN_PROGRESS') return 'active';
    return 'locked';
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your task...</p>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error && !task) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Task Not Available</h1>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
        <AssigneeFooter />
      </div>
    );
  }

  if (!task) return null;
  // Note: branding only available after task loads, error pages use default footer

  const stepIndex = task.stepIndex ?? 1;
  const totalSteps = task.totalSteps ?? 1;
  const displayStepIndex = viewingStepIndex !== null ? viewingStepIndex + 1 : stepIndex;
  const viewedJourneyStep = viewingStepIndex !== null ? journeySteps[viewingStepIndex] : undefined;

  // Apply branding CSS custom properties
  const brandingStyle: React.CSSProperties = {};
  if (task.branding?.primaryColor) {
    (brandingStyle as any)['--brand-primary'] = task.branding.primaryColor;
  }
  if (task.branding?.accentColor) {
    (brandingStyle as any)['--brand-accent'] = task.branding.accentColor;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={brandingStyle}>
      {task.isSandbox && <SandboxBanner />}
      <AssigneeHeader
        runName={task.runName}
        flowName={task.flowName}
        contactName={task.contactName}
        onToggleChat={() => chatStore.toggle()}
        branding={task.branding}
      />

      <StepNavigator
        stepIndex={displayStepIndex}
        totalSteps={totalSteps}
        milestoneName={task.milestoneName}
        onPrev={handlePrev}
        onNext={handleNext}
        onToggleJourney={() => setIsJourneyOpen(!isJourneyOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-xl mx-auto">
          {aiResults.aiAdvise && aiResults.aiAdvise.status === 'COMPLETED' && (
            <AIAdviseCard result={aiResults.aiAdvise} />
          )}
          {aiResults.aiReview && aiResults.aiReview.status === 'REVISION_NEEDED' && (
            <AIReviewFeedback result={aiResults.aiReview} />
          )}
          <StepCard
            task={task}
            mode={getStepMode()}
            journeyStep={viewedJourneyStep}
            formData={formData}
            questionnaireAnswers={questionnaireAnswers}
            onFormChange={(fieldId, value) => setFormData(prev => ({ ...prev, [fieldId]: value }))}
            onQuestionnaireChange={(qId, value) => setQuestionnaireAnswers(prev => ({ ...prev, [qId]: value }))}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            fileInputRef={fileInputRef}
            token={token}
            aiReviewPending={completionState.aiReviewPending}
            aiPrepareResult={aiResults.aiPrepare}
            error={error}
          />

          {/* Activity Section */}
          {token && <ActivitySection token={token} />}
        </div>
      </div>

      <AssigneeFooter companyName={task.branding?.companyName} />

      {/* Overlays & floating elements */}
      {completionState.completed && (
        <CompletionDialog
          contactName={task.contactName}
          nextTaskToken={completionState.nextTaskToken}
          portalSlug={task.portalSlug}
          onContinue={handleNextAction}
        />
      )}

      <JourneyPanel
        isOpen={isJourneyOpen}
        onClose={() => setIsJourneyOpen(false)}
        journeySteps={journeySteps}
        currentStepIndex={activeStepIndex}
        onSelectStep={handleSelectStep}
      />

      <NeedHelpButton />

      {/* Form Chat Assistant - AI help for form fields */}
      {token && task.stepType === 'FORM' && !completionState.completed && (
        <FormChatAssistant
          token={token}
          stepName={task.stepName}
          formFieldLabels={(task.formFields || []).map(f => f.label)}
        />
      )}

      {/* Chat Panel */}
      {token && <FlowRunChatPanel mode="assignee" token={token} />}
    </div>
  );
}
