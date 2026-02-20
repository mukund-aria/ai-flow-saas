/**
 * Assignee Task Page
 *
 * Public page accessed via magic link.
 * External assignees complete tasks here without an account.
 * Supports: Form, Questionnaire, Approval, Acknowledgement, File Request, E-Sign, To-Do
 * Features: "Action completed!" flow with "Next action" button, milestone indicators
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Upload,
  ChevronLeft,
  ChevronRight,
  List,
  FileText,
  ClipboardCheck,
  FileCheck,
  CheckSquare,
  HandMetal,
  Layers,
  PenTool,
  ListChecks,
  HelpCircle,
  X,
  File as FileIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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
  };
  outcomes?: Array<{ outcomeId: string; label: string }>;
  options?: Array<{ optionId: string; label: string }>;
  expired: boolean;
  completed: boolean;
  alreadyCompleted?: boolean;
}

function getStepTypeIcon(stepType: string) {
  const iconClass = 'w-6 h-6 text-gray-500';
  switch (stepType) {
    case 'FORM':
      return <FileText className={iconClass} />;
    case 'QUESTIONNAIRE':
      return <ListChecks className={iconClass} />;
    case 'APPROVAL':
      return <ClipboardCheck className={iconClass} />;
    case 'FILE_REQUEST':
      return <FileCheck className={iconClass} />;
    case 'TODO':
      return <CheckSquare className={iconClass} />;
    case 'ACKNOWLEDGEMENT':
      return <HandMetal className={iconClass} />;
    case 'ESIGN':
      return <PenTool className={iconClass} />;
    case 'DECISION':
      return <HelpCircle className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}

function getStepTypeLabel(stepType: string): string {
  switch (stepType) {
    case 'FORM': return 'Form';
    case 'QUESTIONNAIRE': return 'Questionnaire';
    case 'APPROVAL': return 'Approval';
    case 'FILE_REQUEST': return 'File Request';
    case 'TODO': return 'To-Do';
    case 'ACKNOWLEDGEMENT': return 'Acknowledgement';
    case 'ESIGN': return 'E-Sign';
    case 'DECISION': return 'Decision';
    default: return 'Task';
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function AssigneeTaskPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionState, setCompletionState] = useState<{
    completed: boolean;
    nextTaskToken?: string | null;
  }>({ completed: false });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setCompletionState({
          completed: true,
          nextTaskToken: data.data?.nextTaskToken,
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
      // Navigate to the next task
      navigate(`/task/${completionState.nextTaskToken}`);
      // Reset state for the new task
      setCompletionState({ completed: false });
      setFormData({});
      setQuestionnaireAnswers({});
      setUploadedFiles([]);
      setError('');
      setIsLoading(true);
      setTask(null);
    }
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
        <footer className="py-6 text-center">
          <span className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-500">AI Flow</span></span>
        </footer>
      </div>
    );
  }

  // Action Completed - with "Next action" button
  if (completionState.completed) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Action Completed!</h1>
            <p className="text-gray-500 mb-6">
              Thank you, {task?.contactName}! Your response has been recorded.
            </p>

            {completionState.nextTaskToken ? (
              <Button
                onClick={handleNextAction}
                className="bg-blue-600 hover:bg-blue-700 h-11 text-base px-8"
              >
                Next Action
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <p className="text-sm text-gray-400">
                You can close this window.
              </p>
            )}
          </div>
        </div>
        <footer className="py-6 text-center">
          <span className="text-xs text-gray-400">Powered by <span className="font-semibold text-gray-500">AI Flow</span></span>
        </footer>
      </div>
    );
  }

  if (!task) return null;

  const stepIndex = task.stepIndex ?? 1;
  const totalSteps = task.totalSteps ?? 1;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{task.runName}</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{task.flowName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
              {getInitials(task.contactName)}
            </div>
          </div>
        </div>
      </header>

      {/* Milestone + Step Navigator */}
      <div className="py-4">
        {task.milestoneName && (
          <div className="text-center mb-2">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-violet-700 bg-violet-50 rounded-full">
              {task.milestoneName}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center gap-4">
          <button className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Step {stepIndex}/{totalSteps}</span>
            <List className="w-4 h-4 text-gray-400" />
          </div>
          <button className="p-1.5 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {/* Step progress dots */}
        {totalSteps > 1 && totalSteps <= 20 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 < stepIndex
                    ? 'bg-green-400'
                    : i + 1 === stepIndex
                    ? 'bg-blue-500 ring-2 ring-blue-200'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-8">
        <div className="max-w-xl mx-auto">
          {/* Task Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Step Info Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                  {getStepTypeIcon(task.stepType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-900">{task.stepName}</h2>
                  <p className="text-sm text-gray-500">{getStepTypeLabel(task.stepType)}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {task.stepDescription && (
              <div className="px-6 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{task.stepDescription}</p>
              </div>
            )}

            {/* Step Type Content */}
            <div className="px-6 pb-6">
              {/* ==================== FORM ==================== */}
              {task.stepType === 'FORM' && task.formFields && task.formFields.length > 0 ? (
                <div className="space-y-4">
                  {task.formFields.map(field => (
                    <div key={field.fieldId}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'TEXT_MULTI_LINE' || field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.fieldId] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      ) : field.type === 'SINGLE_SELECT' || field.type === 'DROPDOWN' ? (
                        <select
                          value={formData[field.fieldId] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="">Select...</option>
                          {(field.options || []).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : field.type === 'NUMBER' || field.type === 'CURRENCY' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                          value={formData[field.fieldId] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => handleSubmit(formData)}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit
                  </Button>
                </div>

              /* ==================== QUESTIONNAIRE ==================== */
              ) : task.stepType === 'QUESTIONNAIRE' && task.questionnaire?.questions?.length ? (
                <div className="space-y-5">
                  {task.questionnaire.questions.map((q, qIndex) => (
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
                              onClick={() => setQuestionnaireAnswers(prev => ({ ...prev, [q.questionId]: option }))}
                              className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-colors ${
                                questionnaireAnswers[q.questionId] === option
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : q.answerType === 'TEXT' ? (
                        <textarea
                          value={(questionnaireAnswers[q.questionId] as string) || ''}
                          onChange={(e) => setQuestionnaireAnswers(prev => ({ ...prev, [q.questionId]: e.target.value }))}
                          placeholder="Enter your answer..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : q.answerType === 'SINGLE_SELECT' ? (
                        <div className="space-y-2">
                          {(q.choices || []).map((choice, ci) => (
                            <button
                              key={ci}
                              type="button"
                              onClick={() => setQuestionnaireAnswers(prev => ({ ...prev, [q.questionId]: choice }))}
                              className={`w-full text-left py-2.5 px-4 rounded-lg border text-sm transition-colors ${
                                questionnaireAnswers[q.questionId] === choice
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
                            const selected = ((questionnaireAnswers[q.questionId] as string[]) || []).includes(choice);
                            return (
                              <button
                                key={ci}
                                type="button"
                                onClick={() => {
                                  setQuestionnaireAnswers(prev => {
                                    const current = (prev[q.questionId] as string[]) || [];
                                    return {
                                      ...prev,
                                      [q.questionId]: selected
                                        ? current.filter(c => c !== choice)
                                        : [...current, choice],
                                    };
                                  });
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
                    </div>
                  ))}
                  <Button
                    onClick={() => handleSubmit({ answers: questionnaireAnswers })}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Submit Answers
                  </Button>
                </div>

              /* ==================== APPROVAL ==================== */
              ) : task.stepType === 'APPROVAL' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">Please review and provide your decision.</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleSubmit({ decision: 'APPROVED' })}
                      disabled={isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-base gap-2"
                    >
                      <ThumbsUp className="w-4 h-4" /> Approve
                    </Button>
                    <Button
                      onClick={() => handleSubmit({ decision: 'REJECTED' })}
                      disabled={isSubmitting}
                      variant="outline"
                      className="flex-1 h-11 text-base gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <ThumbsDown className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>

              /* ==================== DECISION ==================== */
              ) : task.stepType === 'DECISION' && task.outcomes?.length ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 text-center mb-4">Select your decision:</p>
                  <div className="space-y-2">
                    {task.outcomes.map((outcome, i) => (
                      <Button
                        key={outcome.outcomeId}
                        onClick={() => handleSubmit({ decision: outcome.label, outcomeId: outcome.outcomeId })}
                        disabled={isSubmitting}
                        variant={i === 0 ? 'default' : 'outline'}
                        className={`w-full h-11 text-base ${
                          i === 0 ? 'bg-violet-600 hover:bg-violet-700' : ''
                        }`}
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {outcome.label}
                      </Button>
                    ))}
                  </div>
                </div>

              /* ==================== ACKNOWLEDGEMENT ==================== */
              ) : task.stepType === 'ACKNOWLEDGEMENT' ? (
                <div>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Please confirm you have reviewed this information.
                  </p>
                  <Button
                    onClick={() => handleSubmit({ acknowledged: true })}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    I Acknowledge
                  </Button>
                </div>

              /* ==================== FILE REQUEST ==================== */
              ) : task.stepType === 'FILE_REQUEST' ? (
                <div>
                  {task.fileRequest?.instructions && (
                    <p className="text-sm text-gray-600 mb-4">{task.fileRequest.instructions}</p>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }}
                  />
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 text-center">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      Max {task.fileRequest?.maxFiles || 5} files
                    </p>
                  </div>
                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                          <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
                          <button
                            onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                            className="p-0.5 text-gray-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    onClick={() => handleSubmit({
                      filesUploaded: uploadedFiles.length,
                      fileNames: uploadedFiles.map(f => f.name),
                    })}
                    disabled={isSubmitting || uploadedFiles.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    Upload {uploadedFiles.length > 0 ? `(${uploadedFiles.length} file${uploadedFiles.length > 1 ? 's' : ''})` : ''}
                  </Button>
                </div>

              /* ==================== E-SIGN ==================== */
              ) : task.stepType === 'ESIGN' ? (
                <div className="space-y-4">
                  {task.esign?.documentName && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="w-8 h-8 text-violet-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{task.esign.documentName}</p>
                        {task.esign.documentDescription && (
                          <p className="text-xs text-gray-500 mt-0.5">{task.esign.documentDescription}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type your full name to sign
                    </label>
                    <input
                      type="text"
                      value={formData['signature'] || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, signature: e.target.value }))}
                      placeholder="Full legal name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    {formData['signature'] && (
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-lg font-serif italic text-gray-800">{formData['signature']}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSubmit({
                      signed: true,
                      signature: formData['signature'],
                      signedAt: new Date().toISOString(),
                    })}
                    disabled={isSubmitting || !formData['signature']?.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-700 h-11 text-base gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    <PenTool className="w-4 h-4" />
                    Sign Document
                  </Button>
                </div>

              ) : (
                /* ==================== TODO / GENERIC ==================== */
                <Button
                  onClick={() => handleSubmit({ completed: true })}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Complete
                </Button>
              )}
            </div>

            {/* Progress Section */}
            <div className="border-t border-gray-100">
              <div className="px-6 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</span>
                <span className="text-xs font-medium text-gray-500">{stepIndex - 1}/{totalSteps}</span>
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
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center mt-4">{error}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-100 bg-white">
        <span className="text-xs text-gray-400">
          Powered by{' '}
          <span className="font-semibold text-gray-500">AI Flow</span>
        </span>
      </footer>
    </div>
  );
}
