/**
 * Hero Prompt Component
 *
 * Large input with typewriter-effect animated placeholder
 * and quick prompt pill buttons below.
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const PLACEHOLDER_PROMPTS = [
  'Onboard new clients with document collection and approvals...',
  'Run a vendor qualification process with 5 review steps...',
  'Coordinate partner onboarding across legal, finance, and ops...',
  'Collect signed agreements and compliance docs from new hires...',
  'Manage a multi-step RFP response with stakeholder sign-offs...',
];

const INDUSTRIES = [
  { id: 'general', label: 'General' },
  { id: 'accounting', label: 'Accounting' },
  { id: 'legal', label: 'Legal' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'marketing', label: 'Digital Marketing' },
  { id: 'real-estate', label: 'Real Estate' },
  { id: 'healthcare', label: 'Healthcare' },
];

const INDUSTRY_PROMPTS: Record<string, string[]> = {
  general: [
    'Create a client onboarding workflow',
    'Build an approval process for invoices',
    'Design an employee offboarding flow',
  ],
  accounting: [
    'Create a tax return preparation workflow',
    'Build a monthly close process',
    'Design a client engagement letter flow',
  ],
  legal: [
    'Create a client intake and conflict check',
    'Build a document review and approval process',
    'Design a case management workflow',
  ],
  consulting: [
    'Create a new project kickoff workflow',
    'Build a client deliverable review process',
    'Design a proposal submission and approval flow',
  ],
  marketing: [
    'Create a campaign launch approval workflow',
    'Build a content review and publish process',
    'Design a client reporting and sign-off flow',
  ],
  'real-estate': [
    'Create a property listing approval workflow',
    'Build a buyer qualification process',
    'Design a closing document collection flow',
  ],
  healthcare: [
    'Create a patient intake workflow',
    'Build a referral management process',
    'Design a compliance audit checklist flow',
  ],
};

interface HeroPromptProps {
  onSubmit: (prompt: string) => void;
}

export function HeroPrompt({ onSubmit }: HeroPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [promptIndex, setPromptIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState('general');
  const inputRef = useRef<HTMLInputElement>(null);

  // Typewriter effect
  useEffect(() => {
    // Don't animate when user is typing
    if (prompt) return;

    const currentPrompt = PLACEHOLDER_PROMPTS[promptIndex];

    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (charIndex < currentPrompt.length) {
            setPlaceholder(currentPrompt.slice(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          } else {
            // Pause before deleting
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          // Deleting
          if (charIndex > 0) {
            setPlaceholder(currentPrompt.slice(0, charIndex - 1));
            setCharIndex(charIndex - 1);
          } else {
            setIsDeleting(false);
            setPromptIndex((promptIndex + 1) % PLACEHOLDER_PROMPTS.length);
          }
        }
      },
      isDeleting ? 30 : 60
    );

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, promptIndex, prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSubmit(prompt.trim());
  };

  const handleQuickPrompt = (text: string) => {
    setPrompt(text);
    inputRef.current?.focus();
  };

  return (
    <div className="pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          Client Workflow Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Run client workflows that{' '}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            actually get done
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
          Give clients, vendors, and partners a structured path to complete every step — with AI handling the busywork.
        </p>

        {/* Prompt Input */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder || 'Describe your workflow...'}
            className="w-full px-6 py-5 pr-16 rounded-2xl bg-white text-gray-900 text-lg placeholder-gray-400 shadow-xl shadow-gray-200/50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        {/* Industry Chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry.id}
              onClick={() => setActiveIndustry(industry.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeIndustry === industry.id
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700'
              }`}
            >
              {industry.label}
            </button>
          ))}
        </div>

        {/* Quick Prompts for active industry */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {(INDUSTRY_PROMPTS[activeIndustry] || INDUSTRY_PROMPTS.general).map((text, i) => (
            <button
              key={`${activeIndustry}-${i}`}
              onClick={() => handleQuickPrompt(text)}
              className="px-4 py-2 rounded-full bg-gray-50 border border-gray-200 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 text-sm text-gray-600 transition-colors"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Trust signal */}
        <p className="mt-8 text-sm text-gray-400">
          No credit card required. Free to start.
        </p>
      </div>
    </div>
  );
}
