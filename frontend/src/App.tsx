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

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CoordinatorLayout } from '@/layouts/CoordinatorLayout';
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
  // LandingPage,
  // FlowPreviewPage,
  OnboardingPage,
  OrgSelectPage,
  OrgSetupPage,
  TeamPage,
  AssigneeTaskPage,
  FormBuilderPage,
} from '@/pages';
import { TemplateDetailPage } from '@/pages/TemplateDetailPage';
import { EmbedStartPage } from '@/pages/EmbedStartPage';

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
// App Routes
// ============================================================================

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
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
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="team" element={<TeamPage />} />
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
