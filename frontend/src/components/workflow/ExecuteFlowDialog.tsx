/**
 * Execute Flow Dialog
 *
 * Modal dialog shown when a user clicks "Start Flow" on a template card.
 * Allows mapping abstract assignee roles to real contacts and filling in
 * kickoff form fields before executing a flow.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Play,
  Loader2,
  Search,
  ChevronDown,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { listContacts, startFlow, getTemplate } from '@/lib/api';
import type { Contact } from '@/lib/api';
import { getRoleColor, getRoleInitials } from '@/types';
import type { AssigneePlaceholder, KickoffConfig, FormField } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExecuteFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    definition?: Record<string, unknown>;
  };
  onFlowStarted: (run: { id: string }) => void;
}

// ---------------------------------------------------------------------------
// Contact Dropdown (searchable)
// ---------------------------------------------------------------------------

interface ContactDropdownProps {
  contacts: Contact[];
  value: string | null;
  onChange: (contactId: string | null) => void;
  placeholder?: string;
}

function ContactDropdown({
  contacts,
  value,
  onChange,
  placeholder = 'Select a contact...',
}: ContactDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find((c) => c.id === value) ?? null;

  const filtered = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [contacts, search]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
      >
        {selectedContact ? (
          <span className="flex items-center gap-2 truncate">
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-[10px] font-bold shrink-0">
              {selectedContact.name.charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-gray-900">
              {selectedContact.name}
            </span>
            <span className="text-gray-400 truncate hidden sm:inline">
              {selectedContact.email}
            </span>
          </span>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 text-center">
                No contacts found
              </div>
            ) : (
              filtered.map((contact) => (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => {
                    onChange(contact.id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-violet-50 transition-colors ${
                    contact.id === value ? 'bg-violet-50' : ''
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="text-gray-900 truncate w-full">
                      {contact.name}
                    </span>
                    <span className="text-gray-400 text-xs truncate w-full">
                      {contact.email}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Clear selection */}
          {value && (
            <div className="border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full px-3 py-2 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors text-center"
              >
                Clear selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kickoff Form Field Renderer
// ---------------------------------------------------------------------------

interface KickoffFieldProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function KickoffField({ field, value, onChange }: KickoffFieldProps) {
  const label = (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {field.label}
      {field.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const helpText = field.helpText ? (
    <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>
  ) : null;

  switch (field.type) {
    case 'TEXT_SINGLE_LINE':
    case 'EMAIL':
    case 'PHONE':
    case 'NAME':
      return (
        <div>
          {label}
          <Input
            type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : 'text'}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
          {helpText}
        </div>
      );

    case 'TEXT_MULTI_LINE':
    case 'ADDRESS':
      return (
        <div>
          {label}
          <Textarea
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
            rows={3}
          />
          {helpText}
        </div>
      );

    case 'NUMBER':
    case 'CURRENCY':
      return (
        <div>
          {label}
          <Input
            type="number"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
          {helpText}
        </div>
      );

    case 'DATE':
      return (
        <div>
          {label}
          <Input
            type="date"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {helpText}
        </div>
      );

    case 'SINGLE_SELECT':
    case 'DROPDOWN':
      return (
        <div>
          {label}
          <select
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {helpText}
        </div>
      );

    case 'MULTI_SELECT':
      return (
        <div>
          {label}
          <div className="space-y-1.5 border border-gray-200 rounded-lg p-2 max-h-36 overflow-y-auto">
            {field.options?.map((opt) => {
              const selected = Array.isArray(value) && (value as string[]).includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(value) ? (value as string[]) : [];
                      if (checked) {
                        onChange([...current, opt.value]);
                      } else {
                        onChange(current.filter((v) => v !== opt.value));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              );
            })}
          </div>
          {helpText}
        </div>
      );

    case 'FILE_UPLOAD':
      return (
        <div>
          {label}
          <input
            type="file"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-600 hover:file:bg-violet-100"
          />
          {helpText}
        </div>
      );

    case 'HEADING':
      return (
        <h4 className="text-sm font-semibold text-gray-900 pt-2">
          {field.label}
        </h4>
      );

    case 'PARAGRAPH':
      return (
        <p className="text-sm text-gray-500">{field.label}</p>
      );

    default:
      return (
        <div>
          {label}
          <Input
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || ''}
          />
          {helpText}
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Main Dialog Component
// ---------------------------------------------------------------------------

export function ExecuteFlowDialog({
  open,
  onOpenChange,
  template,
  onFlowStarted,
}: ExecuteFlowDialogProps) {
  // ---- State ----
  const [fullDefinition, setFullDefinition] = useState<Record<string, unknown> | null>(
    template.definition ?? null
  );
  const [definitionLoading, setDefinitionLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Fetch full template definition if not provided (list endpoint omits it)
  useEffect(() => {
    if (!open) return;
    if (template.definition) {
      setFullDefinition(template.definition);
      return;
    }
    let cancelled = false;
    setDefinitionLoading(true);
    getTemplate(template.id)
      .then((full) => {
        if (!cancelled) {
          setFullDefinition((full.definition as Record<string, unknown>) ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setFullDefinition(null);
      })
      .finally(() => {
        if (!cancelled) setDefinitionLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, template.id, template.definition]);

  // ---- Derived data from template definition ----
  const assigneePlaceholders: AssigneePlaceholder[] = useMemo(() => {
    if (!fullDefinition) return [];
    return (fullDefinition.assigneePlaceholders as AssigneePlaceholder[]) ?? [];
  }, [fullDefinition]);

  const kickoffConfig: KickoffConfig | null = useMemo(() => {
    if (!fullDefinition?.kickoff) return null;
    return fullDefinition.kickoff as KickoffConfig;
  }, [fullDefinition]);

  const kickoffFields: FormField[] = useMemo(() => {
    if (!kickoffConfig?.kickoffFormEnabled || !kickoffConfig.kickoffFormFields) {
      return [];
    }
    return kickoffConfig.kickoffFormFields;
  }, [kickoffConfig]);

  const hasRoles = assigneePlaceholders.length > 0;
  const hasKickoffForm = kickoffFields.length > 0;
  const [roleAssignments, setRoleAssignments] = useState<
    Record<string, string | null>
  >({});
  const [assignAllToMe, setAssignAllToMe] = useState(false);
  const [kickoffData, setKickoffData] = useState<Record<string, unknown>>({});
  const [runName, setRunName] = useState('');
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- Effects ----

  // Reset state when dialog opens / template changes
  useEffect(() => {
    if (open) {
      const dateStr = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      setRunName(`${template.name} - ${dateStr}`);
      setRoleAssignments({});
      setAssignAllToMe(false);
      setKickoffData({});
      setError(null);
      setExecuting(false);
    }
  }, [open, template.name]);

  // Fetch contacts when dialog opens and roles are known
  useEffect(() => {
    if (!open || definitionLoading || !hasRoles) return;

    let cancelled = false;
    setContactsLoading(true);

    listContacts()
      .then((data) => {
        if (!cancelled) {
          setContacts(data.filter((c) => c.status === 'ACTIVE'));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContacts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setContactsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, definitionLoading, hasRoles]);

  // ---- Handlers ----

  const handleAssignAllToMe = (checked: boolean) => {
    setAssignAllToMe(checked);
    if (checked) {
      // Use the first contact as a "me" fallback, or clear if none
      const meContact = contacts.find((c) => c.type === 'ADMIN') ?? contacts[0];
      if (meContact) {
        const assignments: Record<string, string | null> = {};
        assigneePlaceholders.forEach((p) => {
          assignments[p.roleName] = meContact.id;
        });
        setRoleAssignments(assignments);
      }
    } else {
      setRoleAssignments({});
    }
  };

  const handleRoleAssignment = (roleName: string, contactId: string | null) => {
    setAssignAllToMe(false);
    setRoleAssignments((prev) => ({ ...prev, [roleName]: contactId }));
  };

  const handleKickoffChange = (fieldId: string, value: unknown) => {
    setKickoffData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Check if all required fields are filled
  const isValid = useMemo(() => {
    if (!runName.trim()) return false;

    // Check required kickoff fields
    for (const field of kickoffFields) {
      if (field.required && field.type !== 'HEADING' && field.type !== 'PARAGRAPH') {
        const val = kickoffData[field.fieldId];
        if (val === undefined || val === null || val === '') return false;
        if (Array.isArray(val) && val.length === 0) return false;
      }
    }

    return true;
  }, [runName, kickoffFields, kickoffData]);

  const handleExecute = async () => {
    if (!isValid || executing) return;

    setExecuting(true);
    setError(null);

    try {
      // Build role assignments: roleName -> contactId (only non-null)
      const mappedRoles: Record<string, string> = {};
      for (const [roleName, contactId] of Object.entries(roleAssignments)) {
        if (contactId) {
          mappedRoles[roleName] = contactId;
        }
      }

      const options: { roleAssignments?: Record<string, string>; kickoffData?: Record<string, unknown> } = {};
      if (Object.keys(mappedRoles).length > 0) {
        options.roleAssignments = mappedRoles;
      }
      if (Object.keys(kickoffData).length > 0) {
        options.kickoffData = kickoffData;
      }

      const run = await startFlow(template.id, runName, options);
      onFlowStarted({ id: run.id ?? run.flowId });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start flow');
    } finally {
      setExecuting(false);
    }
  };

  // ---- Render ----

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !executing && onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-xl w-full mx-4 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Start Flow
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {template.name}
            </p>
          </div>
          <button
            onClick={() => !executing && onOpenChange(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Flow Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Flow Name
            </label>
            <Input
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              placeholder="Enter a name for this flow..."
            />
          </div>

          {/* Loading definition */}
          {definitionLoading && (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Loading flow details...</span>
            </div>
          )}

          {/* Role Mapping Section */}
          {!definitionLoading && hasRoles && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Assign Roles
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Map each role to a contact who will complete the assigned tasks.
              </p>

              {/* Assign all to me */}
              {contacts.length > 0 && (
                <label className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <Checkbox
                    checked={assignAllToMe}
                    onCheckedChange={handleAssignAllToMe}
                  />
                  <span className="text-sm text-gray-700">
                    Assign all roles to me
                  </span>
                </label>
              )}

              {/* Role list */}
              {contactsLoading ? (
                <div className="flex items-center justify-center py-6 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading contacts...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {assigneePlaceholders.map((placeholder, index) => (
                    <div key={placeholder.placeholderId}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: getRoleColor(index) }}
                        >
                          {getRoleInitials(placeholder.roleName)}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {placeholder.roleName}
                        </span>
                      </div>
                      {placeholder.description && (
                        <p className="text-xs text-gray-400 mb-1.5 ml-8">
                          {placeholder.description}
                        </p>
                      )}
                      <div className="ml-8">
                        <ContactDropdown
                          contacts={contacts}
                          value={roleAssignments[placeholder.roleName] ?? null}
                          onChange={(contactId) =>
                            handleRoleAssignment(placeholder.roleName, contactId)
                          }
                          placeholder={`Select contact for ${placeholder.roleName}...`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Kickoff Form Section */}
          {!definitionLoading && hasKickoffForm && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Kickoff Information
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Provide the initial information needed to start this flow.
              </p>

              <div className="space-y-4">
                {kickoffFields.map((field) => (
                  <KickoffField
                    key={field.fieldId}
                    field={field}
                    value={kickoffData[field.fieldId]}
                    onChange={(val) => handleKickoffChange(field.fieldId, val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state: no roles, no kickoff form */}
          {!definitionLoading && !hasRoles && !hasKickoffForm && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">
                This flow has no roles to assign or kickoff fields. You can
                start it right away.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={executing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={!isValid || executing}
              className="bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-300"
            >
              {executing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Execute
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
