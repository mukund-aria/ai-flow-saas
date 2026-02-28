/**
 * Embed Start Page
 *
 * Public page for embedded flow starts.
 * Fetches flow info, shows kickoff form, collects assignee info, and starts the flow.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface EmbedFlowInfo {
  id: string;
  name: string;
  description?: string;
  kickoff?: {
    kickoffFormEnabled?: boolean;
    kickoffFormFields?: Array<{
      fieldId: string;
      label: string;
      type: string;
      required?: boolean;
      placeholder?: string;
      options?: string[];
    }>;
  };
  assigneePlaceholders?: Array<{ name: string; description?: string }>;
  roles?: Array<{ name: string; description?: string }>;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    companyName?: string;
  } | null;
}

export function EmbedStartPage() {
  const { embedId } = useParams<{ embedId: string }>();
  const navigate = useNavigate();

  const [flowInfo, setFlowInfo] = useState<EmbedFlowInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [kickoffData, setKickoffData] = useState<Record<string, unknown>>({});
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeEmail, setAssigneeEmail] = useState('');

  useEffect(() => {
    if (!embedId) return;
    fetchFlowInfo();
  }, [embedId]);

  async function fetchFlowInfo() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/public/embed/${embedId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message || 'Flow not found');
        return;
      }

      setFlowInfo(data.data);
    } catch {
      setError('Unable to load flow information');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!embedId || submitting) return;

    try {
      setSubmitting(true);

      const body: Record<string, unknown> = {};
      if (Object.keys(kickoffData).length > 0) {
        body.kickoffData = kickoffData;
      }
      if (assigneeEmail) {
        body.assigneeInfo = {
          name: assigneeName || undefined,
          email: assigneeEmail,
        };
      }

      const res = await fetch(`${API_BASE}/api/public/embed/${embedId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message || 'Failed to start flow');
        return;
      }

      setSubmitted(true);

      // If we got a task URL, redirect to it after a brief delay
      if (data.data.firstTaskUrl) {
        setTimeout(() => {
          navigate(data.data.firstTaskUrl);
        }, 1500);
      }
    } catch {
      setError('Failed to start flow. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function updateKickoffField(fieldId: string, value: unknown) {
    setKickoffData(prev => ({ ...prev, [fieldId]: value }));
  }

  const primaryColor = flowInfo?.branding?.primaryColor || '#7c3aed';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !flowInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Flow Not Available</h2>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: primaryColor }} />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Flow Started</h2>
          <p className="text-sm text-gray-500">
            Your submission has been received. You will be redirected shortly.
          </p>
        </div>
      </div>
    );
  }

  if (!flowInfo) return null;

  const hasKickoffForm = flowInfo.kickoff?.kickoffFormEnabled && flowInfo.kickoff?.kickoffFormFields?.length;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          {flowInfo.branding?.logoUrl && (
            <img
              src={flowInfo.branding.logoUrl}
              alt={flowInfo.branding.companyName || 'Logo'}
              className="h-10 mx-auto mb-4 object-contain"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900">{flowInfo.name}</h1>
          {flowInfo.description && (
            <p className="mt-2 text-sm text-gray-600">{flowInfo.description}</p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Assignee Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Your Information</h3>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input
                type="text"
                value={assigneeName}
                onChange={e => setAssigneeName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                value={assigneeEmail}
                onChange={e => setAssigneeEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
              />
            </div>
          </div>

          {/* Kickoff Form Fields */}
          {hasKickoffForm && (
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Details</h3>
              {flowInfo.kickoff!.kickoffFormFields!.map(field => {
                if (field.type === 'HEADING') {
                  return <h4 key={field.fieldId} className="text-sm font-semibold text-gray-800 pt-2">{field.label}</h4>;
                }
                if (field.type === 'PARAGRAPH') {
                  return <p key={field.fieldId} className="text-xs text-gray-500">{field.label}</p>;
                }

                return (
                  <div key={field.fieldId}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    {field.type === 'TEXTAREA' || field.type === 'LONG_TEXT' ? (
                      <textarea
                        value={(kickoffData[field.fieldId] as string) || ''}
                        onChange={e => updateKickoffField(field.fieldId, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 resize-none"
                      />
                    ) : field.type === 'SELECT' || field.type === 'DROPDOWN' ? (
                      <select
                        value={(kickoffData[field.fieldId] as string) || ''}
                        onChange={e => updateKickoffField(field.fieldId, e.target.value)}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'CHECKBOX' ? (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!kickoffData[field.fieldId]}
                          onChange={e => updateKickoffField(field.fieldId, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type === 'NUMBER' ? 'number' : field.type === 'EMAIL' ? 'email' : 'text'}
                        value={(kickoffData[field.fieldId] as string) || ''}
                        onChange={e => updateKickoffField(field.fieldId, e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {submitting ? 'Starting...' : 'Start'}
          </button>
        </form>

        {/* Footer */}
        {flowInfo.branding?.companyName && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Powered by {flowInfo.branding.companyName}
          </p>
        )}
      </div>
    </div>
  );
}
