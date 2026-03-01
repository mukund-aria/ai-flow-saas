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
  Users,
  Building2,
  LogOut,
  RotateCcw,
  Play,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';
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
  isCollapsed?: boolean;
  tooltip?: string;
}

function NavItem({ to, icon, label, isCollapsed, tooltip }: NavItemProps) {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isCollapsed && 'justify-center',
          isActive
            ? 'bg-violet-100 text-violet-900'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        )
      }
    >
      <span className="w-5 h-5">{icon}</span>
      {!isCollapsed && (
        tooltip ? (
          <FeatureTooltip content={tooltip} side="right">
            <span className="flex-1">{label}</span>
          </FeatureTooltip>
        ) : (
          <span className="flex-1">{label}</span>
        )
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar-collapsed', next.toString());
  };
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
    <aside className={cn(isCollapsed ? 'w-16' : 'w-56', 'bg-white border-r border-gray-200 flex flex-col transition-all duration-200')}>
      {/* Organization Switcher */}
      <div className={cn('border-b border-gray-200', isCollapsed ? 'p-2' : 'p-4')}>
        {isCollapsed ? (
          <div className="flex items-center justify-center" title={user?.organizationName || 'My Organization'}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {(user?.organizationName || 'M').charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <OrgSwitcher />
        )}
      </div>

      {/* Start Flow Button + Dropdown */}
      <div className={cn('relative', isCollapsed ? 'p-2' : 'p-4')} ref={startFlowRef}>
        <button
          onClick={() => setShowStartFlow(!showStartFlow)}
          title={isCollapsed ? 'Start Flow' : undefined}
          className={cn(
            'flex items-center justify-center w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors text-sm',
            isCollapsed ? 'px-2 py-2.5' : 'gap-2 px-4 py-2.5'
          )}
        >
          <Play className="w-4 h-4" />
          {!isCollapsed && 'Start Flow'}
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
      <nav className={cn('flex-1 py-2 space-y-1 overflow-y-auto', isCollapsed ? 'px-2' : 'px-3')}>
        <NavItem to="/home" icon={<Home className="w-5 h-5" />} label="Home" isCollapsed={isCollapsed} />
        <NavItem to="/flows" icon={<PlayCircle className="w-5 h-5" />} label="Flows" isCollapsed={isCollapsed} tooltip="Active workflow instances. Each flow is a running copy of a template." />
        <NavItem to="/templates" icon={<FileText className="w-5 h-5" />} label="Templates" isCollapsed={isCollapsed} tooltip="Reusable workflow blueprints. Build once, run many times." />
        <NavItem to="/contacts" icon={<Users className="w-5 h-5" />} label="Contacts" isCollapsed={isCollapsed} />
        <NavItem to="/accounts" icon={<Building2 className="w-5 h-5" />} label="Accounts" isCollapsed={isCollapsed} />
        <NavItem to="/reports" icon={<BarChart3 className="w-5 h-5" />} label="Reports" isCollapsed={isCollapsed} />
        <NavItem to="/schedules" icon={<Calendar className="w-5 h-5" />} label="Schedules" isCollapsed={isCollapsed} />
        <NavItem to="/integrations" icon={<Plug className="w-5 h-5" />} label="Integrations" isCollapsed={isCollapsed} />
      </nav>

      {/* Bottom Section */}
      <div className={cn('border-t border-gray-200', isCollapsed ? 'p-2' : 'p-3')}>
        <div className="relative">
          <NotificationBell isCollapsed={isCollapsed} />
          <NotificationPanel />
        </div>
        <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" isCollapsed={isCollapsed} />

        {/* User Profile with Popover Menu */}
        {user && (
          <div className="relative mt-2" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={isCollapsed ? user.name : undefined}
              className={cn(
                'flex items-center w-full rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors',
                isCollapsed ? 'justify-center px-1 py-2' : 'gap-3 px-3 py-2'
              )}
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium flex-shrink-0">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              )}
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

        {/* Collapse Toggle */}
        <button onClick={toggleCollapsed} className="flex items-center justify-center w-full py-2 mt-1 text-gray-400 hover:text-gray-600 transition-colors">
          {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}
