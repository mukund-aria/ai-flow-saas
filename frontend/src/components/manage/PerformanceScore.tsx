import { ScoreRing } from './shared/ScoreRing';
import type { PulseData } from '@/lib/api';

interface Props {
  data: PulseData['performanceScore'];
}

export function PerformanceScore({ data }: Props) {
  const { score, previousScore, trend, topContributor } = data;

  const trendLabel = trend === 'up'
    ? `Up from ${previousScore} last period`
    : trend === 'down'
    ? `Down from ${previousScore} last period`
    : `Stable at ${score}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-6">
        <ScoreRing score={score} size={96} />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
          <p className="text-sm text-gray-500 mt-1">
            {trendLabel}. {topContributor}
          </p>
          <div className="flex gap-4 mt-3">
            {Object.entries(data.factors).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xs text-gray-400 capitalize">{formatFactorName(key)}</div>
                <div className={`text-sm font-semibold ${value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                  {Math.round(value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatFactorName(key: string): string {
  const names: Record<string, string> = {
    onTimeRate: 'On-Time',
    slaCompliance: 'SLA',
    cycleTimeTrend: 'Speed',
    escalationRate: 'Escalation',
    completionRate: 'Completion',
  };
  return names[key] || key;
}
