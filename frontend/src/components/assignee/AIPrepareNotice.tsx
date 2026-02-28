import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { AIPrepareResult } from '@/types';

interface AIPrepareNoticeProps {
  result: AIPrepareResult;
  fieldCount: number;
}

export function AIPrepareNotice({ result, fieldCount }: AIPrepareNoticeProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (result.status === 'FAILED') return null;

  const filledCount = Object.keys(result.prefilledFields).length;

  return (
    <div className="mb-4 border border-violet-200 rounded-lg bg-violet-50/50 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-700">
            AI pre-filled {filledCount} of {fieldCount} fields
          </span>
        </div>
        {result.reasoning && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1"
          >
            {showDetails ? 'Hide' : 'Details'}
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>
      {showDetails && result.reasoning && (
        <div className="px-4 pb-3 text-xs text-violet-600 border-t border-violet-100 pt-2">
          {result.reasoning}
        </div>
      )}
    </div>
  );
}
