import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      buildTemplate: false,
      publishTemplate: false,
      startFlow: false,
      completeAction: false,
      coordinateFlows: false,
      isChecklistDismissed: false,

      completeBuildTemplate: () => set({ buildTemplate: true }),
      completePublishTemplate: () => set({ publishTemplate: true }),
      completeStartFlow: () => set({ startFlow: true }),
      completeCompleteAction: () => set({ completeAction: true }),
      completeCoordinateFlows: () => set({ coordinateFlows: true }),
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
    }),
    {
      name: 'ai-flow-onboarding',
    }
  )
);
