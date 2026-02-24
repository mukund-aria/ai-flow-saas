/**
 * Contacts Page
 *
 * Manage external contacts (assignees) with search, sorting, and table view.
 * Matches Moxo Action Hub design with violet/indigo theme.
 * Wired to real API endpoints for full CRUD.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Users,
  Mail,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listContacts,
  createContact,
  deleteContact,
  toggleContactStatus,
  type Contact,
} from '@/lib/api';

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

// Contact type definitions with descriptions (matching Moxo)
const CONTACT_TYPES = {
  ASSIGNEE: {
    label: 'Assignee',
    description: 'Can only complete actions assigned to them',
    color: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20',
  },
  MEMBER: {
    label: 'Member',
    description: 'Can design, create, and coordinate flows',
    color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
  },
  ADMIN: {
    label: 'Admin',
    description: 'Has full organization-level access',
    color: 'bg-violet-50 text-violet-700 ring-1 ring-violet-600/20',
  },
} as const;

type ContactTypeKey = keyof typeof CONTACT_TYPES;

// Add Contact Dialog
interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contact: { name: string; email: string; type: ContactTypeKey }) => Promise<void>;
}

function AddContactDialog({ open, onOpenChange, onSubmit }: AddContactDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<ContactTypeKey>('ASSIGNEE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), email: email.trim(), type });
      setName('');
      setEmail('');
      setType('ASSIGNEE');
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Contact</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add a new user to your organization
        </p>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah@company.com"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Type - Card selection like Moxo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="space-y-2">
              {(Object.entries(CONTACT_TYPES) as [ContactTypeKey, typeof CONTACT_TYPES[ContactTypeKey]][]).map(([key, info]) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    type === key
                      ? 'border-violet-500 bg-violet-50/50 ring-1 ring-violet-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="contact-type"
                    value={key}
                    checked={type === key}
                    onChange={() => setType(key)}
                    className="mt-0.5 w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{info.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Chen"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim() || !email.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Contact'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch contacts on mount
  useEffect(() => {
    async function fetchContacts() {
      try {
        setIsLoading(true);
        const data = await listContacts();
        setContacts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    }
    fetchContacts();
  }, []);

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle add contact
  const handleAddContact = async (contact: { name: string; email: string; type: ContactTypeKey }) => {
    const newContact = await createContact(contact);
    setContacts((prev) => [...prev, newContact]);
  };

  // Handle delete contact
  const handleDeleteContact = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (contact: Contact) => {
    const newStatus = contact.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await toggleContactStatus(contact.id, newStatus);
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? updated : c)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update contact status');
    }
  };

  // Filter and sort contacts
  const filteredContacts = useMemo(() => {
    let result = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
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
        case 'lastActive': {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return direction * (dateA - dateB);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [contacts, searchQuery, sortConfig]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading contacts...</p>
        </div>
      </div>
    );
  }

  // Error state (only if no contacts loaded)
  if (error && contacts.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading contacts</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AddContactDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddContact}
      />

      {/* Inline error banner for action errors */}
      {error && contacts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <Badge variant="secondary" className="text-sm font-medium">
            {contacts.length}
          </Badge>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200/50"
        >
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
                  Email
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

                  {/* Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{contact.email}</span>
                    </div>
                  </td>

                  {/* Status (clickable toggle) */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(contact)}
                      className="focus:outline-none"
                      title={`Click to ${contact.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}
                    >
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-colors ${
                          contact.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20 hover:bg-gray-200'
                        }`}
                      >
                        {contact.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        CONTACT_TYPES[contact.type as ContactTypeKey]?.color || 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20'
                      }`}
                    >
                      {CONTACT_TYPES[contact.type as ContactTypeKey]?.label || contact.type}
                    </span>
                  </td>

                  {/* Last Active */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatRelativeDate(contact.updatedAt)}
                  </td>

                  {/* Actions (3-dot menu) */}
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === contact.id ? null : contact.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === contact.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                            <button
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDeleteContact(contact.id);
                              }}
                              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : contacts.length === 0 ? (
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
            secure magic links -- no account needed.
          </p>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200/50"
          >
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
