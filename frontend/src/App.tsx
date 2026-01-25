import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { WorkflowPanel } from '@/components/workflow/WorkflowPanel';
import { useChat } from '@/hooks/useChat';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/pages/LoginPage';

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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // In development without auth configured, allow access
  // Check if we're in development mode by trying to detect the Vite dev server
  const isDev = import.meta.env.DEV;
  if (isDev && !isAuthenticated) {
    // In development, allow access without auth for easier testing
    // The backend will also allow unauthenticated API access in dev mode
    return <>{children}</>;
  }

  // In production, redirect to login if not authenticated
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ============================================================================
// Main App Content
// ============================================================================

function MainApp() {
  const { startNewChat } = useChat();

  return (
    <AppLayout
      chatPanel={<ChatContainer />}
      workflowPanel={<WorkflowPanel />}
      onNewChat={startNewChat}
    />
  );
}

// ============================================================================
// App Routes
// ============================================================================

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
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
