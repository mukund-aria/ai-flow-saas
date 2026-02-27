/**
 * useAttentionSettings — localStorage-backed attention configuration.
 *
 * Controls which types of attention reasons the coordinator wants to see.
 */

import { useState, useCallback } from 'react';
import type { AttentionItem } from '@/lib/api';

export interface AttentionSettings {
  yourTurn: boolean;
  yourActionOverdue: boolean;
  flowOverdue: boolean;
  offTrack: boolean;
  messageFilter: 'all_new' | 'all_unresolved' | 'mentions_only' | 'none';
}

const STORAGE_KEY = 'attention-settings';

const DEFAULTS: AttentionSettings = {
  yourTurn: true,
  yourActionOverdue: true,
  flowOverdue: true,
  offTrack: true,
  messageFilter: 'all_new',
};

function loadSettings(): AttentionSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULTS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULTS };
}

function saveSettings(settings: AttentionSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useAttentionSettings() {
  const [settings, setSettings] = useState<AttentionSettings>(loadSettings);

  const updateSetting = useCallback(<K extends keyof AttentionSettings>(key: K, value: AttentionSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      return next;
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings({ ...DEFAULTS });
    saveSettings({ ...DEFAULTS });
  }, []);

  return { settings, updateSetting, resetToDefaults };
}

/**
 * Filter attention items based on the coordinator's settings.
 */
export function filterByAttentionSettings(items: AttentionItem[], settings: AttentionSettings): AttentionItem[] {
  return items.filter((item) => {
    const reasons = item.reasons.map((r) => r.type);

    // Check if any enabled reason is present
    let hasEnabledReason = false;

    if (settings.yourTurn && reasons.includes('YOUR_TURN')) hasEnabledReason = true;
    if (settings.yourActionOverdue && reasons.includes('STEP_OVERDUE')) hasEnabledReason = true;
    if (settings.flowOverdue && reasons.includes('FLOW_OVERDUE')) hasEnabledReason = true;

    // Escalated and stalled are always shown if they exist (they're critical)
    if (reasons.includes('ESCALATED') || reasons.includes('STALLED') || reasons.includes('AUTOMATION_FAILED')) {
      hasEnabledReason = true;
    }

    // Message filter
    if (settings.messageFilter !== 'none' && reasons.includes('UNREAD_CHAT')) {
      hasEnabledReason = true;
    }

    return hasEnabledReason;
  });
}
