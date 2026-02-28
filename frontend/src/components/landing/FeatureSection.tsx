/**
 * Feature Section
 *
 * Three cards highlighting Build, Run, and Manage capabilities.
 */

import { Sparkles, Link, Shield } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI builds it for you',
    description:
      'Describe any process in plain English. AI creates the full workflow — steps, assignments, due dates, and logic — in seconds.',
    color: 'violet',
    bgClass: 'bg-violet-100',
    iconClass: 'text-violet-600',
  },
  {
    icon: Link,
    title: 'Anyone can participate',
    description:
      'External participants complete tasks via magic links or their own branded portal. No accounts, no training, no friction.',
    color: 'blue',
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Nothing falls through',
    description:
      'Real-time dashboards, automated reminders, AI-powered reviews, and smart escalations keep every workflow on track.',
    color: 'emerald',
    bgClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
  },
];

export function FeatureSection() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything happens in one place
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Build, run, and track every workflow — without chasing emails or spreadsheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-gray-200 p-8 hover:border-violet-200 hover:shadow-lg transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.bgClass} flex items-center justify-center mb-6`}
              >
                <feature.icon className={`w-6 h-6 ${feature.iconClass}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
