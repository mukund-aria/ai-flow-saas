/**
 * Custom Action Step
 *
 * Multiple option buttons for custom actions.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomActionStepProps {
  options: Array<{ optionId: string; label: string }>;
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function CustomActionStep({ options, onSubmit, isSubmitting }: CustomActionStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center mb-4">Choose an option:</p>
      <div className="space-y-2">
        {options.map((option, i) => (
          <Button
            key={option.optionId}
            onClick={() => onSubmit({ selectedOption: option.label, optionId: option.optionId })}
            disabled={isSubmitting}
            variant={i === 0 ? 'default' : 'outline'}
            className={`w-full h-11 text-base ${i === 0 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
