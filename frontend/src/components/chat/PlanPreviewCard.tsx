import { useState, useEffect, useRef } from 'react';
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
  Eye,
  Sparkles,
  FileSearch,
  Mic,
  Languages,
  PenTool,
  FileCheck,
  Plug,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { PendingPlan, Step, TriggerConfig, EditOperation, Milestone } from '@/types';
import { getRoleColor, getRoleInitials } from '@/types';

// ============================================================================
// Change Status Helpers
// ============================================================================

type StepChangeStatus = 'added' | 'modified' | 'moved' | 'unchanged';

interface ChangeInfo {
  status: StepChangeStatus;
  title?: string;
}

function buildChangeStatusMap(operations: EditOperation[]): Map<string, ChangeInfo> {
  const statusMap = new Map<string, ChangeInfo>();

  for (const op of operations) {
    const opType = op.op as string;

    let stepId: string | undefined;
    let stepTitle: string | undefined;

    if (opType.includes('ADD_STEP') || opType.includes('ADD_PATH_STEP') || opType.includes('ADD_OUTCOME_STEP')) {
      stepId = op.step?.stepId;
      stepTitle = (op.step as unknown as { title?: string })?.title || op.step?.config?.name;
    } else {
      stepId = op.stepId || op.step?.stepId;
      const updatesTitle = (op.updates as { title?: string } | undefined)?.title;
      stepTitle = updatesTitle || (op.step as unknown as { title?: string })?.title || op.step?.config?.name;
    }

    if (!stepId) continue;

    if (opType.includes('ADD_STEP') || opType.includes('ADD_PATH_STEP') || opType.includes('ADD_OUTCOME_STEP')) {
      statusMap.set(stepId, { status: 'added', title: stepTitle });
    } else if (opType.includes('UPDATE_STEP') || opType.includes('UPDATE_PATH_STEP')) {
      statusMap.set(stepId, { status: 'modified', title: stepTitle });
    } else if (opType.includes('MOVE_STEP') || opType.includes('MOVE_PATH_STEP')) {
      statusMap.set(stepId, { status: 'moved', title: stepTitle });
    }
  }

  return statusMap;
}

function getStepChangeStatus(
  step: Step,
  changeStatusMap: Map<string, ChangeInfo>
): StepChangeStatus {
  const changeInfo = changeStatusMap.get(step.stepId);
  if (!changeInfo) return 'unchanged';

  if (changeInfo.status === 'added' && changeInfo.title) {
    const stepTitle = (step as unknown as { title?: string }).title || step.config?.name;
    if (stepTitle && changeInfo.title !== stepTitle) {
      return 'unchanged';
    }
  }

  return changeInfo.status;
}

function getChangeStatusStyles(status: StepChangeStatus, isEditMode: boolean): string {
  if (!isEditMode) return '';

  switch (status) {
    case 'added':
      return 'border-l-4 border-green-500 bg-green-50 ring-1 ring-green-200';
    case 'modified':
      return 'border-l-4 border-amber-500 bg-amber-50/50';
    case 'moved':
      return 'border-l-4 border-blue-500 bg-blue-50/50';
    case 'unchanged':
      return 'opacity-60';
    default:
      return '';
  }
}

// ============================================================================
// Milestone Grouping Helpers
// ============================================================================

interface StepGroup {
  milestone?: Milestone;
  steps: Step[];
  globalStartIndex: number;
}

function groupStepsByMilestones(steps: Step[], milestones: Milestone[]): StepGroup[] {
  if (!steps || steps.length === 0) {
    return [];
  }

  if (!milestones || milestones.length === 0) {
    return [{ steps, globalStartIndex: 0 }];
  }

  const stepIdToIndex = new Map(steps.map((s, i) => [s.stepId, i]));

  const milestoneStartPoints = milestones.map(m => ({
    milestone: m,
    startAfterIndex: m.afterStepId ? (stepIdToIndex.get(m.afterStepId) ?? -1) : -1,
  }));

  milestoneStartPoints.sort((a, b) => a.startAfterIndex - b.startAfterIndex);

  const groups: StepGroup[] = [];

  const firstMilestoneStart = milestoneStartPoints.length > 0
    ? milestoneStartPoints[0].startAfterIndex + 1
    : steps.length;

  if (firstMilestoneStart > 0) {
    groups.push({
      steps: steps.slice(0, firstMilestoneStart),
      globalStartIndex: 0,
    });
  }

  for (let i = 0; i < milestoneStartPoints.length; i++) {
    const current = milestoneStartPoints[i];
    const next = milestoneStartPoints[i + 1];

    const startIndex = current.startAfterIndex + 1;
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
// Constants
// ============================================================================

const PREVIEW_STEP_COUNT = 3;

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
  isEditMode: boolean;
  changeStatusMap: Map<string, ChangeInfo>;
  stepLimit?: number;
  stepsRenderedSoFar?: number;
}

function MilestoneGroup({
  milestone,
  steps,
  globalStartIndex,
  assignees,
  isLastGroup,
  totalSteps,
  isEditMode,
  changeStatusMap,
  stepLimit,
  stepsRenderedSoFar = 0,
}: MilestoneGroupProps) {
  let stepsToRender = steps;
  if (stepLimit !== undefined) {
    const remainingSlots = stepLimit - stepsRenderedSoFar;
    if (remainingSlots <= 0) {
      return null;
    }
    stepsToRender = steps.slice(0, remainingSlots);
  }

  if (!milestone) {
    return (
      <div className="space-y-2">
        {stepsToRender.map((step, index) => {
          const globalIndex = globalStartIndex + index;
          const changeStatus = getStepChangeStatus(step, changeStatusMap);
          return (
            <StepRenderer
              key={step.stepId || `step-${globalIndex}`}
              step={step}
              stepNumber={String(globalIndex + 1)}
              isLast={globalIndex === totalSteps - 1}
              assignees={assignees}
              depth={0}
              isEditMode={isEditMode}
              changeStatus={changeStatus}
              changeStatusMap={changeStatusMap}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3 py-2 px-3 bg-gray-50 rounded-xl border border-gray-100">
        <Layers className="w-4 h-4 text-gray-500" />
        <span className="text-base font-semibold text-gray-700">{milestone.name}</span>
        <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
          {steps.length} step{steps.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="ml-4 pl-4 border-l border-gray-200 space-y-2">
        {stepsToRender.length > 0 ? (
          stepsToRender.map((step, index) => {
            const globalIndex = globalStartIndex + index;
            const changeStatus = getStepChangeStatus(step, changeStatusMap);
            return (
              <StepRenderer
                key={step.stepId || `step-${globalIndex}`}
                step={step}
                stepNumber={String(globalIndex + 1)}
                isLast={isLastGroup && index === steps.length - 1}
                assignees={assignees}
                depth={0}
                isEditMode={isEditMode}
                changeStatus={changeStatus}
                changeStatusMap={changeStatusMap}
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

// ============================================================================
// Main Component
// ============================================================================

interface PlanPreviewCardProps {
  plan: PendingPlan;
  onApprove: () => void;
  onRequestChanges?: (changes: string) => void;
  isPublished?: boolean;
  savedChangeRequest?: string;
}

// Step type to icon mapping - includes all SaaS step types
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
function summarizeOperations(operations: EditOperation[], workflowSteps: Step[]): string[] {
  const summary: string[] = [];

  // Build a lookup map for step titles by stepId
  const stepTitleMap = new Map<string, string>();
  const addStepTitles = (steps: Step[]) => {
    for (const step of steps) {
      const title = step.title || step.config?.name;
      if (step.stepId && title) {
        stepTitleMap.set(step.stepId, title);
      }
      // Also check nested steps in branches
      const paths = step.config?.paths || step.config?.outcomes || [];
      for (const path of paths) {
        if (path.steps) {
          addStepTitles(path.steps);
        }
      }
    }
  };
  addStepTitles(workflowSteps);

  // Group operations by type
  const addedSteps: string[] = [];
  const removedSteps: string[] = [];
  const updatedSteps: string[] = [];
  const movedSteps: string[] = [];
  const addedRoles: string[] = [];
  const removedRoles: string[] = [];
  let hasMetadataUpdate = false;
  let hasMilestoneChanges = false;
  const addedMilestones: string[] = [];

  for (const op of operations) {
    // Get step name - try title from operation, then look up in workflow, then fallback to generic
    const opStepId = op.stepId || op.step?.stepId;
    const stepName = op.step?.title || op.step?.config?.name ||
                     (opStepId ? stepTitleMap.get(opStepId) : null) ||
                     'a step';

    // Check if this operation involves milestones
    if (op.op === 'UPDATE_FLOW_METADATA' || op.op === 'UPDATE_FLOW_NAME') {
      hasMetadataUpdate = true;
      // Check if milestones were modified
      if (op.updates?.milestones) {
        hasMilestoneChanges = true;
        const milestones = op.updates.milestones as Array<{ name: string }>;
        milestones.forEach(m => {
          if (m.name) addedMilestones.push(m.name);
        });
      }
    } else if (op.op === 'ADD_MILESTONE') {
      hasMilestoneChanges = true;
      if (op.milestone?.name) addedMilestones.push(op.milestone.name);
    } else if (op.op === 'REMOVE_MILESTONE' || op.op === 'UPDATE_MILESTONE') {
      hasMilestoneChanges = true;
    } else if (op.op === 'ADD_ASSIGNEE_PLACEHOLDER') {
      if (op.placeholder?.name) addedRoles.push(op.placeholder.name);
    } else if (op.op === 'REMOVE_ASSIGNEE_PLACEHOLDER') {
      removedRoles.push(op.placeholderId || 'role');
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

  if (addedRoles.length > 0) {
    summary.push(`Added roles: ${addedRoles.join(', ')}`);
  }
  if (removedRoles.length > 0) {
    summary.push(`Removed ${removedRoles.length} role(s)`);
  }

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

export function PlanPreviewCard({ plan, onApprove, onRequestChanges, isPublished = false, savedChangeRequest }: PlanPreviewCardProps) {
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesText, setChangesText] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDialogChangesInput, setShowDialogChangesInput] = useState(false);
  const [dialogChangesText, setDialogChangesText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dialogScrollRef = useRef<HTMLDivElement>(null);
  const { workflow } = plan;

  // Determine if this is an edit or create preview
  const isEdit = plan.mode === 'edit';
  const operations = plan.operations || [];

  // Build change status map for visual indicators (edit mode only)
  const changeStatusMap = buildChangeStatusMap(operations);

  // Defensive: ensure arrays exist even if LLM omits them
  const assignees = Array.isArray(workflow?.assigneePlaceholders)
    ? workflow.assigneePlaceholders
    : [];
  const steps = Array.isArray(workflow?.steps) ? workflow.steps : [];
  const milestones = Array.isArray(workflow?.milestones) ? workflow.milestones : [];

  // Group steps by milestones for visual rendering
  const stepGroups = groupStepsByMilestones(steps, milestones);

  // Calculate total steps and whether to show expand button
  const totalSteps = steps.length;
  const showExpandButton = totalSteps > PREVIEW_STEP_COUNT;

  // Render step groups with optional limit
  const renderStepGroups = (limit?: number) => {
    let stepsRenderedSoFar = 0;
    return stepGroups.map((group, groupIndex) => {
      if (limit !== undefined && stepsRenderedSoFar >= limit) {
        return null;
      }
      const component = (
        <MilestoneGroup
          key={group.milestone?.milestoneId || `group-${groupIndex}`}
          milestone={group.milestone}
          steps={group.steps}
          globalStartIndex={group.globalStartIndex}
          assignees={assignees}
          isLastGroup={groupIndex === stepGroups.length - 1}
          totalSteps={totalSteps}
          isEditMode={isEdit}
          changeStatusMap={changeStatusMap}
          stepLimit={limit}
          stepsRenderedSoFar={stepsRenderedSoFar}
        />
      );
      stepsRenderedSoFar += group.steps.length;
      return component;
    });
  };

  // Find first changed step ID for auto-scroll
  const firstChangedStepId = (() => {
    if (!isEdit || operations.length === 0) return null;
    const addOperation = operations.find(op => {
      const opType = (op.op as string) || '';
      return opType.includes('ADD_STEP') || opType.includes('ADD_PATH_STEP') || opType.includes('ADD_OUTCOME_STEP');
    });
    return addOperation?.step?.stepId || null;
  })();

  // Auto-scroll to first changed step in edit mode (for card)
  useEffect(() => {
    if (!isEdit || operations.length === 0 || !scrollContainerRef.current) return;

    const attemptScroll = (attempt: number) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      if (firstChangedStepId) {
        const element = container.querySelector(`[data-step-id="${firstChangedStepId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      if (attempt >= 2) {
        container.scrollTop = container.scrollHeight;
      } else {
        setTimeout(() => attemptScroll(attempt + 1), 150);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(() => attemptScroll(0));
    }, 100);

    return () => clearTimeout(timer);
  }, [isEdit, operations, firstChangedStepId]);

  // Auto-scroll to first changed step when dialog opens
  useEffect(() => {
    if (!dialogOpen || !isEdit || !firstChangedStepId) return;

    const attemptScroll = (attempt: number) => {
      const container = dialogScrollRef.current;
      if (!container) {
        if (attempt < 5) {
          setTimeout(() => attemptScroll(attempt + 1), 100);
        }
        return;
      }

      const element = container.querySelector(`[data-step-id="${firstChangedStepId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const timer = setTimeout(() => attemptScroll(0), 150);
    return () => clearTimeout(timer);
  }, [dialogOpen, isEdit, firstChangedStepId]);

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
      {/* Header - minimal: name + badge */}
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
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Visual Step Timeline - collapsed view with limited steps */}
        <div ref={scrollContainerRef} className="space-y-3">
          {stepGroups.length > 0 ? (
            renderStepGroups(PREVIEW_STEP_COUNT)
          ) : (
            <p className="text-base text-gray-500 text-center py-4">No steps defined</p>
          )}
        </div>

        {/* View all steps button */}
        {showExpandButton && (
          <Button
            variant="outline"
            className="w-full mt-2 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => setDialogOpen(true)}
          >
            <Eye className="w-4 h-4 mr-2" />
            View all {totalSteps} steps
          </Button>
        )}

        {/* Edit Operations Summary (for edit mode) */}
        {isEdit && operations.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
              <Pencil className="w-3.5 h-3.5" />
              Changes being made:
            </p>
            <ul className="text-sm text-gray-600 space-y-1.5 ml-5">
              {summarizeOperations(operations, steps).map((line, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  {line}
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
          : savedChangeRequest
            ? "border-blue-100 bg-blue-50/30"
            : "border-gray-100 bg-gray-50/30"
      )}>
        {isPublished ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-base font-medium">
              {isEdit ? 'Changes applied successfully' : 'Workflow created successfully'}
            </span>
          </div>
        ) : savedChangeRequest ? (
          <div className="w-full">
            <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-blue-200 mb-2">
              <Send className="w-4 h-4" />
              <span className="text-sm font-medium">Changes requested</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{savedChangeRequest}</p>
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

      {/* Expanded view dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="border-b border-gray-100 pb-4 shrink-0">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {workflow?.name || 'New Workflow'}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {totalSteps} steps • {assignees.length} roles
            </p>
          </DialogHeader>

          {/* Scrollable content area */}
          <div
            ref={dialogScrollRef}
            className="flex-1 overflow-y-auto min-h-0 pr-2 py-2 space-y-4"
          >
            {/* Roles section */}
            {assignees.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
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

            {/* Trigger section */}
            {workflow?.triggerConfig && (
              <TriggerSection triggerConfig={workflow.triggerConfig} />
            )}

            {/* Steps list - all steps, no limit */}
            <div className="space-y-3">
              {stepGroups.length > 0 ? (
                renderStepGroups()
              ) : (
                <p className="text-base text-gray-500 text-center py-4">No steps defined</p>
              )}
            </div>

            {/* Edit Operations Summary in dialog */}
            {isEdit && operations.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Pencil className="w-3.5 h-3.5" />
                  Changes being made:
                </p>
                <ul className="text-sm text-gray-600 space-y-1.5 ml-5">
                  {summarizeOperations(operations, steps).map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Assumptions section */}
            {plan.assumptions && plan.assumptions.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
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
          </div>

          {/* Dialog footer with actions */}
          {!isPublished && !savedChangeRequest && (
            <div className="border-t border-gray-100 pt-4 mt-4 shrink-0">
              {showDialogChangesInput ? (
                <div className="space-y-3">
                  <Textarea
                    value={dialogChangesText}
                    onChange={(e) => setDialogChangesText(e.target.value)}
                    placeholder="Describe the changes you'd like..."
                    className="min-h-[80px] text-sm resize-none rounded-xl border-gray-200"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowDialogChangesInput(false);
                        setDialogChangesText('');
                      }}
                      className="flex-1 rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (dialogChangesText.trim() && onRequestChanges) {
                          onRequestChanges(dialogChangesText.trim());
                          setDialogChangesText('');
                          setShowDialogChangesInput(false);
                          setDialogOpen(false);
                        }
                      }}
                      disabled={!dialogChangesText.trim()}
                      className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Send
                    </Button>
                  </div>
                </div>
              ) : (
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDialogChangesInput(true)}
                    className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <Pencil className="w-4 h-4 mr-1.5" />
                    {isEdit ? 'Different Changes' : 'Make Changes'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setDialogOpen(false);
                      onApprove();
                    }}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {isEdit ? 'Apply Changes' : 'Proceed & Create!'}
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Trigger section component
function TriggerSection({ triggerConfig }: { triggerConfig: TriggerConfig }) {
  const isManual = triggerConfig.type === 'manual';
  const isAutomatic = triggerConfig.type === 'automatic';
  const isScheduled = triggerConfig.type === 'scheduled';

  const TriggerIcon = isManual ? Play : isAutomatic ? Zap : Clock;
  const triggerLabel = isManual ? 'Manual Start' : isAutomatic ? 'Automatic Trigger' : 'Scheduled';

  return (
    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100">
          <TriggerIcon className="w-4 h-4 text-gray-500" />
        </div>
        <span className="text-base font-medium text-gray-700">{triggerLabel}</span>
      </div>

      {isManual && triggerConfig.initiator && (
        <p className="text-sm text-gray-500 mt-2 ml-10">
          Started by: <span className="font-medium text-gray-700">{triggerConfig.initiator}</span>
        </p>
      )}

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
                className="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {isAutomatic && triggerConfig.triggerSource && (
        <p className="text-sm text-gray-500 mt-2 ml-10">
          Triggered from: <span className="font-medium text-gray-700">{triggerConfig.triggerSource}</span>
        </p>
      )}

      {isScheduled && triggerConfig.schedule && (
        <p className="text-sm text-gray-500 mt-2 ml-10">
          Schedule: <span className="font-medium text-gray-700">{triggerConfig.schedule}</span>
        </p>
      )}
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
  isEditMode: boolean;
  changeStatus: StepChangeStatus;
  changeStatusMap: Map<string, ChangeInfo>;
}

function StepRenderer({ step, stepNumber, isLast, assignees, depth = 0, isEditMode, changeStatus, changeStatusMap }: StepRendererProps) {
  const hasBranches = hasBranchesOrOutcomes(step);

  if (hasBranches) {
    return (
      <BranchStepCard
        step={step}
        stepNumber={stepNumber}
        isLast={isLast}
        assignees={assignees}
        depth={depth}
        isEditMode={isEditMode}
        changeStatus={changeStatus}
        changeStatusMap={changeStatusMap}
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
      isEditMode={isEditMode}
      changeStatus={changeStatus}
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
  isEditMode: boolean;
  changeStatus: StepChangeStatus;
  changeStatusMap: Map<string, ChangeInfo>;
}

function BranchStepCard({ step, stepNumber, isLast, assignees, depth, isEditMode, changeStatus, changeStatusMap }: BranchStepCardProps) {
  const [expanded, setExpanded] = useState(true);
  const config = step?.config || {};
  const paths = config.paths || config.outcomes || [];
  const isDecision = step?.type === 'DECISION';

  const statusStyles = getChangeStatusStyles(changeStatus, isEditMode);

  return (
    <div className="flex items-stretch gap-3" data-step-id={step.stepId}>
      {/* Timeline */}
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

      {/* Branch content */}
      <div className="flex-1 mb-2">
        <div
          className={cn(
            'p-3 rounded-xl border bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow',
            'border-gray-100',
            statusStyles
          )}
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-gray-500" />
              </div>
              <span className="font-medium text-base text-gray-800 truncate">
                {step?.title || config.name || step?.type || 'Branch'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isEditMode && changeStatus !== 'unchanged' && (
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap',
                  changeStatus === 'added' && 'bg-green-100 text-green-700',
                  changeStatus === 'modified' && 'bg-amber-100 text-amber-700',
                  changeStatus === 'moved' && 'bg-blue-100 text-blue-700',
                )}>
                  {changeStatus === 'added' ? 'New' : changeStatus === 'modified' ? 'Modified' : 'Moved'}
                </span>
              )}
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

        {/* Expanded paths */}
        {expanded && paths.length > 0 && (
          <div className="mt-3 ml-4 border-l border-gray-200 pl-4 space-y-3">
            {paths.map((path: { pathId?: string; outcomeId?: string; label?: string; steps?: Step[] }, pathIndex: number) => {
              const pathId = path.pathId || path.outcomeId || `path-${pathIndex}`;
              const pathLabel = path.label || `${isDecision ? 'Outcome' : 'Path'} ${pathIndex + 1}`;
              const pathSteps = path.steps || [];

              return (
                <div key={pathId}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">{pathIndex + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{pathLabel}</span>
                    <span className="text-xs text-gray-400">
                      ({pathSteps.length} step{pathSteps.length !== 1 ? 's' : ''})
                    </span>
                  </div>

                  {pathSteps.length > 0 ? (
                    <div className="space-y-1">
                      {pathSteps.map((nestedStep: Step, nestedIndex: number) => {
                        const nestedChangeStatus = getStepChangeStatus(nestedStep, changeStatusMap);
                        return (
                          <StepRenderer
                            key={nestedStep.stepId || `${pathId}-step-${nestedIndex}`}
                            step={nestedStep}
                            stepNumber={`${stepNumber}.${nestedIndex + 1}`}
                            isLast={nestedIndex === pathSteps.length - 1}
                            assignees={assignees}
                            depth={depth + 1}
                            isEditMode={isEditMode}
                            changeStatus={nestedChangeStatus}
                            changeStatusMap={changeStatusMap}
                          />
                        );
                      })}
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

// Regular step card
interface StepCardProps {
  step: Step;
  stepNumber: string;
  isLast: boolean;
  assignees: Array<{ placeholderId: string; roleName: string }>;
  depth?: number;
  isEditMode: boolean;
  changeStatus: StepChangeStatus;
}

function StepCard({ step, stepNumber, isLast, assignees, depth = 0, isEditMode, changeStatus }: StepCardProps) {
  const Icon = STEP_ICONS[step?.type] || Cog;
  const config = step?.config || {};

  // Resolve assignee name from config.assignee or step.assignees.placeholderId
  let resolvedAssignee = config.assignee;
  if (!resolvedAssignee && step.assignees) {
    const stepAssignees = step.assignees as { mode?: string; placeholderId?: string };
    if (stepAssignees.placeholderId) {
      const foundAssignee = assignees.find(a => a.placeholderId === stepAssignees.placeholderId);
      resolvedAssignee = foundAssignee?.roleName;
    }
  }

  // Resolve description from config or step level
  const resolvedDescription = config.description || step.description;

  const statusStyles = getChangeStatusStyles(changeStatus, isEditMode);

  return (
    <div className="flex items-stretch gap-3" data-step-id={step.stepId}>
      {/* Timeline */}
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

      {/* Step content */}
      <div
        className={cn(
          'flex-1 p-3 rounded-xl border bg-white mb-2 shadow-sm hover:shadow-md transition-shadow',
          'border-gray-100',
          depth > 0 && 'p-2.5 rounded-lg',
          statusStyles
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
              {step?.title || config.name || step?.type || 'Step'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEditMode && changeStatus !== 'unchanged' && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap',
                changeStatus === 'added' && 'bg-green-100 text-green-700',
                changeStatus === 'modified' && 'bg-amber-100 text-amber-700',
                changeStatus === 'moved' && 'bg-blue-100 text-blue-700',
              )}>
                {changeStatus === 'added' ? 'New' : changeStatus === 'modified' ? 'Modified' : 'Moved'}
              </span>
            )}
            {resolvedAssignee && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-1 rounded-full text-sm font-medium shrink-0",
                  "bg-gray-100 text-gray-600"
                )}
              >
                {resolvedAssignee}
              </span>
            )}
          </div>
        </div>
        {resolvedDescription && depth === 0 && (
          <p className="text-sm text-gray-500 mt-2 ml-10 line-clamp-2">
            {resolvedDescription}
          </p>
        )}
      </div>
    </div>
  );
}
