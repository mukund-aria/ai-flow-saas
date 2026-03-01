import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { SparklineChart } from './shared/SparklineChart';
import { AccountDrillDown } from './AccountDrillDown';
import type { AccountAnalyticsData } from '@/lib/api';
import { useState } from 'react';

type SortKey = 'accountName' | 'activeFlows' | 'completedInPeriod' | 'avgCycleTimeMs' | 'onTimeRate' | 'avgResponsivenessMs';

interface Props {
  accounts: AccountAnalyticsData['accounts'];
  expandedAccountId: string | null;
  drillDownData: AccountAnalyticsData['drillDown'] | null;
  drillDownLoading: boolean;
  onExpand: (accountId: string) => void;
}

export function AccountPerformanceTable({ accounts, expandedAccountId, drillDownData, drillDownLoading, onExpand }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('completedInPeriod');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...accounts].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortHeader = ({ label, field, align }: { label: string; field: SortKey; align?: string }) => (
    <th
      onClick={() => handleSort(field)}
      className={`text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer hover:text-gray-700 whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {label} {sortKey === field ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              <th className="w-8 px-4 py-3" />
              <SortHeader label="Account" field="accountName" />
              <SortHeader label="Active" field="activeFlows" align="right" />
              <SortHeader label="Completed" field="completedInPeriod" align="right" />
              <SortHeader label="Avg Cycle" field="avgCycleTimeMs" align="right" />
              <SortHeader label="On-Time" field="onTimeRate" align="right" />
              <SortHeader label="Response Time" field="avgResponsivenessMs" align="right" />
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => {
              const isExpanded = expandedAccountId === a.accountId;
              const cycleRatio = a.orgAvgCycleTimeMs > 0 ? a.avgCycleTimeMs / a.orgAvgCycleTimeMs : 1;
              const cycleLabel = cycleRatio > 1.1 ? `${cycleRatio.toFixed(1)}x slower` : cycleRatio < 0.9 ? `${cycleRatio.toFixed(1)}x faster` : 'avg';

              return (
                <tbody key={a.accountId}>
                  <tr
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onExpand(a.accountId)}
                  >
                    <td className="px-4 py-3">
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900">{a.accountName}</span>
                        {a.domain && <span className="text-xs text-gray-400 ml-2">{a.domain}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.activeFlows}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{a.completedInPeriod}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-600">{formatMs(a.avgCycleTimeMs)}</span>
                        <span className={`text-xs ${cycleRatio > 1.1 ? 'text-red-500' : cycleRatio < 0.9 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {cycleLabel}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-medium ${a.onTimeRate >= 80 ? 'text-emerald-600' : a.onTimeRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {a.onTimeRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatMs(a.avgResponsivenessMs)}</td>
                    <td className="px-4 py-3">
                      <SparklineChart data={a.engagementTrend} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="bg-gray-50 px-6 py-4">
                        {drillDownLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                          </div>
                        ) : drillDownData ? (
                          <AccountDrillDown data={drillDownData} />
                        ) : (
                          <p className="text-sm text-gray-400 text-center py-4">No drill-down data available.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              );
            })}
          </tbody>
        </table>
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
