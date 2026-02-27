/**
 * Schedules Page
 *
 * Manage scheduled workflow triggers with cron-based automation.
 */

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Plus, Trash2, Loader2, X, ChevronDown, AlertCircle } from 'lucide-react';
import {
  listSchedules,
  createSchedule,
  deleteSchedule,
  listTemplates,
  type Schedule,
  type Template,
} from '@/lib/api';

// ============================================================================
// Cron presets
// ============================================================================

const CRON_PRESETS = [
  { label: 'Every weekday at 9 AM', value: '0 9 * * 1-5' },
  { label: 'Every Monday at 8 AM', value: '0 8 * * 1' },
  { label: 'Every day at 9 AM', value: '0 9 * * *' },
  { label: 'First of month at 9 AM', value: '0 9 1 * *' },
  { label: 'Custom', value: 'custom' },
] as const;

/**
 * Convert a cron pattern to a human-readable label.
 */
function cronToLabel(cron: string): string {
  const preset = CRON_PRESETS.find((p) => p.value === cron);
  if (preset) return preset.label;

  // Simple pattern matching for common crons
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return cron;

  const [min, hour, dom, , dow] = parts;
  const timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;

  if (dom === '1' && dow === '*') return `1st of month at ${timeStr}`;
  if (dom === '*' && dow === '1-5') return `Weekdays at ${timeStr}`;
  if (dom === '*' && dow === '1') return `Mondays at ${timeStr}`;
  if (dom === '*' && dow === '*') return `Daily at ${timeStr}`;

  return cron;
}

/**
 * Format an ISO date string to a short human-readable form.
 */
function formatNextRun(iso?: string): string {
  if (!iso) return '--';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();

  if (diffMs < 0) return 'Overdue';

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[d.getDay()];
  const hours = d.getHours();
  const mins = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const timeStr = mins === 0 ? `${h12} ${ampm}` : `${h12}:${mins.toString().padStart(2, '0')} ${ampm}`;

  return `${dayName} ${timeStr}`;
}

export function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New schedule form state
  const [formFlowId, setFormFlowId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPreset, setFormPreset] = useState(CRON_PRESETS[0].value);
  const [formCustomCron, setFormCustomCron] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [s, t] = await Promise.all([listSchedules(), listTemplates()]);
      setSchedules(s);
      setTemplates(t.filter((t) => t.status === 'ACTIVE'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    setFormError(null);

    if (!formFlowId) {
      setFormError('Please select a template');
      return;
    }
    if (!formName.trim()) {
      setFormError('Please enter a schedule name');
      return;
    }

    const cronPattern = formPreset === 'custom' ? formCustomCron.trim() : formPreset;
    if (!cronPattern) {
      setFormError('Please enter a cron pattern');
      return;
    }

    const cronParts = cronPattern.split(/\s+/);
    if (cronParts.length !== 5) {
      setFormError('Cron pattern must have 5 fields (minute hour dayOfMonth month dayOfWeek)');
      return;
    }

    try {
      setCreating(true);
      await createSchedule({
        flowId: formFlowId,
        scheduleName: formName.trim(),
        cronPattern,
      });
      setShowDialog(false);
      resetForm();
      await fetchData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create schedule');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleting) return;
    try {
      setDeleting(id);
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormFlowId('');
    setFormName('');
    setFormPreset(CRON_PRESETS[0].value);
    setFormCustomCron('');
    setFormError(null);
  };

  const openDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Automate workflow triggers with schedules</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">Automate workflow triggers with schedules</p>
        </div>
        <button
          onClick={openDialog}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Empty state */}
      {schedules.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">No schedules yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Create your first schedule to automatically start workflows at specific times or intervals.
          </p>
          <button
            onClick={openDialog}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first schedule
          </button>
        </div>
      ) : (
        /* Schedule table */
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Template</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Schedule</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Next Run</th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr
                  key={schedule.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{schedule.flowName}</td>
                  <td className="px-4 py-3 text-gray-700">{schedule.scheduleName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-gray-700">{cronToLabel(schedule.cronPattern)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatNextRun(schedule.nextRun)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deleting === schedule.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete schedule"
                    >
                      {deleting === schedule.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Schedule Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDialog(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">New Schedule</h2>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Template select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Template</label>
                <div className="relative">
                  <select
                    value={formFlowId}
                    onChange={(e) => setFormFlowId(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    <option value="">Select a template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Schedule name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Daily morning run"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                />
              </div>

              {/* Cron preset */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Frequency</label>
                <div className="relative">
                  <select
                    value={formPreset}
                    onChange={(e) => setFormPreset(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  >
                    {CRON_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Custom cron input */}
              {formPreset === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Cron Pattern
                  </label>
                  <input
                    type="text"
                    value={formCustomCron}
                    onChange={(e) => setFormCustomCron(e.target.value)}
                    placeholder="e.g., 0 9 * * 1-5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Format: minute hour dayOfMonth month dayOfWeek
                  </p>
                </div>
              )}

              {/* Form error */}
              {formError && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
