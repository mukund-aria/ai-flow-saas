/**
 * Assignee Portal Utilities
 *
 * Shared helper functions for the assignee task experience.
 */

import {
  FileText,
  ClipboardCheck,
  FileCheck,
  CheckSquare,
  HandMetal,
  PenTool,
  ListChecks,
  HelpCircle,
  MousePointerClick,
  ExternalLink,
} from 'lucide-react';
import { createElement } from 'react';

export function getStepTypeIcon(stepType: string, className = 'w-6 h-6 text-gray-500') {
  const iconMap: Record<string, typeof FileText> = {
    FORM: FileText,
    QUESTIONNAIRE: ListChecks,
    APPROVAL: ClipboardCheck,
    FILE_REQUEST: FileCheck,
    TODO: CheckSquare,
    ACKNOWLEDGEMENT: HandMetal,
    ESIGN: PenTool,
    DECISION: HelpCircle,
    PDF_FORM: FileCheck,
    CUSTOM_ACTION: MousePointerClick,
    WEB_APP: ExternalLink,
  };

  const Icon = iconMap[stepType] || FileText;
  return createElement(Icon, { className });
}

export function getStepTypeLabel(stepType: string): string {
  const labels: Record<string, string> = {
    FORM: 'Form',
    QUESTIONNAIRE: 'Questionnaire',
    APPROVAL: 'Approval',
    FILE_REQUEST: 'File Request',
    TODO: 'To-Do',
    ACKNOWLEDGEMENT: 'Acknowledgement',
    ESIGN: 'E-Sign',
    DECISION: 'Decision',
    PDF_FORM: 'PDF Form',
    CUSTOM_ACTION: 'Custom Action',
    WEB_APP: 'Web App',
  };
  return labels[stepType] || 'Task';
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
