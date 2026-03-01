import { Workflow, MessageSquare } from 'lucide-react';

interface EmptyWorkflowProps {
  editMode?: boolean;
}

export function EmptyWorkflow({ editMode = false }: EmptyWorkflowProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 flex items-center justify-center">
          <Workflow className="w-7 h-7 text-violet-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {editMode ? 'Add Your First Step' : 'No Workflow Yet'}
        </h3>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          {editMode
            ? 'Click the + button above to add a step, or drag one from the palette.'
            : 'Use the chat to describe the process you want to automate. Approve the result to see it here.'}
        </p>

        {!editMode && (
          <p className="inline-flex items-center gap-2 text-sm text-violet-600 font-medium">
            <MessageSquare className="w-4 h-4" />
            <span>Start chatting to create a workflow</span>
          </p>
        )}
      </div>
    </div>
  );
}
