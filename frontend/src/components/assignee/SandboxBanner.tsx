/**
 * Sandbox Banner
 *
 * Sticky top banner shown in the assignee task page when the task
 * belongs to a sandbox flow. Encourages the visitor to sign up.
 */

import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SandboxBanner() {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate(`/login?returnTo=${encodeURIComponent('/templates/new?fromPreview=true')}`);
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>This is a preview. Sign up to customize and manage this flow.</span>
        </div>
        <button
          onClick={handleSignUp}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Sign Up Free
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
