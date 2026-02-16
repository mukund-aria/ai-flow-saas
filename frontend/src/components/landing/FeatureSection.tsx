/**
 * Feature Section
 *
 * Three cards highlighting Build, Run, and Manage capabilities.
 */

import { Sparkles, PlayCircle, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'Build with AI',
    description:
      'Describe your process in plain language. AI designs a complete workflow with steps, assignments, and logic.',
    color: 'violet',
    bgClass: 'bg-violet-100',
    iconClass: 'text-violet-600',
  },
  {
    icon: PlayCircle,
    title: 'Run with your team',
    description:
      'Execute workflows with your team and external participants. Magic links let anyone complete tasks — no account needed.',
    color: 'blue',
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
  },
  {
    icon: BarChart3,
    title: 'Manage & improve',
    description:
      'Track progress, identify bottlenecks, and optimize your processes with real-time reports and insights.',
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
            Everything you need to automate work
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From creation to execution to optimization — all in one platform.
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
