import type { StepChangeStatus } from '@/lib/proposal-utils';

const BADGE_CONFIG: Record<Exclude<StepChangeStatus, 'unchanged'>, { label: string; className: string }> = {
  added: { label: 'New', className: 'bg-green-100 text-green-700 border-green-200' },
  modified: { label: 'Modified', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  moved: { label: 'Moved', className: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export function ChangeStatusBadge({ status }: { status: StepChangeStatus }) {
  if (status === 'unchanged') return null;
  const config = BADGE_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}
