import { useState, useEffect } from 'react';
import { Loader2, BarChart3, TrendingUp, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getPulseData, type PulseData } from '@/lib/api';
import { type TimeRange } from './shared/TimeRangeSelector';
import { MetricCard } from './shared/MetricCard';
import { ThroughputChart } from './ThroughputChart';
import { EfficiencyTrendChart } from './EfficiencyTrendChart';
import { PeriodComparison } from './PeriodComparison';
import { PerformanceScore } from './PerformanceScore';

interface Props {
  range: TimeRange;
}

export function OverviewTab({ range }: Props) {
  const [data, setData] = useState<PulseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getPulseData(range)
      .then(setData)
      .catch((err) => {
        console.error('[OverviewTab] Failed to load pulse data:', err);
        setError(err?.message || 'Unknown error');
      })
      .finally(() => setIsLoading(false));
  }, [range]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <BarChart3 className="w-12 h-12 mb-3" />
        <p className="text-sm">Failed to load overview data. Please refresh to try again.</p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    );
  }

  const { metrics } = data;

  return (
    <div className="space-y-6">
      <PerformanceScore data={data.performanceScore} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Throughput"
          value={String(metrics.throughput.value)}
          subtext={`flows completed, ${metrics.throughput.periodChange >= 0 ? '+' : ''}${metrics.throughput.periodChange}% vs last period`}
          trend={metrics.throughput.trend}
          periodChange={metrics.throughput.periodChange}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg Cycle Time"
          value={formatMs(metrics.avgCycleTimeMs.value)}
          subtext={`${Math.abs(metrics.avgCycleTimeMs.periodChange)}% ${metrics.avgCycleTimeMs.periodChange <= 0 ? 'faster' : 'slower'} than last period`}
          trend={metrics.avgCycleTimeMs.trend}
          periodChange={metrics.avgCycleTimeMs.periodChange}
          invertColor
          icon={<Clock className="w-4 h-4" />}
        />
        <MetricCard
          label="On-Time Rate"
          value={`${metrics.onTimeRate.value}%`}
          subtext="of flows completed before deadline"
          trend={metrics.onTimeRate.trend}
          periodChange={metrics.onTimeRate.periodChange}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
        <MetricCard
          label="SLA Compliance"
          value={`${metrics.slaCompliance.value}%`}
          subtext="of steps within SLA"
          trend={metrics.slaCompliance.trend}
          periodChange={metrics.slaCompliance.periodChange}
          icon={<ShieldCheck className="w-4 h-4" />}
        />
      </div>

      <ThroughputChart data={data.throughputChart} />
      <EfficiencyTrendChart data={data.efficiencyChart} />
      <PeriodComparison data={data.periodComparison} />
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
