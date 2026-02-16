/**
 * Organization Switcher
 *
 * Dropdown in sidebar header for switching between organizations.
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Check, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

interface Org {
  id: string;
  name: string;
  slug: string;
  role: string;
  isActive: boolean;
}

export function OrgSwitcher() {
  const { user, switchOrg } = useAuth();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_BASE}/organizations`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOrgs(data.data);
      })
      .catch(() => {});
  }, [user?.activeOrganizationId]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const activeOrg = orgs.find(o => o.isActive);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {activeOrg?.name || user?.organizationName || 'My Organization'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user?.email || 'Free Plan'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => {
                if (!org.isActive) switchOrg(org.id);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
              </div>
              <span className="flex-1 text-sm text-gray-700 truncate">{org.name}</span>
              {org.isActive && <Check className="w-4 h-4 text-violet-600" />}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/onboarding';
              }}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <span className="text-sm text-violet-600 font-medium">Create organization</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
