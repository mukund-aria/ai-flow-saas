import { EngagementTimeline } from './EngagementTimeline';
import { OrgComparisonBars } from './OrgComparisonBars';
import { RelationshipSignals } from './RelationshipSignals';
import type { AccountAnalyticsData } from '@/lib/api';

interface Props {
  data: NonNullable<AccountAnalyticsData['drillDown']>;
}

export function AccountDrillDown({ data }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementTimeline data={data.engagementTimeline} />
        <OrgComparisonBars data={data.vsOrgAverage} />
      </div>

      {data.contactBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Responsiveness</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">Name</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-3 py-2">Pending</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-3 py-2">Completed</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-3 py-2">Avg Response</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-3 py-2">On-Time</th>
                </tr>
              </thead>
              <tbody>
                {data.contactBreakdown.map((c) => (
                  <tr key={c.contactId} className="border-b border-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">{c.contactName}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-600">{c.pendingTasks}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-600">{c.completedInPeriod}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-600">{formatMs(c.avgResponseTimeMs)}</td>
                    <td className="px-3 py-2 text-sm text-right">
                      <span className={`font-medium ${c.onTimeRate >= 80 ? 'text-emerald-600' : c.onTimeRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {c.onTimeRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.signals.length > 0 && <RelationshipSignals signals={data.signals} />}
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
