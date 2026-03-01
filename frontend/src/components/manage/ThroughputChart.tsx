import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PulseData } from '@/lib/api';

interface Props {
  data: PulseData['throughputChart'];
}

export function ThroughputChart({ data }: Props) {
  const chartData = data.labels.map((label, i) => ({
    label,
    onTime: data.completedOnTime[i] || 0,
    late: data.completedLate[i] || 0,
  }));

  const totalCompleted = chartData.reduce((sum, d) => sum + d.onTime + d.late, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Throughput</h3>
          <p className="text-sm text-gray-500">{totalCompleted} flows completed in period</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              formatter={(value, name) => [Number(value), name === 'onTime' ? 'On Time' : 'Late']}
            />
            <Legend
              formatter={(value: string) => (value === 'onTime' ? 'On Time' : 'Late')}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="onTime"
              stackId="1"
              stroke="#10b981"
              fill="#d1fae5"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="late"
              stackId="1"
              stroke="#f59e0b"
              fill="#fef3c7"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
