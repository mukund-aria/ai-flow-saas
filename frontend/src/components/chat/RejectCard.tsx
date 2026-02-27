import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface RejectCardProps {
  reason: string;
  suggestion?: string;
}

export function RejectCard({ reason, suggestion }: RejectCardProps) {
  return (
    <Card className="border-2 border-red-200 bg-white max-w-md shadow-lg shadow-red-100/30 rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-br from-red-50 to-rose-50/50 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-sm">
            <XCircle className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-red-800">Cannot Process Request</CardTitle>
            <p className="text-xs text-red-500 mt-0.5">Try a different approach</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>

        {suggestion && (
          <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-xl border border-amber-200/60">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-700 mb-1">Try this instead</p>
              <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
