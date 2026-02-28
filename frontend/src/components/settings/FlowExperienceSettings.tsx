/**
 * Flow Experience Settings
 *
 * Configure the default portal's flow experience: header image,
 * view mode, and welcome message.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listPortals, updatePortal } from '@/lib/api';
import type { Portal } from '@/types';

export function FlowExperienceSettings() {
  const [defaultPortal, setDefaultPortal] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [headerImage, setHeaderImage] = useState('');
  const [viewMode, setViewMode] = useState('SPOTLIGHT');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    listPortals()
      .then((portals) => {
        const def = portals.find((p) => p.isDefault);
        if (def) {
          setDefaultPortal(def);
          const exp = def.settings?.flowExperience;
          setHeaderImage(exp?.headerImage || '');
          setViewMode(exp?.viewMode || 'SPOTLIGHT');
          setWelcomeMessage(exp?.welcomeMessage || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    if (!defaultPortal) return;
    setSaving(true);
    try {
      const updated = await updatePortal(defaultPortal.id, {
        settings: {
          ...defaultPortal.settings,
          flowExperience: {
            headerImage: headerImage || undefined,
            viewMode,
            welcomeMessage: welcomeMessage || undefined,
          },
        },
      });
      setDefaultPortal(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save flow experience settings:', err);
    } finally {
      setSaving(false);
    }
  }, [defaultPortal, headerImage, viewMode, welcomeMessage]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading settings...
      </div>
    );
  }

  if (!defaultPortal) {
    return <p className="text-sm text-gray-500 py-4">No default portal found. Create one in the Portals tab.</p>;
  }

  return (
    <div className="space-y-5">
      {/* Header Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Header Image URL</label>
        <input
          type="url"
          value={headerImage}
          onChange={(e) => setHeaderImage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          placeholder="https://example.com/header.jpg"
        />
        {headerImage && (
          <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden max-h-32">
            <img
              src={headerImage}
              alt="Header preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* View Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
        <div className="flex gap-3">
          <label
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              viewMode === 'SPOTLIGHT'
                ? 'border-violet-300 bg-violet-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="viewMode"
              value="SPOTLIGHT"
              checked={viewMode === 'SPOTLIGHT'}
              onChange={(e) => setViewMode(e.target.value)}
              className="accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Spotlight</p>
              <p className="text-xs text-gray-500">Focus on one step at a time</p>
            </div>
          </label>
          <label
            className={`flex-1 flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              viewMode === 'GALLERY'
                ? 'border-violet-300 bg-violet-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="viewMode"
              value="GALLERY"
              checked={viewMode === 'GALLERY'}
              onChange={(e) => setViewMode(e.target.value)}
              className="accent-violet-600"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Gallery</p>
              <p className="text-xs text-gray-500">Show all steps in a scrollable view</p>
            </div>
          </label>
        </div>
      </div>

      {/* Welcome Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
        <textarea
          value={welcomeMessage}
          onChange={(e) => setWelcomeMessage(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          placeholder="Welcome! Here you can track your tasks and complete assigned actions."
        />
        <p className="text-xs text-gray-400 mt-1">
          Shown on the portal dashboard for assignees
        </p>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          variant={saved ? 'outline' : 'default'}
          className={saved ? 'text-green-600 border-green-200' : ''}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-1" />
              Saved
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
