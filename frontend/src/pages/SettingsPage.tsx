/**
 * Settings Page
 *
 * Organization and user settings with live API wiring.
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Building2, Bell, Shield, CheckCircle, Loader2, Palette, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  updateOrganization,
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '@/lib/api';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { AssigneeExperienceSettings } from '@/components/settings/AssigneeExperienceSettings';

export function SettingsPage() {
  const { user, logout, checkAuth } = useAuth();

  // ---------- Organization ----------
  const [orgName, setOrgName] = useState(user?.organizationName || '');
  const [orgSaving, setOrgSaving] = useState(false);
  const [orgSaved, setOrgSaved] = useState(false);
  const [orgError, setOrgError] = useState('');
  const orgDirty = orgName.trim() !== (user?.organizationName || '');

  useEffect(() => {
    setOrgName(user?.organizationName || '');
  }, [user?.organizationName]);

  const saveOrgName = useCallback(async () => {
    if (!user?.activeOrganizationId || !orgName.trim()) return;
    setOrgSaving(true);
    setOrgError('');
    try {
      await updateOrganization(user.activeOrganizationId, { name: orgName.trim() });
      await checkAuth();
      setOrgSaved(true);
      setTimeout(() => setOrgSaved(false), 2000);
    } catch {
      setOrgError('Failed to save organization name. Please try again.');
    } finally {
      setOrgSaving(false);
    }
  }, [user?.activeOrganizationId, orgName, checkAuth]);

  // ---------- Notification Preferences ----------
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    getNotificationPreferences()
      .then(setNotifPrefs)
      .catch(() => setNotifPrefs({ emailEnabled: true, inAppEnabled: true, digestFrequency: 'NONE', mutedEventTypes: [] }))
      .finally(() => setNotifLoading(false));
  }, []);

  const togglePref = useCallback(async (key: 'emailEnabled' | 'inAppEnabled', value: boolean) => {
    setNotifPrefs((prev) => prev ? { ...prev, [key]: value } : prev);
    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      setNotifPrefs(updated);
    } catch {
      setNotifPrefs((prev) => prev ? { ...prev, [key]: !value } : prev);
    }
  }, []);

  const setDigest = useCallback(async (digestFrequency: 'NONE' | 'DAILY' | 'WEEKLY') => {
    const prev = notifPrefs?.digestFrequency;
    setNotifPrefs((p) => p ? { ...p, digestFrequency } : p);
    try {
      const updated = await updateNotificationPreferences({ digestFrequency });
      setNotifPrefs(updated);
    } catch {
      setNotifPrefs((p) => p ? { ...p, digestFrequency: prev || 'NONE' } : p);
    }
  }, [notifPrefs?.digestFrequency]);

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
              <div className="flex gap-3">
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="Organization name"
                />
                <Button
                  onClick={saveOrgName}
                  disabled={!orgDirty || orgSaving}
                  variant={orgSaved ? 'outline' : 'default'}
                  className={orgSaved ? 'text-green-600 border-green-200' : ''}
                >
                  {orgSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : orgSaved ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Saved
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
              </div>
            </div>
            {orgError && (
              <p className="text-sm text-red-600">{orgError}</p>
            )}
            {user?.role !== 'ADMIN' && (
              <p className="text-sm text-gray-500">
                Contact your administrator to change organization settings.
              </p>
            )}
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
          {notifLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading preferences...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Email notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Email notifications</p>
                  <p className="text-xs text-gray-500">Receive task assignments and reminders via email</p>
                </div>
                <button
                  onClick={() => togglePref('emailEnabled', !notifPrefs?.emailEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifPrefs?.emailEnabled ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifPrefs?.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* In-app notifications toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">In-app notifications</p>
                  <p className="text-xs text-gray-500">Show notifications within the app</p>
                </div>
                <button
                  onClick={() => togglePref('inAppEnabled', !notifPrefs?.inAppEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifPrefs?.inAppEnabled ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifPrefs?.inAppEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Daily digest select */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Digest frequency</p>
                  <p className="text-xs text-gray-500">Summary of overdue tasks and flow activity</p>
                </div>
                <select
                  value={notifPrefs?.digestFrequency || 'NONE'}
                  onChange={(e) => setDigest(e.target.value as 'NONE' | 'DAILY' | 'WEEKLY')}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="NONE">None</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Branding Section */}
      {user?.role === 'ADMIN' && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <BrandingSettings />
          </div>
        </section>
      )}

      {/* Assignee Experience Section */}
      {user?.role === 'ADMIN' && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Assignee Experience
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <AssigneeExperienceSettings />
          </div>
        </section>
      )}

      {/* Security Section */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-5">
            {/* Auth method */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
                <CheckCircle className="w-3.5 h-3.5" />
                Signed in via Google OAuth
              </span>
            </div>

            {/* Session info */}
            <div>
              <p className="text-sm font-medium text-gray-900">Session</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Active since {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            {/* API access note */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                API keys and webhook signing secrets are configured per-flow in the Notifications tab.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
