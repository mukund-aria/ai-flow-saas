import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  SkipForward,
  Layers,
  Sparkles,
  Link2,
  Tag,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Phase 2 enhancement options
interface Phase2Option {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  hasDetails: boolean;
  detailsLabel?: string;
  detailsPlaceholder?: string;
  detailsMultiline?: boolean;
  subFields?: {
    id: string;
    label: string;
    placeholder: string;
  }[];
}

const PHASE2_OPTIONS: Phase2Option[] = [
  {
    id: 'milestones',
    label: 'Organize into stages',
    description: 'Group steps into phases or milestones for better tracking',
    icon: <Layers className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Describe the stages you want',
    detailsPlaceholder: 'e.g., "Initiation, Review, Completion" or describe the phases',
    detailsMultiline: true,
  },
  {
    id: 'aiAutomation',
    label: 'Add AI automation',
    description: 'Extract data, summarize docs, translate, transcribe, write content, or run custom AI tasks',
    icon: <Sparkles className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'What would you like AI to help with? (Available: Extract, Summarize, Translate, Transcribe, Write, Custom Prompt)',
    detailsPlaceholder: 'e.g., "Extract data from uploaded invoices", "Summarize client responses", "Translate documents to Spanish", "Transcribe meeting recordings"',
    detailsMultiline: true,
  },
  {
    id: 'integrations',
    label: 'Connect to other systems',
    description: 'Integrate with CRM, email, or other business tools',
    icon: <Link2 className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Which systems should this connect to?',
    detailsPlaceholder: 'e.g., "Salesforce", "HubSpot", "Send email to sales team"',
    detailsMultiline: true,
  },
  {
    id: 'naming',
    label: 'Set up naming convention',
    description: 'How each run of this flow should be named',
    icon: <Tag className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Naming pattern',
    detailsPlaceholder: 'e.g., "{Client Name} - Onboarding" or describe the pattern',
  },
  {
    id: 'permissions',
    label: 'Configure permissions',
    description: 'Control who can start, manage, or edit this flow',
    icon: <Users className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Permission settings',
    subFields: [
      { id: 'execute', label: 'Who can start this flow?', placeholder: 'e.g., Sales team, any user' },
      { id: 'coordinate', label: 'Who can manage active runs?', placeholder: 'e.g., Managers, admins' },
      { id: 'edit', label: 'Who can edit this flow design?', placeholder: 'e.g., Admin only' },
    ],
  },
];

interface Phase2CardProps {
  workflowName: string;
  onSubmit: (selectedOptions: Record<string, string | Record<string, string>>) => void;
  onSkip: () => void;
  isLocked?: boolean;
  wasSkipped?: boolean;
  savedSelections?: Record<string, string | Record<string, string>>;
}

export function Phase2Card({
  workflowName,
  onSubmit,
  onSkip,
  isLocked = false,
  wasSkipped = false,
  savedSelections
}: Phase2CardProps) {
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [details, setDetails] = useState<Record<string, string>>({});
  const [subFieldValues, setSubFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  // For skipped state - whether to show expanded view
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
      // Also collapse when deselecting
      const newExpanded = new Set(expandedOptions);
      newExpanded.delete(optionId);
      setExpandedOptions(newExpanded);
    } else {
      newSelected.add(optionId);
      // Auto-expand when selecting
      const newExpanded = new Set(expandedOptions);
      newExpanded.add(optionId);
      setExpandedOptions(newExpanded);
    }
    setSelectedOptions(newSelected);
  };

  const toggleExpand = (optionId: string) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionId)) {
      newExpanded.delete(optionId);
    } else {
      newExpanded.add(optionId);
    }
    setExpandedOptions(newExpanded);
  };

  const handleSubmit = () => {
    const result: Record<string, string | Record<string, string>> = {};

    selectedOptions.forEach((optionId) => {
      const option = PHASE2_OPTIONS.find((o) => o.id === optionId);
      if (!option) return;

      if (option.subFields) {
        // For options with sub-fields, include all sub-field values
        result[optionId] = subFieldValues[optionId] || {};
      } else if (details[optionId]?.trim()) {
        // For regular options with details text
        result[optionId] = details[optionId].trim();
      } else {
        // Selected but no details - still include it
        result[optionId] = 'yes';
      }
    });

    onSubmit(result);
  };

  const hasAnySelection = selectedOptions.size > 0;

  // Locked state - show what was selected
  if (isLocked && savedSelections) {
    return (
      <Card className="border-2 border-green-200 bg-white max-w-lg shadow-lg shadow-green-100/30 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-b border-green-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-green-700">Enhancements submitted</span>
          </div>
        </div>
        <CardContent className="space-y-2.5 p-4">
          {Object.entries(savedSelections).map(([optionId, value]) => {
            const option = PHASE2_OPTIONS.find((o) => o.id === optionId);
            if (!option) return null;

            return (
              <div key={optionId} className="flex items-start gap-2.5 p-2.5 bg-green-50/40 rounded-lg border border-green-100/60">
                <div className="text-green-600 mt-0.5 shrink-0">{option.icon}</div>
                <div className="min-w-0">
                  <span className="font-medium text-sm text-gray-700">{option.label}</span>
                  {typeof value === 'string' && value !== 'yes' && (
                    <p className="text-gray-600 text-xs mt-0.5">{value}</p>
                  )}
                  {typeof value === 'object' && (
                    <div className="text-gray-600 text-xs mt-0.5 space-y-0.5">
                      {Object.entries(value).map(([fieldId, fieldValue]) => (
                        fieldValue && <p key={fieldId}>• {fieldValue}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // Skip state - collapsible to show what was available
  if (isLocked && wasSkipped) {
    return (
      <Card className="border border-gray-200 bg-gray-50/50 max-w-lg">
        {/* Collapsed header - always visible */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100/50 transition-colors"
          onClick={() => setIsSkippedExpanded(!isSkippedExpanded)}
        >
          <div className="flex items-center gap-2 text-gray-500 text-base">
            <SkipForward className="w-4 h-4" />
            <span>Enhancement options skipped</span>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded">
            {isSkippedExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Expanded view - shows available options (read-only) */}
        {isSkippedExpanded && (
          <CardContent className="pt-0 pb-4 border-t border-gray-200">
            <p className="text-sm text-gray-400 mb-3">These options were available:</p>
            <div className="space-y-2">
              {PHASE2_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-gray-100/50"
                >
                  <div className="text-gray-400 shrink-0">{option.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-gray-500">{option.label}</p>
                    <p className="text-sm text-gray-400 truncate">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3 italic">
              You can still ask me to add these enhancements anytime.
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="border-2 border-amber-200 bg-white max-w-lg shadow-lg shadow-amber-100/30 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 pt-0 px-0">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border-b border-amber-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <Lightbulb className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">What's next?</h3>
              <p className="text-xs text-amber-600 font-medium">Optional enhancements for {workflowName}</p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-2 px-4">
        {PHASE2_OPTIONS.map((option) => {
          const isSelected = selectedOptions.has(option.id);
          const isExpanded = expandedOptions.has(option.id);

          return (
            <div
              key={option.id}
              className={cn(
                'rounded-xl border transition-all',
                isSelected
                  ? 'border-amber-300 bg-amber-50/30 shadow-sm'
                  : 'border-gray-200 bg-gray-50/30 hover:bg-gray-50 hover:border-gray-300'
              )}
            >
              {/* Option header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleOption(option.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOption(option.id)}
                  className="shrink-0"
                />
                <div className={cn('shrink-0', isSelected ? 'text-amber-600' : 'text-gray-400')}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-base font-medium', isSelected ? 'text-gray-900' : 'text-gray-700')}>
                    {option.label}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{option.description}</p>
                </div>
                {isSelected && option.hasDetails && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(option.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isSelected && isExpanded && option.hasDetails && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                  {option.subFields ? (
                    <div className="space-y-4 mt-3">
                      {option.subFields.map((field) => (
                        <div key={field.id}>
                          <label className="text-sm text-gray-600 block mb-2">{field.label}</label>
                          <Input
                            value={subFieldValues[option.id]?.[field.id] || ''}
                            onChange={(e) =>
                              setSubFieldValues((prev) => ({
                                ...prev,
                                [option.id]: {
                                  ...(prev[option.id] || {}),
                                  [field.id]: e.target.value,
                                },
                              }))
                            }
                            placeholder={field.placeholder}
                            className="text-sm bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="text-sm text-gray-600 block mb-2">
                        {option.detailsLabel}
                      </label>
                      {option.detailsMultiline ? (
                        <Textarea
                          value={details[option.id] || ''}
                          onChange={(e) =>
                            setDetails((prev) => ({ ...prev, [option.id]: e.target.value }))
                          }
                          placeholder={option.detailsPlaceholder}
                          className="text-sm bg-white min-h-[60px]"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={details[option.id] || ''}
                          onChange={(e) =>
                            setDetails((prev) => ({ ...prev, [option.id]: e.target.value }))
                          }
                          placeholder={option.detailsPlaceholder}
                          className="text-sm bg-white"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="pt-2 gap-2 border-t border-amber-100/50 px-4">
        <Button variant="outline" onClick={onSkip} className="flex-1 rounded-full border-gray-300">
          <SkipForward className="w-4 h-4 mr-1.5" />
          Skip for now
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasAnySelection}
          className="flex-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
        >
          <Send className="w-4 h-4 mr-1.5" />
          Enhance workflow
        </Button>
      </CardFooter>
    </Card>
  );
}
