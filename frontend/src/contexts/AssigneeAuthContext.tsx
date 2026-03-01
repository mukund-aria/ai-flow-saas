/**
 * Assignee Auth Context
 *
 * Manages portal-authenticated assignee sessions via Bearer token.
 * Token is stored in localStorage. Auto-validates on mount.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getPortalMe, portalSendOTP, portalVerifyOTP, getPortalInfo } from '@/lib/api';
import type { PortalBranding, PortalSettings } from '@/types';

interface AssigneeContact {
  id: string;
  name: string;
  email: string;
}

interface PortalInfo {
  name: string;
  slug: string;
  branding?: PortalBranding;
  settings?: PortalSettings;
}

interface AssigneeAuthState {
  contact: AssigneeContact | null;
  portal: PortalInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (slug: string, email: string) => Promise<void>;
  verify: (slug: string, email: string, code: string) => Promise<void>;
  logout: () => void;
  loadPortalInfo: (slug: string) => Promise<PortalInfo | null>;
}

const TOKEN_KEY = 'sf_assignee_token';

const AssigneeAuthContext = createContext<AssigneeAuthState | null>(null);

export function AssigneeAuthProvider({ children }: { children: ReactNode }) {
  const [contact, setContact] = useState<AssigneeContact | null>(null);
  const [portal, setPortal] = useState<PortalInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount (check URL for ssoToken first)
  useEffect(() => {
    // Check for SSO token in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const ssoToken = urlParams.get('ssoToken');
    if (ssoToken) {
      // Store SSO token and clean URL
      localStorage.setItem(TOKEN_KEY, ssoToken);
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    }

    const activeToken = ssoToken || localStorage.getItem(TOKEN_KEY);
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    getPortalMe(activeToken)
      .then((data) => {
        setContact(data.contact);
        setPortal(data.portal);
        setToken(activeToken);
      })
      .catch(() => {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (slug: string, email: string) => {
    await portalSendOTP(slug, email);
  }, []);

  const verify = useCallback(async (slug: string, email: string, code: string) => {
    const result = await portalVerifyOTP(slug, email, code);
    localStorage.setItem(TOKEN_KEY, result.token);
    setToken(result.token);
    setContact(result.contact);

    // Fetch portal info
    const portalData = await getPortalInfo(slug);
    setPortal({ name: portalData.name, slug, branding: portalData.branding, settings: portalData.settings });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setContact(null);
    setPortal(null);
  }, []);

  const loadPortalInfo = useCallback(async (slug: string): Promise<PortalInfo | null> => {
    try {
      const data = await getPortalInfo(slug);
      const info = { name: data.name, slug, branding: data.branding, settings: data.settings };
      setPortal(info);
      return info;
    } catch {
      return null;
    }
  }, []);

  return (
    <AssigneeAuthContext.Provider
      value={{
        contact,
        portal,
        token,
        isAuthenticated: !!token && !!contact,
        isLoading,
        login,
        verify,
        logout,
        loadPortalInfo,
      }}
    >
      {children}
    </AssigneeAuthContext.Provider>
  );
}

export function useAssigneeAuth() {
  const ctx = useContext(AssigneeAuthContext);
  if (!ctx) throw new Error('useAssigneeAuth must be used within AssigneeAuthProvider');
  return ctx;
}
