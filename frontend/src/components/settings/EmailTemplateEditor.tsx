/**
 * Email Template Editor
 *
 * Edit notification email templates with variable insertion and live preview.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  listEmailTemplates,
  updateEmailTemplate,
  previewEmailTemplate,
  deleteEmailTemplate,
} from '@/lib/api';
import type { EmailTemplate, EmailTemplateType } from '@/types';

const TEMPLATE_TYPES: { value: EmailTemplateType; label: string; description: string }[] = [
  { value: 'TASK_ASSIGNED', label: 'Task Assigned', description: 'Sent when a new task is assigned to an assignee' },
  { value: 'TASK_REMINDER', label: 'Task Reminder', description: 'Sent as a reminder for pending or overdue tasks' },
  { value: 'FLOW_COMPLETED', label: 'Flow Completed', description: 'Sent when a flow run is completed' },
];

const VARIABLES = [
  { key: '{{contactName}}', label: 'Contact Name' },
  { key: '{{flowName}}', label: 'Flow Name' },
  { key: '{{stepName}}', label: 'Step Name' },
  { key: '{{taskUrl}}', label: 'Task URL' },
  { key: '{{dueDate}}', label: 'Due Date' },
  { key: '{{companyName}}', label: 'Company Name' },
];

export function EmailTemplateEditor() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<EmailTemplateType>('TASK_ASSIGNED');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Current template being edited
  const currentTemplate = templates.find((t) => t.templateType === selectedType);
  const [subject, setSubject] = useState('');
  const [heading, setHeading] = useState('');
  const [body, setBody] = useState('');
  const [buttonLabel, setButtonLabel] = useState('');
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    listEmailTemplates()
      .then(setTemplates)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Sync form fields when template selection changes
  useEffect(() => {
    if (currentTemplate) {
      setSubject(currentTemplate.subject);
      setHeading(currentTemplate.heading);
      setBody(currentTemplate.body);
      setButtonLabel(currentTemplate.buttonLabel || '');
      setEnabled(currentTemplate.enabled);
    }
  }, [selectedType, currentTemplate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updated = await updateEmailTemplate(selectedType, {
        subject,
        heading,
        body,
        buttonLabel: buttonLabel || undefined,
        enabled,
      });
      setTemplates((prev) =>
        prev.map((t) => (t.templateType === selectedType ? updated : t))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save template:', err);
    } finally {
      setSaving(false);
    }
  }, [selectedType, subject, heading, body, buttonLabel, enabled]);

  const handleReset = useCallback(async () => {
    try {
      await deleteEmailTemplate(selectedType);
      const refreshed = await listEmailTemplates();
      setTemplates(refreshed);
    } catch (err) {
      console.error('Failed to reset template:', err);
    }
  }, [selectedType]);

  const handlePreview = useCallback(async () => {
    try {
      const html = await previewEmailTemplate(selectedType, {
        subject,
        heading,
        body,
        buttonLabel,
      });
      setPreviewHtml(html);
      setShowPreview(true);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  }, [selectedType, subject, heading, body, buttonLabel]);

  const insertVariable = useCallback(
    (variable: string) => {
      setBody((prev) => prev + ` ${variable}`);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading email templates...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Template type selector */}
      <div className="flex gap-2">
        {TEMPLATE_TYPES.map((tt) => (
          <button
            key={tt.value}
            onClick={() => { setSelectedType(tt.value); setShowPreview(false); }}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
              selectedType === tt.value
                ? 'bg-violet-50 border-violet-200 text-violet-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {tt.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">
        {TEMPLATE_TYPES.find((t) => t.value === selectedType)?.description}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {/* Enable/disable toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Enabled</span>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-violet-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Email subject line"
            />
          </div>

          {/* Heading */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Email heading"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              placeholder="Email body content (supports HTML)"
            />
          </div>

          {/* Variable insertion */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Insert Variable</label>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => insertVariable(v.key)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-600 font-mono transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Button Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Label</label>
            <input
              type="text"
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g. Complete Task"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
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
                'Save Template'
              )}
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
            {!currentTemplate?.isDefault && (
              <Button variant="ghost" onClick={handleReset} className="text-gray-500 text-xs">
                Reset to Default
              </Button>
            )}
          </div>
        </div>

        {/* Preview pane */}
        <div>
          {showPreview && previewHtml ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <span className="text-xs font-medium text-gray-500">Email Preview</span>
              </div>
              <div
                className="p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
              <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Click "Preview" to see how the email will look
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
