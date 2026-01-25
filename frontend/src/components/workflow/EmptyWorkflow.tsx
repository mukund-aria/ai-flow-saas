import { Workflow, MessageSquare } from 'lucide-react';

export function EmptyWorkflow() {
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
          Your published workflow will appear here. Use the chat to create or
          import a workflow, then approve it to see it visualized.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
          <MessageSquare className="w-4 h-4" />
          <span>Start chatting to create a workflow</span>
        </div>
      </div>
    </div>
  );
}
