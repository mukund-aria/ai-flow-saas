/**
 * Portal Dashboard Page
 *
 * Assignee dashboard with summary cards and workspace list.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';
import { WorkspaceSummaryCards } from '@/components/portal/WorkspaceSummaryCards';
import { WorkspaceList } from '@/components/portal/WorkspaceList';
import { Button } from '@/components/ui/button';
import { getPortalDashboard } from '@/lib/api';
import type { PortalDashboardData } from '@/types';

export function PortalDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { token, portal, contact } = useAssigneeAuth();
  const [data, setData] = useState<PortalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = () => {
    if (!token) return;
    setLoading(true);
    setError('');
    getPortalDashboard(token)
      .then(setData)
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const allowSelfService = portal?.settings?.allowSelfServiceFlowStart;
  const showSummary = portal?.settings?.showWorkspaceSummary ?? true;
  const welcomeMessage = portal?.settings?.flowExperience?.welcomeMessage;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 mb-3">{error}</p>
        <Button variant="outline" onClick={loadDashboard} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const hasWorkspaces = data && data.workspaces.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      {welcomeMessage ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700">{welcomeMessage}</p>
        </div>
      ) : contact?.name && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700">Welcome back, <span className="font-medium">{contact.name}</span></p>
        </div>
      )}

      {/* Summary cards */}
      {showSummary && data && (
        <WorkspaceSummaryCards summary={data.summary} />
      )}

      {/* Actions */}
      {allowSelfService && (
        <div className="flex justify-end">
          <Button
            onClick={() => navigate(`/portal/${slug}/start`)}
            className="bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
      )}

      {/* Workspace list */}
      {hasWorkspaces ? (
        <WorkspaceList workspaces={data.workspaces} />
      ) : (
        <div className="text-center py-12">
          <p className="text-sm text-gray-400">No tasks assigned to you yet</p>
          <p className="text-xs text-gray-300 mt-1">Tasks will appear here when they're assigned</p>
        </div>
      )}
    </div>
  );
}
