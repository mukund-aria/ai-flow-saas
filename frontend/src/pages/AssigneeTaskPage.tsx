/**
 * Assignee Task Page
 *
 * Public page accessed via magic link.
 * External assignees complete tasks here without an account.
 */

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Clock, AlertCircle, FileText, ThumbsUp, ThumbsDown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface TaskContext {
  token: string;
  flowName: string;
  runName: string;
  stepName: string;
  stepDescription?: string;
  stepType: string;
  contactName: string;
  formFields?: Array<{ fieldId: string; label: string; type: string; required?: boolean }>;
  expired: boolean;
  completed: boolean;
  alreadyCompleted?: boolean;
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Task Not Available</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isCompleted || task?.alreadyCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Task Completed</h1>
          <p className="text-gray-500">
            Thank you! Your response has been recorded.
          </p>
          <p className="text-sm text-gray-400 mt-4">
            You can close this window.
          </p>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{task.flowName}</p>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{task.stepName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Hi {task.contactName}, please complete this task.
          </p>
        </div>
      </div>

      {/* Task Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {task.stepDescription && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-sm text-gray-600">{task.stepDescription}</p>
          </div>
        )}

        {/* Render based on step type */}
        {task.stepType === 'FORM' && task.formFields && task.formFields.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            {task.formFields.map(field => (
              <div key={field.fieldId}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    value={formData[field.fieldId] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, [field.fieldId]: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                )}
              </div>
            ))}
            <Button
              onClick={() => handleSubmit(formData)}
              disabled={isSubmitting}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit
            </Button>
          </div>
        ) : task.stepType === 'APPROVAL' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-6">Do you approve this request?</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => handleSubmit({ decision: 'APPROVED' })}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <ThumbsUp className="w-4 h-4" /> Approve
              </Button>
              <Button
                onClick={() => handleSubmit({ decision: 'REJECTED' })}
                disabled={isSubmitting}
                variant="outline"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <ThumbsDown className="w-4 h-4" /> Reject
              </Button>
            </div>
          </div>
        ) : task.stepType === 'ACKNOWLEDGEMENT' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <p className="text-gray-600 mb-6">
              Please acknowledge that you have received and reviewed this information.
            </p>
            <Button
              onClick={() => handleSubmit({ acknowledged: true })}
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              I Acknowledge
            </Button>
          </div>
        ) : task.stepType === 'FILE_REQUEST' ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Upload the requested file</p>
            <p className="text-xs text-gray-400 mb-6">(File upload coming soon - click Complete to skip for now)</p>
            <Button
              onClick={() => handleSubmit({ fileUploaded: false, note: 'File upload pending' })}
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Complete
            </Button>
          </div>
        ) : (
          /* Default: TODO / generic task */
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              Complete this task when you're ready.
            </p>
            <Button
              onClick={() => handleSubmit({ completed: true })}
              disabled={isSubmitting}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Mark as Complete
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}
