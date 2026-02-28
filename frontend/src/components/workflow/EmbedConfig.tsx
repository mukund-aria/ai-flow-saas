/**
 * Embed Configuration Panel
 *
 * Allows coordinators to enable embedding for a flow template.
 * Shows start link URL, iframe HTML, and preview button.
 */

import { useState } from 'react';
import { Code2, Copy, Check, ExternalLink, Loader2, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface EmbedConfigProps {
  templateId: string;
  existingEmbedId?: string;
}

export function EmbedConfig({ templateId, existingEmbedId }: EmbedConfigProps) {
  const [embedId, setEmbedId] = useState(existingEmbedId || '');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = window.location.origin;
  const embedUrl = embedId ? `${baseUrl}/embed/${embedId}` : '';
  const iframeHtml = embedId
    ? `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`
    : '';

  async function generateEmbed() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/api/templates/${templateId}/embed-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message || 'Failed to generate embed config');
        return;
      }

      setEmbedId(data.data.embedId);
    } catch {
      setError('Failed to generate embed configuration');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  if (!embedId) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Code2 className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Embed & Share</h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Generate an embed link to let external users start this flow from your website or share a direct link.
        </p>
        {error && (
          <p className="text-xs text-red-500 mb-2">{error}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={generateEmbed}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
          ) : (
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
          )}
          Enable Embedding
        </Button>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Code2 className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-medium text-gray-700">Embed & Share</h3>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
          Enabled
        </span>
      </div>

      {/* Start Link */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Start Link</label>
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            readOnly
            value={embedUrl}
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs font-mono bg-gray-50 text-gray-700 truncate"
          />
          <button
            onClick={() => copyToClipboard(embedUrl, 'link')}
            className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Copy link"
          >
            {copiedField === 'link' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Iframe HTML */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Embed Code</label>
        <div className="flex items-start gap-1.5">
          <textarea
            readOnly
            value={iframeHtml}
            rows={2}
            className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded-md text-xs font-mono bg-gray-50 text-gray-700 resize-none"
          />
          <button
            onClick={() => copyToClipboard(iframeHtml, 'iframe')}
            className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Copy embed code"
          >
            {copiedField === 'iframe' ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Preview Button */}
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full px-3 py-1.5 text-xs font-medium text-violet-600 border border-violet-200 rounded-md hover:bg-violet-50 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        Preview Embed Page
      </a>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
