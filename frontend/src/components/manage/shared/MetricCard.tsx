import { SparklineChart } from './SparklineChart';
import { TrendIndicator } from './TrendIndicator';

interface Props {
  label: string;
  value: string;
  subtext: string;
  trend: number[];
  periodChange: number;
  invertColor?: boolean;
  icon: React.ReactNode;
}

export function MetricCard({ label, value, subtext, trend, periodChange, invertColor, icon }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {icon}
          <span>{label}</span>
        </div>
        <TrendIndicator value={periodChange} invertColor={invertColor} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <p className="text-xs text-gray-400 mt-1">{subtext}</p>
        </div>
        {trend.length > 0 && <SparklineChart data={trend} />}
      </div>
    </div>
  );
}
