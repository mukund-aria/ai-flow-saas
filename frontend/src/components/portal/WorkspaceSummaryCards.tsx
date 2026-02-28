/**
 * Workspace Summary Cards
 *
 * 4 stat cards showing New, In Progress, Due, and Completed counts.
 */

import { Inbox, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface WorkspaceSummaryCardsProps {
  summary: {
    new: number;
    inProgress: number;
    due: number;
    completed: number;
  };
}

const CARDS = [
  { key: 'new' as const, label: 'New', icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'inProgress' as const, label: 'In Progress', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'due' as const, label: 'Due', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { key: 'completed' as const, label: 'Completed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
];

export function WorkspaceSummaryCards({ summary }: WorkspaceSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const count = summary[card.key];
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
