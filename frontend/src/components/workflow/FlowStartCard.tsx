import { Card } from '@/components/ui/card';
import { PlayCircle, Zap, FileText } from 'lucide-react';
import type { Flow } from '@/types';

interface FlowStartCardProps {
  workflow: Flow;
}

export function FlowStartCard({ workflow }: FlowStartCardProps) {
  const hasParameters = (workflow.parameters?.length || 0) > 0;
  const triggerType = workflow.triggerConfig?.type || 'manual';

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <PlayCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Flow Start</h3>
            {hasParameters && (
              <p className="text-xs text-gray-500">
                {workflow.parameters?.length} parameter{workflow.parameters?.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Trigger */}
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Trigger</p>
          <div className="flex items-center gap-2 p-2 bg-white rounded-md border">
            {triggerType === 'manual' ? (
              <>
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Kickoff form - Manual</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-700 capitalize">{triggerType}</span>
              </>
            )}
          </div>
        </div>

        {/* Parameters Preview */}
        {hasParameters && workflow.parameters && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Parameters</p>
            <div className="space-y-1">
              {workflow.parameters.slice(0, 3).map((param) => (
                <div
                  key={param.parameterId}
                  className="flex items-center justify-between p-2 bg-white rounded-md border text-sm"
                >
                  <span className="text-gray-700">{param.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{param.type}</span>
                </div>
              ))}
              {workflow.parameters.length > 3 && (
                <p className="text-xs text-gray-500 text-center">
                  +{workflow.parameters.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
