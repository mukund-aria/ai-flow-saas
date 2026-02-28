/**
 * Admin Layout
 *
 * Shell for the sysadmin portal with sticky header, tabs, and outlet.
 */

import { Outlet, NavLink, Link } from 'react-router-dom';
import { Building2, Settings, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-gray-900">ServiceFlow</span>
            <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>

          {/* Tabs */}
          <nav className="flex items-center gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              Organizations
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-violet-50 text-violet-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Settings className="w-4 h-4" />
              Settings
            </NavLink>
          </nav>

          {/* User + back link */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Link
              to="/home"
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              Back to app
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
