/**
 * Login Page
 *
 * Two-step OTP login flow with Google OAuth fallback.
 * Step 1: Email input
 * Step 2: 6-digit OTP verification
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOTPAuth } from '@/hooks/useOTPAuth';
import { OTPInput } from '@/components/auth/OTPInput';

export function LoginPage() {
  const { isAuthenticated, isLoading: authLoading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get('error');
  const returnTo = searchParams.get('returnTo');
  const invite = searchParams.get('invite');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const {
    step,
    error: otpError,
    countdown,
    isLoading,
    sendOTP,
    verifyOTP,
    resendOTP,
    goBack,
    clearError,
  } = useOTPAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(returnTo || '/home');
    }
  }, [isAuthenticated, authLoading, navigate, returnTo]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600" />
      </div>
    );
  }

  // Build Google auth URL with query params
  const googleParams = new URLSearchParams();
  if (returnTo) googleParams.set('returnTo', returnTo);
  if (invite) googleParams.set('invite', invite);
  const googleAuthUrl = `/auth/google${googleParams.toString() ? `?${googleParams.toString()}` : ''}`;

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    clearError();
    await sendOTP(email);
  };

  const handleOTPComplete = async (code: string) => {
    const result = await verifyOTP(email, code);
    if (result) {
      await checkAuth();
      navigate(returnTo || result.redirectTo || '/home');
    }
  };

  const handleResend = async () => {
    clearError();
    await resendOTP(email);
  };

  const handleGoBack = () => {
    goBack();
    setEmailError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ServiceFlow</h1>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'email' && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              emailError={emailError}
              otpError={otpError}
              urlError={urlError}
              isLoading={isLoading}
              googleAuthUrl={googleAuthUrl}
              onSubmit={handleEmailSubmit}
            />
          )}

          {(step === 'otp' || step === 'verifying') && (
            <OTPStep
              email={email}
              error={otpError}
              countdown={countdown}
              isVerifying={step === 'verifying'}
              onComplete={handleOTPComplete}
              onResend={handleResend}
              onGoBack={handleGoBack}
            />
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">Signing you in...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          AI-powered workflow builder
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// EmailStep
// ============================================================================

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  emailError: string;
  otpError: string | null;
  urlError: string | null;
  isLoading: boolean;
  googleAuthUrl: string;
  onSubmit: (e: React.FormEvent) => void;
}

function EmailStep({
  email,
  setEmail,
  emailError,
  otpError,
  urlError,
  isLoading,
  googleAuthUrl,
  onSubmit,
}: EmailStepProps) {
  const displayError = emailError || otpError;

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Sign in to ServiceFlow</h2>
        <p className="mt-1 text-sm text-gray-500">Enter your email to get started</p>
      </div>

      {/* Unauthorized error from URL */}
      {urlError === 'unauthorized' && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium">Access Denied</span>
          </div>
          <p className="mt-1 text-xs text-red-600 ml-6">
            Your email is not authorized to access this application.
          </p>
        </div>
      )}

      {/* Email form */}
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            autoFocus
            disabled={isLoading}
            className={`
              w-full px-4 py-3 rounded-xl border-2 outline-none text-sm
              transition-all duration-200
              ${displayError
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 hover:border-gray-300'
              }
              disabled:bg-gray-50 disabled:text-gray-400
            `}
          />
          {displayError && (
            <p className="mt-1.5 text-xs text-red-600">{displayError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full py-3 px-4 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-violet-600 to-indigo-600
            hover:from-violet-700 hover:to-indigo-700
            focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            shadow-sm hover:shadow-md
          "
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending code...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      {/* Google sign-in */}
      <a
        href={googleAuthUrl}
        className="
          w-full flex items-center justify-center gap-3 px-4 py-3
          border-2 border-gray-200 rounded-xl
          bg-white hover:bg-gray-50 hover:border-gray-300
          transition-all duration-200 group
        "
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
          Continue with Google
        </span>
      </a>
    </>
  );
}

// ============================================================================
// OTPStep
// ============================================================================

interface OTPStepProps {
  email: string;
  error: string | null;
  countdown: number;
  isVerifying: boolean;
  onComplete: (code: string) => void;
  onResend: () => void;
  onGoBack: () => void;
}

function OTPStep({
  email,
  error,
  countdown,
  isVerifying,
  onComplete,
  onResend,
  onGoBack,
}: OTPStepProps) {
  return (
    <>
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-violet-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
        <p className="mt-1 text-sm text-gray-500">
          We sent a 6-digit code to <span className="font-semibold text-gray-700">{email}</span>
        </p>
      </div>

      <div className="mb-5">
        <OTPInput
          onComplete={onComplete}
          disabled={isVerifying}
          error={!!error}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Verifying state */}
      {isVerifying && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
          <svg className="animate-spin h-4 w-4 text-violet-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying...
        </div>
      )}

      {/* Resend */}
      <div className="text-center mb-4">
        {countdown > 0 ? (
          <p className="text-sm text-gray-400">
            Resend code in {countdown}s
          </p>
        ) : (
          <button
            onClick={onResend}
            disabled={isVerifying}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 disabled:text-gray-400 transition-colors"
          >
            Resend code
          </button>
        )}
      </div>

      {/* Back link */}
      <div className="text-center">
        <button
          onClick={onGoBack}
          disabled={isVerifying}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300 transition-colors"
        >
          Use a different email
        </button>
      </div>
    </>
  );
}
