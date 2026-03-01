import { useState } from 'react';
import {
  Sparkles,
  Pencil,
  Check,
  Send,
  ChevronDown,
  ChevronUp,
  Layers,
  Users,
  ArrowLeftRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { COPILOT_SETTINGS } from '@/config/copilot-settings';
import type { PendingProposal } from '@/types';

interface ProposalBannerProps {
  proposal: PendingProposal;
  viewMode: 'proposed' | 'current';
  onToggleView: () => void;
  onApprove: () => void;
  onRequestChanges: (changes: string) => void;
  isPublished?: boolean;
}

export function ProposalBanner({
  proposal,
  viewMode,
  onToggleView,
  onApprove,
  onRequestChanges,
  isPublished = false,
}: ProposalBannerProps) {
  const [showChangesInput, setShowChangesInput] = useState(false);
  const [changesText, setChangesText] = useState('');
  const [showAssumptions, setShowAssumptions] = useState(false);

  const { plan, operationSummary } = proposal;
  const isEdit = plan.mode === 'edit';
  const workflow = plan.workflow;

  // Stats
  const stepCount = workflow.steps?.length || 0;
  const roleCount = workflow.roles?.length || 0;
  const phaseCount = workflow.milestones?.length || 0;

  // Assumptions
  const assumptions = plan.assumptions || [];
  const { maxSummaryLines, maxVisibleAssumptions } = COPILOT_SETTINGS.banner;

  // Truncate change summary
  const visibleSummary = operationSummary.slice(0, maxSummaryLines);
  const hiddenSummaryCount = operationSummary.length - maxSummaryLines;

  const handleSubmitChanges = () => {
    if (changesText.trim()) {
      onRequestChanges(changesText.trim());
      setChangesText('');
      setShowChangesInput(false);
    }
  };

  // Published state
  if (isPublished) {
    return (
      <div className="mx-4 mt-4 mb-2 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-900">{workflow.name}</h3>
            <p className="text-xs text-green-600">Workflow saved as draft</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mx-4 mt-4 mb-2 rounded-xl border p-4 space-y-3',
        isEdit
          ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50'
          : 'border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
              isEdit ? 'bg-amber-100' : 'bg-violet-100'
            )}
          >
            <Sparkles className={cn('w-4 h-4', isEdit ? 'text-amber-600' : 'text-violet-600')} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{workflow.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  'inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded',
                  isEdit
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-violet-100 text-violet-700'
                )}
              >
                {isEdit ? 'Edit' : 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
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

      {/* Current ↔ Proposed toggle (edit mode only) */}
      {isEdit && (
        <div className="flex items-center">
          <div className="inline-flex items-center bg-white/80 rounded-lg p-0.5 border border-gray-200">
            <button
              onClick={viewMode === 'proposed' ? onToggleView : undefined}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
                viewMode === 'current'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Current
            </button>
            <button
              onClick={viewMode === 'current' ? onToggleView : undefined}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all',
                viewMode === 'proposed'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <ArrowLeftRight className="w-3 h-3" />
              Proposed
            </button>
          </div>
        </div>
      )}

      {/* Changes summary (edit mode only) */}
      {isEdit && visibleSummary.length > 0 && (
        <div className="text-xs text-gray-600 space-y-0.5">
          <span className="font-medium text-gray-700">Changes:</span>
          {visibleSummary.map((line, i) => (
            <div key={i} className="ml-2">
              {line}
            </div>
          ))}
          {hiddenSummaryCount > 0 && (
            <div className="ml-2 text-gray-400">and {hiddenSummaryCount} more...</div>
          )}
        </div>
      )}

      {/* Assumptions (collapsible) */}
      {assumptions.length > 0 && (
        <div>
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
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

      {/* Action buttons */}
      {!showChangesInput ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChangesInput(true)}
            className="text-xs h-8 gap-1.5"
          >
            <Pencil className="w-3 h-3" />
            Make Changes
          </Button>
          <Button
            size="sm"
            onClick={onApprove}
            className={cn(
              'text-xs h-8 gap-1.5',
              isEdit
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-violet-600 hover:bg-violet-700'
            )}
          >
            <Check className="w-3 h-3" />
            {isEdit ? 'Approve Changes' : 'Approve & Create'}
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
  );
}
