/**
 * Reports Page
 *
 * Dashboard with metrics and analytics.
 */

import { BarChart3, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{value}</span>
            {change && (
              <span className="text-sm text-green-600 font-medium">
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your workflow performance
        </p>
      </div>

      {/* Workspace Status */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Workspace Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="New Runs"
            value={0}
            icon={TrendingUp}
            color="bg-blue-100 text-blue-600"
          />
          <MetricCard
            label="In Progress"
            value={0}
            icon={Clock}
            color="bg-amber-100 text-amber-600"
          />
          <MetricCard
            label="Completed"
            value={0}
            icon={CheckCircle2}
            color="bg-green-100 text-green-600"
          />
          <MetricCard
            label="Overdue"
            value={0}
            icon={Clock}
            color="bg-red-100 text-red-600"
          />
        </div>
      </section>

      {/* Your Action Status */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Your Action Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Your Turn"
            value={0}
            icon={TrendingUp}
            color="bg-violet-100 text-violet-600"
          />
          <MetricCard
            label="Due Today"
            value={0}
            icon={Clock}
            color="bg-amber-100 text-amber-600"
          />
          <MetricCard
            label="Overdue"
            value={0}
            icon={Clock}
            color="bg-red-100 text-red-600"
          />
          <MetricCard
            label="Due in 7 Days"
            value={0}
            icon={Clock}
            color="bg-blue-100 text-blue-600"
          />
        </div>
      </section>

      {/* Chart Placeholder */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Progress Insights
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No data yet
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Start running workflows to see progress insights and analytics
              here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
