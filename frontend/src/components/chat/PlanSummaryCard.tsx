/**
 * PlanSummaryCard — Lightweight chat card for AI workflow proposals.
 *
 * Replaces the 1,475-line PlanPreviewCard. Shows a compact summary in chat;
 * the full workflow is rendered on the right-side WorkflowPanel.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Check,
  Pencil,
  Send,
  Sparkles,
  Layers,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSmallEdit, summarizeOperations } from '@/lib/proposal-utils';
import { COPILOT_SETTINGS } from '@/config/copilot-settings';
import type { PendingPlan } from '@/types';

interface PlanSummaryCardProps {
  plan: PendingPlan;
  onApprove: () => void;
  onRequestChanges?: (changes: string) => void;
  isPublished?: boolean;
  savedChangeRequest?: string;
}

export function PlanSummaryCard({
  plan,
  onApprove,
  onRequestChanges,
  isPublished = false,
  savedChangeRequest,
}: PlanSummaryCardProps) {
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesText, setChangesText] = useState('');
  const [showAssumptions, setShowAssumptions] = useState(false);

  const { workflow } = plan;
  const isEdit = plan.mode === 'edit';
  const operations = plan.operations || [];
  const small = isSmallEdit(plan);

  // Stats
  const steps = Array.isArray(workflow?.steps) ? workflow.steps : [];
  const assignees = Array.isArray(workflow?.assigneePlaceholders) ? workflow.assigneePlaceholders : [];
  const milestones = Array.isArray(workflow?.milestones) ? workflow.milestones : [];
  const stepCount = steps.length;
  const roleCount = assignees.length;
  const phaseCount = milestones.length;

  // Change summary (edit mode)
  const changeSummary = isEdit ? summarizeOperations(operations, steps) : [];
  const { maxSummaryLines, maxVisibleAssumptions } = COPILOT_SETTINGS.banner;
  const visibleSummary = changeSummary.slice(0, maxSummaryLines);
  const hiddenCount = changeSummary.length - maxSummaryLines;

  const assumptions = plan.assumptions || [];

  const handleSubmitChanges = () => {
    if (changesText.trim() && onRequestChanges) {
      onRequestChanges(changesText.trim());
      setChangesText('');
      setShowChangesInput(false);
    }
  };

  // Published state — green confirmation
  if (isPublished) {
    return (
      <Card className="overflow-hidden border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="p-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-green-900 truncate">{workflow.name}</h3>
            <p className="text-xs text-green-600">Saved as draft</p>
          </div>
        </div>
      </Card>
    );
  }

  // Saved change request state — blue display
  if (savedChangeRequest) {
    return (
      <Card className="overflow-hidden border-blue-200 bg-blue-50/50">
        <div className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Changes requested</span>
          </div>
          <p className="text-xs text-blue-600 ml-5 line-clamp-2">{savedChangeRequest}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        isEdit ? 'border-amber-200' : 'border-violet-200'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'p-3 flex items-center gap-2',
          isEdit
            ? 'bg-gradient-to-r from-amber-50 to-orange-50'
            : 'bg-gradient-to-r from-violet-50 to-indigo-50'
        )}
      >
        <div
          className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
            isEdit ? 'bg-amber-100' : 'bg-violet-100'
          )}
        >
          <Sparkles className={cn('w-3.5 h-3.5', isEdit ? 'text-amber-600' : 'text-violet-600')} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{workflow.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={cn(
                'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded',
                isEdit ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'
              )}
            >
              {isEdit ? 'Edit' : 'New'}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {stepCount} step{stepCount !== 1 ? 's' : ''}
          </span>
          {roleCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {roleCount} role{roleCount !== 1 ? 's' : ''}
            </span>
          )}
          {phaseCount > 0 && (
            <span>{phaseCount} phase{phaseCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Change summary (edit mode) */}
        {isEdit && visibleSummary.length > 0 && (
          <div className="text-xs text-gray-600 space-y-0.5">
            {visibleSummary.map((line, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-gray-400 mt-0.5">-</span>
                <span>{line}</span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="text-gray-400 ml-3">and {hiddenCount} more...</div>
            )}
          </div>
        )}

        {/* Assumptions (collapsible) */}
        {assumptions.length > 0 && (
          <div>
            <button
              onClick={() => setShowAssumptions(!showAssumptions)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showAssumptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>Assumptions ({assumptions.length})</span>
            </button>
            {showAssumptions && (
              <ul className="mt-1 ml-4 space-y-0.5 text-xs text-gray-500">
                {assumptions.slice(0, maxVisibleAssumptions).map((a, i) => (
                  <li key={i} className="list-disc">{a}</li>
                ))}
                {assumptions.length > maxVisibleAssumptions && (
                  <li className="text-gray-400">
                    and {assumptions.length - maxVisibleAssumptions} more...
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

        {/* Panel cue for large edits / creates */}
        {!small && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ArrowRight className="w-3 h-3" />
            <span>Review workflow in the panel</span>
          </div>
        )}
      </div>

      {/* Footer — action buttons */}
      <div className="p-3 pt-0">
        {!showChangesInput ? (
          <div className="flex items-center gap-2">
            {onRequestChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangesInput(true)}
                className="text-xs h-7 gap-1"
              >
                <Pencil className="w-3 h-3" />
                Make Changes
              </Button>
            )}
            <Button
              size="sm"
              onClick={onApprove}
              className={cn(
                'text-xs h-7 gap-1',
                isEdit
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-violet-600 hover:bg-violet-700'
              )}
            >
              <Check className="w-3 h-3" />
              {isEdit ? 'Approve' : 'Approve & Create'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={changesText}
              onChange={(e) => setChangesText(e.target.value)}
              placeholder="Describe the changes you'd like..."
              className="text-xs min-h-[60px] resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowChangesInput(false); setChangesText(''); }}
                className="text-xs h-7"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitChanges}
                disabled={!changesText.trim()}
                className="text-xs h-7 gap-1"
              >
                <Send className="w-3 h-3" />
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
