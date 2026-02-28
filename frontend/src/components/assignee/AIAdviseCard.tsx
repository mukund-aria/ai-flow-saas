import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import type { AIAdviseResult } from '@/types';

interface AIAdviseCardProps {
  result: AIAdviseResult;
}

export function AIAdviseCard({ result }: AIAdviseCardProps) {
  const [showReasoning, setShowReasoning] = useState(false);

  if (result.status === 'FAILED') return null;

  return (
    <div className="mb-4 border-l-4 border-violet-400 bg-violet-50/50 rounded-r-lg overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-violet-500" />
          <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">AI Recommendation</span>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed">{result.recommendation}</p>

        <button
          onClick={() => setShowReasoning(!showReasoning)}
          className="mt-2 text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1"
        >
          {showReasoning ? 'Hide reasoning' : 'Show reasoning'}
          {showReasoning ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showReasoning && (
          <div className="mt-2 text-xs text-gray-600 bg-white/60 rounded-md p-3 border border-violet-100">
            {result.reasoning}
          </div>
        )}
      </div>
    </div>
  );
}
