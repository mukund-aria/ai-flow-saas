/**
 * Acknowledgement Step
 *
 * Confirm acknowledgement button.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AcknowledgementStepProps {
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function AcknowledgementStep({ onSubmit, isSubmitting }: AcknowledgementStepProps) {
  return (
    <div>
      <p className="text-sm text-gray-600 text-center mb-4">
        Please confirm you have reviewed this information.
      </p>
      <Button
        onClick={() => onSubmit({ acknowledged: true })}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        I Acknowledge
      </Button>
    </div>
  );
}
