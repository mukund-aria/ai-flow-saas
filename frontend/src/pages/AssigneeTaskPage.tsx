/**
 * Assignee Task Page
 *
 * Public page accessed via magic link.
 * External assignees complete tasks here without an account.
 * Design inspired by Moxo's clean task completion experience.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  contactName: string;
  formFields?: Array<{ fieldId: string; label: string; type: string; required?: boolean }>;
  expired: boolean;
  completed: boolean;
  alreadyCompleted?: boolean;
}

function getStepTypeIcon(stepType: string) {
  const iconClass = 'w-6 h-6 text-gray-500';
  switch (stepType) {
    case 'FORM':
    case 'QUESTIONNAIRE':
      return <FileText className={iconClass} />;
    case 'APPROVAL':
      return <ClipboardCheck className={iconClass} />;
    case 'FILE_REQUEST':
      return <FileCheck className={iconClass} />;
    case 'TODO':
      return <CheckSquare className={iconClass} />;
    case 'ACKNOWLEDGEMENT':
      return <HandMetal className={iconClass} />;
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
    case 'DECISION': return 'Decision';
    default: return 'Task';
  }
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function AssigneeTaskPage() {
  const { token } = useParams<{ token: string }>();
  const [task, setTask] = useState<TaskContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE}/public/task/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTask(data.data);
          if (data.data.alreadyCompleted) setIsCompleted(true);
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
        setIsCompleted(true);
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

  // Completed
  if (isCompleted || task?.alreadyCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Completed</h1>
            <p className="text-gray-500">
              Thank you, {task?.contactName}! Your response has been recorded.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              You can close this window.
            </p>
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

      {/* Step Navigator */}
      <div className="py-4">
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
              {task.stepType === 'FORM' && task.formFields && task.formFields.length > 0 ? (
                <div className="space-y-4">
                  {task.formFields.map(field => (
                    <div key={field.fieldId}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.fieldId] || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type || 'text'}
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
              ) : task.stepType === 'FILE_REQUEST' ? (
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 mb-4">
                    <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">File upload coming soon</p>
                  </div>
                  <Button
                    onClick={() => handleSubmit({ fileUploaded: false, note: 'File upload pending' })}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                  >
                    Complete
                  </Button>
                </div>
              ) : (
                /* Default: TODO / generic */
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
