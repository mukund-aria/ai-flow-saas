/**
 * Portal Editor
 *
 * Edit a single portal: name, description, feature toggles,
 * branding overrides, and flow catalog.
 */

import { useState, useCallback } from 'react';
import { Loader2, CheckCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updatePortal } from '@/lib/api';
import { PortalFlowCatalog } from './PortalFlowCatalog';
import type { Portal } from '@/types';

interface PortalEditorProps {
  portal: Portal;
  onUpdate: () => void;
}

export function PortalEditor({ portal, onUpdate }: PortalEditorProps) {
  const [name, setName] = useState(portal.name);
  const [description, setDescription] = useState(portal.description || '');
  const [allowSelfService, setAllowSelfService] = useState(
    portal.settings?.allowSelfServiceFlowStart ?? false
  );
  const [showSummary, setShowSummary] = useState(
    portal.settings?.showWorkspaceSummary ?? true
  );

  // Branding overrides
  const [logoUrl, setLogoUrl] = useState(portal.brandingOverrides?.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(portal.brandingOverrides?.primaryColor || '');
  const [accentColor, setAccentColor] = useState(portal.brandingOverrides?.accentColor || '');
  const [companyName, setCompanyName] = useState(portal.brandingOverrides?.companyName || '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const portalUrl = `${window.location.origin}/portal/${portal.slug}`;

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updatePortal(portal.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        settings: {
          ...portal.settings,
          allowSelfServiceFlowStart: allowSelfService,
          showWorkspaceSummary: showSummary,
        },
        brandingOverrides: {
          logoUrl: logoUrl || undefined,
          primaryColor: primaryColor || undefined,
          accentColor: accentColor || undefined,
          companyName: companyName || undefined,
        },
      });
      onUpdate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to update portal:', err);
    } finally {
      setSaving(false);
    }
  }, [portal, name, description, allowSelfService, showSummary, logoUrl, primaryColor, accentColor, companyName, onUpdate]);

  const copyUrl = useCallback(() => {
    navigator.clipboard.writeText(portalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [portalUrl]);

  return (
    <div className="space-y-6">
      {/* Portal URL */}
      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Portal URL</p>
          <p className="text-sm font-mono text-gray-700">{portalUrl}</p>
        </div>
        <Button variant="outline" size="sm" onClick={copyUrl}>
          <Copy className="w-3.5 h-3.5 mr-1" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Feature toggles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Features</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Show workspace summary</p>
              <p className="text-xs text-gray-500">Display summary cards on the portal dashboard</p>
            </div>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showSummary ? 'bg-violet-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${showSummary ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Allow self-service flow start</p>
              <p className="text-xs text-gray-500">Assignees can start flows from the portal catalog</p>
            </div>
            <button
              onClick={() => setAllowSelfService(!allowSelfService)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                allowSelfService ? 'bg-violet-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${allowSelfService ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Branding overrides */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Branding Overrides</h3>
        <p className="text-xs text-gray-500 mb-3">Leave empty to inherit from org branding</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Inherit from org"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Inherit from org"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor || '#7c3aed'}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="#7c3aed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor || '#6366f1'}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="#6366f1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !name.trim()}
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
            'Save Portal'
          )}
        </Button>
      </div>

      {/* Flow Catalog */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Flow Catalog</h3>
        <p className="text-xs text-gray-500 mb-4">
          Choose which flow templates are available for self-service in this portal
        </p>
        <PortalFlowCatalog portalId={portal.id} />
      </div>
    </div>
  );
}
