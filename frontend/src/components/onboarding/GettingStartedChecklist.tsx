/**
 * Getting Started Checklist
 *
 * Compact onboarding checklist displayed in the sidebar.
 * Tracks: buildFlow, publishFlow, runFlow, viewRun, inviteContact.
 */

import { CheckCircle2, Circle, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/stores/onboardingStore';

interface ChecklistItem {
  key: string;
  label: string;
  completed: boolean;
  path: string;
}

export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const {
    buildFlow,
    publishFlow,
    runFlow,
    viewRun,
    inviteContact,
    isChecklistDismissed,
    dismissChecklist,
  } = useOnboardingStore();

  if (isChecklistDismissed) return null;

  const items: ChecklistItem[] = [
    { key: 'buildFlow', label: 'Build a flow template', completed: buildFlow, path: '/flows/new' },
    { key: 'publishFlow', label: 'Publish a flow template', completed: publishFlow, path: '/flows' },
    { key: 'runFlow', label: 'Start a flow', completed: runFlow, path: '/flows' },
    { key: 'viewRun', label: 'View a flow', completed: viewRun, path: '/runs' },
    { key: 'inviteContact', label: 'Add a contact', completed: inviteContact, path: '/contacts' },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Hide if all completed
  if (completedCount === totalCount) return null;

  return (
    <div className="mx-3 my-3 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl border border-violet-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Getting Started</h3>
        <button
          onClick={dismissChecklist}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{completedCount} of {totalCount}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => !item.completed && navigate(item.path)}
            className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
              item.completed
                ? 'text-gray-400'
                : 'text-gray-700 hover:bg-white/50'
            }`}
            disabled={item.completed}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={item.completed ? 'line-through' : ''}>{item.label}</span>
            {!item.completed && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
