import type { FlowPerformanceData } from '@/lib/api';

type StepTiming = NonNullable<FlowPerformanceData['drillDown']>['stepTimings'][number];

interface Props {
  steps: StepTiming[];
}

export function StepTimingWaterfall({ steps }: Props) {
  if (steps.length === 0) return null;

  const maxDuration = Math.max(...steps.map((s) => s.avgDurationMs), 1);
  const medianDuration = getMedian(steps.map((s) => s.avgDurationMs));

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Step Timing Waterfall</h4>
      <div className="space-y-2">
        {steps.map((step) => {
          const pct = (step.avgDurationMs / maxDuration) * 100;
          const color = step.slaBreachCount > 0
            ? 'bg-red-400'
            : step.avgDurationMs > medianDuration * 1.5
            ? 'bg-amber-400'
            : 'bg-emerald-400';

          return (
            <div key={step.stepIndex} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 truncate max-w-[60%]" title={step.stepName}>
                  {step.stepName}
                </span>
                <span className="text-xs text-gray-400">{formatMs(step.avgDurationMs)}</span>
              </div>
              <div className="h-5 bg-gray-50 rounded relative">
                <div
                  className={`h-full rounded ${color} transition-all`}
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-600 bg-white/90 px-1 rounded">
                    {step.count} executions, {step.slaBreachCount} breaches
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms <= 0) return '0';
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

function getMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
