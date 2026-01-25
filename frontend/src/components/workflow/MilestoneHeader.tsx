import { Flag } from 'lucide-react';

interface MilestoneHeaderProps {
  name: string;
}

export function MilestoneHeader({ name }: MilestoneHeaderProps) {
  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex-1 border-t border-dashed border-gray-300" />
      <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
        <Flag className="w-3 h-3 text-amber-600" />
        <span className="text-xs font-medium text-amber-700">{name}</span>
      </div>
      <div className="flex-1 border-t border-dashed border-gray-300" />
    </div>
  );
}
