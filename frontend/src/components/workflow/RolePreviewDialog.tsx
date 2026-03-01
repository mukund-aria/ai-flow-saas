/**
 * Role Preview Dialog
 *
 * Shows a preview of the assignee portal experience for a specific role.
 * Filters steps to those assigned to the selected role and renders
 * read-only previews of each step's assignee-facing UI.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StepIcon } from './StepIcon';
import { getRoleColor, getRoleInitials, STEP_TYPE_META } from '@/types';
import type { Step, Role, StepType } from '@/types';
import {
  ThumbsUp,
  ThumbsDown,
  Upload,
  CheckSquare,
  Eye as EyeIcon,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface RolePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: Step[];
  role: Role;
  roleIndex: number;
}

/** Human step types that an assignee would interact with */
const ASSIGNEE_STEP_TYPES = new Set<StepType>([
  'FORM',
  'APPROVAL',
  'FILE_REQUEST',
  'TODO',
  'ACKNOWLEDGEMENT',
  'DECISION',
  'QUESTIONNAIRE',
  'ESIGN',
  'CUSTOM_ACTION',
  'PDF_FORM',
  'WEB_APP',
]);

export function RolePreviewDialog({
  open,
  onOpenChange,
  steps,
  role,
  roleIndex,
}: RolePreviewDialogProps) {
  const color = getRoleColor(roleIndex);
  const assignedStepIds = new Set(
    steps.filter((s) => s.config.assignee === role.name).map((s) => s.stepId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: color }}
            >
              {getRoleInitials(role.name)}
            </span>
            <div>
              <DialogTitle className="text-base">
                Preview:{' '}
                <span style={{ color }}>{role.name}</span>
                {"'s Experience"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Read-only preview of what this assignee will see
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
          {assignedStepIds.size === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No steps are assigned to this role yet.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Assign steps to <strong>{role.name}</strong> in the step configuration panel.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {steps.map((step, index) => {
                const isAssigned = assignedStepIds.has(step.stepId);
                const isLast = index === steps.length - 1;

                if (!isAssigned) {
                  return (
                    <OtherStepPlaceholder
                      key={step.stepId}
                      step={step}
                      index={index}
                      isLast={isLast}
                    />
                  );
                }

                return (
                  <AssignedStepPreview
                    key={step.stepId}
                    step={step}
                    index={index}
                    isLast={isLast}
                    roleColor={color}
                  />
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Other Step Placeholder (collapsed / grayed)
// ============================================================================

function OtherStepPlaceholder({
  step,
  index,
  isLast,
}: {
  step: Step;
  index: number;
  isLast: boolean;
}) {
  const meta = STEP_TYPE_META[step.type];

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <Lock className="w-3 h-3 text-gray-300" />
        </div>
        {!isLast && <div className="w-px flex-1 min-h-[8px] bg-gray-200" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3 min-w-0">
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-xs text-gray-400 italic truncate">
            {step.config.name || `Step ${index + 1}`}
          </span>
          <span className="text-xs text-gray-300 shrink-0">
            {meta?.label || step.type}
          </span>
          {step.config.assignee && (
            <span className="text-xs text-gray-300 shrink-0">
              ({step.config.assignee})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Assigned Step Preview (expanded with assignee-facing UI)
// ============================================================================

function AssignedStepPreview({
  step,
  index,
  isLast,
  roleColor,
}: {
  step: Step;
  index: number;
  isLast: boolean;
  roleColor: string;
}) {
  const meta = STEP_TYPE_META[step.type];

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${roleColor}15` }}
        >
          <StepIcon
            type={step.type}
            className="w-3.5 h-3.5"
            style={{ color: roleColor }}
          />
        </div>
        {!isLast && (
          <div
            className="w-px flex-1 min-h-[8px]"
            style={{ backgroundColor: `${roleColor}30` }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-4 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-900 truncate">
            {step.config.name || `Step ${index + 1}`}
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0"
            style={{
              backgroundColor: `${meta?.color || roleColor}15`,
              color: meta?.color || roleColor,
            }}
          >
            {meta?.label || step.type}
          </span>
        </div>

        {step.config.description && (
          <p className="text-xs text-gray-500 mb-3">{step.config.description}</p>
        )}

        <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
          <StepPreviewContent step={step} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step Preview Content (renders step-type-specific preview UI)
// ============================================================================

function StepPreviewContent({ step }: { step: Step }) {
  switch (step.type) {
    case 'FORM':
      return <FormPreviewContent step={step} />;
    case 'APPROVAL':
      return <ApprovalPreviewContent />;
    case 'FILE_REQUEST':
      return <FileRequestPreviewContent step={step} />;
    case 'TODO':
      return <TodoPreviewContent step={step} />;
    case 'ACKNOWLEDGEMENT':
      return <AcknowledgementPreviewContent />;
    case 'DECISION':
      return <DecisionPreviewContent step={step} />;
    case 'QUESTIONNAIRE':
      return <QuestionnairePreviewContent step={step} />;
    case 'ESIGN':
      return <ESignPreviewContent />;
    default:
      return <GenericPreviewContent step={step} />;
  }
}

// --- FORM ---
function FormPreviewContent({ step }: { step: Step }) {
  const fields = step.config.formFields || [];

  if (fields.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-2">
        No form fields configured
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <div key={field.fieldId}>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {field.type === 'TEXT_MULTI_LINE' ? (
            <div className="w-full h-14 border border-gray-200 rounded-md bg-white px-2 py-1.5">
              <span className="text-xs text-gray-300">
                {field.placeholder || 'Multi-line text input'}
              </span>
            </div>
          ) : field.type === 'SINGLE_SELECT' || field.type === 'DROPDOWN' ? (
            <div className="w-full border border-gray-200 rounded-md bg-white px-2 py-1.5 flex items-center justify-between">
              <span className="text-xs text-gray-300">Select...</span>
              <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : field.type === 'MULTI_SELECT' ? (
            <div className="space-y-1">
              {(field.options || []).slice(0, 3).map((opt) => (
                <div key={opt.value} className="flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-md bg-white">
                  <div className="w-3.5 h-3.5 rounded border border-gray-300" />
                  <span className="text-xs text-gray-500">{opt.label}</span>
                </div>
              ))}
              {(field.options || []).length > 3 && (
                <span className="text-xs text-gray-300 pl-1">
                  +{(field.options || []).length - 3} more
                </span>
              )}
            </div>
          ) : field.type === 'FILE_UPLOAD' ? (
            <div className="border border-dashed border-gray-200 rounded-md bg-white px-2 py-2 text-center">
              <Upload className="w-3.5 h-3.5 text-gray-300 mx-auto mb-0.5" />
              <span className="text-xs text-gray-300">Upload file</span>
            </div>
          ) : field.type === 'SIGNATURE' ? (
            <div className="border border-dashed border-gray-200 rounded-md bg-white px-2 py-3 text-center">
              <span className="text-xs text-gray-300 italic">Signature pad</span>
            </div>
          ) : (
            <div className="w-full border border-gray-200 rounded-md bg-white px-2 py-1.5">
              <span className="text-xs text-gray-300">
                {field.placeholder || `Enter ${field.label.toLowerCase()}`}
              </span>
            </div>
          )}
        </div>
      ))}
      <PreviewButton label="Submit" />
    </div>
  );
}

// --- APPROVAL ---
function ApprovalPreviewContent() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 text-center">
        Please review and provide your decision.
      </p>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-green-100 text-green-700 text-xs font-medium">
          <ThumbsUp className="w-3 h-3" /> Approve
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-red-200 text-red-600 text-xs font-medium">
          <ThumbsDown className="w-3 h-3" /> Reject
        </div>
      </div>
    </div>
  );
}

// --- FILE_REQUEST ---
function FileRequestPreviewContent({ step }: { step: Step }) {
  const config = step.config.fileRequest;
  return (
    <div className="space-y-2">
      {config?.instructions && (
        <p className="text-xs text-gray-500">{config.instructions}</p>
      )}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
        <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
        <p className="text-xs text-gray-400">Drag & drop or click to upload</p>
        <p className="text-xs text-gray-300 mt-0.5">
          Max {config?.maxFiles || 5} files
        </p>
      </div>
      <PreviewButton label="Submit" />
    </div>
  );
}

// --- TODO ---
function TodoPreviewContent({ step }: { step: Step }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 py-1.5">
        <CheckSquare className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
        <span className="text-xs text-gray-500">
          {step.config.description || 'Task to complete'}
        </span>
      </div>
      <PreviewButton label="Mark Complete" />
    </div>
  );
}

// --- ACKNOWLEDGEMENT ---
function AcknowledgementPreviewContent() {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2 py-1.5">
        <EyeIcon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
        <span className="text-xs text-gray-500">
          Please confirm you have reviewed this information.
        </span>
      </div>
      <PreviewButton label="I Acknowledge" />
    </div>
  );
}

// --- DECISION ---
function DecisionPreviewContent({ step }: { step: Step }) {
  const outcomes = step.config.outcomes || [];

  if (outcomes.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-2">
        No decision options configured
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 text-center">Select your decision:</p>
      {outcomes.map((outcome, i) => (
        <div
          key={outcome.outcomeId}
          className={`w-full py-2 rounded-md text-xs font-medium text-center ${
            i === 0
              ? 'bg-violet-100 text-violet-700'
              : 'border border-gray-200 text-gray-600'
          }`}
        >
          {outcome.label}
        </div>
      ))}
    </div>
  );
}

// --- QUESTIONNAIRE ---
function QuestionnairePreviewContent({ step }: { step: Step }) {
  const questions = step.config.questionnaire?.questions || [];

  if (questions.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic text-center py-2">
        No questions configured
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.slice(0, 3).map((q) => (
        <div key={q.questionId}>
          <p className="text-xs font-medium text-gray-600 mb-1">
            {q.question}
            {q.required && <span className="text-red-400 ml-0.5">*</span>}
          </p>
          {q.answerType === 'YES_NO' ? (
            <div className="flex gap-2">
              <div className="flex-1 py-1.5 rounded-md border border-gray-200 text-center text-xs text-gray-400">
                Yes
              </div>
              <div className="flex-1 py-1.5 rounded-md border border-gray-200 text-center text-xs text-gray-400">
                No
              </div>
            </div>
          ) : q.answerType === 'SINGLE_SELECT' || q.answerType === 'MULTI_SELECT' ? (
            <div className="space-y-1">
              {(q.choices || []).slice(0, 3).map((choice, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-md bg-white">
                  <div className={`w-3.5 h-3.5 border border-gray-300 ${q.answerType === 'SINGLE_SELECT' ? 'rounded-full' : 'rounded'}`} />
                  <span className="text-xs text-gray-500">{choice}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border border-gray-200 rounded-md bg-white px-2 py-1.5">
              <span className="text-xs text-gray-300">Type your answer...</span>
            </div>
          )}
        </div>
      ))}
      {questions.length > 3 && (
        <p className="text-xs text-gray-300 text-center">
          +{questions.length - 3} more questions
        </p>
      )}
      <PreviewButton label="Submit" />
    </div>
  );
}

// --- E-SIGN ---
function ESignPreviewContent() {
  return (
    <div className="space-y-2">
      <div className="border border-dashed border-gray-200 rounded-md bg-white px-3 py-4 text-center">
        <span className="text-xs text-gray-400 italic">Electronic signature area</span>
      </div>
      <PreviewButton label="Sign & Submit" />
    </div>
  );
}

// --- Generic fallback ---
function GenericPreviewContent({ step }: { step: Step }) {
  const meta = STEP_TYPE_META[step.type];
  return (
    <div className="text-center py-2">
      <p className="text-xs text-gray-400">
        {meta?.label || step.type} step
      </p>
      <PreviewButton label="Complete" />
    </div>
  );
}

// ============================================================================
// Shared preview button (non-functional, styled to look like the real thing)
// ============================================================================

function PreviewButton({ label }: { label: string }) {
  return (
    <div className="w-full py-2 rounded-md bg-blue-100 text-blue-600 text-xs font-medium text-center cursor-default">
      {label}
    </div>
  );
}
