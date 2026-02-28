/**
 * Branding Settings Component
 *
 * Allows org admins to configure white-label branding:
 * logo, colors, company name, with a live preview.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, Upload, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface BrandingConfig {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  companyName?: string;
  faviconUrl?: string;
  emailFooter?: string;
}

async function fetchBranding(orgId: string): Promise<BrandingConfig> {
  const res = await fetch(`${API_BASE}/organizations/${orgId}/branding`, {
    credentials: 'include',
  });
  const data = await res.json();
  return data.success ? data.data : {};
}

async function saveBranding(orgId: string, branding: BrandingConfig): Promise<BrandingConfig> {
  const res = await fetch(`${API_BASE}/organizations/${orgId}/branding`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(branding),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || 'Failed to save');
  return data.data;
}

export function BrandingSettings() {
  const { user } = useAuth();
  const orgId = user?.activeOrganizationId;

  const [branding, setBranding] = useState<BrandingConfig>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [original, setOriginal] = useState<BrandingConfig>({});

  useEffect(() => {
    if (!orgId) return;
    fetchBranding(orgId)
      .then((data) => {
        setBranding(data);
        setOriginal(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgId]);

  const updateField = useCallback(<K extends keyof BrandingConfig>(key: K, value: BrandingConfig[K]) => {
    setBranding((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!orgId) return;
    setSaving(true);
    try {
      const result = await saveBranding(orgId, branding);
      setBranding(result);
      setOriginal(result);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save branding:', err);
    } finally {
      setSaving(false);
    }
  }, [orgId, branding]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading branding settings...
      </div>
    );
  }

  const previewPrimary = branding.primaryColor || '#7c3aed';
  const previewAccent = branding.accentColor || '#6366f1';
  const previewName = branding.companyName || 'Your Company';

  return (
    <div className="space-y-6">
      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={branding.companyName || ''}
            onChange={(e) => updateField('companyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Displayed in assignee portal header"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={branding.logoUrl || ''}
              onChange={(e) => updateField('logoUrl', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="https://example.com/logo.png"
            />
            {branding.logoUrl && (
              <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden shrink-0">
                <img
                  src={branding.logoUrl}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.primaryColor || '#7c3aed'}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={branding.primaryColor || ''}
              onChange={(e) => updateField('primaryColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
              placeholder="#7c3aed"
            />
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.accentColor || '#6366f1'}
              onChange={(e) => updateField('accentColor', e.target.value)}
              className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={branding.accentColor || ''}
              onChange={(e) => updateField('accentColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
              placeholder="#6366f1"
            />
          </div>
        </div>

        {/* Email Footer */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Footer Text
          </label>
          <input
            type="text"
            value={branding.emailFooter || ''}
            onChange={(e) => updateField('emailFooter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Shown at the bottom of outgoing emails"
          />
        </div>
      </div>

      {/* Live Preview */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Live Preview - Assignee Header</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: 'white', borderBottom: `2px solid ${previewPrimary}` }}
          >
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${previewPrimary}, ${previewAccent})` }}
                >
                  <Layers className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{previewName}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">Client Onboarding</span>
              </div>
            </div>
            <button
              className="px-4 py-1.5 text-xs font-medium rounded-lg text-white"
              style={{ background: `linear-gradient(135deg, ${previewPrimary}, ${previewAccent})` }}
            >
              Submit
            </button>
          </div>
          <div className="bg-gray-50 px-4 py-6 text-center">
            <p className="text-xs text-gray-400">
              This is how the assignee portal header will look with your branding.
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!dirty || saving}
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
            'Save Branding'
          )}
        </Button>
      </div>
    </div>
  );
}
