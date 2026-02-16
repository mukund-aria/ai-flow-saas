import { useState } from 'react';
import { Workflow, MessageSquare, Plus } from 'lucide-react';
import { AddStepPopover } from './AddStepPopover';
import { useWorkflowStore } from '@/stores/workflowStore';
import type { StepType } from '@/types';

interface EmptyWorkflowProps {
  editMode?: boolean;
}

export function EmptyWorkflow({ editMode = false }: EmptyWorkflowProps) {
  const [showPopover, setShowPopover] = useState(false);
  const { addStep, initEmptyWorkflow, workflow } = useWorkflowStore();

  const handleAddFirstStep = (stepType: StepType) => {
    if (!workflow) {
      initEmptyWorkflow();
    }
    // Use setTimeout to ensure workflow is initialized before adding step
    setTimeout(() => {
      useWorkflowStore.getState().addStep(0, stepType);
    }, 0);
    setShowPopover(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Workflow className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No Workflow Yet
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          {editMode
            ? 'Start building your workflow by adding your first step.'
            : 'Your published workflow will appear here. Use the chat to create or import a workflow, then approve it to see it visualized.'}
        </p>

        {editMode ? (
          <div className="relative inline-block">
            <button
              onClick={() => setShowPopover(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first step
            </button>
            {showPopover && (
              <AddStepPopover
                open
                onOpenChange={setShowPopover}
                onSelect={handleAddFirstStep}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <MessageSquare className="w-4 h-4" />
            <span>Start chatting to create a workflow</span>
          </div>
        )}
      </div>
    </div>
  );
}
