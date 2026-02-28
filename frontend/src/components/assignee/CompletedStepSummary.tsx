/**
 * Completed Step Summary
 *
 * Read-only summary of a completed step's result data.
 * Used when navigating back to review a previously completed step.
 */

import { CheckCircle2, XCircle } from 'lucide-react';

interface CompletedStepSummaryProps {
  stepType: string;
  resultData: Record<string, unknown>;
  formFields?: Array<{ fieldId: string; label: string; type: string }>;
  completedAt?: string;
}

export function CompletedStepSummary({ stepType, resultData, formFields, completedAt }: CompletedStepSummaryProps) {
  const renderContent = () => {
    switch (stepType) {
      case 'FORM': {
        if (formFields?.length) {
          return (
            <div className="space-y-3">
              {formFields.map(field => (
                <div key={field.fieldId}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{field.label}</p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {String(resultData[field.fieldId] ?? '—')}
                  </p>
                </div>
              ))}
            </div>
          );
        }
        return renderGeneric();
      }

      case 'APPROVAL': {
        const decision = resultData.decision as string;
        return (
          <div className="flex items-center gap-2">
            {decision === 'APPROVED' ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Approved</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-700">Rejected</span>
              </>
            )}
          </div>
        );
      }

      case 'FILE_REQUEST': {
        const fileNames = (resultData.fileNames as string[]) || [];
        return (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Uploaded Files</p>
            {fileNames.length > 0 ? (
              <ul className="space-y-1">
                {fileNames.map((name, i) => (
                  <li key={i} className="text-sm text-gray-700">• {name}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">{String(resultData.filesUploaded || 0)} files uploaded</p>
            )}
          </div>
        );
      }

      case 'QUESTIONNAIRE': {
        const answers = (resultData.answers as Record<string, unknown>) || resultData;
        return (
          <div className="space-y-3">
            {Object.entries(answers)
              .filter(([key]) => key !== '_meta')
              .map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </p>
                </div>
              ))}
          </div>
        );
      }

      case 'DECISION': {
        return (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Decision</p>
            <p className="text-sm font-medium text-gray-700 mt-0.5">{String(resultData.decision ?? '—')}</p>
          </div>
        );
      }

      case 'ACKNOWLEDGEMENT': {
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Acknowledged</span>
          </div>
        );
      }

      case 'ESIGN': {
        return (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Signature</p>
            <p className="text-lg font-serif italic text-gray-800">{String(resultData.signature ?? '')}</p>
            {typeof resultData.signedAt === 'string' && (
              <p className="text-xs text-gray-400">
                Signed {new Date(resultData.signedAt as string).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      }

      default:
        return renderGeneric();
    }
  };

  const renderGeneric = () => {
    const entries = Object.entries(resultData).filter(([key]) => key !== '_meta' && key !== '_aiReview');
    if (entries.length === 0) return <p className="text-sm text-gray-400">No data recorded</p>;
    return (
      <div className="space-y-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-gray-700 mt-0.5">
              {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <span className="text-sm font-medium text-green-700">Step completed</span>
      </div>
      {renderContent()}
      {completedAt && (
        <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
          Completed on {new Date(completedAt).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </p>
      )}
    </div>
  );
}
