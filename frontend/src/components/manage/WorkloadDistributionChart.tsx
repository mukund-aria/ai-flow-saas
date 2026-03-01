import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PeopleAnalyticsData } from '@/lib/api';

interface Props {
  data: PeopleAnalyticsData['workloadChart'];
}

export function WorkloadDistributionChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => (b.completed + b.pending + b.overdue) - (a.completed + a.pending + a.overdue));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Workload Distribution</h3>
      <p className="text-sm text-gray-500 mb-4">Task load by person</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="completed" stackId="1" fill="#10b981" name="Completed" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" stackId="1" fill="#f59e0b" name="Pending" />
            <Bar dataKey="overdue" stackId="1" fill="#ef4444" name="Overdue" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
