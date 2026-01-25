import { Plus } from 'lucide-react';

interface StepConnectorProps {
  showAddButton?: boolean;
  onAdd?: () => void;
}

export function StepConnector({ showAddButton = false, onAdd }: StepConnectorProps) {
  return (
    <div className="flex flex-col items-center py-1 group">
      {/* Vertical line */}
      <div className="w-0.5 h-4 bg-gray-300" />

      {/* Add button (shows on hover) */}
      {showAddButton && (
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-blue-500 hover:text-blue-500"
        >
          <Plus className="w-3 h-3" />
        </button>
      )}

      {/* Vertical line (only if add button shown) */}
      {showAddButton && <div className="w-0.5 h-4 bg-gray-300" />}
    </div>
  );
}
