/**
 * Portal Flow Catalog Page
 *
 * Grid of available flow templates for self-service start.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';
import { FlowCatalogCard } from '@/components/portal/FlowCatalogCard';
import { getPortalAvailableFlows, startPortalFlow } from '@/lib/api';

interface CatalogFlow {
  id: string;
  name: string;
  description?: string;
  stepCount: number;
}

export function PortalFlowCatalogPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { token } = useAssigneeAuth();
  const [flows, setFlows] = useState<CatalogFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    if (!token) return;
    getPortalAvailableFlows(token)
      .then(setFlows)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleStart = useCallback(async (flowId: string) => {
    if (!token) return;
    setStartingId(flowId);
    setStartError('');
    try {
      const result = await startPortalFlow(token, flowId);
      if (result.firstTaskToken) {
        navigate(`/task/${result.firstTaskToken}`);
      } else {
        navigate(`/portal/${slug}`);
      }
    } catch {
      setStartError('Failed to start flow. Please try again.');
      setStartingId(null);
    }
  }, [token, slug, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/portal/${slug}`)}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Start a New Flow</h1>
      </div>

      {startError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{startError}</p>
        </div>
      )}

      {flows.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">No flows available to start</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.map((flow) => (
            <FlowCatalogCard
              key={flow.id}
              flow={flow}
              onStart={handleStart}
              starting={startingId === flow.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
