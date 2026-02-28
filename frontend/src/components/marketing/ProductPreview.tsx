export function ProductPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        {/* Browser window mockup */}
        <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/60 overflow-hidden bg-white">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <div className="w-3 h-3 rounded-full bg-gray-300" />
            </div>
            <div className="flex-1 mx-4">
              <div className="max-w-md mx-auto h-7 rounded-md bg-gray-100 border border-gray-200 flex items-center px-3">
                <span className="text-xs text-gray-400">app.serviceflow.ai</span>
              </div>
            </div>
          </div>

          {/* Product UI mockup */}
          <div className="flex min-h-[400px]">
            {/* Sidebar */}
            <div className="hidden sm:flex w-48 border-r border-gray-100 bg-gray-50/50 flex-col p-4 gap-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 text-violet-700">
                <div className="w-4 h-4 rounded bg-violet-200" />
                <span className="text-sm font-medium">Templates</span>
              </div>
              {['Flows', 'Contacts', 'Reports', 'Settings'].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500"
                >
                  <div className="w-4 h-4 rounded bg-gray-200" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                </div>
                <div className="h-9 w-28 bg-violet-600 rounded-lg" />
              </div>

              {/* Workflow cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Client Onboarding', steps: 8, color: 'violet' },
                  { name: 'Invoice Approval', steps: 5, color: 'blue' },
                  { name: 'Employee Offboarding', steps: 6, color: 'emerald' },
                  { name: 'Document Review', steps: 4, color: 'amber' },
                ].map((card) => (
                  <div
                    key={card.name}
                    className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-${card.color}-100 flex items-center justify-center`}
                      >
                        <div className={`w-5 h-5 rounded bg-${card.color}-300`} />
                      </div>
                      <div className="h-5 w-12 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-4 w-36 bg-gray-200 rounded mb-1.5" />
                    <div className="h-3 w-24 bg-gray-100 rounded" />
                    <div className="mt-3 flex gap-1">
                      {Array.from({ length: Math.min(card.steps, 5) }).map((_, i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full bg-violet-200"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Build, run, and manage workflows from a single dashboard
        </p>
      </div>
    </section>
  );
}
