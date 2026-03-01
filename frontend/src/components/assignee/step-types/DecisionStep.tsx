/**
 * Decision Step
 *
 * Multiple outcome choice buttons.
 */

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DecisionStepProps {
  outcomes: Array<{ outcomeId: string; label: string }>;
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function DecisionStep({ outcomes, onSubmit, isSubmitting }: DecisionStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center mb-4">Select your decision:</p>
      <div className="space-y-2">
        {outcomes.map((outcome, i) => (
          <Button
            key={outcome.outcomeId}
            data-testid={`decision-${outcome.outcomeId}`}
            onClick={() => onSubmit({ decision: outcome.label, outcomeId: outcome.outcomeId })}
            disabled={isSubmitting}
            variant={i === 0 ? 'default' : 'outline'}
            className={`w-full h-11 text-base ${i === 0 ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {outcome.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
