/**
 * Workspace List
 *
 * List of workspace cards with status filter.
 */

import { useState } from 'react';
import { WorkspaceCard } from './WorkspaceCard';

interface Workspace {
  id: string;
  name: string;
  templateName: string;
  status: string;
  progress: { completed: number; total: number };
  dueAt?: string;
  nextTaskToken?: string;
}

interface WorkspaceListProps {
  workspaces: Workspace[];
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? workspaces
    : workspaces.filter((w) => w.status === filter);

  return (
    <div>
      {/* Filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Your Workspaces</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No workspaces found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((ws) => (
            <WorkspaceCard key={ws.id} workspace={ws} />
          ))}
        </div>
      )}
    </div>
  );
}
