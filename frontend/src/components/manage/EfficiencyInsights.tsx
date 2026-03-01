import { Award, AlertTriangle } from 'lucide-react';
import type { PeopleAnalyticsData } from '@/lib/api';

interface Props {
  insights: PeopleAnalyticsData['insights'];
}

export function EfficiencyInsights({ insights }: Props) {
  const { fastestResponders, improvementOpportunities } = insights;

  if (fastestResponders.length === 0 && improvementOpportunities.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fastestResponders.length > 0 && (
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-semibold text-emerald-800">Fastest Responders</h4>
          </div>
          <div className="space-y-2">
            {fastestResponders.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-emerald-700">{r.name}</span>
                <span className="text-sm font-medium text-emerald-800">{formatMs(r.avgResponseTimeMs)} avg</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {improvementOpportunities.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-semibold text-amber-800">Improvement Opportunities</h4>
          </div>
          <div className="space-y-2">
            {improvementOpportunities.map((o, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-amber-700">{o.name}</span>
                  <span className="text-xs text-amber-500 ml-2">({o.reason})</span>
                </div>
                <span className="text-sm font-medium text-amber-800">Score: {o.efficiencyScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
