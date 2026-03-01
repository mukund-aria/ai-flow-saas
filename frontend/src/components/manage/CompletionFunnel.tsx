import type { FlowPerformanceData } from '@/lib/api';

type FunnelStep = NonNullable<FlowPerformanceData['drillDown']>['completionFunnel'][number];

interface Props {
  steps: FunnelStep[];
}

export function CompletionFunnel({ steps }: Props) {
  if (steps.length === 0) return null;

  const maxCount = Math.max(...steps.map((s) => s.reachedCount), 1);

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Completion Funnel</h4>
      <div className="space-y-2">
        {steps.map((step, i) => {
          const reachedPct = (step.reachedCount / maxCount) * 100;
          const completedPct = (step.completedCount / maxCount) * 100;
          const dropOff = i > 0
            ? steps[i - 1].completedCount - step.reachedCount
            : 0;

          return (
            <div key={step.stepIndex}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 truncate max-w-[50%]">{step.stepName}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{step.reachedCount} reached</span>
                  <span className="text-emerald-600 font-medium">{step.completedCount} done</span>
                  {dropOff > 0 && (
                    <span className="text-red-400">-{dropOff}</span>
                  )}
                </div>
              </div>
              <div className="h-4 bg-gray-50 rounded relative">
                <div
                  className="h-full bg-violet-100 rounded absolute"
                  style={{ width: `${reachedPct}%` }}
                />
                <div
                  className="h-full bg-emerald-400 rounded absolute"
                  style={{ width: `${completedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
