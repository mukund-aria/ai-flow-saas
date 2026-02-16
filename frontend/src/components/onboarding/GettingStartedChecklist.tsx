/**
 * Getting Started Checklist
 *
 * Compact onboarding checklist displayed in the sidebar.
 * Tracks 5 steps: Build, Publish, Execute, Action, Coordinate.
 */

import { CheckCircle2, Circle, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingStore } from '@/stores/onboardingStore';

interface ChecklistItem {
  key: 'buildTemplate' | 'publishTemplate' | 'startFlow' | 'completeAction' | 'coordinateFlows';
  label: string;
  path: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  { key: 'buildTemplate', label: 'Build a template', path: '/templates/new' },
  { key: 'publishTemplate', label: 'Publish your template', path: '/templates' },
  { key: 'startFlow', label: 'Start your first flow', path: '/flows' },
  { key: 'completeAction', label: 'Complete an action', path: '/flows' },
  { key: 'coordinateFlows', label: 'Coordinate your flows', path: '/flows' },
];

export function GettingStartedChecklist() {
  const navigate = useNavigate();
  const store = useOnboardingStore();

  if (store.isChecklistDismissed) return null;

  const completedCount = CHECKLIST_ITEMS.filter((item) => store[item.key]).length;
  const totalCount = CHECKLIST_ITEMS.length;

  // Hide if all completed
  if (completedCount === totalCount) return null;

  return (
    <div className="mx-3 my-3 rounded-xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Setup guide</h3>
          <span className="text-xs text-gray-400">{completedCount}/{totalCount}</span>
        </div>
        <button
          onClick={() => store.dismissChecklist()}
          className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Dismiss checklist"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Checklist items */}
      <div className="space-y-0.5">
        {CHECKLIST_ITEMS.map((item) => {
          const done = store[item.key];
          return (
            <button
              key={item.key}
              onClick={() => !done && navigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left text-sm transition-colors ${
                done
                  ? 'text-gray-400'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              disabled={done}
            >
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
              )}
              <span className={done ? 'line-through' : ''}>{item.label}</span>
              {!done && (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
