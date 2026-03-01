import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { AccountAnalyticsData } from '@/lib/api';

interface Props {
  data: NonNullable<AccountAnalyticsData['drillDown']>['engagementTimeline'];
}

export function EngagementTimeline({ data }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Engagement Timeline</h4>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }} />
            <Legend iconType="circle" iconSize={8} />
            <Line
              type="monotone"
              dataKey="started"
              stroke="#8b5cf6"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 2 }}
              name="Started"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
