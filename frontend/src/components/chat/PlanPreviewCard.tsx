import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  Users,
  Lightbulb,
  FileText,
  ClipboardCheck,
  Upload,
  CheckCircle2,
  FileSignature,
  HelpCircle,
  Cog,
  Mail,
  GitBranch,
  ChevronDown,
  CheckCircle,
  Pencil,
  Send,
  Play,
  Zap,
  Clock,
  FormInput,
  Layers,
  Sparkles,
  FileSearch,
  Mic,
  Languages,
  PenTool,
  FileCheck,
  Plug,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { PendingPlan, Step, TriggerConfig, EditOperation, Milestone } from '@/types';
import { getRoleColor, getRoleInitials } from '@/types';

// ============================================================================
// Milestone Grouping Helpers
// ============================================================================

interface StepGroup {
  milestone?: Milestone;
  steps: Step[];
  globalStartIndex: number;  // The global step number this group starts at
}

/**
 * Groups steps by their milestones for visual rendering.
 * Milestones act as phase markers - steps after a milestone's afterStepId
 * belong to that milestone until the next milestone.
 */
function groupStepsByMilestones(steps: Step[], milestones: Milestone[]): StepGroup[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  if (!milestones || milestones.length === 0) {
    // No milestones - return all steps ungrouped
    return [{ steps, globalStartIndex: 0 }];
  }

  // Build a map of stepId to index
  const stepIdToIndex = new Map(steps.map((s, i) => [s.stepId, i]));

  // Determine where each milestone starts (the step index AFTER which it appears)
  // If afterStepId is empty/null, milestone starts at beginning (index -1)
  const milestoneStartPoints = milestones.map(m => ({
    milestone: m,
    startAfterIndex: m.afterStepId ? (stepIdToIndex.get(m.afterStepId) ?? -1) : -1,
  }));

  // Sort by start position
  milestoneStartPoints.sort((a, b) => a.startAfterIndex - b.startAfterIndex);

  const groups: StepGroup[] = [];

  // Check if there are steps before the first milestone
  const firstMilestoneStart = milestoneStartPoints.length > 0
    ? milestoneStartPoints[0].startAfterIndex + 1
    : steps.length;

  if (firstMilestoneStart > 0) {
    // There are pre-milestone steps
    groups.push({
      steps: steps.slice(0, firstMilestoneStart),
      globalStartIndex: 0,
    });
  }

  // Add milestone groups
  for (let i = 0; i < milestoneStartPoints.length; i++) {
    const current = milestoneStartPoints[i];
    const next = milestoneStartPoints[i + 1];

    // This milestone's steps start at (startAfterIndex + 1)
    const startIndex = current.startAfterIndex + 1;
    // And end at the next milestone's start, or end of steps
    const endIndex = next ? next.startAfterIndex + 1 : steps.length;

    if (startIndex <= endIndex) {
      groups.push({
        milestone: current.milestone,
        steps: steps.slice(startIndex, endIndex),
        globalStartIndex: startIndex,
      });
    }
  }

  return groups;
}

// ============================================================================
// Milestone Group Component
// ============================================================================

interface MilestoneGroupProps {
  milestone?: Milestone;
  steps: Step[];
  globalStartIndex: number;
  assignees: Array<{ placeholderId: string; roleName: string }>;
  isLastGroup: boolean;
  totalSteps: number;
}

function MilestoneGroup({
  milestone,
  steps,
  globalStartIndex,
  assignees,
  isLastGroup,
  totalSteps,
}: MilestoneGroupProps) {
  // If no milestone, render steps without a container (pre-milestone steps)
  if (!milestone) {
    return (
      <div className="space-y-2">
        {steps.map((step, index) => {
          const globalIndex = globalStartIndex + index;
          return (
            <StepRenderer
              key={step.stepId || `step-${globalIndex}`}
              step={step}
              stepNumber={String(globalIndex + 1)}
              isLast={globalIndex === totalSteps - 1}
              assignees={assignees}
              depth={0}
            />
          );
        })}
      </div>
    );
  }

  // Render milestone container - clean, minimal design
  return (
    <div className="relative">
      {/* Milestone header - subtle and clean */}
      <div className="flex items-center gap-2 mb-3 py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-base font-semibold text-gray-700">{milestone.name}</span>
        <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Steps container - clean indentation */}
      <div className="ml-4 pl-4 border-l border-gray-200 space-y-2">
        {steps.length > 0 ? (
          steps.map((step, index) => {
            const globalIndex = globalStartIndex + index;
            return (
              <StepRenderer
                key={step.stepId || `step-${globalIndex}`}
                step={step}
                stepNumber={String(globalIndex + 1)}
                isLast={isLastGroup && index === steps.length - 1}
                assignees={assignees}
                depth={0}
              />
            );
          })
        ) : (
          <p className="text-sm text-gray-400 italic py-2">No steps in this phase</p>
        )}
      </div>
    </div>
  );
}

interface PlanPreviewCardProps {
  plan: PendingPlan;
  onApprove: () => void;
  onRequestChanges?: (changes: string) => void;
  isPublished?: boolean;
}

// Step type to icon mapping
const STEP_ICONS: Record<string, React.ElementType> = {
  FORM: FileText,
  QUESTIONNAIRE: ClipboardCheck,
  FILE_REQUEST: Upload,
  TODO: CheckCircle2,
  APPROVAL: CheckCircle2,
  ACKNOWLEDGEMENT: CheckCircle2,
  ESIGN: FileSignature,
  DECISION: HelpCircle,
  CUSTOM_ACTION: Cog,
  WEB_APP: Cog,
  AI_CUSTOM_PROMPT: Sparkles,
  AI_EXTRACT: FileSearch,
  AI_SUMMARIZE: FileText,
  AI_TRANSCRIBE: Mic,
  AI_TRANSLATE: Languages,
  AI_WRITE: PenTool,
  PDF_FORM: FileCheck,
  SUB_FLOW: GitBranch,
  INTEGRATION_AIRTABLE: Plug,
  INTEGRATION_CLICKUP: Plug,
  INTEGRATION_DROPBOX: Plug,
  INTEGRATION_GMAIL: Plug,
  INTEGRATION_GOOGLE_DRIVE: Plug,
  INTEGRATION_GOOGLE_SHEETS: Plug,
  INTEGRATION_WRIKE: Plug,
  SYSTEM_EMAIL: Mail,
  SYSTEM_WEBHOOK: Cog,
  SYSTEM_CHAT_MESSAGE: Mail,
  BUSINESS_RULE: Cog,
};


// Summarize edit operations into user-friendly lines
function summarizeOperations(operations: EditOperation[]): string[] {
  const summary: string[] = [];

  // Group operations by type
  const addedSteps: string[] = [];
  const removedSteps: string[] = [];
  const updatedSteps: string[] = [];
  const movedSteps: string[] = [];
  let hasMetadataUpdate = false;
  let hasMilestoneChanges = false;
  const addedMilestones: string[] = [];

  for (const op of operations) {
    const stepName = op.step?.config?.name || op.stepId || 'step';

    // Check if this operation involves milestones
    if (op.op === 'UPDATE_FLOW_METADATA') {
      hasMetadataUpdate = true;
      // Check if milestones were modified
      if (op.updates?.milestones) {
        hasMilestoneChanges = true;
        const milestones = op.updates.milestones as Array<{ name: string }>;
        milestones.forEach(m => {
          if (m.name) addedMilestones.push(m.name);
        });
      }
    } else if (op.op === 'ADD_STEP_AFTER' || op.op === 'ADD_STEP_BEFORE' || op.op === 'ADD_PATH_STEP_AFTER' || op.op === 'ADD_PATH_STEP_BEFORE') {
      addedSteps.push(stepName);
    } else if (op.op === 'REMOVE_STEP') {
      removedSteps.push(stepName);
    } else if (op.op === 'UPDATE_STEP') {
      updatedSteps.push(stepName);
    } else if (op.op === 'MOVE_STEP') {
      movedSteps.push(stepName);
    }
  }

  // Build summary lines
  if (addedMilestones.length > 0) {
    summary.push(`Added milestones: ${addedMilestones.join(', ')}`);
  } else if (hasMilestoneChanges) {
    summary.push('Updated milestones');
  }

  if (hasMetadataUpdate && !hasMilestoneChanges) {
    summary.push('Updated workflow settings');
  }

  if (addedSteps.length > 0) {
    if (addedSteps.length <= 3) {
      summary.push(`Added steps: ${addedSteps.join(', ')}`);
    } else {
      summary.push(`Added ${addedSteps.length} steps`);
    }
  }

  if (removedSteps.length > 0) {
    if (removedSteps.length <= 3) {
      summary.push(`Removed steps: ${removedSteps.join(', ')}`);
    } else {
      summary.push(`Removed ${removedSteps.length} steps`);
    }
  }

  if (updatedSteps.length > 0) {
    if (updatedSteps.length <= 3) {
      summary.push(`Updated steps: ${updatedSteps.join(', ')}`);
    } else {
      summary.push(`Updated ${updatedSteps.length} steps`);
    }
  }

  if (movedSteps.length > 0) {
    if (movedSteps.length <= 3) {
      summary.push(`Reordered steps: ${movedSteps.join(', ')}`);
    } else {
      summary.push(`Reordered ${movedSteps.length} steps`);
    }
  }

  return summary.length > 0 ? summary : ['Made changes to workflow'];
}

export function PlanPreviewCard({ plan, onApprove, onRequestChanges, isPublished = false }: PlanPreviewCardProps) {
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesText, setChangesText] = useState('');
  const { workflow } = plan;

  // Determine if this is an edit or create preview
  const isEdit = plan.mode === 'edit';
  const operations = plan.operations || [];

  // Defensive: ensure arrays exist even if LLM omits them
  const assignees = Array.isArray(workflow?.assigneePlaceholders)
    ? workflow.assigneePlaceholders
    : [];
  const steps = Array.isArray(workflow?.steps) ? workflow.steps : [];
  const milestones = Array.isArray(workflow?.milestones) ? workflow.milestones : [];

  // Group steps by milestones for visual rendering
  const stepGroups = groupStepsByMilestones(steps, milestones);

  const handleRequestChanges = () => {
    if (changesText.trim() && onRequestChanges) {
      onRequestChanges(changesText.trim());
      setChangesText('');
      setShowChangesInput(false);
    }
  };

  return (
    <Card className={cn(
      "w-full max-w-lg shadow-lg rounded-2xl overflow-hidden",
      isPublished
        ? "border border-green-200 bg-white"
        : "border border-gray-200 bg-white"
    )}>
      {/* Header - clean, minimal */}
      <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{workflow?.name || 'New Workflow'}</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {steps.length} steps • {assignees.length} roles
            </p>
          </div>
          {isPublished ? (
            <Badge variant="default" className="shrink-0 bg-green-600 text-white rounded-full px-3">
              <CheckCircle className="w-3 h-3 mr-1" />
              {isEdit ? 'Updated' : 'Published'}
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0 text-gray-600 bg-white rounded-full px-3">
              {isEdit ? 'Edit Preview' : 'Preview'}
            </Badge>
          )}
        </div>

        {/* Roles - clean pills */}
        {assignees.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {assignees.map((a, i) => (
                <span
                  key={a.placeholderId}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700"
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ backgroundColor: getRoleColor(i) }}
                  >
                    {getRoleInitials(a.roleName)}
                  </span>
                  {a.roleName}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trigger */}
        {workflow?.triggerConfig && (
          <TriggerSection triggerConfig={workflow.triggerConfig} />
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Visual Step Timeline - scrollable for long workflows */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {stepGroups.length > 0 ? (
            stepGroups.map((group, groupIndex) => (
              <MilestoneGroup
                key={group.milestone?.milestoneId || `group-${groupIndex}`}
                milestone={group.milestone}
                steps={group.steps}
                globalStartIndex={group.globalStartIndex}
                assignees={assignees}
                isLastGroup={groupIndex === stepGroups.length - 1}
                totalSteps={steps.length}
              />
            ))
          ) : (
            <p className="text-base text-gray-500 text-center py-4">No steps defined</p>
          )}
        </div>

        {/* Step count indicator for long workflows */}
        {steps.length > 10 && (
          <p className="text-sm text-gray-400 text-center">
            Scroll to see all {steps.length} steps
          </p>
        )}

        {/* Edit Operations Summary (for edit mode) - clean design */}
        {isEdit && operations.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
              <Pencil className="w-3.5 h-3.5" />
              Changes being made:
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5 ml-5">
              {summarizeOperations(operations).map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assumptions - clean, subtle design */}
        {plan.assumptions && plan.assumptions.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5" />
              I made these assumptions:
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5 ml-5">
              {plan.assumptions.map((assumption, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>

      {/* Actions - clean footer */}
      <CardFooter className={cn(
        "border-t p-4 flex-col gap-3",
        isPublished
          ? "border-green-100 bg-green-50/30"
          : "border-gray-100 bg-gray-50/30"
      )}>
        {isPublished ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-base font-medium">
              {isEdit ? 'Changes applied successfully' : 'Workflow created successfully'}
            </span>
          </div>
        ) : showChangesInput ? (
          <div className="w-full space-y-3">
            <Textarea
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="Describe the changes you'd like..."
              className="min-h-[60px] text-sm resize-none rounded-xl border-gray-200"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowChangesInput(false);
                  setChangesText('');
                }}
                className="flex-1 rounded-full"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleRequestChanges}
                disabled={!changesText.trim()}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
              >
                <Send className="w-4 h-4 mr-1.5" />
                Send
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center w-full">
              {isEdit
                ? 'Apply these changes to your workflow, or request different changes'
                : 'Approve to create this workflow, or request changes'}
            </p>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangesInput(true)}
                className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4 mr-1.5" />
                {isEdit ? 'Different Changes' : 'Make Changes'}
              </Button>
              <Button
                size="sm"
                onClick={onApprove}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
              >
                <Check className="w-4 h-4 mr-1.5" />
                {isEdit ? 'Apply Changes' : 'Proceed & Create!'}
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

// Trigger section component - clean, minimal design
function TriggerSection({ triggerConfig }: { triggerConfig: TriggerConfig }) {
  const isManual = triggerConfig.type === 'manual';
  const isAutomatic = triggerConfig.type === 'automatic';
  const isScheduled = triggerConfig.type === 'scheduled';

  const TriggerIcon = isManual ? Play : isAutomatic ? Zap : Clock;
  const triggerLabel = isManual ? 'Manual Start' : isAutomatic ? 'Automatic Trigger' : 'Scheduled';

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="p-3 rounded-xl bg-white border border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
            <TriggerIcon className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-base font-medium text-gray-700">{triggerLabel}</span>
        </div>

        {/* Initiator (for manual) */}
        {isManual && triggerConfig.initiator && (
          <p className="text-sm text-gray-500 mt-2 ml-10">
            Started by: <span className="font-medium text-gray-700">{triggerConfig.initiator}</span>
          </p>
        )}

        {/* Kickoff fields (for manual with form) */}
        {isManual && triggerConfig.kickoffFields && triggerConfig.kickoffFields.length > 0 && (
          <div className="mt-2 ml-10">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
              <FormInput className="w-3.5 h-3.5" />
              <span>Kickoff form collects:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {triggerConfig.kickoffFields.map((field, i) => (
                <span
                  key={i}
                  className="inline-block px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-600"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Trigger source (for automatic) */}
        {isAutomatic && triggerConfig.triggerSource && (
          <p className="text-sm text-gray-500 mt-2 ml-10">
            Triggered from: <span className="font-medium text-gray-700">{triggerConfig.triggerSource}</span>
          </p>
        )}

        {/* Schedule (for scheduled) */}
        {isScheduled && triggerConfig.schedule && (
          <p className="text-sm text-gray-500 mt-2 ml-10">
            Schedule: <span className="font-medium text-gray-700">{triggerConfig.schedule}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// Check if step has branches or decision outcomes
function hasBranchesOrOutcomes(step: Step): boolean {
  const hasPaths = !!(step?.config?.paths && Array.isArray(step.config.paths) && step.config.paths.length > 0);
  const hasOutcomes = !!(step?.config?.outcomes && Array.isArray(step.config.outcomes) && step.config.outcomes.length > 0);
  return hasPaths || hasOutcomes;
}

// Step renderer that handles both regular steps and branches
interface StepRendererProps {
  step: Step;
  stepNumber: string;
  isLast: boolean;
  assignees: Array<{ placeholderId: string; roleName: string }>;
  depth?: number;
}

function StepRenderer({ step, stepNumber, isLast, assignees, depth = 0 }: StepRendererProps) {
  const hasBranches = hasBranchesOrOutcomes(step);

  if (hasBranches) {
    return (
      <BranchStepCard
        step={step}
        stepNumber={stepNumber}
        isLast={isLast}
        assignees={assignees}
        depth={depth}
      />
    );
  }

  return (
    <StepCard
      step={step}
      stepNumber={stepNumber}
      isLast={isLast}
      assignees={assignees}
      depth={depth}
    />
  );
}

// Branch step card with expandable paths
interface BranchStepCardProps {
  step: Step;
  stepNumber: string;
  isLast: boolean;
  assignees: Array<{ placeholderId: string; roleName: string }>;
  depth: number;
}

function BranchStepCard({ step, stepNumber, isLast, assignees, depth }: BranchStepCardProps) {
  const [expanded, setExpanded] = useState(true);
  const config = step?.config || {};
  const paths = config.paths || config.outcomes || [];
  const isDecision = step?.type === 'DECISION';

  return (
    <div className="flex items-stretch gap-3">
      {/* Timeline - clean vertical line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
            'bg-gray-100 text-gray-600 border border-gray-200'
          )}
        >
          {stepNumber}
        </div>
        {(!isLast || expanded) && (
          <div className="w-px flex-1 bg-gray-200 my-1" />
        )}
      </div>

      {/* Branch content - clean card */}
      <div className="flex-1 mb-2">
        <div
          className={cn(
            'p-3 rounded-xl border bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow',
            'border-gray-100'
          )}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-medium text-base text-gray-800 truncate">
                {config.name || step?.type || 'Branch'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {paths.length} {isDecision ? 'outcomes' : 'paths'}
              </span>
              <ChevronDown className={cn(
                "w-4 h-4 text-gray-400 transition-transform",
                !expanded && "-rotate-90"
              )} />
            </div>
          </div>
          {config.description && (
            <p className="text-sm text-gray-500 mt-2 ml-10 line-clamp-2">
              {config.description}
            </p>
          )}
        </div>

        {/* Expanded paths - clean indentation */}
        {expanded && paths.length > 0 && (
          <div className="mt-3 ml-4 border-l border-gray-200 pl-4 space-y-3">
            {paths.map((path: { pathId?: string; outcomeId?: string; label?: string; steps?: Step[] }, pathIndex: number) => {
              const pathId = path.pathId || path.outcomeId || `path-${pathIndex}`;
              const pathLabel = path.label || `${isDecision ? 'Outcome' : 'Path'} ${pathIndex + 1}`;
              const pathSteps = path.steps || [];

              return (
                <div key={pathId}>
                  {/* Path header - minimal */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">{pathIndex + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{pathLabel}</span>
                    <span className="text-xs text-gray-400">
                      ({pathSteps.length} step{pathSteps.length !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {/* Path steps */}
                  {pathSteps.length > 0 ? (
                    <div className="space-y-1">
                      {pathSteps.map((nestedStep: Step, nestedIndex: number) => (
                        <StepRenderer
                          key={nestedStep.stepId || `${pathId}-step-${nestedIndex}`}
                          step={nestedStep}
                          stepNumber={`${stepNumber}.${nestedIndex + 1}`}
                          isLast={nestedIndex === pathSteps.length - 1}
                          assignees={assignees}
                          depth={depth + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic ml-7">No steps</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Regular step card - clean, minimal design
interface StepCardProps {
  step: Step;
  stepNumber: string;
  isLast: boolean;
  assignees: Array<{ placeholderId: string; roleName: string }>;
  depth?: number;
}

function StepCard({ step, stepNumber, isLast, assignees: _assignees, depth = 0 }: StepCardProps) {
  const Icon = STEP_ICONS[step?.type] || Cog;
  const config = step?.config || {};

  return (
    <div className="flex items-stretch gap-3">
      {/* Timeline - clean vertical line with step number */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
            'bg-gray-100 text-gray-600 border border-gray-200',
            depth > 0 && 'w-6 h-6 text-[10px]'
          )}
        >
          {stepNumber}
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-gray-200 my-1" />
        )}
      </div>

      {/* Step content - clean card */}
      <div
        className={cn(
          'flex-1 p-3 rounded-xl border bg-white mb-2 shadow-sm hover:shadow-md transition-shadow',
          'border-gray-100',
          depth > 0 && 'p-2.5 rounded-lg'
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-gray-50',
              depth > 0 && 'w-6 h-6 rounded-md'
            )}>
              <Icon className={cn('w-4 h-4 text-gray-500', depth > 0 && 'w-3.5 h-3.5')} />
            </div>
            <span className={cn('font-medium text-base text-gray-800 truncate', depth > 0 && 'text-sm')}>
              {config.name || step?.type || 'Step'}
            </span>
          </div>
          {config.assignee && (
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium shrink-0",
                "bg-gray-100 text-gray-600"
              )}
            >
              {config.assignee}
            </span>
          )}
        </div>
        {config.description && depth === 0 && (
          <p className="text-sm text-gray-500 mt-2 ml-10 line-clamp-2">
            {config.description}
          </p>
        )}
      </div>
    </div>
  );
}
