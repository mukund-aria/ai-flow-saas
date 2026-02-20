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
  ArrowRight,
  MapPin,
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
  GOTO: ArrowRight,
  GOTO_DESTINATION: MapPin,
  TERMINATE: XCircle,
  WAIT: Clock,
  AI_AUTOMATION: Sparkles,
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
