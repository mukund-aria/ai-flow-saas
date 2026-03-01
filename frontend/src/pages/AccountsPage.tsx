/**
 * Accounts Page
 *
 * Manage accounts (companies, clients, vendors) with search and table view.
 * Matches the Coordinator Portal design with violet/indigo theme.
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Building2,
  Loader2,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  listAccounts,
  createAccount,
  type Account,
} from '@/lib/api';

// Sort configuration
type SortField = 'name' | 'domain' | 'contactCount' | 'activeFlowCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
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

// Add Account Dialog
interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (account: { name: string; domain?: string }) => Promise<void>;
}

function AddAccountDialog({ open, onOpenChange, onSubmit }: AddAccountDialogProps) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), domain: domain.trim() || undefined });
      setName('');
      setDomain('');
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create account');
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">New Account</h2>
        <p className="text-sm text-gray-500 mb-6">
          Add a new account to group contacts and flows
        </p>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Name */}
          <div>
            <label htmlFor="account-name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              id="account-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
              autoFocus
            />
          </div>

          {/* Domain */}
          <div>
            <label htmlFor="account-domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain (optional)
            </label>
            <input
              id="account-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
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
              disabled={isSubmitting || !name.trim()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AccountsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const data = await listAccounts();
        setAccounts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load accounts');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle sort
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle add account
  const handleAddAccount = async (account: { name: string; domain?: string }) => {
    const newAccount = await createAccount(account);
    setAccounts((prev) => [...prev, newAccount]);
  };

  // Filter and sort accounts
  const filteredAccounts = useMemo(() => {
    let result = accounts.filter(
      (account) =>
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (account.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.field) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'domain':
          return direction * (a.domain || '').localeCompare(b.domain || '');
        case 'contactCount':
          return direction * ((a.contactCount || 0) - (b.contactCount || 0));
        case 'activeFlowCount':
          return direction * ((a.activeFlowCount || 0) - (b.activeFlowCount || 0));
        case 'createdAt': {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return direction * (dateA - dateB);
        }
        default:
          return 0;
      }
    });

    return result;
  }, [accounts, searchQuery, sortConfig]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading accounts...</p>
        </div>
      </div>
    );
  }

  // Error state (only if no accounts loaded)
  if (error && accounts.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading accounts</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddAccount}
      />

      {/* Inline error banner for action errors */}
      {error && accounts.length > 0 && (
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
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <Badge variant="secondary" className="text-sm font-medium">
            {accounts.length}
          </Badge>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-200/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* Accounts Table */}
      {filteredAccounts.length > 0 ? (
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
                <SortableHeader
                  label="Domain"
                  field="domain"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Contacts"
                  field="contactCount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Active Flows"
                  field="activeFlowCount"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Created"
                  field="createdAt"
                  sortConfig={sortConfig}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.map((account) => (
                <tr
                  key={account.id}
                  className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/accounts/${account.id}`)}
                >
                  {/* Name with Icon */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 ring-2 ring-white shadow-sm">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {account.name}
                      </span>
                    </div>
                  </td>

                  {/* Domain */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {account.domain || '\u2014'}
                  </td>

                  {/* Contact Count */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.contactCount || 0}
                  </td>

                  {/* Active Flows */}
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.activeFlowCount || 0}
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : '\u2014'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : accounts.length === 0 ? (
        /* Empty State - No accounts at all */
        <div className="text-center py-20 px-6">
          {/* Illustration */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 animate-pulse" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-50 to-white" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-200/50 transform -rotate-6">
                <Building2 className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            No accounts yet
          </h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
            Accounts represent companies or organizations you work with. Group contacts and track flow activity per account.
          </p>

          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add your first account
          </Button>
        </div>
      ) : (
        /* No results for search */
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No accounts found
          </h3>
          <p className="text-gray-500 mb-4">
            No accounts match your search criteria
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  );
}
