import { Sparkles } from 'lucide-react';

// Subtle example prompts
const EXAMPLE_PROMPTS = [
  "Help me create a client onboarding workflow",
  "I need an invoice approval process",
  "Build me an employee offboarding flow",
];

interface WelcomeMessageProps {
  onSelectExample?: (prompt: string) => void;
}

export function WelcomeMessage({ onSelectExample }: WelcomeMessageProps) {
  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
        <Sparkles className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[85%]">
        {/* Greeting bubble */}
        <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md">
          <p className="text-base leading-relaxed">
            Hi! Tell me about the process you'd like to automate and I'll design a workflow for you.
          </p>
        </div>

        {/* Subtle example chips */}
        {onSelectExample && (
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onSelectExample(prompt)}
                className="text-sm text-gray-500 hover:text-violet-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
