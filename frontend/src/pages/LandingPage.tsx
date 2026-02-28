/**
 * Landing Page
 *
 * Full marketing landing page with hero prompt, product preview,
 * how-it-works, features, CTA, and footer.
 */

import { useCallback } from 'react';
import { HeroPrompt } from '@/components/landing/HeroPrompt';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { ProductPreview } from '@/components/marketing/ProductPreview';
import { CTASection } from '@/components/marketing/CTASection';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export function LandingPage() {
  const handlePromptSubmit = useCallback((prompt: string) => {
    const url = `/preview?prompt=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-violet-50/50 to-white pb-16">
        <HeroPrompt onSubmit={handlePromptSubmit} />
      </section>

      {/* Product Preview */}
      <ProductPreview />

      {/* How It Works */}
      <HowItWorks />

      {/* Use Cases */}
      <UseCasesSection />

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
