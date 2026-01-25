/**
 * Flow Runs Page
 *
 * Lists all active and completed workflow instances.
 * Shows progress, status, and allows filtering.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlayCircle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

// Placeholder - will be replaced with API data
const MOCK_RUNS: Array<{
  id: string;
  name: string;
  flowName: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PAUSED';
  currentStep: number;
  totalSteps: number;
  assignedTo?: string;
  startedAt: string;
  completedAt?: string;
}> = [];

function getStatusIcon(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return <PlayCircle className="w-4 h-4 text-blue-500" />;
    case 'COMPLETED':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'PAUSED':
      return <Clock className="w-4 h-4 text-amber-500" />;
    case 'CANCELLED':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
}

function getStatusLabel(status: string, assignedTo?: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return assignedTo ? `Waiting: ${assignedTo}` : 'In progress';
    case 'COMPLETED':
      return 'Completed';
    case 'PAUSED':
      return 'Paused';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
}

export function FlowRunsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRuns = MOCK_RUNS.filter((run) => {
    const matchesSearch =
      run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.flowName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || run.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flow Runs</h1>
        <p className="text-sm text-gray-500 mt-1">
          {MOCK_RUNS.length} workflow instances
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search runs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">All Status</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="PAUSED">Paused</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Run List */}
      {filteredRuns.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredRuns.map((run) => (
            <div
              key={run.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/runs/${run.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{run.name}</h3>
                    <p className="text-sm text-gray-500">{run.flowName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    <span className="text-sm text-gray-600">
                      {getStatusLabel(run.status, run.assignedTo)}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="w-32">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>
                        {run.currentStep}/{run.totalSteps}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all"
                        style={{
                          width: `${(run.currentStep / run.totalSteps) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-sm text-gray-400 w-24 text-right">
                    {run.startedAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <PlayCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No flow runs yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Start a flow run from one of your workflow templates to see it here.
          </p>
        </div>
      )}
    </div>
  );
}
