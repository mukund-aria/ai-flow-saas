/**
 * Reassign Step Dialog
 *
 * Dialog for reassigning a step to a different contact or team member.
 */

import { useState, useEffect, useMemo } from 'react';
import { Loader2, Search, User, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { listContacts, reassignStep, type Contact } from '@/lib/api';
import { cn } from '@/lib/utils';

interface ReassignStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  stepId: string;
  currentAssignee?: { name: string; type: 'contact' | 'user' };
  onReassigned: () => void;
}

export function ReassignStepDialog({
  open,
  onOpenChange,
  runId,
  stepId,
  currentAssignee,
  onReassigned,
}: ReassignStepDialogProps) {
  const [assignType, setAssignType] = useState<'contact' | 'user'>('contact');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoadingContacts(true);
      setSearchQuery('');
      setSelectedId(null);
      setError(null);
      listContacts()
        .then(setContacts)
        .catch(() => setContacts([]))
        .finally(() => setIsLoadingContacts(false));
    }
  }, [open]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const assignment =
        assignType === 'contact'
          ? { assignToContactId: selectedId }
          : { assignToUserId: selectedId };
      await reassignStep(runId, stepId, assignment);
      onReassigned();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reassign step');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Step</DialogTitle>
          <DialogDescription>
            Choose a new assignee for this step.
          </DialogDescription>
        </DialogHeader>

        {/* Current assignee info */}
        {currentAssignee && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {(currentAssignee.name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-600">
              Currently assigned to{' '}
              <span className="font-medium text-gray-900">{currentAssignee.name}</span>
              <span className="text-gray-400 ml-1">
                ({currentAssignee.type === 'contact' ? 'external' : 'team member'})
              </span>
            </span>
          </div>
        )}

        {/* Assignment type toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => {
              setAssignType('contact');
              setSelectedId(null);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              assignType === 'contact'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <User className="w-3.5 h-3.5" />
            Contact
          </button>
          <button
            onClick={() => {
              setAssignType('user');
              setSelectedId(null);
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              assignType === 'user'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Team Member
          </button>
        </div>

        {assignType === 'contact' ? (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            {/* Contact list */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {isLoadingContacts && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500">Loading contacts...</span>
                </div>
              )}

              {!isLoadingContacts && filteredContacts.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-400">
                  {searchQuery ? 'No contacts match your search.' : 'No contacts found.'}
                </div>
              )}

              {!isLoadingContacts &&
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedId(contact.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors',
                      selectedId === contact.id && 'bg-violet-50 hover:bg-violet-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                        selectedId === contact.id
                          ? 'bg-violet-200 text-violet-700'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {(contact.name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{contact.name}</p>
                      <p className="text-xs text-gray-400 truncate">{contact.email}</p>
                    </div>
                    {selectedId === contact.id && (
                      <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-sm text-gray-400 border border-gray-200 rounded-lg">
            Team member assignment is not yet available.
            <br />
            <span className="text-xs">Use the Contact tab to reassign to an external contact.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedId || isSubmitting}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Reassigning...
              </>
            ) : (
              'Confirm Reassign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
