import { Card } from '@/components/ui/card';
import { PlayCircle, Zap, UserCircle } from 'lucide-react';
import type { Flow } from '@/types';

interface FlowStartCardProps {
  workflow: Flow;
}

export function FlowStartCard({ workflow }: FlowStartCardProps) {
  const triggerType = workflow.triggerConfig?.type || 'manual';

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
            <PlayCircle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900">Flow Start</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
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
        </div>
      </div>
    </Card>
  );
}
