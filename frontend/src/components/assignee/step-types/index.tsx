/**
 * Step Type Components - Barrel Export
 *
 * Exports all step type renderers and the dispatcher component.
 */

export { FormStep } from './FormStep';
export { QuestionnaireStep } from './QuestionnaireStep';
export { ApprovalStep } from './ApprovalStep';
export { DecisionStep } from './DecisionStep';
export { AcknowledgementStep } from './AcknowledgementStep';
export { FileRequestStep } from './FileRequestStep';
export { ESignStep } from './ESignStep';
export { PdfFormStep } from './PdfFormStep';
export { CustomActionStep } from './CustomActionStep';
export { WebAppStep } from './WebAppStep';
export { GenericStep } from './GenericStep';

import { FormStep } from './FormStep';
import { QuestionnaireStep } from './QuestionnaireStep';
import { ApprovalStep } from './ApprovalStep';
import { DecisionStep } from './DecisionStep';
import { AcknowledgementStep } from './AcknowledgementStep';
import { FileRequestStep } from './FileRequestStep';
import { ESignStep } from './ESignStep';
import { PdfFormStep } from './PdfFormStep';
import { CustomActionStep } from './CustomActionStep';
import { WebAppStep } from './WebAppStep';
import { GenericStep } from './GenericStep';
import type { AIPrepareResult } from '@/types';

interface TaskContext {
  stepType: string;
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
  esign?: {
    documentName?: string;
    documentDescription?: string;
    signingOrder?: string;
  };
  fileRequest?: {
    maxFiles?: number;
    allowedTypes?: string[];
    instructions?: string;
    aiReview?: { enabled: boolean; criteria?: string };
  };
  pdfForm?: {
    documentUrl?: string;
    fields?: Array<{
      fieldId: string;
      pdfFieldName: string;
      label: string;
      fieldType?: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'signature';
      required?: boolean;
      options?: string[];
    }>;
  };
  outcomes?: Array<{ outcomeId: string; label: string }>;
  options?: Array<{ optionId: string; label: string }>;
}

interface StepTypeRendererProps {
  task: TaskContext;
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
}

export function StepTypeRenderer({
  task,
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
}: StepTypeRendererProps) {
  if (task.stepType === 'FORM' && task.formFields && task.formFields.length > 0) {
    return (
      <FormStep
        formFields={task.formFields}
        formData={formData}
        onChange={onFormChange}
        onSubmit={() => onSubmit(formData)}
        isSubmitting={isSubmitting}
        aiPrepareResult={aiPrepareResult}
      />
    );
  }

  if (task.stepType === 'QUESTIONNAIRE' && task.questionnaire?.questions?.length) {
    return (
      <QuestionnaireStep
        questions={task.questionnaire.questions}
        answers={questionnaireAnswers}
        onChange={onQuestionnaireChange}
        onSubmit={() => onSubmit({ answers: questionnaireAnswers })}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (task.stepType === 'APPROVAL') {
    return <ApprovalStep onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  }

  if (task.stepType === 'DECISION' && task.outcomes?.length) {
    return <DecisionStep outcomes={task.outcomes} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  }

  if (task.stepType === 'ACKNOWLEDGEMENT') {
    return <AcknowledgementStep onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  }

  if (task.stepType === 'FILE_REQUEST') {
    return (
      <FileRequestStep
        fileRequest={task.fileRequest}
        uploadedFiles={uploadedFiles}
        setUploadedFiles={setUploadedFiles}
        fileInputRef={fileInputRef}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        token={token}
        aiReviewPending={aiReviewPending}
      />
    );
  }

  if (task.stepType === 'ESIGN') {
    return (
      <ESignStep
        esign={task.esign}
        formData={formData}
        onChange={onFormChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (task.stepType === 'PDF_FORM') {
    return (
      <PdfFormStep
        pdfForm={task.pdfForm}
        formData={formData}
        onChange={onFormChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    );
  }

  if (task.stepType === 'CUSTOM_ACTION' && task.options?.length) {
    return <CustomActionStep options={task.options} onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  }

  if (task.stepType === 'WEB_APP') {
    return <WebAppStep onSubmit={onSubmit} isSubmitting={isSubmitting} />;
  }

  return <GenericStep onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
