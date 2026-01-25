import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onNewChat: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Flow Copilot</h1>
        </div>
      </div>

      {/* Right side - Actions and User */}
      <div className="flex items-center gap-3">
        <Button onClick={onNewChat} variant="outline" size="sm">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        {/* User Menu */}
        {isAuthenticated && user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            {/* User Avatar */}
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full ring-2 ring-gray-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-600">
                  {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            )}

            {/* User Name */}
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-700 leading-none">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user.email}
              </p>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-gray-500 hover:text-gray-700"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
