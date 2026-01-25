/**
 * AI Flow SaaS - Main Application
 *
 * Routes:
 * - / : Home page with AI prompt
 * - /flows : Flow templates list
 * - /flows/new : AI flow builder
 * - /flows/:id : Flow detail (edit)
 * - /runs : Flow runs list
 * - /runs/:id : Flow run detail
 * - /reports : Analytics dashboard
 * - /contacts : Contact management
 * - /schedules : Coming soon
 * - /integrations : Coming soon
 * - /settings : Settings
 * - /login : Login page
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CoordinatorLayout } from '@/layouts/CoordinatorLayout';
import {
  HomePage,
  FlowsPage,
  FlowBuilderPage,
  FlowRunsPage,
  ReportsPage,
  ContactsPage,
  SchedulesPage,
  IntegrationsPage,
  SettingsPage,
  LoginPage,
} from '@/pages';

// ============================================================================
// Protected Route Component
// ============================================================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

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
    // In development, allow access without auth for easier testing
    return <>{children}</>;
  }

  // In production, redirect to login if not authenticated
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ============================================================================
// App Routes
// ============================================================================

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes - Coordinator Portal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="flows" element={<FlowsPage />} />
        <Route path="flows/new" element={<FlowBuilderPage />} />
        <Route path="flows/:id" element={<FlowBuilderPage />} />
        <Route path="runs" element={<FlowRunsPage />} />
        <Route path="runs/:id" element={<FlowRunsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="contacts" element={<ContactsPage />} />
        <Route path="schedules" element={<SchedulesPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
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
