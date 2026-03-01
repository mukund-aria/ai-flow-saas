import type { FlowPerformanceData } from '@/lib/api';

interface Props {
  data: NonNullable<FlowPerformanceData['drillDown']>['cycleTimeDistribution'];
}

export function CycleTimeDistribution({ data }: Props) {
  const { min, p25, median, p75, max } = data;
  const range = max - min || 1;

  const pctLeft = ((p25 - min) / range) * 100;
  const pctBox = ((p75 - p25) / range) * 100;
  const pctMedian = ((median - min) / range) * 100;

  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Cycle Time Distribution</h4>
      <div className="flex items-center gap-4 mb-4">
        <Stat label="Min" value={formatMs(min)} />
        <Stat label="P25" value={formatMs(p25)} />
        <Stat label="Median" value={formatMs(median)} highlight />
        <Stat label="P75" value={formatMs(p75)} />
        <Stat label="Max" value={formatMs(max)} />
      </div>
      <div className="relative h-8 bg-gray-50 rounded">
        {/* Whisker line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300" />
        {/* Box (P25-P75) */}
        <div
          className="absolute top-1 bottom-1 bg-violet-100 border border-violet-300 rounded"
          style={{ left: `${pctLeft}%`, width: `${Math.max(pctBox, 2)}%` }}
        />
        {/* Median line */}
        <div
          className="absolute top-0.5 bottom-0.5 w-0.5 bg-violet-600"
          style={{ left: `${pctMedian}%` }}
        />
        {/* Min marker */}
        <div className="absolute top-2 bottom-2 w-px bg-gray-400" style={{ left: '0%' }} />
        {/* Max marker */}
        <div className="absolute top-2 bottom-2 w-px bg-gray-400" style={{ left: '100%' }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-400">{formatMs(min)}</span>
        <span className="text-[10px] text-gray-400">{formatMs(max)}</span>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-400 uppercase">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-violet-600' : 'text-gray-700'}`}>{value}</div>
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
