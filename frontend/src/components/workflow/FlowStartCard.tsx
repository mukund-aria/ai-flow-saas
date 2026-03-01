import { Card } from '@/components/ui/card';
import { PlayCircle, Zap, UserCircle, FileText, Link, ChevronRight, Settings2 } from 'lucide-react';
import type { Flow, StartMode } from '@/types';

interface FlowStartCardProps {
  workflow: Flow;
  editMode?: boolean;
  onConfigClick?: () => void;
}

const START_MODE_LABELS: Record<StartMode, { label: string; icon: typeof UserCircle; description: string }> = {
  MANUAL_EXECUTE: { label: 'Manual', icon: UserCircle, description: 'Coordinator starts this flow manually' },
  KICKOFF_FORM: { label: 'Kickoff Form', icon: FileText, description: 'Collect info before the flow starts' },
  START_LINK: { label: 'Start Link', icon: Link, description: 'Anyone with the link can start this flow' },
  WEBHOOK: { label: 'Webhook', icon: Zap, description: 'Triggered by external system' },
  SCHEDULE: { label: 'Schedule', icon: Zap, description: 'Runs on a recurring schedule' },
  INTEGRATION: { label: 'Integration', icon: Zap, description: 'Triggered by an integration' },
};

export function FlowStartCard({ workflow, editMode, onConfigClick }: FlowStartCardProps) {
  const startMode = workflow.kickoff?.defaultStartMode || 'MANUAL_EXECUTE';
  const modeInfo = START_MODE_LABELS[startMode] || START_MODE_LABELS.MANUAL_EXECUTE;
  const ModeIcon = modeInfo.icon;

  const hasKickoffForm = workflow.kickoff?.kickoffFormEnabled && (workflow.kickoff?.kickoffFormFields?.length || 0) > 0;
  const variableCount = workflow.kickoff?.flowVariables?.length || 0;

  return (
    <Card
      className={`w-[320px] border-l-4 border-l-blue-500 bg-white shadow-sm rounded-lg overflow-hidden ${
        editMode ? 'cursor-pointer hover:shadow-md hover:border-l-blue-600 transition-all group' : ''
      }`}
      onClick={editMode ? onConfigClick : undefined}
    >
      {/* Header row */}
      <div className="bg-blue-50/60 px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
        <PlayCircle className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-medium text-gray-600 flex-1">Flow Start</span>
        {editMode && (
          <Settings2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <ModeIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 flex-1">{modeInfo.description}</span>
          {editMode && (
            <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Show kickoff form indicator */}
        {hasKickoffForm && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-blue-500" />
            <span className="text-xs text-blue-600 font-medium">
              Kickoff form: {workflow.kickoff!.kickoffFormFields!.length} fields
            </span>
          </div>
        )}

        {/* Show variable count */}
        {variableCount > 0 && (
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-xs text-gray-500">
              {variableCount} flow variable{variableCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
