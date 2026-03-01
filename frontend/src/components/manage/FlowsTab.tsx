import { useState, useEffect } from 'react';
import { Loader2, BarChart3 } from 'lucide-react';
import { getFlowPerformance, type FlowPerformanceData } from '@/lib/api';
import { type TimeRange } from './shared/TimeRangeSelector';
import { TemplatePerformanceTable } from './TemplatePerformanceTable';
import { TemplateCompareDialog } from './TemplateCompareDialog';

interface Props {
  range: TimeRange;
}

export function FlowsTab({ range }: Props) {
  const [data, setData] = useState<FlowPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<FlowPerformanceData['drillDown'] | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    setExpandedTemplateId(null);
    setDrillDownData(null);
    getFlowPerformance(range)
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [range]);

  const handleExpand = async (templateId: string) => {
    if (expandedTemplateId === templateId) {
      setExpandedTemplateId(null);
      setDrillDownData(null);
      return;
    }
    setExpandedTemplateId(templateId);
    setDrillDownLoading(true);
    try {
      const result = await getFlowPerformance(range, templateId);
      setDrillDownData(result.drillDown || null);
    } catch {
      setDrillDownData(null);
    } finally {
      setDrillDownLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <BarChart3 className="w-12 h-12 mb-3" />
        <p className="text-sm">Failed to load flow performance data.</p>
      </div>
    );
  }

  if (data.templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <BarChart3 className="w-12 h-12 mb-3" />
        <p className="text-sm">No flow data yet. Start some flows to see performance metrics here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setCompareOpen(true)}
          className="text-sm text-violet-600 hover:text-violet-700 font-medium"
        >
          Compare Templates
        </button>
      </div>
      <TemplatePerformanceTable
        templates={data.templates}
        expandedTemplateId={expandedTemplateId}
        drillDownData={drillDownData}
        drillDownLoading={drillDownLoading}
        onExpand={handleExpand}
      />
      {compareOpen && (
        <TemplateCompareDialog
          templates={data.templates}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}
