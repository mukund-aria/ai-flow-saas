/**
 * Generic Step
 *
 * Fallback for TODO and unrecognized step types.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenericStepProps {
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function GenericStep({ onSubmit, isSubmitting }: GenericStepProps) {
  return (
    <Button
      onClick={() => onSubmit({ completed: true })}
      disabled={isSubmitting}
      className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
    >
      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      Complete
    </Button>
  );
}
