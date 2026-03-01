/**
 * ServiceFlow - Main Application
 *
 * Routes:
 * Public:
 * - / : Landing page (public)
 * - /preview : Flow preview page (public)
 * - /login : Login page
 *
 * Protected (Coordinator Portal):
 * - /home : Dashboard with AI prompt
 * - /templates : Templates list (workflow blueprints)
 * - /templates/new : AI template builder
 * - /templates/:id : Template detail (edit)
 * - /flows : Flows list (active instances)
 * - /flows/:id : Flow detail
 * - /reports : Analytics dashboard
 * - /contacts : Contact management
 * - /schedules : Coming soon
 * - /integrations : Coming soon
 * - /settings : Settings
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AssigneeAuthProvider } from '@/contexts/AssigneeAuthContext';
import { CoordinatorLayout } from '@/layouts/CoordinatorLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminOrgDetail } from '@/pages/admin/AdminOrgDetail';
import { AdminSettings } from '@/pages/admin/AdminSettings';
// import { PublicLayout } from '@/layouts/PublicLayout';
import {
  HomePage,
  FlowsPage,
  FlowBuilderPage,
  FlowRunsPage,
  FlowRunDetailPage,
  ReportsPage,
  ContactsPage,
  SchedulesPage,
  IntegrationsPage,
  SettingsPage,
  LoginPage,
  LandingPage,
  FlowPreviewPage,
  OnboardingPage,
  OrgSelectPage,
  OrgSetupPage,
  TeamPage,
  AssigneeTaskPage,
  FormBuilderPage,
  AccountsPage,
  AccountDetailPage,
} from '@/pages';
import { TemplateDetailPage } from '@/pages/TemplateDetailPage';
import { EmbedStartPage } from '@/pages/EmbedStartPage';
import { PortalLoginPage } from '@/pages/portal/PortalLoginPage';
import { PortalLayout } from '@/pages/portal/PortalLayout';
import { PortalDashboardPage } from '@/pages/portal/PortalDashboardPage';
import { PortalFlowCatalogPage } from '@/pages/portal/PortalFlowCatalogPage';

// ============================================================================
// Protected Route Component
// ============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // In development without auth configured, allow access
  const isDev = import.meta.env.DEV;
  if (isDev && !isAuthenticated) {
    return <>{children}</>;
  }

  // In production, redirect to login with returnTo
  if (!isAuthenticated) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  // Redirect to onboarding if user needs it (in production)
  if (!import.meta.env.DEV && user?.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// Admin Route Guard
// ============================================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSysadmin, setIsSysadmin] = useState<boolean | null>(null);

  useEffect(() => {
    // In dev mode, bypass sysadmin check
    if (import.meta.env.DEV) {
      setIsSysadmin(true);
      return;
    }

    if (!isAuthenticated) return;

    fetch(`${API_BASE}/admin/me`, { credentials: 'include' })
      .then(res => {
        setIsSysadmin(res.ok);
      })
      .catch(() => setIsSysadmin(false));
  }, [isAuthenticated]);

  if (isLoading || isSysadmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!isSysadmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// App Routes
// ============================================================================

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/preview" element={<FlowPreviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/org-select"
        element={
          <ProtectedRoute>
            <OrgSelectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/org-setup"
        element={
          <ProtectedRoute>
            <OrgSetupPage />
          </ProtectedRoute>
        }
      />
      <Route path="/task/:token" element={<AssigneeTaskPage />} />
      <Route path="/embed/:embedId" element={<EmbedStartPage />} />

      {/* Assignee Portal Routes */}
      <Route path="/portal/:slug/login" element={<AssigneeAuthProvider><PortalLoginPage /></AssigneeAuthProvider>} />
      <Route path="/portal/:slug" element={<AssigneeAuthProvider><PortalLayout /></AssigneeAuthProvider>}>
        <Route index element={<PortalDashboardPage />} />
        <Route path="start" element={<PortalFlowCatalogPage />} />
      </Route>

      {/* Protected Routes - Coordinator Portal */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <CoordinatorLayout />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
      </Route>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <CoordinatorLayout />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      >
        <Route path="templates" element={<FlowsPage />} />
        <Route path="templates/new" element={<FlowBuilderPage />} />
        <Route path="templates/:id" element={<FlowBuilderPage />} />
        <Route path="templates/:id/form/:stepId" element={<FormBuilderPage />} />
        <Route path="templates/:id/detail" element={<TemplateDetailPage />} />
        <Route path="flows" element={<FlowRunsPage />} />
        <Route path="flows/:id" element={<FlowRunDetailPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/:id" element={<AccountDetailPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>

      {/* Admin Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="orgs/:id" element={<AdminOrgDetail />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================================================================
// App Entry Point
// ============================================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
