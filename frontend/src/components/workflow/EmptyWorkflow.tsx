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
  const { initEmptyWorkflow, workflow } = useWorkflowStore();

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
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center">
          <Workflow className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No Workflow Yet
        </h3>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          {editMode
            ? 'Start building your workflow by adding your first step.'
            : 'Use the chat to describe the process you want to automate. Approve the result to see it here.'}
        </p>

        {editMode ? (
          <div className="relative inline-block">
            <button
              onClick={() => setShowPopover(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
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
          <button className="inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>Start chatting to create a workflow</span>
          </button>
        )}
      </div>
    </div>
  );
}
