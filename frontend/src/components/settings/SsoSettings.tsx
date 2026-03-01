/**
 * SSO Settings Component
 *
 * Admin-only settings for SAML SSO configuration:
 * 1. Domain management (claim, verify, remove)
 * 2. Coordinator SSO config
 * 3. Assignee Portal SSO config
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Globe, Shield, Trash2, RefreshCw, Plus, CheckCircle, XCircle, Clock,
  Loader2, ChevronDown, ChevronUp, Copy, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  listSsoDomains, claimSsoDomain, verifySsoDomain, removeSsoDomain,
  listSsoConfigs, createSsoConfig, updateSsoConfig, deleteSsoConfig,
  type SsoDomain, type SsoConfig,
} from '@/lib/api';

// ============================================================================
// Main Component
// ============================================================================

export function SsoSettings() {
  const [domains, setDomains] = useState<SsoDomain[]>([]);
  const [configs, setConfigs] = useState<SsoConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [d, c] = await Promise.all([listSsoDomains(), listSsoConfigs()]);
      setDomains(d);
      setConfigs(c);
    } catch (err) {
      console.error('Failed to load SSO settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading SSO settings...
      </div>
    );
  }

  const coordinatorConfig = configs.find(c => c.target === 'COORDINATOR');
  const assigneeConfigs = configs.filter(c => c.target === 'ASSIGNEE');

  return (
    <div className="space-y-8">
      {/* Domain Management */}
      <DomainSection domains={domains} onReload={reload} />

      {/* Coordinator SSO */}
      <SsoConfigSection
        title="Coordinator SSO"
        description="SAML SSO for your team members who use the coordinator portal"
        target="COORDINATOR"
        config={coordinatorConfig}
        hasVerifiedDomain={domains.some(d => d.verificationStatus === 'VERIFIED')}
        onReload={reload}
      />

      {/* Assignee SSO */}
      <SsoConfigSection
        title="Assignee Portal SSO"
        description="SAML SSO for external participants accessing portals"
        target="ASSIGNEE"
        config={assigneeConfigs[0]}
        hasVerifiedDomain={domains.some(d => d.verificationStatus === 'VERIFIED')}
        onReload={reload}
      />
    </div>
  );
}

// ============================================================================
// Domain Section
// ============================================================================

function DomainSection({ domains, onReload }: { domains: SsoDomain[]; onReload: () => void }) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    setError('');
    try {
      await claimSsoDomain(newDomain.trim());
      setNewDomain('');
      onReload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setVerifying(domainId);
    setError('');
    try {
      const result = await verifySsoDomain(domainId);
      if (!result.success) {
        setError(result.error || 'Verification failed');
      }
      onReload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(null);
    }
  };

  const handleRemove = async (domainId: string) => {
    try {
      await removeSsoDomain(domainId);
      onReload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Globe className="w-4 h-4 text-gray-500" />
        Email Domains
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Claim and verify email domains to enable SSO. Users with verified domain emails will be directed to SSO.
      </p>

      {/* Add domain */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding || !newDomain.trim()} size="sm">
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      {/* Domain list */}
      {domains.length === 0 ? (
        <p className="text-xs text-gray-400">No domains claimed yet.</p>
      ) : (
        <div className="space-y-2">
          {domains.map((d) => (
            <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <StatusBadge status={d.verificationStatus} />
                <span className="text-sm font-mono text-gray-800">{d.domain}</span>
              </div>
              <div className="flex items-center gap-1">
                {d.verificationStatus !== 'VERIFIED' && (
                  <>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`_serviceflow-verify=${d.verificationToken}`);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      title="Copy DNS TXT value"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVerify(d.id)}
                      disabled={verifying === d.id}
                    >
                      {verifying === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Verify
                    </Button>
                  </>
                )}
                <button
                  onClick={() => handleRemove(d.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  title="Remove domain"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'VERIFIED':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'FAILED':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-amber-500" />;
  }
}

// ============================================================================
// SSO Config Section
// ============================================================================

function SsoConfigSection({
  title,
  description,
  target,
  config,
  hasVerifiedDomain,
  onReload,
}: {
  title: string;
  description: string;
  target: 'COORDINATOR' | 'ASSIGNEE';
  config?: SsoConfig;
  hasVerifiedDomain: boolean;
  onReload: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    idpEntityId: config?.idpEntityId || '',
    idpSsoUrl: config?.idpSsoUrl || '',
    idpCertificate: '',
    idpSloUrl: config?.idpSloUrl || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasCert = config?.idpCertificate === '***configured***';

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (config) {
        // Update existing
        const updates: Record<string, any> = {};
        if (form.idpEntityId) updates.idpEntityId = form.idpEntityId;
        if (form.idpSsoUrl) updates.idpSsoUrl = form.idpSsoUrl;
        if (form.idpCertificate) updates.idpCertificate = form.idpCertificate;
        if (form.idpSloUrl !== undefined) updates.idpSloUrl = form.idpSloUrl;
        await updateSsoConfig(config.id, updates);
      } else {
        // Create new
        if (!form.idpEntityId || !form.idpSsoUrl || !form.idpCertificate) {
          setError('Entity ID, SSO URL, and Certificate are required');
          setSaving(false);
          return;
        }
        await createSsoConfig({
          target,
          idpEntityId: form.idpEntityId,
          idpSsoUrl: form.idpSsoUrl,
          idpCertificate: form.idpCertificate,
          idpSloUrl: form.idpSloUrl || undefined,
        });
      }
      setSuccess('SSO configuration saved');
      setTimeout(() => setSuccess(''), 3000);
      onReload();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (field: 'enabled' | 'enforced', value: boolean) => {
    if (!config) return;
    try {
      await updateSsoConfig(config.id, { [field]: value } as any);
      onReload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!config) return;
    try {
      await deleteSsoConfig(config.id);
      setForm({ idpEntityId: '', idpSsoUrl: '', idpCertificate: '', idpSloUrl: '' });
      onReload();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-500" />
            {title}
            {config?.enabled && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-2 py-0.5 text-[10px] font-medium text-green-700">
                Active
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4">
          {!hasVerifiedDomain && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
              You must verify at least one email domain before enabling SSO.
            </div>
          )}

          {/* IdP Configuration */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">IdP Entity ID</label>
              <input
                type="text"
                value={form.idpEntityId}
                onChange={(e) => setForm(f => ({ ...f, idpEntityId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="https://idp.example.com/metadata"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SSO URL (Login endpoint)</label>
              <input
                type="text"
                value={form.idpSsoUrl}
                onChange={(e) => setForm(f => ({ ...f, idpSsoUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="https://idp.example.com/sso/saml"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                X.509 Certificate (PEM)
                {hasCert && <span className="text-green-600 ml-1">(configured)</span>}
              </label>
              <textarea
                value={form.idpCertificate}
                onChange={(e) => setForm(f => ({ ...f, idpCertificate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={4}
                placeholder={hasCert ? 'Leave empty to keep existing certificate' : 'Paste PEM certificate here...'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">SLO URL (optional)</label>
              <input
                type="text"
                value={form.idpSloUrl}
                onChange={(e) => setForm(f => ({ ...f, idpSloUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="https://idp.example.com/sso/slo"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {config ? 'Update' : 'Save'}
            </Button>
            {config && (
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {/* SP Metadata & Toggles (only if config exists) */}
          {config && (
            <div className="pt-4 border-t border-gray-100 space-y-4">
              {/* SP Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">SP Entity ID</span>
                  <code className="text-gray-700 bg-gray-50 px-2 py-0.5 rounded">{config.spEntityId}</code>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">ACS URL</span>
                  <code className="text-gray-700 bg-gray-50 px-2 py-0.5 rounded">{config.spAcsUrl}</code>
                </div>
                <div className="flex items-center text-xs">
                  <a
                    href={`/auth/sso/metadata/${config.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:text-violet-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Download SP Metadata XML
                  </a>
                </div>
              </div>

              {/* Enabled toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enabled</p>
                  <p className="text-xs text-gray-500">Allow SSO login for users with verified domain emails</p>
                </div>
                <button
                  onClick={() => handleToggle('enabled', !config.enabled)}
                  disabled={!hasVerifiedDomain}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    config.enabled ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Enforced toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enforced</p>
                  <p className="text-xs text-gray-500">Block OTP and Google login for users with this domain</p>
                </div>
                <button
                  onClick={() => handleToggle('enforced', !config.enforced)}
                  disabled={!config.enabled}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                    config.enforced ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    config.enforced ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
