import { TrendIndicator } from './shared/TrendIndicator';
import type { PulseData } from '@/lib/api';

interface Props {
  data: PulseData['periodComparison'];
}

export function PeriodComparison({ data }: Props) {
  const { current, previous } = data;

  const rows = [
    { label: 'Flows Started', current: current.started, previous: previous.started },
    { label: 'Flows Completed', current: current.completed, previous: previous.completed },
    { label: 'Avg Cycle Time', current: current.avgCycleTimeMs, previous: previous.avgCycleTimeMs, format: formatMs, invertColor: true },
    { label: 'SLA Breaches', current: current.slaBreaches, previous: previous.slaBreaches, invertColor: true },
    { label: 'Escalations', current: current.escalations, previous: previous.escalations, invertColor: true },
    { label: 'Reminders Sent', current: current.remindersSent, previous: previous.remindersSent, invertColor: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Comparison</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Current Period</h4>
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{row.label}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {row.format ? row.format(row.current) : row.current}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Previous Period</h4>
          <div className="space-y-3">
            {rows.map((row) => {
              const change = row.previous > 0
                ? Math.round(((row.current - row.previous) / row.previous) * 100)
                : row.current > 0 ? 100 : 0;
              return (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {row.format ? row.format(row.previous) : row.previous}
                  </span>
                  <TrendIndicator value={change} invertColor={row.invertColor} />
                </div>
              );
            })}
          </div>
        </div>
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
