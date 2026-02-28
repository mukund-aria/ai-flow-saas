/**
 * Login Page
 *
 * Simple login page with Google OAuth sign-in button.
 * Supports returnTo query param for post-auth redirect.
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const returnTo = searchParams.get('returnTo');

  // Redirect to returnTo or /home if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const destination = returnTo || '/home';
      navigate(destination);
    }
  }, [isAuthenticated, isLoading, navigate, returnTo]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Build Google auth URL with returnTo
  const googleAuthUrl = returnTo
    ? `/auth/google?returnTo=${encodeURIComponent(returnTo)}`
    : '/auth/google';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
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
          <p className="mt-2 text-gray-600">
            Build workflows with AI
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Error Message */}
          {error === 'unauthorized' && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="font-medium">Access Denied</span>
              </div>
              <p className="mt-1 text-sm text-red-600">
                Your email is not authorized to access this application.
              </p>
            </div>
          )}

          {/* Sign In Button */}
          <a
            href={googleAuthUrl}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 rounded-xl shadow-sm bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 group"
          >
            {/* Google Icon */}
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
            <span className="font-medium text-gray-700 group-hover:text-gray-900">
              Sign in with Google
            </span>
          </a>

          {/* Divider */}
          <div className="my-6 border-t border-gray-100" />

          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Access is restricted to authorized users.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Contact your administrator if you need access.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          AI-powered workflow builder
        </p>
      </div>
    </div>
  );
}
