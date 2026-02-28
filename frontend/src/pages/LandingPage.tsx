/**
 * Landing Page
 *
 * Full marketing landing page with hero prompt, product preview,
 * how-it-works, features, CTA, and footer.
 */

import { useState, useCallback } from 'react';
import { HeroPrompt } from '@/components/landing/HeroPrompt';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { ProductPreview } from '@/components/marketing/ProductPreview';
import { CTASection } from '@/components/marketing/CTASection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { FlowPreviewInline } from '@/components/marketing/FlowPreviewInline';
import { usePreviewChat } from '@/hooks/usePreviewChat';
import type { Flow } from '@/types';

export function LandingPage() {
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const previewChat = usePreviewChat();

  const handlePromptSubmit = useCallback(
    (prompt: string) => {
      setSubmittedPrompt(prompt);
      previewChat.sendPrompt(prompt);
    },
    [previewChat]
  );

  const handleRetry = useCallback(() => {
    if (submittedPrompt) {
      previewChat.sendPrompt(submittedPrompt);
    }
  }, [submittedPrompt, previewChat]);

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-violet-50/50 to-white">
        <HeroPrompt
          onSubmit={handlePromptSubmit}
          showInlinePreview={false}
        />

        {/* Inline flow preview */}
        <div className="pb-16">
          <FlowPreviewInline
            status={previewChat.status}
            workflow={previewChat.workflow}
            error={previewChat.error}
            prompt={submittedPrompt}
            sessionId={previewChat.sessionId}
            onRetry={handleRetry}
          />
        </div>
      </section>

      {/* Product Preview */}
      <ProductPreview />

      {/* How It Works */}
      <HowItWorks />

      {/* Features */}
      <div id="features">
        <FeatureSection />
      </div>

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
