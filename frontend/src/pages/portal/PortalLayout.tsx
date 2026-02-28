/**
 * Portal Layout
 *
 * Shared layout for the assignee portal with branded header and footer.
 */

import { Outlet, Navigate, useParams } from 'react-router-dom';
import { useAssigneeAuth } from '@/contexts/AssigneeAuthContext';
import { PortalHeader } from '@/components/portal/PortalHeader';
import { PortalFooter } from '@/components/portal/PortalFooter';
import { Loader2 } from 'lucide-react';

export function PortalLayout() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading } = useAssigneeAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/portal/${slug}/login`} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PortalHeader />
      <main className="flex-1 p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <Outlet />
      </main>
      <PortalFooter />
    </div>
  );
}
