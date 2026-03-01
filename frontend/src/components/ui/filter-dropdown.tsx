/**
 * FilterDropdown — Reusable pill-button dropdown with optional search.
 *
 * Used in the FlowsPage filter bar for "All Flows", "All Templates",
 * "All Statuses", and "All Contacts" dropdowns.
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  allLabel: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  searchable?: boolean;
}

export function FilterDropdown({ allLabel, value, options, onChange, searchable }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const isActive = value !== 'all';
  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = isActive && selectedOption ? selectedOption.label : allLabel;

  const filteredOptions = searchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger pill */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch('');
        }}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          isActive
            ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
        }`}
      >
        <span className="truncate max-w-[140px]">{displayLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 min-w-[200px] max-h-[320px] flex flex-col">
          {/* Search input */}
          {searchable && (
            <div className="px-2 py-1.5 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {/* "All" option */}
            <button
              onClick={() => {
                onChange('all');
                setIsOpen(false);
                setSearch('');
              }}
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left text-sm"
            >
              <span className="flex-1 text-gray-700">{allLabel}</span>
              {!isActive && <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />}
            </button>

            {/* Options */}
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left text-sm"
              >
                <span className="flex-1 text-gray-700 truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />}
              </button>
            ))}

            {searchable && filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
