import type { PeopleAnalyticsData } from '@/lib/api';

interface Props {
  members: PeopleAnalyticsData['members'];
}

const loadLevelColors: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700',
  MODERATE: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-amber-50 text-amber-700',
  HEAVY: 'bg-red-50 text-red-700',
};

export function TeamMembersTable({ members }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Team Members</h3>
        <p className="text-sm text-gray-500">Internal coordinators managing flows</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Name</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Runs Managed</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Avg Cycle</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Completion</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Load</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => {
              const cycleRatio = m.teamAvgCycleTimeMs > 0 ? m.avgCycleTimeMs / m.teamAvgCycleTimeMs : 1;
              const cycleLabel = cycleRatio > 1.1 ? 'slower' : cycleRatio < 0.9 ? 'faster' : 'avg';

              return (
                <tr key={m.userId} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.picture ? (
                        <img src={m.picture} alt={m.name} className="w-7 h-7 rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-500">
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{m.runsManaged}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-gray-600">{formatMs(m.avgCycleTimeMs)}</span>
                    <span className={`text-xs ml-1 ${cycleLabel === 'faster' ? 'text-emerald-500' : cycleLabel === 'slower' ? 'text-red-400' : 'text-gray-400'}`}>
                      ({cycleLabel})
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${m.completionRate >= 80 ? 'text-emerald-600' : m.completionRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                      {m.completionRate}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${loadLevelColors[m.loadLevel] || ''}`}>
                      {m.loadLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms <= 0) return '0';
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}
