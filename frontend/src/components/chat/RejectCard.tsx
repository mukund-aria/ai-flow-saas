import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Lightbulb } from 'lucide-react';

interface RejectCardProps {
  reason: string;
  suggestion?: string;
}

export function RejectCard({ reason, suggestion }: RejectCardProps) {
  return (
    <Card className="border-2 border-red-200 bg-red-50/30 max-w-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <CardTitle className="text-base text-red-700">Cannot Process Request</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="text-base text-gray-700">{reason}</p>

        {suggestion && (
          <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-md border border-amber-200">
            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700">Suggestion</p>
              <p className="text-base text-gray-700">{suggestion}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
