import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle2, AlertTriangle, Sparkles, Lightbulb, FileCheck } from 'lucide-react';
import type { Step, FormField } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

type AIFeature = 'review' | 'prepare' | 'advise';

interface AITestDialogProps {
  open: boolean;
  onClose: () => void;
  step: Step;
  initialTab?: AIFeature;
}

interface AIReviewResult {
  status: 'APPROVED' | 'REVISION_NEEDED';
  feedback: string;
  issues: string[];
  reviewedAt: string;
}

interface AIPrepareResult {
  status: 'COMPLETED' | 'FAILED';
  prefilledFields: Record<string, unknown>;
  confidence: number;
  reasoning: string;
  preparedAt: string;
}

interface AIAdviseResult {
  status: 'COMPLETED' | 'FAILED';
  recommendation: string;
  reasoning: string;
  supportingData: Record<string, unknown>;
  advisedAt: string;
}

type AIResult = AIReviewResult | AIPrepareResult | AIAdviseResult;

function SampleDataForm({
  formFields,
  sampleData,
  onChange,
}: {
  formFields: FormField[];
  sampleData: Record<string, string>;
  onChange: (data: Record<string, string>) => void;
}) {
  const inputFields = formFields.filter(
    (f) => !['SECTION_HEADER', 'DESCRIPTION', 'IMAGE', 'PAGE_BREAK', 'LINE_SEPARATOR'].includes(f.type)
  );

  if (inputFields.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic py-2">
        No input fields defined for this step. Add a JSON object below instead.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {inputFields.map((field) => (
        <div key={field.fieldId}>
          <label className="text-xs font-medium text-gray-600 block mb-1">
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
            <span className="text-gray-400 ml-1">({field.type})</span>
          </label>
          <input
            type="text"
            value={sampleData[field.label] || ''}
            onChange={(e) => onChange({ ...sampleData, [field.label]: e.target.value })}
            placeholder={field.placeholder || `Sample ${field.label.toLowerCase()}`}
            className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      ))}
    </div>
  );
}

function ReviewResultDisplay({ result }: { result: AIReviewResult }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        {result.status === 'APPROVED' ? (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </Badge>
        ) : (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Revision Needed
          </Badge>
        )}
      </div>
      <div>
        <span className="text-xs font-medium text-gray-600 block mb-1">Feedback</span>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">{result.feedback}</p>
      </div>
      {result.issues.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-600 block mb-1">Issues</span>
          <ul className="list-disc list-inside space-y-1">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-amber-700">{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PrepareResultDisplay({ result }: { result: AIPrepareResult }) {
  const fields = Object.entries(result.prefilledFields);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Badge variant={result.status === 'COMPLETED' ? 'success' : 'destructive'}>
          {result.status === 'COMPLETED' ? 'Completed' : 'Failed'}
        </Badge>
        <span className="text-xs text-gray-500">
          Confidence: {Math.round(result.confidence * 100)}%
        </span>
      </div>
      {fields.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-600 block mb-1">Pre-filled Values</span>
          <div className="bg-gray-50 rounded-md p-3 space-y-2">
            {fields.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-xs font-medium text-gray-500 min-w-[100px]">{key}:</span>
                <span className="text-sm text-gray-700">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <span className="text-xs font-medium text-gray-600 block mb-1">Reasoning</span>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">{result.reasoning}</p>
      </div>
    </div>
  );
}

function AdviseResultDisplay({ result }: { result: AIAdviseResult }) {
  const supportEntries = Object.entries(result.supportingData);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Status:</span>
        <Badge variant={result.status === 'COMPLETED' ? 'success' : 'destructive'}>
          {result.status === 'COMPLETED' ? 'Completed' : 'Failed'}
        </Badge>
      </div>
      <div>
        <span className="text-xs font-medium text-gray-600 block mb-1">Recommendation</span>
        <div className="bg-violet-50 border border-violet-100 rounded-md p-3">
          <p className="text-sm text-gray-800 font-medium">{result.recommendation}</p>
        </div>
      </div>
      <div>
        <span className="text-xs font-medium text-gray-600 block mb-1">Reasoning</span>
        <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3">{result.reasoning}</p>
      </div>
      {supportEntries.length > 0 && (
        <div>
          <span className="text-xs font-medium text-gray-600 block mb-1">Supporting Data</span>
          <div className="bg-gray-50 rounded-md p-3 space-y-1">
            {supportEntries.map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium text-gray-500">{key}:</span>{' '}
                <span className="text-gray-700">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function AITestDialog({ open, onClose, step, initialTab }: AITestDialogProps) {
  const showReview = ['FORM', 'FILE_REQUEST', 'QUESTIONNAIRE'].includes(step.type);
  const showPrepare = step.type === 'FORM';
  const showAdvise = ['DECISION', 'APPROVAL', 'FORM', 'FILE_REQUEST'].includes(step.type);

  const availableTabs = useMemo(() => {
    const tabs: AIFeature[] = [];
    if (showReview && step.config.aiReview?.enabled) tabs.push('review');
    if (showPrepare && step.config.aiPrepare?.enabled) tabs.push('prepare');
    if (showAdvise && step.config.aiAdvise?.enabled) tabs.push('advise');
    return tabs;
  }, [showReview, showPrepare, showAdvise, step.config]);

  const [activeTab, setActiveTab] = useState<AIFeature>(
    initialTab && availableTabs.includes(initialTab) ? initialTab : availableTabs[0] || 'review'
  );
  const [sampleData, setSampleData] = useState<Record<string, string>>({});
  const [rawJson, setRawJson] = useState('');
  const [useRawJson, setUseRawJson] = useState(false);
  const [contextJson, setContextJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formFields = step.config.formFields || [];

  const tabLabels: Record<AIFeature, { label: string; icon: typeof Sparkles }> = {
    review: { label: 'AI Review', icon: FileCheck },
    prepare: { label: 'AI Prepare', icon: Sparkles },
    advise: { label: 'AI Advise', icon: Lightbulb },
  };

  const handleRunTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let data: Record<string, unknown> = {};
      if (useRawJson && rawJson.trim()) {
        data = JSON.parse(rawJson);
      } else {
        data = { ...sampleData };
      }

      let context: Record<string, unknown> | undefined;
      if (contextJson.trim()) {
        context = JSON.parse(contextJson);
      }

      const stepDef = {
        type: step.type,
        config: step.config,
      };

      const res = await fetch(`${API_BASE}/ai/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          feature: activeTab,
          stepDef,
          sampleData: data,
          context,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Test failed');
      } else {
        setResult(json.result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run test');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: AIFeature) => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
  };

  if (availableTabs.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Test AI Features
          </DialogTitle>
          <DialogDescription>
            Test AI features with sample data before publishing. No data is saved.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 gap-1">
          {availableTabs.map((tab) => {
            const { label, icon: Icon } = tabLabels[tab];
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-violet-500 text-violet-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>

        {/* Sample Data Input */}
        <div className="space-y-4 mt-2">
          {(activeTab === 'review' || activeTab === 'advise') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Sample Data
                </span>
                {formFields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseRawJson(!useRawJson)}
                    className="text-xs text-violet-600 hover:text-violet-700"
                  >
                    {useRawJson ? 'Use form fields' : 'Use raw JSON'}
                  </button>
                )}
              </div>

              {useRawJson || formFields.length === 0 ? (
                <textarea
                  value={rawJson}
                  onChange={(e) => setRawJson(e.target.value)}
                  placeholder='{"fieldName": "sample value", ...}'
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              ) : (
                <SampleDataForm
                  formFields={formFields}
                  sampleData={sampleData}
                  onChange={setSampleData}
                />
              )}
            </div>
          )}

          {/* Context (optional, for prepare and advise) */}
          {(activeTab === 'prepare' || activeTab === 'advise') && (
            <div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-2">
                Context (Optional)
              </span>
              <p className="text-xs text-gray-500 mb-1.5">
                Simulate prior step data. JSON with kickoffData and/or priorStepOutputs.
              </p>
              <textarea
                value={contextJson}
                onChange={(e) => setContextJson(e.target.value)}
                placeholder={'{\n  "kickoffData": { "clientName": "Acme Corp" },\n  "priorStepOutputs": { "Step 1": { "result": "approved" } }\n}'}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
              />
            </div>
          )}

          {/* Run Button */}
          <Button
            onClick={handleRunTest}
            disabled={loading}
            className="w-full"
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running test...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Test
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="border border-gray-200 rounded-lg p-4">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block mb-3">
                Result
              </span>
              {activeTab === 'review' && (
                <ReviewResultDisplay result={result as AIReviewResult} />
              )}
              {activeTab === 'prepare' && (
                <PrepareResultDisplay result={result as AIPrepareResult} />
              )}
              {activeTab === 'advise' && (
                <AdviseResultDisplay result={result as AIAdviseResult} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
