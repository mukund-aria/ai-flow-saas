/**
 * Post-Generation Panel
 *
 * Replaces PreviewCTA after a sandbox flow has been saved.
 * Shows success message with "Test Flow" and "Edit Flow" CTAs.
 */

import { useState } from 'react';
import { CheckCircle2, Play, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePreviewStore } from '@/stores/previewStore';
import { TestFlowEmailModal } from './TestFlowEmailModal';
import type { Flow } from '@/types';

interface PostGenerationPanelProps {
  workflow: Flow;
  prompt: string;
  sessionId?: string;
  sandboxFlowId: string;
}

export function PostGenerationPanel({ workflow, prompt, sessionId, sandboxFlowId }: PostGenerationPanelProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setPreview, setSandboxFlowId } = usePreviewStore();
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEditFlow = () => {
    setPreview(workflow, prompt, sessionId);
    setSandboxFlowId(sandboxFlowId);

    if (isAuthenticated) {
      navigate('/templates/new?fromPreview=true');
    } else {
      navigate(`/login?returnTo=${encodeURIComponent('/templates/new?fromPreview=true')}`);
    }
  };

  const handleTestFlow = () => {
    setShowEmailModal(true);
  };

  const stepCount = workflow.steps?.length || 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-4 px-6 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {workflow.name || 'Your workflow'} is ready!
              </p>
              <p className="text-sm text-gray-500">
                {stepCount} step{stepCount !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestFlow}
              className="flex items-center gap-2 px-5 py-2.5 border border-violet-300 text-violet-700 hover:bg-violet-50 font-medium rounded-xl transition-colors"
            >
              <Play className="w-4 h-4" />
              Test Flow
            </button>
            <button
              onClick={handleEditFlow}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-lg shadow-violet-200/50 transition-all hover:shadow-xl hover:shadow-violet-200/70"
            >
              <Pencil className="w-4 h-4" />
              Edit Flow
            </button>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <TestFlowEmailModal
          sandboxFlowId={sandboxFlowId}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </>
  );
}
