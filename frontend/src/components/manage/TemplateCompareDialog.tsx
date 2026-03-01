import { useState } from 'react';
import { X } from 'lucide-react';
import type { FlowPerformanceData } from '@/lib/api';

interface Props {
  templates: FlowPerformanceData['templates'];
  onClose: () => void;
}

export function TemplateCompareDialog({ templates, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareTemplates = templates.filter((t) => selected.includes(t.templateId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Compare Templates</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-64px)]">
          {selected.length < 2 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-3">Select 2-3 templates to compare:</p>
              <div className="flex flex-wrap gap-2">
                {templates.map((t) => (
                  <button
                    key={t.templateId}
                    onClick={() => toggle(t.templateId)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      selected.includes(t.templateId)
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t.templateName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected.length >= 2 && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {templates.map((t) => (
                  <button
                    key={t.templateId}
                    onClick={() => toggle(t.templateId)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                      selected.includes(t.templateId)
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {t.templateName}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Metric</th>
                      {compareTemplates.map((t) => (
                        <th key={t.templateId} className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                          {t.templateName}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <CompareRow label="Runs" values={compareTemplates.map((t) => String(t.runsInPeriod))} />
                    <CompareRow label="Completed" values={compareTemplates.map((t) => String(t.completed))} />
                    <CompareRow
                      label="Completion Rate"
                      values={compareTemplates.map((t) => `${t.completionRate}%`)}
                      best={(vals) => {
                        const nums = vals.map((v) => parseInt(v));
                        return nums.indexOf(Math.max(...nums));
                      }}
                    />
                    <CompareRow
                      label="Avg Cycle Time"
                      values={compareTemplates.map((t) => formatMs(t.avgCycleTimeMs))}
                      best={() => {
                        const nums = compareTemplates.map((t) => t.avgCycleTimeMs);
                        return nums.indexOf(Math.min(...nums));
                      }}
                    />
                    <CompareRow
                      label="On-Time Rate"
                      values={compareTemplates.map((t) => `${t.onTimeRate}%`)}
                      best={(vals) => {
                        const nums = vals.map((v) => parseInt(v));
                        return nums.indexOf(Math.max(...nums));
                      }}
                    />
                    <CompareRow
                      label="SLA Compliance"
                      values={compareTemplates.map((t) => `${t.slaCompliance}%`)}
                      best={(vals) => {
                        const nums = vals.map((v) => parseInt(v));
                        return nums.indexOf(Math.max(...nums));
                      }}
                    />
                    <CompareRow
                      label="Bottleneck Step"
                      values={compareTemplates.map((t) => t.bottleneckStep?.name || '--')}
                    />
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, values, best }: { label: string; values: string[]; best?: (vals: string[]) => number }) {
  const bestIdx = best ? best(values) : -1;

  return (
    <tr className="border-b border-gray-50">
      <td className="px-4 py-3 text-sm text-gray-600">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-4 py-3 text-sm text-right font-medium ${
            i === bestIdx ? 'text-emerald-600' : 'text-gray-900'
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function formatMs(ms: number): string {
  if (ms <= 0) return '0';
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}
