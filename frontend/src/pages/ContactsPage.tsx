/**
 * Contacts Page
 *
 * Manage external contacts (assignees) with search, sorting, and table view.
 * Matches Moxo Action Hub design with violet/indigo theme.
 */

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  Mail,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Contact type definition
interface Contact {
  id: string;
  name: string;
  email: string;
  account?: string;
  type: 'ADMIN' | 'ASSIGNEE';
  status: 'ACTIVE' | 'INACTIVE';
  lastActive?: string;
}

// Mock data for development
const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@technova.com',
    account: 'TechNova Solutions',
    type: 'ADMIN',
    status: 'ACTIVE',
    lastActive: '2025-01-24T10:30:00Z',
  },
  {
    id: '2',
    name: 'Michael Torres',
    email: 'michael.t@acmecorp.io',
    account: 'Acme Corporation',
    type: 'ASSIGNEE',
    status: 'ACTIVE',
    lastActive: '2025-01-23T14:15:00Z',
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'ewatson@globalfinance.com',
    account: 'Global Finance Ltd',
    type: 'ASSIGNEE',
    status: 'ACTIVE',
    lastActive: '2025-01-22T09:00:00Z',
  },
  {
    id: '4',
    name: 'James Liu',
    email: 'james.liu@startupxyz.co',
    account: 'StartupXYZ',
    type: 'ADMIN',
    status: 'INACTIVE',
    lastActive: '2025-01-10T16:45:00Z',
  },
  {
    id: '5',
    name: 'Anna Schmidt',
    email: 'anna.s@eurotech.eu',
    account: 'EuroTech GmbH',
    type: 'ASSIGNEE',
    status: 'ACTIVE',
    lastActive: '2025-01-21T11:20:00Z',
  },
  {
    id: '6',
    name: 'David Park',
    email: 'dpark@innovatelabs.com',
    type: 'ASSIGNEE',
    status: 'INACTIVE',
    lastActive: '2024-12-15T08:30:00Z',
  },
];

// Sort configuration
type SortField = 'name' | 'email' | 'status' | 'type' | 'lastActive';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

// Helper function to format relative dates
function formatRelativeDate(dateString?: string): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
  return date.toLocaleDateString();
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Sortable column header component
interface SortableHeaderProps {
  label: string;
  field: SortField;
  sortConfig: SortConfig;
  onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, sortConfig, onSort }: SortableHeaderProps) {
  const isActive = sortConfig.field === field;

  return (
    <th
      className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 transition-colors select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <div className="flex flex-col">
          <ChevronUp
            className={`w-3 h-3 -mb-1 ${
              isActive && sortConfig.direction === 'asc'
                ? 'text-violet-600'
                : 'text-gray-300'
            }`}
          />
          <ChevronDown
            className={`w-3 h-3 ${
              isActive && sortConfig.direction === 'desc'
                ? 'text-violet-600'
                : 'text-gray-300'
            }`}
          />
        </div>
      </div>
    </th>
  );
}

export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let result = MOCK_CONTACTS.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.account?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );

    // Sort
    result.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'email':
          return direction * a.email.localeCompare(b.email);
        case 'status':
          return direction * a.status.localeCompare(b.status);
        case 'type':
          return direction * a.type.localeCompare(b.type);
        case 'lastActive':
          const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
          const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
          return direction * (dateA - dateB);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, sortConfig]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <Badge variant="secondary" className="text-sm font-medium">
            {MOCK_CONTACTS.length}
          </Badge>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200/50">
          <Plus className="w-4 h-4 mr-2" />
          Add new
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <SortableHeader
                  label="Name"
                  field="name"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email / Account
                </th>
                <SortableHeader
                  label="Status"
                  field="status"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Type"
                  field="type"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Last Active"
                  field="lastActive"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {/* Name with Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 text-sm font-semibold ring-2 ring-white shadow-sm">
                        {getInitials(contact.name)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {contact.name}
                      </span>
                    </div>
                  </td>

                  {/* Email / Account */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                      {contact.account && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Building2 className="w-4 h-4 text-gray-300" />
                          <span className="text-xs">{contact.account}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        contact.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                          : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                      }`}
                    >
                      {contact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        contact.type === 'ADMIN'
                          ? 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20'
                          : 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
                      }`}
                    >
                      {contact.type === 'ADMIN' ? 'Admin' : 'Assignee'}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatRelativeDate(contact.lastActive)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : MOCK_CONTACTS.length === 0 ? (
        /* Empty State - No contacts at all */
        <div className="text-center py-20 px-6">
          {/* Illustration */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Background circles */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-50 to-white" />
            {/* Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200/50 transform -rotate-6">
                <Users className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="w-3 h-3 text-amber-500" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-emerald-100" />
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No contacts yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Contacts are people who participate in your flows. They access tasks via
            secure magic links — no account needed.
          </p>

          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200/50">
            <Plus className="w-5 h-5 mr-2" />
            Add your first contact
          </Button>
        </div>
      ) : (
        /* No results for search */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No contacts found
          </h3>
          <p className="text-gray-500 mb-4">
            No contacts match your search criteria
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
