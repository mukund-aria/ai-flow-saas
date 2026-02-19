/**
 * Sidebar Navigation
 *
 * Main navigation sidebar for the Coordinator Portal.
 */

import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  PlayCircle,
  BarChart3,
  Calendar,
  Plug,
  Plus,
  Settings,
  LogOut,
  RotateCcw,
  Play,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { OrgSwitcher } from './OrgSwitcher';
import { NotificationBell } from './NotificationBell';
import { NotificationPanel } from './NotificationPanel';
import { listTemplates, startFlow, type Template } from '@/lib/api';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavItem({ to, icon, label }: NavItemProps) {
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
    </NavLink>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStartFlow, setShowStartFlow] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const startFlowRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Close start flow dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (startFlowRef.current && !startFlowRef.current.contains(e.target as Node)) {
        setShowStartFlow(false);
      }
    }
    if (showStartFlow) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showStartFlow]);

  // Fetch published templates when dropdown opens
  useEffect(() => {
    if (showStartFlow) {
      setIsLoadingTemplates(true);
      listTemplates()
        .then((data) => setTemplates(data.filter((t) => t.status === 'ACTIVE')))
        .catch(() => setTemplates([]))
        .finally(() => setIsLoadingTemplates(false));
    }
  }, [showStartFlow]);

  const handleStartFlow = async (template: Template) => {
    try {
      setStartingTemplateId(template.id);
      const runName = `${template.name} - ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}`;
      const flow = await startFlow(template.id, runName);
      useOnboardingStore.getState().completeStartFlow();
      setShowStartFlow(false);
      navigate(`/flows/${flow.id}`);
    } catch {
      setStartingTemplateId(null);
    }
  };

  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
      {/* Organization Switcher */}
      <div className="p-4 border-b border-gray-200">
        <OrgSwitcher />
      </div>

      {/* Start Flow Button + Dropdown */}
      <div className="p-4 relative" ref={startFlowRef}>
        <button
          onClick={() => setShowStartFlow(!showStartFlow)}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Play className="w-4 h-4" />
          Start Flow
        </button>

        {/* Start Flow Dropdown */}
        {showStartFlow && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
              </div>
            ) : templates.length > 0 ? (
              <div className="max-h-64 overflow-y-auto py-1">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleStartFlow(template)}
                    disabled={startingTemplateId === template.id}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <PlayCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    <span className="truncate text-gray-700">{template.name}</span>
                    {startingTemplateId === template.id && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500 ml-auto flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-gray-400">
                No published templates yet
              </div>
            )}

            {/* Divider + Create new template */}
            <div className="border-t border-gray-100">
              <button
                onClick={() => {
                  setShowStartFlow(false);
                  navigate('/templates/new');
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-violet-600 hover:bg-violet-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create new template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <NavItem to="/home" icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem to="/flows" icon={<PlayCircle className="w-5 h-5" />} label="Flows" />
        <NavItem to="/templates" icon={<FileText className="w-5 h-5" />} label="Templates" />
        <NavItem to="/reports" icon={<BarChart3 className="w-5 h-5" />} label="Reports" />
        <NavItem to="/schedules" icon={<Calendar className="w-5 h-5" />} label="Schedules" />
        <NavItem to="/integrations" icon={<Plug className="w-5 h-5" />} label="Integrations" />
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-200">
        <div className="relative">
          <NotificationBell />
          <NotificationPanel />
        </div>
        <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />

        {/* User Profile with Popover Menu */}
        {user && (
          <div className="relative mt-2" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors"
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
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </button>

            {/* Popover Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      resetOnboarding();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                    Restart onboarding tour
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
