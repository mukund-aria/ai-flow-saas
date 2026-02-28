import { useState, useRef, useEffect, useCallback } from 'react';
import { sendOTP, verifyOTP } from '@/lib/api';

export type OTPStep = 'email' | 'otp' | 'verifying' | 'success';

export interface UseOTPAuthReturn {
  step: OTPStep;
  error: string | null;
  countdown: number;
  isLoading: boolean;
  sendOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<{ redirectTo: string } | null>;
  resendOTP: (email: string) => Promise<void>;
  goBack: () => void;
  clearError: () => void;
}

export function useOTPAuth(): UseOTPAuthReturn {
  const [step, setStep] = useState<OTPStep>('email');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [countdown]);

  const handleSendOTP = useCallback(async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await sendOTP(email);
      setCountdown(60);
      setStep('otp');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send code.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVerifyOTP = useCallback(async (email: string, code: string): Promise<{ redirectTo: string } | null> => {
    try {
      setStep('verifying');
      setError(null);
      const result = await verifyOTP(email, code);
      setStep('success');
      return { redirectTo: result.redirectTo };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setError(message);
      setStep('otp');
      return null;
    }
  }, []);

  const handleResendOTP = useCallback(async (email: string) => {
    if (countdown > 0) return;
    await handleSendOTP(email);
  }, [countdown, handleSendOTP]);

  const goBack = useCallback(() => {
    setStep('email');
    setError(null);
    setCountdown(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    step,
    error,
    countdown,
    isLoading,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    resendOTP: handleResendOTP,
    goBack,
    clearError,
  };
}
