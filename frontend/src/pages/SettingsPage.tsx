/**
 * Settings Page
 *
 * Organization and user settings.
 */

import { User, Building2, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your account and organization settings
        </p>
      </div>

      {/* Profile Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <User className="w-4 h-4" />
          Profile
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-xl font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {user?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </section>

      {/* Organization Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Organization
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="My Organization"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled
              />
            </div>
            <p className="text-sm text-gray-500">
              Organization settings will be available in a future update.
            </p>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Notification settings coming soon. You'll be able to configure email
            notifications and in-app alerts.
          </p>
        </div>
      </section>

      {/* Security Section */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-500">
            Security settings coming soon. You'll be able to manage API keys,
            sessions, and access controls.
          </p>
        </div>
      </section>
    </div>
  );
}
