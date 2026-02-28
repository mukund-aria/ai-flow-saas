import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Layers,
  Sparkles,
  Link2,
  Tag,
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  SkipForward,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/stores/workflowStore';

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
    description: 'Group steps into milestones for clearer progress tracking',
    icon: <Layers className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Describe the stages you want',
    detailsPlaceholder: 'e.g., "Initiation, Review, Completion" or leave blank for auto',
    detailsMultiline: true,
  },
  {
    id: 'aiAutomation',
    label: 'Add AI automation',
    description: 'Auto-extract data, summarize, translate, or generate content',
    icon: <Sparkles className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'What should AI help with?',
    detailsPlaceholder: 'e.g., "Extract data from uploaded invoices", "Summarize client responses"',
    detailsMultiline: true,
  },
  {
    id: 'integrations',
    label: 'Connect to other systems',
    description: 'Send data to CRM, email, Slack, or other tools',
    icon: <Link2 className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Which systems should this connect to?',
    detailsPlaceholder: 'e.g., "Send email to sales team", "Update Salesforce record"',
    detailsMultiline: true,
  },
  {
    id: 'naming',
    label: 'Set up naming convention',
    description: 'Define how each run of this flow gets named',
    icon: <Tag className="w-4 h-4" />,
    hasDetails: true,
    detailsLabel: 'Naming pattern',
    detailsPlaceholder: 'e.g., "{Client Name} - Onboarding"',
  },
  {
    id: 'permissions',
    label: 'Configure permissions',
    description: 'Control who can start, manage, or edit this flow',
    icon: <Shield className="w-4 h-4" />,
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

/**
 * Generate contextual hints based on the current workflow shape
 */
function useWorkflowHints() {
  const workflow = useWorkflowStore((s) => s.workflow);

  return useMemo(() => {
    if (!workflow) return {};

    const stepCount = workflow.steps?.length ?? 0;
    const hasForm = workflow.steps?.some((s) => s.type === 'FORM' || s.type === 'QUESTIONNAIRE');
    const hasApproval = workflow.steps?.some((s) => s.type === 'APPROVAL');
    const hasFileRequest = workflow.steps?.some((s) => s.type === 'FILE_REQUEST');
    const hasMilestones = (workflow.milestones?.length ?? 0) > 0;

    const hints: Record<string, string> = {};
    const recommended = new Set<string>();

    // Milestones hint
    if (stepCount >= 5 && !hasMilestones) {
      hints.milestones = `Your flow has ${stepCount} steps — organizing into stages makes progress easier to track.`;
      recommended.add('milestones');
    } else if (hasMilestones) {
      hints.milestones = 'Already organized into stages. You can adjust them here.';
    }

    // AI hint
    if (hasForm || hasFileRequest) {
      hints.aiAutomation = 'Forms and file uploads can be enhanced with AI extraction or summarization.';
    }

    // Naming hint
    if (hasForm) {
      hints.naming = 'Use a form field to auto-name each run (e.g., "{Client Name} - Onboarding").';
      recommended.add('naming');
    }

    // Permissions hint
    if (hasApproval) {
      hints.permissions = 'Approval steps work best with clear permission roles.';
    }

    return { hints, recommended };
  }, [workflow]);
}

export function Phase2Card({
  workflowName,
  onSubmit,
  onSkip,
  isLocked = false,
  wasSkipped = false,
  savedSelections,
}: Phase2CardProps) {
  const { hints, recommended } = useWorkflowHints();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(() => {
    // Pre-select recommended options
    return new Set(recommended);
  });
  const [details, setDetails] = useState<Record<string, string>>({});
  const [subFieldValues, setSubFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(() => {
    // Auto-expand recommended options
    return new Set(recommended);
  });
  const [isSkippedExpanded, setIsSkippedExpanded] = useState(false);

  const toggleOption = (optionId: string) => {
    const newSelected = new Set(selectedOptions);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
      const newExpanded = new Set(expandedOptions);
      newExpanded.delete(optionId);
      setExpandedOptions(newExpanded);
    } else {
      newSelected.add(optionId);
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
        result[optionId] = subFieldValues[optionId] || {};
      } else if (details[optionId]?.trim()) {
        result[optionId] = details[optionId].trim();
      } else {
        result[optionId] = 'yes';
      }
    });

    onSubmit(result);
  };

  const hasAnySelection = selectedOptions.size > 0;

  // Locked + submitted state
  if (isLocked && savedSelections) {
    return (
      <Card className="border border-green-200 bg-white max-w-lg rounded-xl overflow-hidden">
        <div className="bg-green-50 border-b border-green-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Enhancements submitted</span>
          </div>
        </div>
        <CardContent className="space-y-2 p-3">
          {Object.entries(savedSelections).map(([optionId, value]) => {
            const option = PHASE2_OPTIONS.find((o) => o.id === optionId);
            if (!option) return null;

            return (
              <div key={optionId} className="flex items-start gap-2 px-2 py-1.5 bg-green-50/50 rounded-lg">
                <div className="text-green-600 mt-0.5 shrink-0">{option.icon}</div>
                <div className="min-w-0">
                  <span className="font-medium text-sm text-gray-700">{option.label}</span>
                  {typeof value === 'string' && value !== 'yes' && (
                    <p className="text-gray-500 text-xs mt-0.5">{value}</p>
                  )}
                  {typeof value === 'object' && (
                    <div className="text-gray-500 text-xs mt-0.5 space-y-0.5">
                      {Object.entries(value).map(([fieldId, fieldValue]) => (
                        fieldValue && <p key={fieldId}>- {fieldValue}</p>
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

  // Locked + skipped state
  if (isLocked && wasSkipped) {
    return (
      <Card className="border border-gray-200 bg-gray-50/50 max-w-lg rounded-xl">
        <div
          className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-gray-100/50 transition-colors"
          onClick={() => setIsSkippedExpanded(!isSkippedExpanded)}
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <SkipForward className="w-3.5 h-3.5" />
            <span>Enhancement options skipped</span>
          </div>
          <button className="p-1 hover:bg-gray-200 rounded">
            {isSkippedExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>

        {isSkippedExpanded && (
          <CardContent className="pt-0 pb-3 border-t border-gray-200">
            <p className="text-sm text-gray-400 mb-2">These options were available:</p>
            <div className="space-y-1.5">
              {PHASE2_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-100/50"
                >
                  <div className="text-gray-400 shrink-0">{option.icon}</div>
                  <p className="text-sm text-gray-500">{option.label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">
              You can still ask me to add these anytime.
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  // Active (unlocked) state
  return (
    <Card className="border border-gray-200 bg-white max-w-lg rounded-xl overflow-hidden">
      {/* Lighter header */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5">
        <h3 className="font-semibold text-gray-900 text-sm">Optional enhancements</h3>
        <p className="text-xs text-gray-500 mt-0.5">Fine-tune <strong>{workflowName}</strong> before you start using it</p>
      </div>

      <CardContent className="space-y-1.5 py-3 px-3">
        {PHASE2_OPTIONS.map((option) => {
          const isSelected = selectedOptions.has(option.id);
          const isExpanded = expandedOptions.has(option.id);
          const isRecommended = recommended?.has(option.id);
          const hint = hints?.[option.id];

          return (
            <div
              key={option.id}
              className={cn(
                'rounded-lg border transition-all',
                isSelected
                  ? 'border-violet-200 bg-violet-50/30'
                  : 'border-gray-100 hover:border-gray-200'
              )}
            >
              {/* Option header */}
              <div
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                onClick={() => toggleOption(option.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleOption(option.id)}
                  className="shrink-0"
                />
                <div className={cn('shrink-0', isSelected ? 'text-violet-600' : 'text-gray-400')}>
                  {option.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={cn('text-sm font-medium', isSelected ? 'text-gray-900' : 'text-gray-700')}>
                      {option.label}
                    </p>
                    {isRecommended && (
                      <span className="text-[10px] font-medium text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {hint || option.description}
                  </p>
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
                      <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isSelected && isExpanded && option.hasDetails && (
                <div className="px-3 pb-2.5 pt-0 border-t border-gray-100">
                  {option.subFields ? (
                    <div className="space-y-3 mt-2.5">
                      {option.subFields.map((field) => (
                        <div key={field.id}>
                          <label className="text-sm text-gray-600 block mb-1.5">{field.label}</label>
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
                    <div className="mt-2.5">
                      <label className="text-sm text-gray-600 block mb-1.5">
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

      <CardFooter className="pt-2 gap-2 border-t border-gray-100 px-3 pb-3">
        <Button variant="ghost" onClick={onSkip} className="flex-1 text-gray-500 hover:text-gray-700">
          I'll do this later
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!hasAnySelection}
          className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
        >
          <Send className="w-4 h-4 mr-1.5" />
          Enhance workflow
        </Button>
      </CardFooter>
    </Card>
  );
}
