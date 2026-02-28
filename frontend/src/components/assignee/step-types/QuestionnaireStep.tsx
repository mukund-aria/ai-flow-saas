/**
 * Questionnaire Step
 *
 * Renders questionnaire questions with various answer types and validation.
 */

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  questionId: string;
  question: string;
  answerType: 'SINGLE_SELECT' | 'MULTI_SELECT' | 'TEXT' | 'YES_NO';
  choices?: string[];
  required?: boolean;
}

interface QuestionnaireStepProps {
  questions: Question[];
  answers: Record<string, string | string[]>;
  onChange: (questionId: string, value: string | string[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

function isAnswered(answer: string | string[] | undefined): boolean {
  if (!answer) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  return answer.trim().length > 0;
}

export function QuestionnaireStep({ questions, answers, onChange, onSubmit, isSubmitting }: QuestionnaireStepProps) {
  const [showErrors, setShowErrors] = useState(false);

  const unansweredRequired = questions.filter(q => q.required && !isAnswered(answers[q.questionId]));
  const isValid = unansweredRequired.length === 0;

  const handleSubmit = () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  };

  const showQuestionError = (q: Question) =>
    showErrors && q.required && !isAnswered(answers[q.questionId]);

  return (
    <div className="space-y-5">
      {questions.map((q, qIndex) => (
        <div key={q.questionId} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {qIndex + 1}. {q.question}
            {q.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {q.answerType === 'YES_NO' ? (
            <div className="flex gap-3">
              {['Yes', 'No'].map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(q.questionId, option)}
                  className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    answers[q.questionId] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : showQuestionError(q)
                      ? 'border-red-200 text-gray-600 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : q.answerType === 'TEXT' ? (
            <textarea
              value={(answers[q.questionId] as string) || ''}
              onChange={(e) => onChange(q.questionId, e.target.value)}
              placeholder="Enter your answer..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                showQuestionError(q) ? 'border-red-300' : 'border-gray-200'
              }`}
            />
          ) : q.answerType === 'SINGLE_SELECT' ? (
            <div className="space-y-2">
              {(q.choices || []).map((choice, ci) => (
                <button
                  key={ci}
                  type="button"
                  onClick={() => onChange(q.questionId, choice)}
                  className={`w-full text-left py-2.5 px-4 rounded-lg border text-sm transition-colors ${
                    answers[q.questionId] === choice
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          ) : q.answerType === 'MULTI_SELECT' ? (
            <div className="space-y-2">
              {(q.choices || []).map((choice, ci) => {
                const selected = ((answers[q.questionId] as string[]) || []).includes(choice);
                return (
                  <button
                    key={ci}
                    type="button"
                    onClick={() => {
                      const current = (answers[q.questionId] as string[]) || [];
                      onChange(
                        q.questionId,
                        selected ? current.filter(c => c !== choice) : [...current, choice]
                      );
                    }}
                    className={`w-full text-left py-2.5 px-4 rounded-lg border text-sm transition-colors ${
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-block w-4 h-4 mr-2 rounded border ${selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} align-text-bottom`}>
                      {selected && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : null}

          {showQuestionError(q) && (
            <p className="text-xs text-red-500">This question is required</p>
          )}
        </div>
      ))}

      {showErrors && !isValid && (
        <p className="text-sm text-red-600 text-center">Please answer all required questions</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Submit Answers
      </Button>
    </div>
  );
}
