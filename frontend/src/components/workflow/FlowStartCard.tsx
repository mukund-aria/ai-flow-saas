import { Card } from '@/components/ui/card';
import { PlayCircle, Zap, UserCircle } from 'lucide-react';
import type { Flow } from '@/types';

interface FlowStartCardProps {
  workflow: Flow;
}

export function FlowStartCard({ workflow }: FlowStartCardProps) {
  const triggerType = workflow.triggerConfig?.type || 'manual';

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 overflow-hidden">
      {/* Colored top band */}
      <div className="bg-blue-500 px-3 py-1.5 flex items-center gap-2">
        <PlayCircle className="w-3.5 h-3.5 text-white" />
        <span className="text-xs font-semibold text-white">Flow Start</span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-1.5">
          {triggerType === 'manual' ? (
            <>
              <UserCircle className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Coordinator starts this flow manually</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs text-gray-500 capitalize">{triggerType} trigger</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
