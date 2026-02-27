/**
 * Approval Step
 *
 * Approve/Reject decision buttons.
 */

import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApprovalStepProps {
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function ApprovalStep({ onSubmit, isSubmitting }: ApprovalStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center mb-4">Please review and provide your decision.</p>
      <div className="flex gap-3">
        <Button
          onClick={() => onSubmit({ decision: 'APPROVED' })}
          disabled={isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 h-11 text-base gap-2"
        >
          <ThumbsUp className="w-4 h-4" /> Approve
        </Button>
        <Button
          onClick={() => onSubmit({ decision: 'REJECTED' })}
          disabled={isSubmitting}
          variant="outline"
          className="flex-1 h-11 text-base gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <ThumbsDown className="w-4 h-4" /> Reject
        </Button>
      </div>
    </div>
  );
}
