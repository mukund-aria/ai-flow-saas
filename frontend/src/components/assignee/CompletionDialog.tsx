/**
 * Completion Dialog
 *
 * Modal overlay shown when a step is completed.
 * Shows success message with option to continue to next step.
 * Dismissible so the user can review their submission.
 */

import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompletionDialogProps {
  contactName?: string;
  nextTaskToken?: string | null;
  portalSlug?: string | null;
  onContinue: () => void;
  onDismiss?: () => void;
}

export function CompletionDialog({ contactName, nextTaskToken, portalSlug, onContinue, onDismiss }: CompletionDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed backdrop - click to dismiss */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Dialog content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step completed!</h2>
          <p className="text-gray-500 mb-6">
            Thank you{contactName ? `, ${contactName}` : ''}! Your response has been recorded.
          </p>

          {nextTaskToken ? (
            <Button
              onClick={onContinue}
              className="bg-blue-600 hover:bg-blue-700 h-11 text-base px-8"
            >
              Continue to next step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                We'll notify you when the next step is ready.
              </p>
              <p className="text-xs text-gray-400">
                You can close this window.
              </p>
            </div>
          )}

          {/* Portal sign-in prompt */}
          {portalSlug && (
            <p className="mt-4 text-xs text-gray-400">
              Want to track all your tasks?{' '}
              <a
                href={`/portal/${portalSlug}/login`}
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Sign in to your portal &rarr;
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
