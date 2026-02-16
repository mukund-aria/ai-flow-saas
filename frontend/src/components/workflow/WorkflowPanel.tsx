import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowHeader } from './WorkflowHeader';
import { FlowStartCard } from './FlowStartCard';
import { StepList } from './StepList';
import { StepConnector } from './StepConnector';
import { EmptyWorkflow } from './EmptyWorkflow';
import { AssigneeManager } from './AssigneeManager';
import { useWorkflowStore } from '@/stores/workflowStore';

interface WorkflowPanelProps {
  editMode?: boolean;
}

export function WorkflowPanel({ editMode = false }: WorkflowPanelProps) {
  const workflow = useWorkflowStore((state) => state.workflow);

  if (!workflow) {
    return <EmptyWorkflow editMode={editMode} />;
  }

  // In edit mode with no steps, show empty state with assignee manager
  if (editMode && workflow.steps.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <WorkflowHeader workflow={workflow} editMode={editMode} />
        <ScrollArea className="flex-1">
          <div className="p-4 max-w-4xl mx-auto space-y-4">
            <AssigneeManager />
          </div>
        </ScrollArea>
        <EmptyWorkflow editMode={editMode} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <WorkflowHeader workflow={workflow} editMode={editMode} />

      {/* Workflow Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Assignee Manager (edit mode only) */}
          {editMode && (
            <div className="mb-4">
              <AssigneeManager />
            </div>
          )}

          {/* Flow Start Card */}
          <FlowStartCard workflow={workflow} />

          {/* Connector */}
          <StepConnector />

          {/* Step List */}
          <StepList workflow={workflow} editMode={editMode} />
        </div>
      </ScrollArea>
    </div>
  );
}
