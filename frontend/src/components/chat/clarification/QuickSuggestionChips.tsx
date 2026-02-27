import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickSuggestionChipsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export function QuickSuggestionChips({
  suggestions,
  onSuggestionClick,
}: QuickSuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  // Hide "Suggestions:" label when there's only one chip (e.g., just "Let AI decide")
  const showLabel = suggestions.length > 1;

  return (
    <div className="mt-2">
      {showLabel && <span className="text-xs text-gray-500 mr-2">Suggestions:</span>}
      <div className={cn("inline-flex flex-wrap gap-1.5", showLabel && "mt-1")}>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm',
              'bg-gray-100 hover:bg-violet-100 text-gray-600 hover:text-violet-700',
              'border border-gray-200 hover:border-violet-200',
              'cursor-pointer transition-colors'
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
