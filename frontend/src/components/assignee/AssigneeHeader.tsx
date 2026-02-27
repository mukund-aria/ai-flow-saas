/**
 * Assignee Header
 *
 * Top bar showing flow name, run name, chat toggle, and assignee avatar.
 */

import { Layers, MessageSquare } from 'lucide-react';
import { getInitials } from './utils';

interface AssigneeHeaderProps {
  runName: string;
  flowName: string;
  contactName: string;
  onToggleChat: () => void;
}

export function AssigneeHeader({ runName, flowName, contactName, onToggleChat }: AssigneeHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{runName}</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">{flowName}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChat}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-500 hover:text-violet-600"
            title="Chat & updates"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
            {getInitials(contactName)}
          </div>
        </div>
      </div>
    </header>
  );
}
