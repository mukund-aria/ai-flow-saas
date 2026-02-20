import { useWorkflowStore } from '@/stores/workflowStore';
import type { AssigneeExperienceConfig } from '@/types';

const DEFAULT_EXPERIENCE: AssigneeExperienceConfig = {
  welcomeMessage: '',
  chatEnabled: false,
  viewMode: 'SPOTLIGHT',
};

export function AssigneeExperienceEditor() {
  const workflow = useWorkflowStore((s) => s.workflow);
  const updateFlowSettings = useWorkflowStore((s) => s.updateFlowSettings);

  if (!workflow) return null;

  const experience: AssigneeExperienceConfig = {
    ...DEFAULT_EXPERIENCE,
    ...(workflow.settings?.assigneeExperience || {}),
  };

  const update = (partial: Partial<AssigneeExperienceConfig>) => {
    updateFlowSettings({
      assigneeExperience: { ...experience, ...partial },
    });
  };

  const welcomeLength = (experience.welcomeMessage || '').length;
  const WELCOME_MAX = 500;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Assignee Portal
        </h4>
        <p className="text-[11px] text-gray-400">
          Configure how external assignees experience their tasks
        </p>
      </div>

      {/* Welcome Message */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Welcome Message
        </label>
        <textarea
          value={experience.welcomeMessage || ''}
          onChange={(e) => {
            if (e.target.value.length <= WELCOME_MAX) {
              update({ welcomeMessage: e.target.value });
            }
          }}
          placeholder="Welcome! Please complete the tasks below to get started..."
          rows={3}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
        <p className="mt-1 text-[11px] text-gray-400 text-right">
          {welcomeLength}/{WELCOME_MAX}
        </p>
      </div>

      <div className="border-t border-gray-100" />

      {/* Chat Enabled */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={experience.chatEnabled ?? false}
          onChange={(e) => update({ chatEnabled: e.target.checked })}
          className="mt-0.5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Enable chat for assignees</span>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Allow external assignees to chat with the coordinator within their task portal
          </p>
        </div>
      </label>

      <div className="border-t border-gray-100" />

      {/* View Mode */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Task View Mode
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-violet-300 transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50/50">
            <input
              type="radio"
              name="viewMode"
              checked={experience.viewMode === 'SPOTLIGHT'}
              onChange={() => update({ viewMode: 'SPOTLIGHT' })}
              className="mt-0.5 border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Spotlight</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Show one task at a time
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-violet-300 transition-colors has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50/50">
            <input
              type="radio"
              name="viewMode"
              checked={experience.viewMode === 'GALLERY'}
              onChange={() => update({ viewMode: 'GALLERY' })}
              className="mt-0.5 border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Gallery</span>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Show all tasks in a grid
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
