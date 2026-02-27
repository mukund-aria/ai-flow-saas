/**
 * Web App Step
 *
 * External application link with completion button.
 */

import { Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebAppStepProps {
  onSubmit: (resultData: Record<string, unknown>) => void;
  isSubmitting: boolean;
}

export function WebAppStep({ onSubmit, isSubmitting }: WebAppStepProps) {
  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <ExternalLink className="w-8 h-8 text-blue-500 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">Complete this step in the external application</p>
        <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Open Application <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
      <Button
        onClick={() => onSubmit({ completed: true })}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
      >
        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Mark Complete
      </Button>
    </div>
  );
}
