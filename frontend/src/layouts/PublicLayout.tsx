/**
 * Public Layout
 *
 * Layout for public-facing pages (Landing, Preview).
 * Transparent nav with logo and auth buttons.
 */

import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function PublicLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">ServiceFlow</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-9 bg-gray-100 rounded-lg animate-pulse" />
            ) : isAuthenticated ? (
              <Link
                to="/home"
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <Outlet />
    </div>
  );
}
