/**
 * Start Link Settings
 *
 * Configure the default portal's start link pages:
 * initialization page and completion page.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listPortals, updatePortal } from '@/lib/api';
import type { Portal } from '@/types';

export function StartLinkSettings() {
  const [defaultPortal, setDefaultPortal] = useState<Portal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Init page
  const [initTitle, setInitTitle] = useState('');
  const [initSubtitle, setInitSubtitle] = useState('');
  const [startButtonLabel, setStartButtonLabel] = useState('');

  // Completion page
  const [completedImage, setCompletedImage] = useState('');
  const [completedTitle, setCompletedTitle] = useState('');
  const [completedSubtitle, setCompletedSubtitle] = useState('');

  useEffect(() => {
    listPortals()
      .then((portals) => {
        const def = portals.find((p) => p.isDefault);
        if (def) {
          setDefaultPortal(def);
          const sl = def.settings?.startLink;
          setInitTitle(sl?.initTitle || '');
          setInitSubtitle(sl?.initSubtitle || '');
          setStartButtonLabel(sl?.startButtonLabel || '');
          setCompletedImage(sl?.completedImage || '');
          setCompletedTitle(sl?.completedTitle || '');
          setCompletedSubtitle(sl?.completedSubtitle || '');
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
          startLink: {
            initTitle: initTitle || undefined,
            initSubtitle: initSubtitle || undefined,
            startButtonLabel: startButtonLabel || undefined,
            completedImage: completedImage || undefined,
            completedTitle: completedTitle || undefined,
            completedSubtitle: completedSubtitle || undefined,
          },
        },
      });
      setDefaultPortal(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save start link settings:', err);
    } finally {
      setSaving(false);
    }
  }, [defaultPortal, initTitle, initSubtitle, startButtonLabel, completedImage, completedTitle, completedSubtitle]);

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
    <div className="space-y-6">
      {/* Initialization Page */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Initialization Page</h3>
        <p className="text-xs text-gray-500 mb-4">
          Shown when an assignee opens a start link before the flow begins
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={initTitle}
              onChange={(e) => setInitTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Welcome to our onboarding process"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={initSubtitle}
              onChange={(e) => setInitSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Click the button below to get started"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Button Label</label>
            <input
              type="text"
              value={startButtonLabel}
              onChange={(e) => setStartButtonLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Get Started"
            />
          </div>
        </div>
      </div>

      {/* Completion Page */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Completion Page</h3>
        <p className="text-xs text-gray-500 mb-4">
          Shown after a flow started via start link completes
        </p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={completedImage}
              onChange={(e) => setCompletedImage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://example.com/success.png"
            />
            {completedImage && (
              <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden max-h-24 max-w-48">
                <img
                  src={completedImage}
                  alt="Completion"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={completedTitle}
              onChange={(e) => setCompletedTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Thank you!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
            <input
              type="text"
              value={completedSubtitle}
              onChange={(e) => setCompletedSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Your submission has been received"
            />
          </div>
        </div>
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
