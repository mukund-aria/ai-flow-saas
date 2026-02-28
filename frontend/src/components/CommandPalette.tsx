/**
 * Command Palette (Cmd+K)
 *
 * Global search overlay for quickly navigating to runs, templates, contacts,
 * and quick actions. Activated with Cmd+K (Mac) or Ctrl+K (Windows/Linux).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Play, BarChart3, ArrowRight } from 'lucide-react';
import { search, type SearchResults } from '@/lib/api';

const RECENT_KEY = 'command-palette-recent';
const MAX_RECENT = 5;

interface RecentItem {
  id: string;
  name: string;
  type: 'run' | 'template' | 'contact';
  path: string;
}

interface SelectableItem {
  id?: string;
  name: string;
  type: string;
  path: string;
  subtitle?: string;
}

// Static quick actions
const QUICK_ACTIONS: SelectableItem[] = [
  { id: 'start-flow', name: 'Start Flow', type: 'action', path: '/flows' },
  { id: 'create-template', name: 'Create Template', type: 'action', path: '/templates' },
  { id: 'view-reports', name: 'View Reports', type: 'action', path: '/reports' },
  { id: 'go-contacts', name: 'Go to Contacts', type: 'action', path: '/contacts' },
];

function getRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(item: RecentItem) {
  const recent = getRecent().filter(r => r.id !== item.id);
  recent.unshift(item);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function buildItemsList(results: SearchResults | null, query: string): SelectableItem[] {
  if (!query || !results) {
    // Show recent items + quick actions
    const recent = getRecent().map(r => ({
      id: r.id,
      name: r.name,
      type: r.type,
      path: r.path,
    }));
    return [...recent, ...QUICK_ACTIONS];
  }

  const items: SelectableItem[] = [];
  for (const run of results.runs) {
    items.push({ id: run.id, name: run.name, type: 'run', path: `/flows/${run.id}`, subtitle: run.status });
  }
  for (const tpl of results.templates) {
    items.push({ id: tpl.id, name: tpl.name, type: 'template', path: `/templates/${tpl.id}`, subtitle: tpl.status });
  }
  for (const contact of results.contacts) {
    items.push({ id: contact.id, name: contact.name, type: 'contact', path: '/contacts', subtitle: contact.email });
  }
  return items;
}

function getItemIcon(type: string) {
  switch (type) {
    case 'run': return Play;
    case 'template': return FileText;
    case 'contact': return Users;
    case 'action': return BarChart3;
    default: return FileText;
  }
}

function getSectionLabel(type: string): string {
  switch (type) {
    case 'run': return 'Flow Runs';
    case 'template': return 'Templates';
    case 'contact': return 'Contacts';
    case 'action': return 'Quick Actions';
    default: return '';
  }
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(null);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await search(query);
        setResults(data);
        setSelectedIndex(0);
      } catch (e) {
        console.error('Search failed:', e);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const allItems = buildItemsList(results, query);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allItems[selectedIndex]) {
      e.preventDefault();
      selectItem(allItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const selectItem = (item: SelectableItem) => {
    if (item.id && item.type !== 'action') {
      saveRecent({ id: item.id, name: item.name, type: item.type as RecentItem['type'], path: item.path });
    }
    navigate(item.path);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const hasResults = results && (results.runs.length > 0 || results.templates.length > 0 || results.contacts.length > 0);
  const noResults = query && query.length >= 2 && results && !hasResults;

  // Group items by type for section headers
  let currentSection = '';
  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]" onClick={() => setIsOpen(false)}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[600px] bg-white rounded-xl shadow-2xl border overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search runs, templates, contacts..."
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-2">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          )}

          {noResults && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">No results found</div>
          )}

          {allItems.map((item, i) => {
            flatIndex++;
            const idx = flatIndex;
            const Icon = getItemIcon(item.type);
            const isSelected = idx === selectedIndex;

            // Section header
            let sectionHeader = null;
            const sectionLabel = getSectionLabel(item.type);
            if (sectionLabel !== currentSection) {
              currentSection = sectionLabel;
              sectionHeader = (
                <div className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  {sectionLabel}
                </div>
              );
            }

            return (
              <div key={`${item.type}-${item.id || item.name}-${i}`}>
                {sectionHeader}
                <button
                  data-selected={isSelected}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => selectItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <Icon size={16} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.subtitle && (
                    <span className="text-xs text-gray-400 truncate max-w-[150px]">{item.subtitle}</span>
                  )}
                  <ArrowRight size={14} className={isSelected ? 'text-blue-400' : 'text-gray-300'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
