/**
 * Portal Manager
 *
 * List portals, create new ones, and manage per-portal settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Globe, Star, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listPortals, createPortal, deletePortal } from '@/lib/api';
import { PortalEditor } from './PortalEditor';
import type { Portal } from '@/types';

export function PortalManager() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);

  const loadPortals = useCallback(async () => {
    try {
      const data = await listPortals();
      setPortals(data);
    } catch (err) {
      console.error('Failed to load portals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortals();
  }, [loadPortals]);

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await createPortal({ name: newName.trim(), description: newDescription.trim() || undefined });
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
      await loadPortals();
    } catch (err) {
      console.error('Failed to create portal:', err);
    } finally {
      setCreating(false);
    }
  }, [newName, newDescription, loadPortals]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this portal?')) return;
    try {
      await deletePortal(id);
      if (selectedPortalId === id) setSelectedPortalId(null);
      await loadPortals();
    } catch (err) {
      console.error('Failed to delete portal:', err);
    }
  }, [selectedPortalId, loadPortals]);

  const selectedPortal = portals.find((p) => p.id === selectedPortalId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-8">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading portals...
      </div>
    );
  }

  // Show editor if a portal is selected
  if (selectedPortal) {
    return (
      <div>
        <button
          onClick={() => setSelectedPortalId(null)}
          className="text-sm text-violet-600 hover:text-violet-700 mb-4 flex items-center gap-1"
        >
          &larr; Back to Portals
        </button>
        <PortalEditor
          portal={selectedPortal}
          onUpdate={loadPortals}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portal list */}
      <div className="space-y-2">
        {portals.map((portal) => (
          <div
            key={portal.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <button
              onClick={() => setSelectedPortalId(portal.id)}
              className="flex items-center gap-3 flex-1 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Globe className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{portal.name}</span>
                  {portal.isDefault && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded">
                      <Star className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  /portal/{portal.slug}
                  {portal.description && ` — ${portal.description}`}
                </p>
              </div>
            </button>
            <div className="flex items-center gap-2">
              {!portal.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(portal.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Create new portal */}
      {showCreate ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portal Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g., Vendor Portal, Partner Portal"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Optional description"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Portal'}
            </Button>
            <Button variant="outline" onClick={() => { setShowCreate(false); setNewName(''); setNewDescription(''); }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setShowCreate(true)} className="w-full">
          <Plus className="w-4 h-4 mr-1" />
          Create Portal
        </Button>
      )}
    </div>
  );
}
