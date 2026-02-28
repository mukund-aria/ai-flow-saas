import { useRef, useEffect, useCallback } from 'react';
import type { KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function OTPInput({ length = 6, onComplete, disabled = false, error = false }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Reset shake animation after it plays
  useEffect(() => {
    if (!error) return;
    const timeout = setTimeout(() => {
      // shake animation lasts ~500ms, no-op here; parent controls error state
    }, 500);
    return () => clearTimeout(timeout);
  }, [error]);

  const getCode = useCallback(() => {
    return inputsRef.current.map((input) => input?.value || '').join('');
  }, []);

  const triggerComplete = useCallback(() => {
    const code = getCode();
    if (code.length === length) {
      onComplete(code);
    }
  }, [getCode, length, onComplete]);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Only allow single digit
    if (value.length > 1) {
      e.target.value = value.slice(-1);
    }

    // Only allow digits
    if (!/^\d*$/.test(e.target.value)) {
      e.target.value = '';
      return;
    }

    // Move to next input
    if (e.target.value && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    triggerComplete();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const input = inputsRef.current[index];
      if (input && !input.value && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputsRef.current[index - 1]?.focus();
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (!pastedData) return;

    pastedData.split('').forEach((char, i) => {
      const input = inputsRef.current[i];
      if (input) {
        input.value = char;
      }
    });

    // Focus the next empty input, or last filled one
    const nextEmpty = pastedData.length < length ? pastedData.length : length - 1;
    inputsRef.current[nextEmpty]?.focus();

    triggerComplete();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div
      className={`flex items-center justify-center gap-2.5 ${error ? 'animate-shake' : ''}`}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => { inputsRef.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={handleFocus}
          autoComplete="one-time-code"
          className={`
            w-12 h-14 text-center text-xl font-semibold
            rounded-xl border-2 outline-none
            transition-all duration-200
            ${disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : error
                ? 'border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-gray-200 bg-white text-gray-900 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 hover:border-gray-300'
            }
          `}
        />
      ))}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
