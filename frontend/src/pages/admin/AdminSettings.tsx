/**
 * Admin Settings
 *
 * Manage the platform-level allowed emails whitelist.
 */

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function AdminSettings() {
  const [emails, setEmails] = useState('');
  const [originalEmails, setOriginalEmails] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/admin/settings`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Convert comma-separated to newline-separated for display
          const display = (data.data.allowedEmails || '')
            .split(',')
            .map((e: string) => e.trim())
            .filter((e: string) => e.length > 0)
            .join('\n');
          setEmails(display);
          setOriginalEmails(display);
          setUpdatedAt(data.data.updatedAt);
          setUpdatedBy(data.data.updatedBy);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    // Convert newline-separated back to comma-separated
    const commaSeparated = emails
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0)
      .join(',');

    try {
      const res = await fetch(`${API_BASE}/admin/settings/allowed-emails`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowedEmails: commaSeparated }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error?.message || 'Failed to save');
        return;
      }
      setOriginalEmails(emails);
      setUpdatedBy(data.data.updatedBy);
      setUpdatedAt(new Date().toISOString());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = emails !== originalEmails;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure platform-level access controls
        </p>
      </div>

      {/* Allowed Emails */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Allowed Emails</h2>
        <p className="text-xs text-gray-500 mb-4">
          One email or domain wildcard per line. Supports emails (user@example.com) and
          domain wildcards (@example.com). Empty list = all emails allowed.
        </p>

        <textarea
          value={emails}
          onChange={e => setEmails(e.target.value)}
          rows={12}
          placeholder={`user@example.com\n@company.com`}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y"
        />

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-400">
            {updatedBy && updatedAt && (
              <>
                Last updated by {updatedBy} on{' '}
                {new Date(updatedAt).toLocaleString()}
              </>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
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
              'Save'
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
