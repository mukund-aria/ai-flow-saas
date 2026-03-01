import type { AccountAnalyticsData } from '@/lib/api';

interface Props {
  data: NonNullable<AccountAnalyticsData['drillDown']>['vsOrgAverage'];
}

export function OrgComparisonBars({ data }: Props) {
  const metrics = [
    {
      label: 'Cycle Time',
      account: data.cycleTime.account,
      org: data.cycleTime.org,
      format: formatMs,
      lowerIsBetter: true,
    },
    {
      label: 'On-Time Rate',
      account: data.onTimeRate.account,
      org: data.onTimeRate.org,
      format: (v: number) => `${v}%`,
      lowerIsBetter: false,
    },
    {
      label: 'SLA Compliance',
      account: data.slaCompliance.account,
      org: data.slaCompliance.org,
      format: (v: number) => `${v}%`,
      lowerIsBetter: false,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">vs Organization Average</h4>
      <div className="space-y-4">
        {metrics.map((m) => {
          const max = Math.max(m.account, m.org, 1);
          const accountPct = (m.account / max) * 100;
          const orgPct = (m.org / max) * 100;
          const isAccountBetter = m.lowerIsBetter ? m.account < m.org : m.account > m.org;

          return (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">{m.label}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-14">Account</span>
                  <div className="flex-1 h-4 bg-gray-50 rounded">
                    <div
                      className={`h-full rounded ${isAccountBetter ? 'bg-emerald-400' : 'bg-red-300'}`}
                      style={{ width: `${accountPct}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-14 text-right ${isAccountBetter ? 'text-emerald-600' : 'text-red-500'}`}>
                    {m.format(m.account)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400 w-14">Org avg</span>
                  <div className="flex-1 h-4 bg-gray-50 rounded">
                    <div className="h-full rounded bg-gray-300" style={{ width: `${orgPct}%` }} />
                  </div>
                  <span className="text-xs font-medium w-14 text-right text-gray-500">
                    {m.format(m.org)}
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
