/**
 * Step Card
 *
 * Container component that renders step info header, delegates to StepTypeRenderer
 * for interactive content, and renders the progress footer.
 * Supports active, locked, and completed-review modes.
 */

import { Lock } from 'lucide-react';
import { getStepTypeIcon, getStepTypeLabel, getInitials } from './utils';
import { StepTypeRenderer } from './step-types';
import { CompletedStepSummary } from './CompletedStepSummary';
import type { JourneyStep, AIPrepareResult } from '@/types';

interface TaskContext {
  stepType: string;
  stepName: string;
  stepDescription?: string;
  contactName: string;
  formFields?: Array<{ fieldId: string; label: string; type: string; required?: boolean; options?: Array<{ label: string; value: string }> }>;
  questionnaire?: {
    questions: Array<{
      questionId: string;
      question: string;
      answerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXT' | 'YES_NO';
      choices?: string[];
      required?: boolean;
    }>;
  };
  esign?: { documentName?: string; documentDescription?: string; signingOrder?: string };
  fileRequest?: { maxFiles?: number; allowedTypes?: string[]; instructions?: string; aiReview?: { enabled: boolean; criteria?: string } };
  pdfForm?: { documentUrl?: string; fields?: Array<{ fieldId: string; pdfFieldName: string; label: string; fieldType?: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature'; required?: boolean; options?: string[] }> };
  outcomes?: Array<{ outcomeId: string; label: string }>;
  options?: Array<{ optionId: string; label: string }>;
  stepIndex?: number;
  totalSteps?: number;
}

interface StepCardProps {
  task: TaskContext;
  mode: 'active' | 'locked' | 'completed-review';
  journeyStep?: JourneyStep;
  formData: Record<string, string>;
  questionnaireAnswers: Record<string, string | string[]>;
  onFormChange: (fieldId: string, value: string) => void;
  onQuestionnaireChange: (questionId: string, value: string | string[]) => void;
  onSubmit: (resultData?: Record<string, unknown>) => void;
  isSubmitting: boolean;
  uploadedFiles: File[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  token?: string;
  aiReviewPending?: boolean;
  aiPrepareResult?: AIPrepareResult | null;
  error?: string;
}

export function StepCard({
  task,
  mode,
  journeyStep,
  formData,
  questionnaireAnswers,
  onFormChange,
  onQuestionnaireChange,
  onSubmit,
  isSubmitting,
  uploadedFiles,
  setUploadedFiles,
  fileInputRef,
  token,
  aiReviewPending,
  aiPrepareResult,
  error,
}: StepCardProps) {
  const stepName = journeyStep?.stepName ?? task.stepName;
  const stepType = journeyStep?.stepType ?? task.stepType;
  const stepIndex = task.stepIndex ?? 1;
  const totalSteps = task.totalSteps ?? 1;

  return (
    <>
      <div data-testid="step-card" className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${
        mode === 'locked' ? 'opacity-75' : ''
      }`}>
        {/* Step Info Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
              {getStepTypeIcon(stepType)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">{stepName}</h2>
              <p className="text-sm text-gray-500">{getStepTypeLabel(stepType)}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.stepDescription && mode !== 'locked' && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 leading-relaxed">{task.stepDescription}</p>
          </div>
        )}

        {/* Content area based on mode */}
        <div className="px-6 pb-6">
          {mode === 'locked' ? (
            <div className="text-center py-8">
              <Lock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                This step will be available after previous steps are completed
              </p>
            </div>
          ) : mode === 'completed-review' && journeyStep?.resultData ? (
            <CompletedStepSummary
              stepType={stepType}
              resultData={journeyStep.resultData}
              formFields={task.formFields}
              completedAt={journeyStep.completedAt}
            />
          ) : mode === 'active' ? (
            <StepTypeRenderer
              task={task}
              formData={formData}
              questionnaireAnswers={questionnaireAnswers}
              onFormChange={onFormChange}
              onQuestionnaireChange={onQuestionnaireChange}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              fileInputRef={fileInputRef}
              token={token}
              aiReviewPending={aiReviewPending}
              aiPrepareResult={aiPrepareResult}
            />
          ) : null}
        </div>

        {/* Progress Section - only in active mode */}
        {mode === 'active' && (
          <div className="border-t border-gray-100">
            <div className="px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
              <span className="text-xs font-medium text-gray-500">{stepIndex}/{totalSteps}</span>
            </div>
            <div className="px-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {getInitials(task.contactName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.contactName} (You)</p>
                  <p className="text-xs text-gray-500">In progress...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center mt-4">{error}</p>
      )}
    </>
  );
}
