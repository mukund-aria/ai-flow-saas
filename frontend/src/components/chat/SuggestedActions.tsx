import { Check, X, Pencil, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SuggestedAction } from '@/types';

interface SuggestedActionsProps {
  actions: SuggestedAction[];
  onActionClick: (action: SuggestedAction) => void;
  pendingPlanId?: string;
}

export function SuggestedActions({ actions, onActionClick, pendingPlanId }: SuggestedActionsProps) {
  if (!actions || actions.length === 0) return null;

  // Get icon and style based on action type
  const getActionStyle = (action: SuggestedAction) => {
    switch (action.actionType) {
      case 'approve_plan':
        return {
          icon: <Check className="w-3.5 h-3.5" />,
          className: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm shadow-green-200',
        };
      case 'discard_plan':
        return {
          icon: <X className="w-3.5 h-3.5" />,
          className: 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200',
        };
      case 'edit_plan':
        return {
          icon: <Pencil className="w-3.5 h-3.5" />,
          className: 'bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200',
        };
      case 'prompt':
      default:
        return {
          icon: <Send className="w-3.5 h-3.5" />,
          className: 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200',
        };
    }
  };

  // Don't show plan-related actions if there's no pending plan
  const filteredActions = actions.filter(action => {
    if (!pendingPlanId && ['approve_plan', 'discard_plan', 'edit_plan'].includes(action.actionType || '')) {
      return false;
    }
    return true;
  });

  if (filteredActions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {filteredActions.map((action, index) => {
        const style = getActionStyle(action);
        return (
          <button
            key={index}
            onClick={() => onActionClick(action)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all hover:shadow-sm',
              style.className
            )}
          >
            {style.icon}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
