import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SpeechError } from '@/hooks/useSpeechRecognition';

interface VoiceButtonProps {
  /** Whether currently listening */
  isListening: boolean;
  /** Current error state */
  error: SpeechError | null;
  /** Called when user clicks the button */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(error: SpeechError): string {
  switch (error) {
    case 'not-allowed':
    case 'no-permission':
      return 'Microphone access needed. Click to enable in browser settings.';
    case 'audio-capture':
      return 'No microphone found. Please connect one and try again.';
    case 'network':
      return 'Network error. Please check your connection.';
    case 'not-supported':
      return 'Voice input not supported in this browser.';
    default:
      return "Couldn't hear that. Try again?";
  }
}

export function VoiceButton({ isListening, error, onClick, disabled }: VoiceButtonProps) {
  const hasError = error && error !== 'aborted';
  const errorMessage = hasError ? getErrorMessage(error) : null;

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={disabled}
        title={errorMessage || (isListening ? 'Stop recording' : 'Start voice input')}
        className={cn(
          'shrink-0 p-2 rounded-xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-purple-200',
          // Default state
          !isListening && !hasError && 'text-gray-400 hover:text-purple-500 hover:bg-purple-50',
          // Listening state - pulsing red
          isListening && 'text-white bg-red-500 hover:bg-red-600 animate-pulse',
          // Error state
          hasError && 'text-red-500 hover:text-red-600 hover:bg-red-50'
        )}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {hasError ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Error tooltip */}
      {hasError && (
        <div className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2',
          'bg-gray-900 text-white text-xs rounded-lg shadow-lg',
          'whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity',
          'pointer-events-none z-50'
        )}>
          {errorMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}

      {/* Listening indicator ring */}
      {isListening && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-red-400 opacity-25" />
      )}
    </div>
  );
}
