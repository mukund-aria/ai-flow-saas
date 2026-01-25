import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkflowHeader } from './WorkflowHeader';
import { FlowStartCard } from './FlowStartCard';
import { StepList } from './StepList';
import { StepConnector } from './StepConnector';
import { EmptyWorkflow } from './EmptyWorkflow';
import { useWorkflowStore } from '@/stores/workflowStore';

export function WorkflowPanel() {
  const workflow = useWorkflowStore((state) => state.workflow);

  if (!workflow) {
    return <EmptyWorkflow />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <WorkflowHeader workflow={workflow} />

      {/* Workflow Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 max-w-4xl mx-auto">
          {/* Flow Start Card */}
          <FlowStartCard workflow={workflow} />

          {/* Connector */}
          <StepConnector />

          {/* Step List */}
          <StepList workflow={workflow} />
        </div>
      </ScrollArea>
    </div>
  );
}
