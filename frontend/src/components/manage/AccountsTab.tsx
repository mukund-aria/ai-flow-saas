import { useState, useEffect } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import { getAccountAnalytics, type AccountAnalyticsData } from '@/lib/api';
import { type TimeRange } from './shared/TimeRangeSelector';
import { AccountPerformanceTable } from './AccountPerformanceTable';

interface Props {
  range: TimeRange;
}

export function AccountsTab({ range }: Props) {
  const [data, setData] = useState<AccountAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<AccountAnalyticsData['drillDown'] | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setExpandedAccountId(null);
    setDrillDownData(null);
    getAccountAnalytics(range)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [range]);

  const handleExpand = async (accountId: string) => {
    if (expandedAccountId === accountId) {
      setExpandedAccountId(null);
      setDrillDownData(null);
      return;
    }
    setExpandedAccountId(accountId);
    setDrillDownLoading(true);
    try {
      const result = await getAccountAnalytics(range, accountId);
      setDrillDownData(result.drillDown || null);
    } catch {
      setDrillDownData(null);
    } finally {
      setDrillDownLoading(false);
    }
  };

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
        <Building2 className="w-12 h-12 mb-3" />
        <p className="text-sm">Failed to load account analytics.</p>
      </div>
    );
  }

  if (data.accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Building2 className="w-12 h-12 mb-3" />
        <p className="text-sm">No account data yet. Associate flows with accounts to see analytics here.</p>
      </div>
    );
  }

  return (
    <AccountPerformanceTable
      accounts={data.accounts}
      expandedAccountId={expandedAccountId}
      drillDownData={drillDownData}
      drillDownLoading={drillDownLoading}
      onExpand={handleExpand}
    />
  );
}
