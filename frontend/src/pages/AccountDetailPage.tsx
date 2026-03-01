/**
 * Account Detail Page
 *
 * Shows account details with tabs for Contacts and Flows.
 * Matches the Coordinator Portal design with violet/indigo theme.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Users,
  PlayCircle,
  Pencil,
  Loader2,
  X,
  Mail,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getAccount,
  updateAccount,
  getAccountContacts,
  getAccountFlows,
  type Account,
  type Contact,
  type AccountFlow,
} from '@/lib/api';

// Edit Account Dialog
interface EditAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account;
  onSubmit: (data: { name: string; domain?: string }) => Promise<void>;
}

function EditAccountDialog({ open, onOpenChange, account, onSubmit }: EditAccountDialogProps) {
  const [name, setName] = useState(account.name);
  const [domain, setDomain] = useState(account.domain || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setName(account.name);
    setDomain(account.domain || '');
  }, [account]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), domain: domain.trim() || undefined });
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Account</h2>
        <p className="text-sm text-gray-500 mb-6">
          Update account details
        </p>

        {submitError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-account-name" className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            <input
              id="edit-account-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="edit-account-domain" className="block text-sm font-medium text-gray-700 mb-1">
              Domain (optional)
            </label>
            <input
              id="edit-account-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. acme.com"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
            />
          </div>

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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<Account | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accountFlows, setAccountFlows] = useState<AccountFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'contacts' | 'flows'>('contacts');
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        setIsLoading(true);
        const [accountData, contactsData, flowsData] = await Promise.all([
          getAccount(id!),
          getAccountContacts(id!),
          getAccountFlows(id!),
        ]);
        setAccount(accountData);
        setContacts(contactsData);
        setAccountFlows(flowsData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load account');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleUpdateAccount = async (data: { name: string; domain?: string }) => {
    if (!id) return;
    const updated = await updateAccount(id, data);
    setAccount(updated);
  };

  // Get initials from name
  function getInitials(name: string): string {
    if (!name || !name.trim()) return '??';
    return name
      .split(' ')
      .filter((w) => w)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading account...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !account) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading account</p>
          <p className="text-sm mt-1">{error || 'Account not found'}</p>
        </div>
        <button
          onClick={() => navigate('/accounts')}
          className="mt-4 text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {account && showEditDialog && (
        <EditAccountDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          account={account}
          onSubmit={handleUpdateAccount}
        />
      )}

      {/* Back button */}
      <button
        onClick={() => navigate('/accounts')}
        className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Accounts
      </button>

      {/* Account Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
            {account.domain && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                <Globe className="w-3.5 h-3.5" />
                {account.domain}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowEditDialog(true)}
          className="flex items-center gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'contacts'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Contacts
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {contacts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('flows')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'flows'
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            Flows
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {accountFlows.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'contacts' && (
        <div>
          {contacts.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-violet-700 text-xs font-semibold ring-2 ring-white shadow-sm">
                            {getInitials(contact.name)}
                          </div>
                          <span className="font-medium text-gray-900">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts</h3>
              <p className="text-gray-500">
                No contacts are associated with this account yet.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flows' && (
        <div>
          {accountFlows.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accountFlows.map((run) => (
                    <tr
                      key={run.flowId}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/flows/${run.flowId}`)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="font-medium text-gray-900">{run.flowName}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{run.templateName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                            run.flowStatus === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20'
                              : run.flowStatus === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                              : run.flowStatus === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 ring-1 ring-red-600/20'
                              : 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/20'
                          }`}
                        >
                          {run.flowStatus === 'IN_PROGRESS'
                            ? 'In Progress'
                            : run.flowStatus === 'COMPLETED'
                            ? 'Completed'
                            : run.flowStatus === 'CANCELLED'
                            ? 'Cancelled'
                            : run.flowStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {run.flowStartedAt
                          ? new Date(run.flowStartedAt).toLocaleDateString()
                          : '\u2014'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <PlayCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flows</h3>
              <p className="text-gray-500">
                No flow runs are associated with this account yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
