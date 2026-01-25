/**
 * Flows Page
 *
 * Lists all workflow templates with card grid layout.
 * Users can create, edit, and start flow runs from here.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, MoreVertical, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listFlows, type Flow } from '@/lib/api';

export function FlowsPage() {
  const navigate = useNavigate();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch flows on mount
  useEffect(() => {
    async function fetchFlows() {
      try {
        setIsLoading(true);
        const data = await listFlows();
        setFlows(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load flows');
      } finally {
        setIsLoading(false);
      }
    }
    fetchFlows();
  }, []);

  const filteredFlows = flows.filter((flow) => {
    const matchesSearch = flow.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || flow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading flows...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading flows</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flows</h1>
          <p className="text-sm text-gray-500 mt-1">
            {flows.length} workflow template{flows.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/flows/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create flow
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows..."
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
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Flow Grid */}
      {filteredFlows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlows.map((flow) => (
            <div
              key={flow.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => navigate(`/flows/${flow.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                        flow.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : flow.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {flow.status}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      v{flow.version}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Show menu
                  }}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <h3 className="font-semibold text-gray-900 mb-1">{flow.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {flow.description || 'No description'}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {flow.stepCount || 0} step{flow.stepCount !== 1 ? 's' : ''}
                </span>
                {flow.createdBy && (
                  <span className="text-gray-400">
                    By {flow.createdBy.name}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Start flow run
                }}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Flow Run
              </Button>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No flows yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Create your first workflow template to start automating your
            business processes.
          </p>
          <Button onClick={() => navigate('/flows/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first flow
          </Button>
        </div>
      )}
    </div>
  );
}
