import { useState, useEffect } from 'react';
import { Loader2, Users } from 'lucide-react';
import { getPeopleAnalytics, type PeopleAnalyticsData } from '@/lib/api';
import { type TimeRange } from './shared/TimeRangeSelector';
import { WorkloadDistributionChart } from './WorkloadDistributionChart';
import { TeamMembersTable } from './TeamMembersTable';
import { AssigneesTable } from './AssigneesTable';
import { EfficiencyInsights } from './EfficiencyInsights';

interface Props {
  range: TimeRange;
}

export function PeopleTab({ range }: Props) {
  const [data, setData] = useState<PeopleAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    getPeopleAnalytics(range)
      .then(setData)
      .catch(() => setError(true))
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
        <Users className="w-12 h-12 mb-3" />
        <p className="text-sm">Failed to load people analytics.</p>
      </div>
    );
  }

  const hasData = data.members.length > 0 || data.assignees.length > 0;
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Users className="w-12 h-12 mb-3" />
        <p className="text-sm">No people data yet. Start flows and assign tasks to see analytics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.workloadChart.length > 0 && (
        <WorkloadDistributionChart data={data.workloadChart} />
      )}

      {data.members.length > 0 && <TeamMembersTable members={data.members} />}
      {data.assignees.length > 0 && <AssigneesTable assignees={data.assignees} />}

      <EfficiencyInsights insights={data.insights} />
    </div>
  );
}
