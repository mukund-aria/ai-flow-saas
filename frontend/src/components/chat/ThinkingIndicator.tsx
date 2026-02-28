import { Sparkles } from 'lucide-react';

interface ThinkingIndicatorProps {
  status?: 'thinking' | 'analyzing' | 'creating' | 'editing' | 'refining';
}

// Simple, professional status messages — no fake progress theater
const STATUS_LABELS: Record<string, string> = {
  thinking: 'Thinking...',
  analyzing: 'Analyzing...',
  creating: 'Designing your workflow...',
  editing: 'Updating your workflow...',
  refining: 'Refining your workflow...',
};

export function ThinkingIndicator({ status = 'thinking' }: ThinkingIndicatorProps) {
  const label = STATUS_LABELS[status] || STATUS_LABELS.thinking;

  return (
    <div className="flex gap-3 py-4">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/25">
        <Sparkles className="w-4 h-4 animate-pulse" />
      </div>

      {/* Status display */}
      <div className="flex-1 max-w-sm">
        <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
            </div>
            <span className="text-base text-gray-600 font-medium">
              {label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
