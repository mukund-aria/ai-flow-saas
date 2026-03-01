import {
  FileText,
  ListChecks,
  FileUp,
  CheckSquare,
  ThumbsUp,
  Eye,
  PenTool,
  GitBranch,
  GitMerge,
  IterationCw,
  IterationCcw,
  XCircle,
  Clock,
  Sparkles,
  Webhook,
  Mail,
  MessageCircle,
  Calculator,
  HelpCircle,
  Globe,
  Settings,
  FileSearch,
  Mic,
  Languages,
  FileCheck,
  Server,
  type LucideProps,
} from 'lucide-react';
import type { StepType } from '@/types';

interface StepIconProps {
  type: StepType;
  className?: string;
  style?: React.CSSProperties;
}

const ICONS: Record<StepType, React.ComponentType<LucideProps>> = {
  FORM: FileText,
  QUESTIONNAIRE: ListChecks,
  FILE_REQUEST: FileUp,
  TODO: CheckSquare,
  APPROVAL: ThumbsUp,
  ACKNOWLEDGEMENT: Eye,
  ESIGN: PenTool,
  DECISION: HelpCircle,
  CUSTOM_ACTION: Sparkles,
  WEB_APP: Globe,
  SINGLE_CHOICE_BRANCH: GitBranch,
  MULTI_CHOICE_BRANCH: GitMerge,
  PARALLEL_BRANCH: GitMerge,
  GOTO: IterationCw,
  GOTO_DESTINATION: IterationCcw,
  TERMINATE: XCircle,
  WAIT: Clock,
  AI_CUSTOM_PROMPT: Sparkles,
  AI_EXTRACT: FileSearch,
  AI_SUMMARIZE: FileText,
  AI_TRANSCRIBE: Mic,
  AI_TRANSLATE: Languages,
  AI_WRITE: PenTool,
  PDF_FORM: FileCheck,
  SUB_FLOW: GitBranch,
  REST_API: Globe,
  MCP_SERVER: Server,
  SYSTEM_WEBHOOK: Webhook,
  SYSTEM_EMAIL: Mail,
  SYSTEM_CHAT_MESSAGE: MessageCircle,
  SYSTEM_UPDATE_WORKSPACE: Settings,
  BUSINESS_RULE: Calculator,
};

export function StepIcon({ type, className, style }: StepIconProps) {
  const Icon = ICONS[type] || FileText;
  return <Icon className={className} style={style} />;
}
