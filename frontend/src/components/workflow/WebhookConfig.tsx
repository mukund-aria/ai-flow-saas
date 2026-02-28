/**
 * Webhook Configuration Panel
 *
 * Displays webhook endpoint URL and secret for a template.
 * Allows copying credentials, regenerating secrets, and testing
 * the webhook endpoint with a sample payload.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Webhook,
  Copy,
  Check,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const fetchOpts: RequestInit = { credentials: 'include' };

interface WebhookConfigData {
  webhookUrl: string;
  secret: string;
  enabled: boolean;
}

interface WebhookConfigProps {
  templateId: string;
  /** Kickoff fields from the template definition, used to generate payload example */
  kickoffFields?: Array<{ fieldId: string; label: string; type: string; required?: boolean }>;
}

export function WebhookConfig({ templateId, kickoffFields }: WebhookConfigProps) {
  const [config, setConfig] = useState<WebhookConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/templates/${templateId}/webhook-config`, fetchOpts);
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
      } else {
        setError(data.error?.message || 'Failed to load webhook config');
      }
    } catch (err) {
      setError('Failed to load webhook configuration');
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleCopy = async (text: string, type: 'url' | 'secret') => {
    await navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`${API_BASE}/templates/${templateId}/webhook-config/regenerate`, {
        ...fetchOpts,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setShowSecret(true);
      }
    } catch {
      // Silently fail
    } finally {
      setRegenerating(false);
    }
  };

  const handleTest = async () => {
    if (!config) return;
    setTesting(true);
    setTestResult(null);
    try {
      // Build a sample payload
      const samplePayload: Record<string, unknown> = {
        name: 'Test Webhook Run',
        kickoffData: {},
        roleAssignments: {},
      };

      // Sign the payload with the secret
      const body = JSON.stringify(samplePayload);
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(config.secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      const signature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const res = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
        },
        body,
      });

      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, message: `Flow run started (ID: ${data.data?.runId})` });
      } else {
        setTestResult({ success: false, message: data.error?.message || 'Test failed' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Failed to send test webhook' });
    } finally {
      setTesting(false);
    }
  };

  // Generate example payload
  const examplePayload = {
    name: 'Optional run name',
    kickoffData: Object.fromEntries(
      (kickoffFields || [])
        .filter(f => f.type !== 'HEADING' && f.type !== 'PARAGRAPH')
        .map(f => [f.fieldId, `<${f.label}>`])
    ),
    roleAssignments: {},
  };

  if (loading) {
    return (
      <div className="p-6 border border-gray-200 rounded-xl bg-white">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading webhook configuration...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-red-200 rounded-xl bg-red-50">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Webhook className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Incoming Webhook</h3>
          <p className="text-xs text-gray-500">Trigger this flow from external systems</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Webhook URL */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Webhook URL</label>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono truncate">
              {config.webhookUrl}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-9 w-9 p-0"
              onClick={() => handleCopy(config.webhookUrl, 'url')}
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Secret */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Signing Secret</label>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono truncate">
              {showSecret ? config.secret : config.secret.replace(/./g, '*')}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-9 w-9 p-0"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-9 w-9 p-0"
              onClick={() => handleCopy(config.secret, 'secret')}
            >
              {copiedSecret ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 h-9"
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span className="text-xs">Regenerate</span>
            </Button>
          </div>
        </div>

        {/* Example Payload */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Example Payload</label>
          <pre className="mt-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(examplePayload, null, 2)}
          </pre>
          <p className="mt-1.5 text-xs text-gray-400">
            Sign the JSON body with HMAC-SHA256 using your secret and send the hex digest in the <code className="bg-gray-100 px-1 rounded">X-Webhook-Signature</code> header.
          </p>
        </div>

        {/* Test Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleTest}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Send Test Webhook
          </Button>
          {testResult && (
            <span className={`text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
