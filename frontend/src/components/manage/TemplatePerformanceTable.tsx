import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { SparklineChart } from './shared/SparklineChart';
import { TrendIndicator } from './shared/TrendIndicator';
import { TemplateDrillDown } from './TemplateDrillDown';
import type { FlowPerformanceData } from '@/lib/api';
import { useState } from 'react';

type SortKey = 'templateName' | 'runsInPeriod' | 'completionRate' | 'avgCycleTimeMs' | 'onTimeRate' | 'slaCompliance';

interface Props {
  templates: FlowPerformanceData['templates'];
  expandedTemplateId: string | null;
  drillDownData: FlowPerformanceData['drillDown'] | null;
  drillDownLoading: boolean;
  onExpand: (templateId: string) => void;
}

export function TemplatePerformanceTable({ templates, expandedTemplateId, drillDownData, drillDownLoading, onExpand }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('runsInPeriod');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...templates].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      onClick={() => handleSort(field)}
      className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer hover:text-gray-700 whitespace-nowrap"
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
              <SortHeader label="Template" field="templateName" />
              <SortHeader label="Runs" field="runsInPeriod" />
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Completed</th>
              <SortHeader label="Completion" field="completionRate" />
              <SortHeader label="Avg Cycle" field="avgCycleTimeMs" />
              <SortHeader label="On-Time" field="onTimeRate" />
              <SortHeader label="SLA" field="slaCompliance" />
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Bottleneck</th>
              <th className="text-xs font-medium text-gray-500 uppercase tracking-wide px-4 py-3">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const isExpanded = expandedTemplateId === t.templateId;
              const cycleChange = t.previousAvgCycleTimeMs > 0
                ? Math.round(((t.avgCycleTimeMs - t.previousAvgCycleTimeMs) / t.previousAvgCycleTimeMs) * 100)
                : 0;

              return (
                <tbody key={t.templateId}>
                  <tr
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onExpand(t.templateId)}
                  >
                    <td className="px-4 py-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{t.templateName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.runsInPeriod}</td>
                    <td className="px-4 py-3 text-gray-600">{t.completed}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.completionRate >= 80 ? 'bg-emerald-500' : t.completionRate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${t.completionRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          t.completionRate >= 80 ? 'text-emerald-600' : t.completionRate >= 60 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {t.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{formatMs(t.avgCycleTimeMs)}</span>
                        <TrendIndicator value={cycleChange} invertColor />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        t.onTimeRate >= 80 ? 'text-emerald-600' : t.onTimeRate >= 60 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {t.onTimeRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${
                        t.slaCompliance >= 90 ? 'text-emerald-600' : t.slaCompliance >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {t.slaCompliance}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {t.bottleneckStep ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium">
                          {t.bottleneckStep.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <SparklineChart data={t.completionRateTrend} />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={10} className="bg-gray-50 px-6 py-4">
                        {drillDownLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
                          </div>
                        ) : drillDownData ? (
                          <TemplateDrillDown data={drillDownData} />
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
