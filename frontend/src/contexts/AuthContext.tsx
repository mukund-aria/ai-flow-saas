/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the app.
 * Extended with organization info for multi-tenant support.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

// ============================================================================
// Types
// ============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  activeOrganizationId?: string | null;
  organizationName?: string | null;
  role?: string | null;
  needsOnboarding?: boolean;
  authMethod?: 'google' | 'otp' | 'saml';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  switchOrg: (organizationId: string) => Promise<void>;
}

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================

// Auth routes are at /auth/*, API routes are at /api/*
const AUTH_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${AUTH_BASE}/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = async () => {
    try {
      await fetch(`${AUTH_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      window.location.href = '/';
    }
  };

  const switchOrg = async (organizationId: string) => {
    try {
      const response = await fetch(`${API_BASE}/organizations/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ organizationId }),
      });

      if (response.ok) {
        // Re-check auth to get updated user
        await checkAuth();
      } else {
        const data = await response.json();
        // Handle SSO re-auth requirement
        if (data.error?.code === 'SSO_REAUTH_REQUIRED' && data.error?.ssoLoginUrl) {
          window.location.href = data.error.ssoLoginUrl;
          return;
        }
      }
    } catch (err) {
      console.error('Org switch error:', err);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        logout,
        checkAuth,
        switchOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
