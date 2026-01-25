/**
 * Schedules Page
 *
 * Coming soon placeholder for scheduled workflow triggers.
 */

import { Calendar, Clock } from 'lucide-react';

export function SchedulesPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
        <p className="text-sm text-gray-500 mt-1">
          Automate workflow triggers with schedules
        </p>
      </div>

      {/* Coming Soon */}
      <div className="text-center py-24">
        <div className="w-20 h-20 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-6">
          <Calendar className="w-10 h-10 text-violet-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Schedule your workflows to run automatically at specific times or
          intervals. Set up recurring triggers for daily, weekly, or monthly
          processes.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Recurring schedules</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Date-based triggers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
