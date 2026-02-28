import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type StepKey = 'buildTemplate' | 'publishTemplate' | 'startFlow' | 'completeAction' | 'coordinateFlows';

const STEP_ORDER: StepKey[] = [
  'buildTemplate',
  'publishTemplate',
  'startFlow',
  'completeAction',
  'coordinateFlows',
];

interface OnboardingStore {
  buildTemplate: boolean;
  publishTemplate: boolean;
  startFlow: boolean;
  completeAction: boolean;
  coordinateFlows: boolean;
  isChecklistDismissed: boolean;

  completeBuildTemplate: () => void;
  completePublishTemplate: () => void;
  completeStartFlow: () => void;
  completeCompleteAction: () => void;
  completeCoordinateFlows: () => void;
  dismissChecklist: () => void;
  resetOnboarding: () => void;
  getNextStep: () => StepKey | null;
}

/** Returns true only if every step before `key` is complete. */
function canComplete(key: StepKey, state: Record<StepKey, boolean>): boolean {
  const idx = STEP_ORDER.indexOf(key);
  return STEP_ORDER.slice(0, idx).every((k) => state[k]);
}

/** Sanitize persisted state: reset any step whose prior steps aren't all complete. */
function sanitizeState(state: Record<StepKey, boolean>): Partial<Record<StepKey, boolean>> {
  const patched: Partial<Record<StepKey, boolean>> = {};
  for (let i = 0; i < STEP_ORDER.length; i++) {
    const key = STEP_ORDER[i];
    if (state[key] && !canComplete(key, state)) {
      patched[key] = false;
    }
  }
  return patched;
}

export { STEP_ORDER };
export type { StepKey };

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      buildTemplate: false,
      publishTemplate: false,
      startFlow: false,
      completeAction: false,
      coordinateFlows: false,
      isChecklistDismissed: false,

      completeBuildTemplate: () => {
        if (canComplete('buildTemplate', get())) set({ buildTemplate: true });
      },
      completePublishTemplate: () => {
        if (canComplete('publishTemplate', get())) set({ publishTemplate: true });
      },
      completeStartFlow: () => {
        if (canComplete('startFlow', get())) set({ startFlow: true });
      },
      completeCompleteAction: () => {
        if (canComplete('completeAction', get())) set({ completeAction: true });
      },
      completeCoordinateFlows: () => {
        if (canComplete('coordinateFlows', get())) set({ coordinateFlows: true });
      },
      dismissChecklist: () => set({ isChecklistDismissed: true }),
      resetOnboarding: () =>
        set({
          buildTemplate: false,
          publishTemplate: false,
          startFlow: false,
          completeAction: false,
          coordinateFlows: false,
          isChecklistDismissed: false,
        }),
      getNextStep: () => {
        const state = get();
        return STEP_ORDER.find((k) => !state[k]) ?? null;
      },
    }),
    {
      name: 'serviceflow-onboarding',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const patches = sanitizeState(state as unknown as Record<StepKey, boolean>);
        if (Object.keys(patches).length > 0) {
          Object.assign(state, patches);
        }
      },
    }
  )
);
