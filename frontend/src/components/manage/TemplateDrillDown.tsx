import { StepTimingWaterfall } from './StepTimingWaterfall';
import { CompletionFunnel } from './CompletionFunnel';
import { CycleTimeDistribution } from './CycleTimeDistribution';
import type { FlowPerformanceData } from '@/lib/api';

interface Props {
  data: NonNullable<FlowPerformanceData['drillDown']>;
}

export function TemplateDrillDown({ data }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StepTimingWaterfall steps={data.stepTimings} />
        <CompletionFunnel steps={data.completionFunnel} />
      </div>
      <CycleTimeDistribution data={data.cycleTimeDistribution} />
    </div>
  );
}
