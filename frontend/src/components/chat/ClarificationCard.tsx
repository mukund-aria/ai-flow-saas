import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { SelectionInput, TextWithFileInput, QuickSuggestionChips } from './clarification';
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

// Use stepper layout for 2+ questions
const shouldUseStepperLayout = (questions: Clarification[]): boolean => {
  return questions.length >= 2;
};

export function ClarificationCard({ questions, onSubmit, isLocked = false, savedAnswers }: ClarificationCardProps) {
  // Enhanced answer state - keyed by question ID
  const [answers, setAnswers] = useState<Record<string, ClarificationAnswer>>({});

  // Current step for stepper layout
  const [currentStep, setCurrentStep] = useState(0);

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

  // Check if a question is about steps/process (to show special suggestion)
  const isStepsQuestion = (questionId: string, questionText: string): boolean => {
    const idPatterns = ['step', 'process', 'workflow', 'procedure'];
    const textPatterns = ['step', 'process', 'walk me through', 'what happens'];
    const idLower = questionId.toLowerCase();
    const textLower = questionText.toLowerCase();
    return idPatterns.some(p => idLower.includes(p)) ||
           textPatterns.some(p => textLower.includes(p));
  };

  // Get suggestions with special "let AI decide" option appended for steps questions
  const getSuggestionsForQuestion = (question: Clarification): string[] => {
    const aiSuggestions = question.quickSuggestions || [];
    if (isStepsQuestion(question.id, question.text)) {
      return [...aiSuggestions, 'Let AI decide'];
    }
    return aiSuggestions;
  };

  // Render input based on question type
  const renderQuestionInput = (question: Clarification) => {
    const answer = answers[question.id] || { questionId: question.id };
    const inputType = question.inputType || 'text';
    const suggestions = getSuggestionsForQuestion(question);

    // Handler for quick suggestion clicks - appends comma-separated values
    const handleSuggestionClick = (suggestion: string) => {
      const currentValue = answer.textValue || '';
      if (currentValue.trim() === '') {
        // First selection - just set the value
        updateTextValue(question.id, suggestion);
      } else {
        // Append with comma separation (avoid duplicates)
        const existingValues = currentValue.split(',').map(v => v.trim().toLowerCase());
        if (!existingValues.includes(suggestion.toLowerCase())) {
          updateTextValue(question.id, `${currentValue}, ${suggestion}`);
        }
      }
    };

    switch (inputType) {
      case 'text':
        return (
          <>
            <AutoGrowTextarea
              value={answer.textValue || ''}
              onChange={(value) => updateTextValue(question.id, value)}
              placeholder={question.placeholder || 'Type your answer... (optional)'}
            />
            {suggestions.length > 0 && (
              <QuickSuggestionChips
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </>
        );

      case 'text_with_file':
        return (
          <>
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
            {suggestions.length > 0 && (
              <QuickSuggestionChips
                suggestions={suggestions}
                onSuggestionClick={handleSuggestionClick}
              />
            )}
          </>
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

  // Determine if stepper layout should be used
  const useStepper = shouldUseStepperLayout(questions);

  // Step indicators (dots)
  const renderStepIndicators = () => (
    <div className="flex items-center justify-center gap-1.5 mb-4">
      {questions.map((q, index) => {
        const isAnswered = hasValidAnswer(q, answers[q.id]);
        const isCurrent = index === currentStep;
        return (
          <button
            key={q.id}
            onClick={() => setCurrentStep(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              isCurrent
                ? 'w-6 bg-violet-500'
                : isAnswered
                ? 'bg-violet-400'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        );
      })}
    </div>
  );

  // Render stepper layout - one question at a time
  const renderStepperLayout = () => {
    const currentQuestion = questions[currentStep];
    const isLastStep = currentStep === questions.length - 1;
    const isFirstStep = currentStep === 0;

    return (
      <Card className="border-2 border-violet-200 bg-white max-w-md shadow-lg shadow-violet-100/30 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50/50 border-b border-violet-100 px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">A few quick questions</p>
              <p className="text-xs text-violet-600 font-medium">Question {currentStep + 1} of {questions.length}</p>
            </div>
          </div>
          {/* Step indicators */}
          {renderStepIndicators()}
        </div>

        <CardContent className="pt-4 pb-2">
          {/* Current question */}
          <div className="min-h-[120px]">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {currentQuestion.text}
            </label>
            {renderQuestionInput(currentQuestion)}
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex gap-2 border-t border-violet-100/50">
          {/* Back button - only show if not first step */}
          {!isFirstStep && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-3 text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          {/* Next / Submit button */}
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!hasAnyValidAnswer}
              className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Answers
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="flex-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Render stepper locked layout for read-only state
  const renderStepperLockedLayout = () => {
    const currentQuestion = questions[currentStep];
    const answer = savedAnswers?.[currentQuestion.id];
    const isLastStep = currentStep === questions.length - 1;
    const isFirstStep = currentStep === 0;

    return (
      <Card className="border-2 border-green-200 bg-white max-w-md shadow-lg shadow-green-100/30 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-b border-green-100 px-4 pt-3 pb-3">
          {/* Submitted header */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700">Answers submitted</span>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-1.5">
            {questions.map((q, index) => {
              const isCurrent = index === currentStep;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCurrent ? 'w-6 bg-green-500' : 'bg-green-300 hover:bg-green-400'
                  }`}
                  aria-label={`View question ${index + 1}`}
                />
              );
            })}
          </div>
        </div>

        <CardContent className="pt-4 pb-2">
          {/* Current question */}
          <div className="min-h-[80px]">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {currentQuestion.text}
            </p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap bg-green-50/50 rounded-lg p-2.5 border border-green-100">
              {answer || <span className="text-gray-400 italic">No answer provided</span>}
            </p>
          </div>
        </CardContent>

        <CardFooter className="pt-2 flex gap-2 border-t border-green-100/50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((prev) => prev - 1)}
            disabled={isFirstStep}
            className="px-3 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            disabled={isLastStep}
            className="flex-1 rounded-full"
          >
            {isLastStep ? 'Done' : 'Next'}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Locked state: show read-only answers
  if (isLocked) {
    // Stepper locked layout
    if (useStepper) {
      return renderStepperLockedLayout();
    }

    // Single question locked layout
    return (
      <Card className="border-2 border-green-200 bg-white max-w-md shadow-lg shadow-green-100/30 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-b border-green-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700">Answers submitted</span>
          </div>
        </div>

        <CardContent className="space-y-3 pt-4 pb-4">
          {/* Show questions with answers */}
          {questions.map((question, index) => {
            const answer = savedAnswers?.[question.id];
            return (
              <div key={question.id} className="space-y-1.5">
                <p className="text-sm font-medium text-gray-700">
                  {index + 1}. {question.text}
                </p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap bg-green-50/50 rounded-lg p-2.5 border border-green-100 ml-4">
                  {answer || <span className="text-gray-400 italic">No answer provided</span>}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Stepper layout for 2+ questions
  if (useStepper) {
    return renderStepperLayout();
  }

  // Default single question layout
  return (
    <Card className="border-2 border-violet-200 bg-white max-w-md shadow-lg shadow-violet-100/30 rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50/50 border-b border-violet-100 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <HelpCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Quick question</p>
            <p className="text-xs text-violet-600 font-medium">Help me design this right</p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-6 pt-4 pb-2">
        {questions.map((question, index) => (
          <div key={question.id}>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {index + 1}. {question.text}
            </label>
            {renderQuestionInput(question)}
          </div>
        ))}
      </CardContent>

      <CardFooter className="pt-2 border-t border-violet-100/50">
        <Button
          onClick={handleSubmit}
          disabled={!hasAnyValidAnswer}
          className="w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md"
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Answers
        </Button>
      </CardFooter>
    </Card>
  );
}
