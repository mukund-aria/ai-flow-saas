import { MessageSquare, Sparkles, Play } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Describe',
    description: 'Tell AI what process you want to automate',
    icon: MessageSquare,
  },
  {
    number: 2,
    title: 'Build',
    description: 'AI creates a complete workflow with steps, roles, and logic',
    icon: Sparkles,
  },
  {
    number: 3,
    title: 'Run',
    description: 'Execute with your team — assignees get magic links, no account needed',
    icon: Play,
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Go from idea to running workflow in three simple steps.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-violet-200 via-violet-300 to-violet-200" />

          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              {/* Numbered circle */}
              <div className="relative z-10 mx-auto mb-6 w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-violet-200">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                <step.icon className="w-7 h-7 text-violet-600" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
