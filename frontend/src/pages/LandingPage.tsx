/**
 * Landing Page
 *
 * Public landing page with hero prompt input, feature cards,
 * and trust signals. Entry point for the acquisition funnel.
 */

import { useNavigate } from 'react-router-dom';
import { HeroPrompt } from '@/components/landing/HeroPrompt';
import { FeatureSection } from '@/components/landing/FeatureSection';

export function LandingPage() {
  const navigate = useNavigate();

  const handlePromptSubmit = (prompt: string) => {
    navigate('/preview', { state: { prompt } });
  };

  return (
    <div>
      {/* Hero Section with Prompt */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        <HeroPrompt onSubmit={handlePromptSubmit} />
      </div>

      {/* Feature Cards: Build / Run / Manage */}
      <FeatureSection />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400">
          AI Flow — Workflow automation powered by AI
        </div>
      </footer>
    </div>
  );
}
