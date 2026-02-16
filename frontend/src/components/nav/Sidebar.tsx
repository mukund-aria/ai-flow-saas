/**
 * Sidebar Navigation
 *
 * Main navigation sidebar for the Coordinator Portal.
 * Inspired by Action Hub design with org selector and nav items.
 */

import { NavLink } from 'react-router-dom';
import {
  Home,
  FileText,
  PlayCircle,
  BarChart3,
  Users,
  Calendar,
  Plug,
  Plus,
  Settings,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { GettingStartedChecklist } from '@/components/onboarding/GettingStartedChecklist';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

function NavItem({ to, icon, label, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-violet-100 text-violet-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 text-xs font-semibold bg-violet-100 text-violet-700 rounded-full">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();

  // Placeholder counts (will be fetched from API later)
  const flowCount = 0;
  const runCount = 0;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Organization Header */}
      <div className="p-4 border-b border-gray-200">
        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.name || 'My Organization'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'Free Plan'}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Create Flow Button */}
      <div className="p-4">
        <NavLink
          to="/flows/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create flow
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <NavItem to="/home" icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem
          to="/flows"
          icon={<FileText className="w-5 h-5" />}
          label="Flow Templates"
          badge={flowCount}
        />
        <NavItem
          to="/runs"
          icon={<PlayCircle className="w-5 h-5" />}
          label="Flows"
          badge={runCount}
        />
        <NavItem
          to="/reports"
          icon={<BarChart3 className="w-5 h-5" />}
          label="Reports"
        />

        {/* Divider */}
        <div className="my-3 border-t border-gray-200" />

        <NavItem
          to="/contacts"
          icon={<Users className="w-5 h-5" />}
          label="Contacts"
        />
        <NavItem
          to="/schedules"
          icon={<Calendar className="w-5 h-5" />}
          label="Schedules"
        />
        <NavItem
          to="/integrations"
          icon={<Plug className="w-5 h-5" />}
          label="Integrations"
        />
      </nav>

      {/* Onboarding Checklist */}
      <GettingStartedChecklist />

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200">
        <NavItem
          to="/settings"
          icon={<Settings className="w-5 h-5" />}
          label="Settings"
        />

        {/* User Profile */}
        {user && (
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2 mt-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                {user.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500">Sign out</p>
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
