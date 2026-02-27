/**
 * Reports Page
 *
 * Analytics dashboard with tabs matching Moxo Action Hub design.
 * Includes workspace status, action status, and progress insights sections.
 * Fetches real data from the Reports API.
 */

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  FileText,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Activity,
  Target,
  PieChart,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  getReportSummary,
  getFlowReports,
  getAssigneeReports,
  getMemberReports,
  type ReportSummary,
  type FlowReport,
  type AssigneeReport,
  type MemberReport,
} from '@/lib/api';

// Types
type TabId = 'dashboard' | 'flow-report' | 'assignee-report' | 'member-report';
type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

interface StatusCard {
  label: string;
  value: number;
  change: number;
  changeDirection: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

interface ActionCard {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  urgent?: boolean;
}

const tabs: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'flow-report', label: 'Flow report', icon: Layers },
  { id: 'assignee-report', label: 'Assignee report', icon: Users },
  { id: 'member-report', label: 'Member report', icon: FileText },
];

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
  { value: 'year', label: 'This year' },
];

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
    </div>
  );
}

// Empty state component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <BarChart3 className="w-12 h-12 mb-3" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

// Components
function StatusCardComponent({ card }: { card: StatusCard }) {
  const isPositive = card.changeDirection === 'up';
  const isNegative = card.changeDirection === 'down';
  const changeLabel = card.label === 'Due' || card.label === 'Overdue';
  const changeIsGood = changeLabel ? isNegative : isPositive;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center`}>
          <card.icon className={`w-5 h-5 ${card.colorClass}`} />
        </div>
        {card.change !== 0 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            changeIsGood ? 'text-emerald-600' : 'text-red-500'
          }`}>
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{card.change}%</span>
          </div>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-gray-900">{card.value}</span>
        <p className="text-sm text-gray-500 mt-1">{card.label}</p>
      </div>
    </div>
  );
}

function ActionCardComponent({ card }: { card: ActionCard }) {
  return (
    <div className={`bg-white rounded-xl border ${
      card.urgent ? 'border-red-200' : 'border-gray-200'
    } p-5 hover:border-violet-200 hover:shadow-sm transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${card.bgClass} flex items-center justify-center`}>
          <card.icon className={`w-5 h-5 ${card.colorClass}`} />
        </div>
        {card.urgent && card.value > 0 && (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        )}
      </div>
      <div>
        <span className="text-2xl font-bold text-gray-900">{card.value}</span>
        <p className="text-sm text-gray-500 mt-1">{card.label}</p>
      </div>
    </div>
  );
}

function ProgressInsightsSection({ summary }: { summary: ReportSummary }) {
  const data = summary.progress;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5 text-violet-200" />
            <span className="text-sm text-violet-200">Completion Rate</span>
          </div>
          <div className="text-3xl font-bold">{data.completionRate}%</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Avg. Completion Time</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.avgCompletionDays}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Active Templates</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.activeTemplates}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-500">Total Runs</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.totalRuns}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
            <p className="text-sm text-gray-500">Flows over the past 7 days</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-sm text-gray-500">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-500">In Progress</span>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart Visualization */}
        <div className="flex items-end justify-between h-48 gap-4 px-4">
          {data.weeklyTrend.map((value, index) => {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const maxValue = Math.max(...data.weeklyTrend, 1);
            const height = (value / maxValue) * 100;
            const isToday = index === data.weeklyTrend.length - 1;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center justify-end h-40">
                  <span className="text-xs text-gray-500 mb-2">{value}</span>
                  <div
                    className={`w-full max-w-[40px] rounded-t-lg transition-all ${
                      isToday
                        ? 'bg-gradient-to-t from-violet-600 to-violet-400'
                        : 'bg-gradient-to-t from-violet-300 to-violet-200'
                    }`}
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
                <span className={`text-xs mt-2 ${isToday ? 'font-medium text-violet-600' : 'text-gray-500'}`}>
                  {days[index]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FlowReportTab() {
  const [data, setData] = useState<FlowReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getFlowReports()
      .then(setData)
      .catch((err) => console.error('Failed to fetch flow reports:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (data.length === 0) return <EmptyState message="No flow data yet. Start some flows to see reports here." />;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Flow Performance</h3>
        <p className="text-sm text-gray-500">Overview of template performance</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Template</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Total Runs</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Completed</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Completion Rate</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Avg. Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((flow) => {
              const completionRate = flow.runs > 0 ? Math.round((flow.completed / flow.runs) * 100) : 0;
              return (
                <tr key={flow.templateId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{flow.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{flow.runs}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{flow.completed}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${
                      completionRate >= 80 ? 'text-emerald-600' : completionRate >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {completionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{flow.avgCompletionDays}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssigneeReportTab() {
  const [data, setData] = useState<AssigneeReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getAssigneeReports()
      .then(setData)
      .catch((err) => console.error('Failed to fetch assignee reports:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (data.length === 0) return <EmptyState message="No assignee data yet. Assign tasks to contacts to see reports here." />;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Assignee Performance</h3>
        <p className="text-sm text-gray-500">Task distribution and completion by assignee</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Assignee</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Total Tasks</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Completed</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Pending</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Progress</th>
            </tr>
          </thead>
          <tbody>
            {data.map((assignee) => {
              const progress = assignee.tasks > 0 ? Math.round((assignee.completed / assignee.tasks) * 100) : 0;
              const initials = assignee.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <tr key={assignee.contactId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-medium">
                        {initials}
                      </div>
                      <span className="font-medium text-gray-900">{assignee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-600">{assignee.tasks}</td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-medium">{assignee.completed}</td>
                  <td className="px-6 py-4 text-right text-amber-600 font-medium">{assignee.pending}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-10">{progress}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberReportTab() {
  const [data, setData] = useState<MemberReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getMemberReports()
      .then(setData)
      .catch((err) => console.error('Failed to fetch member reports:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (data.length === 0) return <EmptyState message="No member data yet. Start some flows to see coordinator activity here." />;

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Member Activity</h3>
        <p className="text-sm text-gray-500">Workflow engagement by team member</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Member</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Active Runs</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Completed</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-6 py-4">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => (
              <tr key={member.userId} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-900">{member.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                    {member.activeRuns} active
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-emerald-600 font-medium">{member.completedRuns}</td>
                <td className="px-6 py-4 text-right text-gray-900 font-medium">
                  {member.activeRuns + member.completedRuns}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getReportSummary(timeRange)
      .then(setSummary)
      .catch((err) => console.error('Failed to fetch report summary:', err))
      .finally(() => setIsLoading(false));
  }, [timeRange]);

  // Build status/action cards from summary data
  const workspaceStatus: StatusCard[] = summary
    ? [
        { label: 'New', value: summary.workspace.new, change: 0, changeDirection: 'neutral' as const, icon: TrendingUp, colorClass: 'text-blue-600', bgClass: 'bg-blue-100' },
        { label: 'In Progress', value: summary.workspace.inProgress, change: 0, changeDirection: 'neutral' as const, icon: Activity, colorClass: 'text-amber-600', bgClass: 'bg-amber-100' },
        { label: 'Completed', value: summary.workspace.completed, change: 0, changeDirection: 'neutral' as const, icon: CheckCircle2, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100' },
        { label: 'Due', value: summary.workspace.due, change: 0, changeDirection: 'neutral' as const, icon: Calendar, colorClass: 'text-violet-600', bgClass: 'bg-violet-100' },
      ]
    : [];

  const actionStatus: ActionCard[] = summary
    ? [
        { label: 'Your turn', value: summary.actions.yourTurn, icon: Target, colorClass: 'text-violet-600', bgClass: 'bg-violet-100' },
        { label: 'Due today', value: summary.actions.dueToday, icon: Clock, colorClass: 'text-amber-600', bgClass: 'bg-amber-100', urgent: true },
        { label: 'Overdue', value: summary.actions.overdue, icon: AlertCircle, colorClass: 'text-red-600', bgClass: 'bg-red-100', urgent: true },
        { label: 'Due in 7 days', value: summary.actions.dueSoon, icon: Calendar, colorClass: 'text-blue-600', bgClass: 'bg-blue-100' },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reports show how your flows perform — completion times, bottlenecks, and activity
          </p>
        </div>
        <Badge variant="secondary" className="text-sm font-medium bg-violet-50 text-violet-700">
          Last updated: Just now
        </Badge>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          {isLoading ? (
            <LoadingSpinner />
          ) : !summary ? (
            <EmptyState message="Unable to load dashboard data. Please try again." />
          ) : (
            <div className="space-y-8">
              {/* Workspace Status Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Workspace Status
                  </h2>
                  <span className="text-xs text-gray-400">vs. previous period</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {workspaceStatus.map((card, index) => (
                    <StatusCardComponent key={index} card={card} />
                  ))}
                </div>
              </section>

              {/* Action Status Section */}
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Action Status
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {actionStatus.map((card, index) => (
                    <ActionCardComponent key={index} card={card} />
                  ))}
                </div>
              </section>

              {/* Progress Insights Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Progress Insights
                  </h2>
                  <div className="relative">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                      className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                    >
                      {timeRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <ProgressInsightsSection summary={summary} />
              </section>
            </div>
          )}
        </>
      )}

      {activeTab === 'flow-report' && <FlowReportTab />}
      {activeTab === 'assignee-report' && <AssigneeReportTab />}
      {activeTab === 'member-report' && <MemberReportTab />}
    </div>
  );
}
