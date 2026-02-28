/**
 * Test Flow Email Modal
 *
 * Collects visitor's name + email before starting a sandbox test run.
 * On submit, calls the test endpoint, stores the sandboxFlowId in previewStore,
 * and navigates to the assignee task page.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';
import { testSandboxFlow } from '@/lib/api';
import { usePreviewStore } from '@/stores/previewStore';

interface TestFlowEmailModalProps {
  sandboxFlowId: string;
  onClose: () => void;
}

export function TestFlowEmailModal({ sandboxFlowId, onClose }: TestFlowEmailModalProps) {
  const navigate = useNavigate();
  const { setSandboxFlowId } = usePreviewStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await testSandboxFlow(sandboxFlowId, {
        name: name.trim(),
        email: email.trim(),
      });

      // Store sandboxFlowId for sign-up flow
      setSandboxFlowId(sandboxFlowId);

      // Navigate to the task page (same tab)
      navigate(`/task/${result.token}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to start test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Experience this flow as an assignee
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          We'll send you a task link — exactly what your assignees will receive.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="test-name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="test-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim() || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Test'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
