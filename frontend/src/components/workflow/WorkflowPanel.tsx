import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowHeader } from './WorkflowHeader';
import { FlowStartCard } from './FlowStartCard';
import { StepList } from './StepList';
import { StepConnector } from './StepConnector';
import { EmptyWorkflow } from './EmptyWorkflow';
import { useWorkflowStore } from '@/stores/workflowStore';

interface WorkflowPanelProps {
  editMode?: boolean;
  onStartConfigClick?: () => void;
}

export function WorkflowPanel({ editMode = false, onStartConfigClick }: WorkflowPanelProps) {
  const workflow = useWorkflowStore((state) => state.workflow);

  if (!workflow) {
    return <EmptyWorkflow editMode={editMode} />;
  }

  // In edit mode, AssigneeManager and header are rendered at the page level
  // so the canvas is just the step content
  if (editMode) {
    return (
      <div className="flex flex-col h-full">
        <ScrollArea className="flex-1">
          <div className="p-6 max-w-2xl mx-auto">
            {workflow.steps.length === 0 ? (
              <EmptyWorkflow editMode={editMode} />
            ) : (
              <>
                {/* Flow Start Card */}
                <FlowStartCard
                  workflow={workflow}
                  editMode
                  onConfigClick={onStartConfigClick}
                />

                {/* Connector */}
                <StepConnector />

                {/* Step List */}
                <StepList workflow={workflow} editMode={editMode} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  // Read-only mode (AI chat preview) — keep header for context
  return (
    <div className="flex flex-col h-full">
      <WorkflowHeader workflow={workflow} editMode={false} />
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Flow Start Card */}
          <FlowStartCard workflow={workflow} />

          {/* Connector */}
          <StepConnector />

          {/* Step List */}
          <StepList workflow={workflow} editMode={false} />
        </div>
      </ScrollArea>
    </div>
  );
}
