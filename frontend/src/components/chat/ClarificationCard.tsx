import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle } from 'lucide-react';
import { SelectionInput, TextWithFileInput } from './clarification';
import type { Clarification, ClarificationAnswer } from '@/types';

// Auto-growing textarea for simple text answers
function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [value]);

  return (
    <Textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[40px] max-h-[120px] resize-none overflow-y-auto bg-white"
      rows={1}
    />
  );
}

interface ClarificationCardProps {
  questions: Clarification[];
  onSubmit: (answers: Record<string, string>, questions: Clarification[]) => void;
  isLocked?: boolean;
  savedAnswers?: Record<string, string>;
}

export function ClarificationCard({ questions, onSubmit, isLocked = false, savedAnswers }: ClarificationCardProps) {
  // Enhanced answer state - keyed by question ID
  const [answers, setAnswers] = useState<Record<string, ClarificationAnswer>>({});

  // Initialize answer objects for each question
  useEffect(() => {
    const initial: Record<string, ClarificationAnswer> = {};
    questions.forEach((q) => {
      if (!answers[q.id]) {
        initial[q.id] = { questionId: q.id };
      }
    });
    if (Object.keys(initial).length > 0) {
      setAnswers((prev) => ({ ...prev, ...initial }));
    }
  }, [questions]);

  // Update handlers
  const updateTextValue = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], questionId, textValue: value },
    }));
  }, []);

  const updateSelectedOption = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const currentAnswer = prev[questionId];
      // Only clear conditional values if selection actually changes to a different option
      const isNewSelection = currentAnswer?.selectedOptionId !== optionId;

      return {
        ...prev,
        [questionId]: {
          ...currentAnswer,
          questionId,
          selectedOptionId: optionId,
          // Only clear conditional values when selection changes to a different option
          conditionalValues: isNewSelection ? {} : (currentAnswer?.conditionalValues || {}),
        },
      };
    });
  }, []);

  const updateConditionalValue = useCallback(
    (questionId: string, fieldId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          conditionalValues: {
            ...(prev[questionId]?.conditionalValues || {}),
            [fieldId]: value,
          },
        },
      }));
    },
    []
  );

  const updateFile = useCallback(
    (questionId: string, file: File | null, previewUrl: string | null) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          file: file || undefined,
          filePreviewUrl: previewUrl || undefined,
        },
      }));
    },
    []
  );

  // Check if a question has a valid answer
  const hasValidAnswer = useCallback(
    (question: Clarification, answer: ClarificationAnswer | undefined): boolean => {
      if (!answer) return false;

      const inputType = question.inputType || 'text';

      switch (inputType) {
        case 'text':
          return !!answer.textValue?.trim();

        case 'text_with_file':
          return !!answer.textValue?.trim() || !!answer.file;

        case 'selection':
          if (!answer.selectedOptionId) return false;
          // Check required conditional fields
          const selectedOption = question.options?.find(
            (o) => o.optionId === answer.selectedOptionId
          );
          const requiredFields =
            selectedOption?.conditionalFields?.filter((f) => f.required) || [];
          return requiredFields.every((f) => answer.conditionalValues?.[f.fieldId]?.trim());

        default:
          return false;
      }
    },
    []
  );

  // Check if at least one question has a valid answer
  const hasAnyValidAnswer = questions.some((q) => hasValidAnswer(q, answers[q.id]));

  // Format answers for submission
  const handleSubmit = () => {
    if (!hasAnyValidAnswer) return;

    // Convert to legacy format (Record<string, string>) for backward compatibility
    // while also including structured data
    const formattedAnswers: Record<string, string> = {};

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (!answer) return;

      const inputType = question.inputType || 'text';

      switch (inputType) {
        case 'text':
          if (answer.textValue?.trim()) {
            formattedAnswers[question.id] = answer.textValue.trim();
          }
          break;

        case 'text_with_file':
          // Combine text and file info
          const parts: string[] = [];
          if (answer.textValue?.trim()) {
            parts.push(answer.textValue.trim());
          }
          if (answer.file) {
            parts.push(`[Attached: ${answer.file.name}]`);
          }
          if (parts.length > 0) {
            formattedAnswers[question.id] = parts.join('\n');
          }
          break;

        case 'selection':
          if (answer.selectedOptionId) {
            const selectedOption = question.options?.find(
              (o) => o.optionId === answer.selectedOptionId
            );
            if (selectedOption) {
              let answerText = selectedOption.label;
              // Add conditional values
              if (answer.conditionalValues) {
                const conditionalParts = Object.entries(answer.conditionalValues)
                  .filter(([_, v]) => v?.trim())
                  .map(([fieldId, value]) => {
                    const field = selectedOption.conditionalFields?.find(
                      (f) => f.fieldId === fieldId
                    );
                    return field ? `${field.label}: ${value}` : value;
                  });
                if (conditionalParts.length > 0) {
                  answerText += `\n  - ${conditionalParts.join('\n  - ')}`;
                }
              }
              formattedAnswers[question.id] = answerText;
            }
          }
          break;
      }
    });

    onSubmit(formattedAnswers, questions);
  };

  // Render input based on question type
  const renderQuestionInput = (question: Clarification) => {
    const answer = answers[question.id] || { questionId: question.id };
    const inputType = question.inputType || 'text';

    switch (inputType) {
      case 'text':
        return (
          <AutoGrowTextarea
            value={answer.textValue || ''}
            onChange={(value) => updateTextValue(question.id, value)}
            placeholder={question.placeholder || 'Type your answer... (optional)'}
          />
        );

      case 'text_with_file':
        return (
          <TextWithFileInput
            textValue={answer.textValue || ''}
            onTextChange={(value) => updateTextValue(question.id, value)}
            placeholder={question.placeholder || 'Type your answer...'}
            fileUploadConfig={question.fileUpload}
            file={answer.file}
            filePreviewUrl={answer.filePreviewUrl}
            onFileChange={(file, previewUrl) =>
              updateFile(question.id, file, previewUrl)
            }
          />
        );

      case 'selection':
        if (!question.options) return null;
        return (
          <SelectionInput
            options={question.options}
            selectedOptionId={answer.selectedOptionId}
            onSelectOption={(optionId) => updateSelectedOption(question.id, optionId)}
            conditionalValues={answer.conditionalValues || {}}
            onConditionalChange={(fieldId, value) =>
              updateConditionalValue(question.id, fieldId, value)
            }
          />
        );

      default:
        return null;
    }
  };

  // Locked state: show read-only answers
  if (isLocked) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/30 max-w-md">
        <CardContent className="space-y-3 pt-4 pb-3">
          {/* Submitted header */}
          <div className="flex items-center gap-2 text-green-600 pb-2 border-b border-green-200">
            <CheckCircle className="w-4 h-4" />
            <span className="text-base font-medium">Answers submitted</span>
          </div>

          {/* Show questions with answers */}
          {questions.map((question, index) => {
            const answer = savedAnswers?.[question.id];
            return (
              <div key={question.id} className="space-y-2">
                <p className="text-base font-medium text-gray-700">
                  {index + 1}. {question.text}
                </p>
                <p className="text-base text-gray-600 pl-4 whitespace-pre-wrap">
                  {answer || <span className="text-gray-400 italic">No answer provided</span>}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-violet-200 bg-violet-50/30 max-w-md">
      <CardContent className="space-y-8 pt-4 pb-2">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-5">
            <label className="text-base font-medium text-gray-700">
              {index + 1}. {question.text}
            </label>
            {renderQuestionInput(question)}
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          onClick={handleSubmit}
          disabled={!hasAnyValidAnswer}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Answers
        </Button>
      </CardFooter>
    </Card>
  );
}
