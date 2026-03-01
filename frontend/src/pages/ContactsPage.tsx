/**
 * Contacts Page
 *
 * Manage external contacts (assignees) with search, sorting, and table view.
 * Matches Moxo Action Hub design with violet/indigo theme.
 * Wired to real API endpoints for full CRUD.
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import { FeatureTooltip } from '@/components/ui/FeatureTooltip';
import {
  listContacts,
  createContact,
  deleteContact,
  toggleContactStatus,
  getContactWorkloads,
  listContactGroups,
  createContactGroup,
  getContactGroup,
  deleteContactGroup,
  addContactGroupMember,
  removeContactGroupMember,
  type Contact,
  type ContactWorkload,
  type ContactGroup,
  type ContactGroupDetail,
  type CompletionMode,
} from '@/lib/api';
import { cn } from '@/lib/utils';

// Sort configuration
type SortField = 'name' | 'email' | 'status' | 'type' | 'lastActive' | 'activeTasks' | 'completed' | 'overdue';
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
              autoFocus
            />
          </div>

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

// Completion mode labels
const COMPLETION_MODES: { value: CompletionMode; label: string; description: string }[] = [
  { value: 'ANY_ONE', label: 'Any One', description: 'Task completes when any member finishes' },
  { value: 'ALL', label: 'All', description: 'All members must complete the task' },
  { value: 'MAJORITY', label: 'Majority', description: 'More than half must complete the task' },
];

// Create Group Dialog
interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description?: string; defaultCompletionMode: CompletionMode }) => Promise<void>;
}

function CreateGroupDialog({ open, onOpenChange, onSubmit }: CreateGroupDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [completionMode, setCompletionMode] = useState<CompletionMode>('ANY_ONE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim() || undefined, defaultCompletionMode: completionMode });
      setName('');
      setDescription('');
      setCompletionMode('ANY_ONE');
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Contact Group</h2>
        <p className="text-sm text-gray-500 mb-6">Create a group to assign tasks to multiple contacts at once</p>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{submitError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
            <input
              id="group-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Legal Review Team"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="group-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              id="group-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Completion Mode</label>
            <div className="space-y-2">
              {COMPLETION_MODES.map((mode) => (
                <label
                  key={mode.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                    completionMode === mode.value
                      ? 'border-violet-500 bg-violet-50/50 ring-1 ring-violet-500'
                      : 'border-gray-200 hover:bg-gray-50'
                  )}
                >
                  <input
                    type="radio"
                    name="completion-mode"
                    value={mode.value}
                    checked={completionMode === mode.value}
                    onChange={() => setCompletionMode(mode.value)}
                    className="mt-0.5 w-4 h-4 text-violet-600 border-gray-300 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">{mode.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{mode.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
              ) : (
                'Create Group'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Group Detail Dialog
interface GroupDetailDialogProps {
  group: ContactGroupDetail | null;
  contacts: Contact[];
  onClose: () => void;
  onAddMember: (contactId: string) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

function GroupDetailDialog({ group, contacts, onClose, onAddMember, onRemoveMember }: GroupDetailDialogProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (!group) return null;

  // Filter contacts not already in the group
  const memberContactIds = new Set(group.members.map((m) => m.contactId).filter(Boolean));
  const availableContacts = contacts.filter((c) => !memberContactIds.has(c.id));

  const handleAddMember = async (contactId: string) => {
    setAddingMember(true);
    try {
      await onAddMember(contactId);
      setShowAddMember(false);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setRemovingId(memberId);
    try {
      await onRemoveMember(memberId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{group.name}</h2>
            {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 mb-6">
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-600/20">
            {COMPLETION_MODES.find((m) => m.value === group.defaultCompletionMode)?.label || group.defaultCompletionMode}
          </span>
          <span className="text-xs text-gray-500">{group.members.length} member{group.members.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Members */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Members</h3>
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>

        {/* Add member dropdown */}
        {showAddMember && (
          <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
            {availableContacts.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">All contacts are already members</div>
            ) : (
              <div className="max-h-40 overflow-y-auto">
                {availableContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => handleAddMember(contact.id)}
                    disabled={addingMember}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 text-xs font-semibold">
                      {getInitials(contact.name)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-xs text-gray-500">{contact.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Member list */}
        {group.members.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No members yet. Add contacts to this group.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {group.members.map((member) => {
              const person = member.contact || member.user;
              const memberType = member.contactId ? 'Contact' : 'User';
              return (
                <div key={member.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 text-xs font-semibold ring-2 ring-white shadow-sm">
                      {person ? getInitials(person.name) : '?'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{person?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{person?.email || ''}</div>
                    </div>
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                      memberType === 'Contact' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'
                    )}>
                      {memberType}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    disabled={removingId === member.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove member"
                  >
                    {removingId === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [workloads, setWorkloads] = useState<Record<string, ContactWorkload>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Groups state
  const [activeTab, setActiveTab] = useState<'contacts' | 'groups'>('contacts');
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroupDetail | null>(null);
  const [showGroupDetail, setShowGroupDetail] = useState(false);
  const [confirmDeleteGroupId, setConfirmDeleteGroupId] = useState<string | null>(null);

  // Fetch contacts and workloads on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [contactsData, workloadsData] = await Promise.all([
          listContacts(),
          getContactWorkloads().catch(() => ({} as Record<string, ContactWorkload>)),
        ]);
        setContacts(contactsData);
        setWorkloads(workloadsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contacts');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Refresh workloads
  const refreshWorkloads = async () => {
    try {
      const w = await getContactWorkloads();
      setWorkloads(w);
    } catch {
      // Non-critical, silently ignore
    }
  };

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
    refreshWorkloads();
  };

  // Handle delete contact
  const handleDeleteContact = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      refreshWorkloads();
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
      refreshWorkloads();
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
        case 'activeTasks':
          return direction * ((workloads[a.id]?.active || 0) - (workloads[b.id]?.active || 0));
        case 'completed':
          return direction * ((workloads[a.id]?.completed || 0) - (workloads[b.id]?.completed || 0));
        case 'overdue':
          return direction * ((workloads[a.id]?.overdue || 0) - (workloads[b.id]?.overdue || 0));
        default:
          return 0;
      }
    });

    return result;
  }, [contacts, searchQuery, sortConfig, workloads]);

  // Compute workload totals for summary cards
  const { totalActive, totalCompleted, totalOverdue } = useMemo(() => {
    let active = 0, completed = 0, overdue = 0;
    for (const w of Object.values(workloads)) {
      active += w.active;
      completed += w.completed;
      overdue += w.overdue;
    }
    return { totalActive: active, totalCompleted: completed, totalOverdue: overdue };
  }, [workloads]);

  // Fetch groups when groups tab is activated
  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const data = await listContactGroups();
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'groups') {
      fetchGroups();
    }
  }, [activeTab]);

  // Handle create group
  const handleCreateGroup = async (data: { name: string; description?: string; defaultCompletionMode: CompletionMode }) => {
    const newGroup = await createContactGroup(data);
    setGroups((prev) => [...prev, newGroup]);
  };

  // Handle delete group
  const confirmDeleteGroup = async () => {
    if (!confirmDeleteGroupId) return;
    const id = confirmDeleteGroupId;
    setConfirmDeleteGroupId(null);
    try {
      await deleteContactGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  // Handle open group detail
  const handleOpenGroupDetail = async (groupId: string) => {
    try {
      const detail = await getContactGroup(groupId);
      setSelectedGroup(detail);
      setShowGroupDetail(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group details');
    }
  };

  // Handle add member to group
  const handleAddGroupMember = async (contactId: string) => {
    if (!selectedGroup) return;
    const member = await addContactGroupMember(selectedGroup.id, { contactId });
    // Find the contact to populate the member info
    const contact = contacts.find((c) => c.id === contactId);
    const enrichedMember = { ...member, contact: contact ? { id: contact.id, name: contact.name, email: contact.email } : null };
    setSelectedGroup((prev) => prev ? { ...prev, members: [...prev.members, enrichedMember] } : prev);
    // Update member count in groups list
    setGroups((prev) => prev.map((g) => g.id === selectedGroup.id ? { ...g, memberCount: (g.memberCount || 0) + 1 } : g));
  };

  // Handle remove member from group
  const handleRemoveGroupMember = async (memberId: string) => {
    if (!selectedGroup) return;
    await removeContactGroupMember(selectedGroup.id, memberId);
    setSelectedGroup((prev) => prev ? { ...prev, members: prev.members.filter((m) => m.id !== memberId) } : prev);
    setGroups((prev) => prev.map((g) => g.id === selectedGroup.id ? { ...g, memberCount: Math.max((g.memberCount || 1) - 1, 0) } : g));
  };

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

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Contact</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contact? Any active task assignments will be affected.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline error banner for action errors */}
      {error && contacts.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Group dialogs */}
      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onSubmit={handleCreateGroup}
      />

      {showGroupDetail && (
        <GroupDetailDialog
          group={selectedGroup}
          contacts={contacts}
          onClose={() => { setShowGroupDetail(false); setSelectedGroup(null); }}
          onAddMember={handleAddGroupMember}
          onRemoveMember={handleRemoveGroupMember}
        />
      )}

      {/* Delete group confirmation dialog */}
      {confirmDeleteGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDeleteGroupId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Group</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this contact group? Members will not be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteGroupId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGroup}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('contacts')}
          className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'contacts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
        >
          Contacts
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={cn('px-4 py-2 text-sm font-medium rounded-md transition-colors', activeTab === 'groups' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}
        >
          Groups
        </button>
      </div>

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                <FeatureTooltip content="Contacts are external people (clients, vendors, partners) who complete tasks in your flows via secure email links." side="bottom">
                  <span>Contacts</span>
                </FeatureTooltip>
              </h1>
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

          {/* Workload Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Active Tasks</div>
              <div className="text-2xl font-bold text-blue-600">{totalActive}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Completed</div>
              <div className="text-2xl font-bold text-green-600">{totalCompleted}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-sm text-gray-500">Overdue</div>
              <div className="text-2xl font-bold text-red-600">{totalOverdue}</div>
            </div>
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
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Account
                    </th>
                    <SortableHeader
                      label="Last Active"
                      field="lastActive"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Active Tasks"
                      field="activeTasks"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Completed"
                      field="completed"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Overdue"
                      field="overdue"
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

                      {/* Account */}
                      <td className="px-6 py-4 text-sm">
                        {contact.account ? (
                          <Link
                            to={`/accounts/${contact.account.id}`}
                            className="text-violet-600 hover:text-violet-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {contact.account.name}
                          </Link>
                        ) : (
                          <span className="text-gray-400">{'\u2014'}</span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatRelativeDate(contact.updatedAt)}
                      </td>

                      {/* Active Tasks */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {workloads[contact.id]?.active || 0}
                      </td>

                      {/* Completed */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {workloads[contact.id]?.completed || 0}
                      </td>

                      {/* Overdue */}
                      <td className="px-6 py-4 text-sm">
                        <span className={(workloads[contact.id]?.overdue || 0) > 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                          {workloads[contact.id]?.overdue || 0}
                        </span>
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
        </>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Contact Groups</h1>
              <Badge variant="secondary" className="text-sm font-medium">
                {groups.length}
              </Badge>
            </div>
            <Button
              onClick={() => setShowCreateGroup(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </div>

          {isLoadingGroups ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
            </div>
          ) : groups.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Members</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completion Mode</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {groups.map((group) => (
                    <tr
                      key={group.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenGroupDetail(group.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                            <Users className="w-4 h-4 text-violet-700" />
                          </div>
                          <span className="font-medium text-gray-900">{group.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {group.description || '--'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {group.memberCount ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-600/20">
                          {COMPLETION_MODES.find((m) => m.value === group.defaultCompletionMode)?.label || group.defaultCompletionMode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteGroupId(group.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete group"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Empty state for groups */
            <div className="text-center py-20 px-6">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 animate-pulse" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-50 to-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200/50 transform -rotate-6">
                    <Users className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No contact groups yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                Groups let you assign tasks to multiple contacts at once. Create a group and add members to get started.
              </p>

              <Button
                onClick={() => setShowCreateGroup(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200/50"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create your first group
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
