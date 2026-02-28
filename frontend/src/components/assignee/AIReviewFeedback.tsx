import { AlertTriangle } from 'lucide-react';
import type { AIReviewResult } from '@/types';

interface AIReviewFeedbackProps {
  result: AIReviewResult;
}

export function AIReviewFeedback({ result }: AIReviewFeedbackProps) {
  if (result.status !== 'REVISION_NEEDED') return null;

  return (
    <div className="mb-4 border border-amber-200 rounded-lg bg-amber-50 overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-700">Revision Needed</span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{result.feedback}</p>

        {result.issues && result.issues.length > 0 && (
          <ul className="space-y-1">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">&#8226;</span>
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
