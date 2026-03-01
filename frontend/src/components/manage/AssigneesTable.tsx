import { useState } from 'react';
import type { PeopleAnalyticsData } from '@/lib/api';

type SortKey = 'name' | 'completedInPeriod' | 'avgResponseTimeMs' | 'onTimeRate' | 'remindersReceived' | 'efficiencyScore';

interface Props {
  assignees: PeopleAnalyticsData['assignees'];
}

export function AssigneesTable({ assignees }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('efficiencyScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'efficiencyScore' ? 'asc' : 'desc');
    }
  };

  const sorted = [...assignees].sort((a, b) => {
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
      className={`text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 cursor-pointer hover:text-gray-700 whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {label} {sortKey === field ? (sortDir === 'asc' ? '\u2191' : '\u2193') : ''}
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">External Assignees</h3>
        <p className="text-sm text-gray-500">Contact task performance and responsiveness</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <SortHeader label="Name" field="name" />
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Account</th>
              <SortHeader label="Tasks" field="completedInPeriod" align="right" />
              <SortHeader label="Avg Response" field="avgResponseTimeMs" align="right" />
              <SortHeader label="On-Time" field="onTimeRate" align="right" />
              <SortHeader label="Reminders" field="remindersReceived" align="right" />
              <SortHeader label="Score" field="efficiencyScore" align="right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.contactId} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <span className="font-medium text-gray-900">{a.name}</span>
                </td>
                <td className="px-5 py-3">
                  {a.accountName ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600">
                      {a.accountName}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">--</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right text-gray-600">{a.completedInPeriod}</td>
                <td className="px-5 py-3 text-right text-gray-600">{formatMs(a.avgResponseTimeMs)}</td>
                <td className="px-5 py-3 text-right">
                  <span className={`font-medium ${a.onTimeRate >= 80 ? 'text-emerald-600' : a.onTimeRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                    {a.onTimeRate}%
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={a.remindersReceived > 3 ? 'text-red-500 font-medium' : 'text-gray-600'}>
                    {a.remindersReceived}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`font-bold ${
                    a.efficiencyScore >= 80 ? 'text-emerald-600' : a.efficiencyScore >= 60 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {a.efficiencyScore}
                  </span>
                </td>
              </tr>
            ))}
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
