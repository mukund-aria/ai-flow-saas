import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import type { AccountAnalyticsData } from '@/lib/api';

type Signal = NonNullable<AccountAnalyticsData['drillDown']>['signals'][number];

interface Props {
  signals: Signal[];
}

export function RelationshipSignals({ signals }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Relationship Signals</h4>
      <div className="space-y-2">
        {signals.map((signal, i) => {
          const config = severityConfig[signal.severity];
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg ${config.bg}`}
            >
              <config.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
              <p className={`text-sm ${config.textColor}`}>{signal.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const severityConfig = {
  positive: {
    bg: 'bg-emerald-50',
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-700',
  },
  warning: {
    bg: 'bg-amber-50',
    icon: TrendingDown,
    iconColor: 'text-amber-500',
    textColor: 'text-amber-700',
  },
  info: {
    bg: 'bg-blue-50',
    icon: Info,
    iconColor: 'text-blue-500',
    textColor: 'text-blue-700',
  },
};
