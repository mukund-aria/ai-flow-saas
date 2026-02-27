import { User, AlertCircle, Sparkles, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message, Clarification, SuggestedAction } from '@/types';
import { PlanSummaryCard } from './PlanSummaryCard';
import { ClarificationCard } from './ClarificationCard';
import { RejectCard } from './RejectCard';
import { Phase2Card } from './Phase2Card';
import { SuggestedActions } from './SuggestedActions';

// Simple markdown rendering for common elements
// Handles: bold (**text**), headers (##), lists (- item)
let markdownRenderCount = 0;

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode {
  // Handle bold markers (**text**)
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-b-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const prefix = `md-${++markdownRenderCount}`;

  // Split by lines to handle block-level elements
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${prefix}-ul-${elements.length}`} className="list-disc list-inside my-2 space-y-1 text-base">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Headers: ## or ### (skip #, too large for chat)
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`${prefix}-h4-${lineIndex}`} className="font-semibold text-base mt-3 mb-1">
          {renderInlineMarkdown(trimmed.slice(4), `${prefix}-h4i-${lineIndex}`)}
        </h4>
      );
    } else if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={`${prefix}-h3-${lineIndex}`} className="font-semibold text-base mt-3 mb-1">
          {renderInlineMarkdown(trimmed.slice(3), `${prefix}-h3i-${lineIndex}`)}
        </h3>
      );
    }
    // List items: - item
    else if (trimmed.startsWith('- ')) {
      currentList.push(
        <li key={`${prefix}-li-${lineIndex}`}>
          {renderInlineMarkdown(trimmed.slice(2), `${prefix}-lii-${lineIndex}`)}
        </li>
      );
    }
    // Empty line
    else if (trimmed === '') {
      flushList();
      // Only add spacer if not at start or after another spacer
      if (elements.length > 0) {
        const lastEl = elements[elements.length - 1];
        if (lastEl && typeof lastEl === 'object' && 'key' in lastEl &&
            typeof lastEl.key === 'string' && !lastEl.key.includes('-space-')) {
          elements.push(<div key={`${prefix}-space-${lineIndex}`} className="h-2" />);
        }
      }
    }
    // Regular text
    else {
      flushList();
      elements.push(
        <span key={`${prefix}-p-${lineIndex}`}>
          {renderInlineMarkdown(trimmed, `${prefix}-pi-${lineIndex}`)}
          {lineIndex < lines.length - 1 && !lines[lineIndex + 1].trim().startsWith('-') && '\n'}
        </span>
      );
    }
  });

  flushList();

  return <>{elements}</>;
}

interface MessageItemProps {
  message: Message;
  onApprovePlan?: (planId: string) => void;
  onRequestChanges?: (changes: string) => void;
  onAnswerClarification?: (answers: Record<string, string>, questions: Clarification[]) => void;
  onPhase2Submit?: (messageId: string, selections: Record<string, string | Record<string, string>>) => void;
  onPhase2Skip?: (messageId: string) => void;
  onSuggestedAction?: (action: SuggestedAction) => void;
  pendingPlanId?: string;  // ID of pending plan from any message in the conversation
}

export function MessageItem({
  message,
  onApprovePlan,
  onRequestChanges,
  onAnswerClarification,
  onPhase2Submit,
  onPhase2Skip,
  onSuggestedAction,
  pendingPlanId,
}: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 py-4',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 max-w-[85%]', isUser && 'text-right')}>
        {/* Attachment Preview */}
        {message.attachment && (
          <div className={cn('mb-2', isUser && 'flex justify-end')}>
            {message.attachment.type === 'image' ? (
              <div className="inline-flex flex-col gap-1">
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name}
                  className="max-w-xs rounded-lg border"
                />
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {message.attachment.name}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-base text-blue-700 font-medium">
                  {message.attachment.name}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Text - minimize when plan preview or clarifications are shown */}
        {(!message.pendingPlan && !message.clarifications?.length || isUser) && message.content && (
          <div
            className={cn(
              'inline-block px-4 py-2 rounded-2xl',
              isUser
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            )}
          >
            <p className="text-base whitespace-pre-wrap">{renderMarkdown(message.content)}</p>
          </div>
        )}

        {/* Brief intro when plan is shown */}
        {message.pendingPlan && !isUser && (
          <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md mb-2">
            <p className="text-base">Here's what I've designed for you:</p>
          </div>
        )}

        {/* Brief intro when clarifications are shown */}
        {message.clarifications && message.clarifications.length > 0 && !isUser && (
          <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-md mb-2">
            <p className="text-base">I have a few questions to make sure I design this right for you:</p>
          </div>
        )}

        {/* Error */}
        {message.error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-base">
            <AlertCircle className="w-4 h-4" />
            <span>{message.error}</span>
          </div>
        )}

        {/* Plan Summary Card */}
        {message.pendingPlan && (message.planPublished || onApprovePlan) && (
          <div className="mt-3">
            <PlanSummaryCard
              plan={message.pendingPlan}
              onApprove={() => onApprovePlan?.(message.pendingPlan!.planId)}
              onRequestChanges={onRequestChanges}
              isPublished={message.planPublished}
              savedChangeRequest={message.savedChangeRequest}
            />
          </div>
        )}

        {/* Clarification Questions */}
        {message.clarifications && message.clarifications.length > 0 && onAnswerClarification && (
          <div className="mt-3">
            <ClarificationCard
              questions={message.clarifications}
              onSubmit={onAnswerClarification}
              isLocked={message.clarificationsLocked}
              savedAnswers={message.clarificationAnswers}
            />
          </div>
        )}

        {/* Rejection */}
        {message.rejection && (
          <div className="mt-3">
            <RejectCard
              reason={message.rejection.reason}
              suggestion={message.rejection.suggestion}
            />
          </div>
        )}

        {/* Phase 2 Enhancements */}
        {message.phase2 && (
          <div className="mt-3">
            <Phase2Card
              workflowName={message.phase2.workflowName}
              onSubmit={(selections) => onPhase2Submit?.(message.id, selections)}
              onSkip={() => onPhase2Skip?.(message.id)}
              isLocked={message.phase2.isLocked}
              wasSkipped={message.phase2.wasSkipped}
              savedSelections={message.phase2.selections}
            />
          </div>
        )}

        {/* Suggested Actions (for respond mode) */}
        {message.suggestedActions && message.suggestedActions.length > 0 && onSuggestedAction && (
          <SuggestedActions
            actions={message.suggestedActions}
            onActionClick={onSuggestedAction}
            pendingPlanId={pendingPlanId}
          />
        )}

        {/* Timestamp */}
        <p className="mt-1 text-sm text-gray-400">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
