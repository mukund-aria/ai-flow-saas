import { Sparkles } from 'lucide-react';

// Example prompts for creating a new workflow
const NEW_TEMPLATE_PROMPTS = [
  'Client onboarding with KYC verification',
  'Invoice approval with 3 levels of sign-off',
  'Employee offboarding checklist',
  'Vendor due diligence process',
];

// Example prompts when editing an existing workflow
const EDITING_TEMPLATE_PROMPTS = [
  'Add an approval step before the final sign-off',
  'Create a branch based on the client\'s country',
  'Add email notifications when steps complete',
  'What improvements would you suggest?',
];

interface WelcomeMessageProps {
  onSelectExample?: (prompt: string) => void;
  hasWorkflow?: boolean;
  workflowName?: string;
}

export function WelcomeMessage({ onSelectExample, hasWorkflow, workflowName }: WelcomeMessageProps) {
  const greeting = hasWorkflow && workflowName
    ? `Hi! I can help you modify **${workflowName}**. What changes would you like to make?`
    : 'Hi! Describe the process you want to automate and I\'ll design a workflow for you.';

  const prompts = hasWorkflow ? EDITING_TEMPLATE_PROMPTS : NEW_TEMPLATE_PROMPTS;

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
            {greeting.split('**').map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        </div>

        {/* Subtle example chips */}
        {onSelectExample && (
          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((prompt, i) => (
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
