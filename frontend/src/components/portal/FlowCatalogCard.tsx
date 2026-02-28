/**
 * Flow Catalog Card
 *
 * Flow template card for self-service start in the portal.
 */

import { Play, Layers } from 'lucide-react';

interface FlowCatalogCardProps {
  flow: {
    id: string;
    name: string;
    description?: string;
    stepCount: number;
  };
  onStart: (flowId: string) => void;
  starting?: boolean;
}

export function FlowCatalogCard({ flow, onStart, starting }: FlowCatalogCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-violet-200 hover:shadow-sm transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
          <Layers className="w-5 h-5 text-violet-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">{flow.name}</h3>
          {flow.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{flow.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{flow.stepCount} steps</span>
        <button
          onClick={() => onStart(flow.id)}
          disabled={starting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          <Play className="w-3 h-3" />
          Start
        </button>
      </div>
    </div>
  );
}
