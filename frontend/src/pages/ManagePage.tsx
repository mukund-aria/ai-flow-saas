import { useState } from 'react';
import { Activity, Layers, Building2, Users } from 'lucide-react';
import { TimeRangeSelector, type TimeRange } from '@/components/manage/shared/TimeRangeSelector';
import { OverviewTab } from '@/components/manage/OverviewTab';
import { FlowsTab } from '@/components/manage/FlowsTab';
import { AccountsTab } from '@/components/manage/AccountsTab';
import { PeopleTab } from '@/components/manage/PeopleTab';

type TabId = 'overview' | 'flows' | 'accounts' | 'people';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'flows', label: 'Flows', icon: Layers },
  { id: 'accounts', label: 'Accounts', icon: Building2 },
  { id: 'people', label: 'People', icon: Users },
];

export function ManagePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analytics and performance insights across your organization
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                  isActive
                    ? 'border-violet-600 text-violet-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'overview' && <OverviewTab range={timeRange} />}
      {activeTab === 'flows' && <FlowsTab range={timeRange} />}
      {activeTab === 'accounts' && <AccountsTab range={timeRange} />}
      {activeTab === 'people' && <PeopleTab range={timeRange} />}
    </div>
  );
}
