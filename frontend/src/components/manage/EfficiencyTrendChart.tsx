import { Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import type { PulseData } from '@/lib/api';

interface Props {
  data: PulseData['efficiencyChart'];
}

export function EfficiencyTrendChart({ data }: Props) {
  const chartData = data.labels.map((label, i) => ({
    label,
    avg: data.avgCycleTimeMs[i] || 0,
    p25: data.p25[i] || 0,
    p75: data.p75[i] || 0,
    band: [(data.p25[i] || 0), (data.p75[i] || 0)] as [number, number],
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Efficiency Trend</h3>
        <p className="text-sm text-gray-500">Average cycle time with P25-P75 range</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisMs}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              formatter={(value, name) => {
                if (name === 'band') return null;
                return [formatAxisMs(Number(value)), name === 'avg' ? 'Avg Cycle Time' : name];
              }}
            />
            <Area
              type="monotone"
              dataKey="band"
              fill="#ede9fe"
              stroke="none"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#8b5cf6' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatAxisMs(ms: number): string {
  if (ms <= 0) return '0';
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${hours.toFixed(0)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}
