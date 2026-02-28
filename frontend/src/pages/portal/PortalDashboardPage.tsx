/**
 * Portal Dashboard Page
 *
 * Assignee dashboard with summary cards and workspace list.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';
import { WorkspaceSummaryCards } from '@/components/portal/WorkspaceSummaryCards';
import { WorkspaceList } from '@/components/portal/WorkspaceList';
import { Button } from '@/components/ui/button';
import { getPortalDashboard } from '@/lib/api';
import type { PortalDashboardData } from '@/types';

export function PortalDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { token, portal } = useAssigneeAuth();
  const [data, setData] = useState<PortalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getPortalDashboard(token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

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

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      {welcomeMessage && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-700">{welcomeMessage}</p>
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
      {data && <WorkspaceList workspaces={data.workspaces} />}
    </div>
  );
}
