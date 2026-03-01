import { Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';

interface StepConnectorProps {
  showAddButton?: boolean;
  onAdd?: () => void;
  /** Unique ID for this drop zone (e.g., "drop-zone-3"). If provided, connector is a palette drop target. */
  dropId?: string;
}

export function StepConnector({ showAddButton = false, onAdd, dropId }: StepConnectorProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: dropId || 'connector-noop',
    disabled: !dropId,
  });

  return (
    <div
      ref={dropId ? setNodeRef : undefined}
      className={`flex flex-col items-center py-0.5 group transition-all ${
        isOver ? 'py-2' : ''
      }`}
    >
      {/* Top endpoint dot */}
      <div className={`w-1 h-1 rounded-full ${isOver ? 'bg-violet-400' : 'bg-gray-400'}`} />

      {/* Solid vertical line */}
      <div className={`w-[2px] h-8 ${isOver ? 'bg-violet-400' : 'bg-gray-400'}`} />

      {/* Drop indicator when dragging from palette */}
      {isOver && (
        <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-medium border-2 border-dashed border-violet-400 animate-in fade-in duration-200">
          Drop here
        </div>
      )}

      {/* Add button (always visible at low opacity, prominent on hover) */}
      {showAddButton && !isOver && (
        <button
          onClick={onAdd}
          className="w-9 h-9 rounded-full border-2 border-solid border-gray-300 bg-white flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:border-violet-400 group-hover:text-violet-500 transition-all hover:bg-violet-50 hover:shadow-sm hover:scale-110"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}

      {/* Solid vertical line (bottom segment) */}
      <div className={`w-[2px] h-8 ${isOver ? 'bg-violet-400' : 'bg-gray-400'}`} />

      {/* Bottom endpoint dot */}
      <div className={`w-1 h-1 rounded-full ${isOver ? 'bg-violet-400' : 'bg-gray-400'}`} />
    </div>
  );
}
