import { Users, Building2, Handshake, Cog } from 'lucide-react';

const useCases = [
  {
    icon: Users,
    title: 'Client Onboarding',
    description:
      'Collect documents, get approvals, and deliver welcome packages — all in one structured flow.',
    bgClass: 'bg-violet-100',
    iconClass: 'text-violet-600',
    borderHover: 'hover:border-violet-200',
  },
  {
    icon: Building2,
    title: 'Vendor Management',
    description:
      'Qualification questionnaires, compliance checks, and contract workflows with external vendors.',
    bgClass: 'bg-blue-100',
    iconClass: 'text-blue-600',
    borderHover: 'hover:border-blue-200',
  },
  {
    icon: Handshake,
    title: 'Partner Programs',
    description:
      'Coordinate onboarding, certifications, and co-marketing across partner organizations.',
    bgClass: 'bg-emerald-100',
    iconClass: 'text-emerald-600',
    borderHover: 'hover:border-emerald-200',
  },
  {
    icon: Cog,
    title: 'Internal Operations',
    description:
      'HR onboarding, cross-department approvals, and any multi-step process that involves real people.',
    bgClass: 'bg-amber-100',
    iconClass: 'text-amber-600',
    borderHover: 'hover:border-amber-200',
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for any process with people in the loop
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            ServiceFlow works wherever multiple people need to complete structured steps — inside or outside your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className={`bg-white rounded-2xl border border-gray-200 p-8 ${useCase.borderHover} hover:shadow-lg transition-all`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${useCase.bgClass} flex items-center justify-center mb-6`}
              >
                <useCase.icon className={`w-6 h-6 ${useCase.iconClass}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {useCase.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                {useCase.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
