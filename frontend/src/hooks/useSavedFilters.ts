import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    flow: string;
    template: string;
    status: string;
    contact: string;
    attention: boolean;
  };
  pinned: boolean;
  createdAt: string;
}

const STORAGE_KEY = 'saved-filters-flows';

export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
  }, [savedFilters]);

  const saveFilter = useCallback((name: string, filters: SavedFilter['filters'], pinned: boolean) => {
    const newFilter: SavedFilter = { id: nanoid(), name, filters, pinned, createdAt: new Date().toISOString() };
    setSavedFilters(prev => [...prev, newFilter]);
  }, []);

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setSavedFilters(prev => prev.map(f => f.id === id ? { ...f, pinned: !f.pinned } : f));
  }, []);

  const pinnedFilters = savedFilters.filter(f => f.pinned);

  return { savedFilters, pinnedFilters, saveFilter, deleteFilter, togglePin };
}
