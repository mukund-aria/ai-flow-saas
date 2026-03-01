/**
 * DDR Picker (Dynamic Data Reference)
 *
 * Popover component that displays available data sources for inserting
 * dynamic references into step configurations. Shows kickoff fields,
 * assignee role data, previous step outputs, and workspace variables.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Braces, Users, ListChecks, Building2 } from 'lucide-react';
import type { Flow } from '@/types';

interface DDRPickerProps {
  open: boolean;
  onClose: () => void;
  onInsert: (token: string) => void;
  /** The current flow for context */
  workflow: Flow;
  /** Index of current step (to only show earlier steps as data sources) */
  currentStepIndex?: number;
  /** Anchor position for the popover */
  anchorRef?: React.RefObject<HTMLElement | null>;
}

interface DDRItem {
  token: string;
  label: string;
}

interface DDRSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: DDRItem[];
}

function buildSections(workflow: Flow, currentStepIndex?: number): DDRSection[] {
  const sections: DDRSection[] = [];

  // 1. Kickoff Data
  const kickoffFields = workflow.kickoff?.kickoffFormFields;
  if (kickoffFields && kickoffFields.length > 0) {
    sections.push({
      id: 'kickoff',
      title: 'Kickoff Data',
      icon: <Braces className="w-3.5 h-3.5" />,
      items: kickoffFields.map((field) => ({
        token: `{Kickoff / ${field.label}}`,
        label: field.label,
      })),
    });
  }

  // 2. Role Fields
  const assignees = workflow.roles;
  if (assignees && assignees.length > 0) {
    const roleItems: DDRItem[] = [];
    for (const assignee of assignees) {
      roleItems.push({
        token: `{Role: ${assignee.name} / Name}`,
        label: `${assignee.name} - Name`,
      });
      roleItems.push({
        token: `{Role: ${assignee.name} / Email}`,
        label: `${assignee.name} - Email`,
      });
    }
    sections.push({
      id: 'roles',
      title: 'Role Fields',
      icon: <Users className="w-3.5 h-3.5" />,
      items: roleItems,
    });
  }

  // 3. Step Outputs (only previous FORM steps)
  const stepsToShow = currentStepIndex !== undefined
    ? workflow.steps.slice(0, currentStepIndex)
    : workflow.steps;

  const formSteps = stepsToShow.filter(
    (step) => step.type === 'FORM' && step.config.formFields && step.config.formFields.length > 0
  );

  if (formSteps.length > 0) {
    const stepItems: DDRItem[] = [];
    for (const step of formSteps) {
      for (const field of step.config.formFields!) {
        stepItems.push({
          token: `{${step.config.name} / ${field.label}}`,
          label: `${step.config.name} / ${field.label}`,
        });
      }
    }
    sections.push({
      id: 'steps',
      title: 'Step Outputs',
      icon: <ListChecks className="w-3.5 h-3.5" />,
      items: stepItems,
    });
  }

  // 4. Workspace
  sections.push({
    id: 'workspace',
    title: 'Workspace',
    icon: <Building2 className="w-3.5 h-3.5" />,
    items: [
      { token: '{Workspace / Name}', label: 'Workspace Name' },
      { token: '{Workspace / ID}', label: 'Workspace ID' },
    ],
  });

  return sections;
}

export function DDRPicker({
  open,
  onClose,
  onInsert,
  workflow,
  currentStepIndex,
  anchorRef,
}: DDRPickerProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const sections = useMemo(
    () => buildSections(workflow, currentStepIndex),
    [workflow, currentStepIndex]
  );

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const query = search.toLowerCase();
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.token.toLowerCase().includes(query)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, search]);

  // Focus search input when opened
  useEffect(() => {
    if (open) {
      setSearch('');
      // Small delay to ensure the popover is rendered
      const timer = setTimeout(() => {
        searchRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target as Node))
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchorRef]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const toggleSection = (sectionId: string) => {
    setCollapsed((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleInsert = (token: string) => {
    onInsert(token);
    onClose();
  };

  if (!open) return null;

  const totalItems = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-72 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Search */}
      <div className="p-2 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data references..."
            className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="max-h-80 overflow-y-auto py-1">
        {filteredSections.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-gray-400">No matching references found</p>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isCollapsed = collapsed[section.id] ?? false;

            return (
              <div key={section.id}>
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase text-gray-400 tracking-wider hover:bg-gray-50 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                  {section.icon}
                  <span className="flex-1 text-left">{section.title}</span>
                  <span className="text-xs font-normal text-gray-300">
                    {section.items.length}
                  </span>
                </button>

                {/* Section items */}
                {!isCollapsed && (
                  <div>
                    {section.items.map((item) => (
                      <button
                        key={item.token}
                        type="button"
                        onClick={() => handleInsert(item.token)}
                        className="w-full text-left px-4 py-1.5 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition-colors flex items-center gap-2 group"
                      >
                        <span className="text-violet-400 text-xs font-mono group-hover:text-violet-600 shrink-0">
                          {'{'}...{'}'}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <p className="text-xs text-gray-400">
          {totalItems} reference{totalItems !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  );
}
