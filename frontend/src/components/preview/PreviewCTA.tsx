/**
 * Preview CTA
 *
 * "Edit This Flow" conversion button that appears when the
 * preview workflow is fully built.
 */

import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePreviewStore } from '@/stores/previewStore';
import type { Flow } from '@/types';

interface PreviewCTAProps {
  workflow: Flow;
  prompt: string;
  sessionId?: string;
}

export function PreviewCTA({ workflow, prompt, sessionId }: PreviewCTAProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setPreview } = usePreviewStore();

  const handleEditFlow = () => {
    // Store workflow for later retrieval
    setPreview(workflow, prompt, sessionId);

    if (isAuthenticated) {
      // Go directly to flow builder
      navigate('/flows/new?fromPreview=true');
    } else {
      // Go to login with returnTo
      navigate(`/login?returnTo=${encodeURIComponent('/flows/new?fromPreview=true')}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-4 px-6 z-50">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {workflow.name || 'Your workflow'} is ready!
            </p>
            <p className="text-sm text-gray-500">
              {workflow.steps?.length || 0} steps created
            </p>
          </div>
        </div>

        <button
          onClick={handleEditFlow}
          className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-lg shadow-violet-200/50 transition-all hover:shadow-xl hover:shadow-violet-200/70"
        >
          Edit This Flow
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
