/**
 * Portal Flow Catalog
 *
 * Manage which flows are available in a portal's self-service catalog.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getPortalTemplates,
  addPortalTemplate,
  updatePortalTemplate,
  removePortalTemplate,
  listTemplates,
  type Template,
} from '@/lib/api';
import type { PortalTemplate } from '@/types';

interface PortalFlowCatalogProps {
  portalId: string;
}

export function PortalFlowCatalog({ portalId }: PortalFlowCatalogProps) {
  const [catalogItems, setCatalogItems] = useState<PortalTemplate[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [portalTemplates, templates] = await Promise.all([
        getPortalTemplates(portalId),
        listTemplates(),
      ]);
      setCatalogItems(portalTemplates);
      // Only show ACTIVE templates not already in catalog
      const catalogTemplateIds = new Set(portalTemplates.map((pt) => pt.templateId));
      setAvailableTemplates(
        templates.filter((t) => t.status === 'ACTIVE' && !catalogTemplateIds.has(t.id))
      );
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [portalId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAdd = useCallback(async () => {
    if (!selectedTemplateId) return;
    try {
      await addPortalTemplate(portalId, selectedTemplateId);
      setSelectedTemplateId('');
      setShowAdd(false);
      await loadData();
    } catch (err) {
      console.error('Failed to add flow:', err);
    }
  }, [portalId, selectedTemplateId, loadData]);

  const handleRemove = useCallback(async (pfId: string) => {
    try {
      await removePortalTemplate(portalId, pfId);
      await loadData();
    } catch (err) {
      console.error('Failed to remove flow:', err);
    }
  }, [portalId, loadData]);

  const handleToggle = useCallback(async (pf: PortalTemplate) => {
    try {
      await updatePortalTemplate(portalId, pf.id, { enabled: !pf.enabled });
      await loadData();
    } catch (err) {
      console.error('Failed to toggle flow:', err);
    }
  }, [portalId, loadData]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading catalog...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Catalog list */}
      {catalogItems.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">
          No flows in this portal's catalog yet
        </p>
      ) : (
        <div className="space-y-2">
          {catalogItems.map((pf) => (
            <div
              key={pf.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                pf.enabled
                  ? 'bg-white border-gray-200'
                  : 'bg-gray-50 border-gray-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {pf.displayTitle || pf.template?.name || 'Unknown Flow'}
                  </p>
                  {pf.template?.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{pf.template.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(pf)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    pf.enabled ? 'bg-violet-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                      pf.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
                <button
                  onClick={() => handleRemove(pf.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add flow */}
      {showAdd ? (
        <div className="flex items-center gap-2">
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Select a template...</option>
            {availableTemplates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Button onClick={handleAdd} disabled={!selectedTemplateId} size="sm">
            Add
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowAdd(true)} className="w-full" size="sm">
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Flow to Catalog
        </Button>
      )}
    </div>
  );
}
