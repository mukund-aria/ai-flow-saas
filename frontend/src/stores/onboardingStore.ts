import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStore {
  buildFlow: boolean;
  publishFlow: boolean;
  runFlow: boolean;
  viewRun: boolean;
  inviteContact: boolean;
  isChecklistDismissed: boolean;

  completeBuildFlow: () => void;
  completePublishFlow: () => void;
  completeRunFlow: () => void;
  completeViewRun: () => void;
  completeInviteContact: () => void;
  dismissChecklist: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      buildFlow: false,
      publishFlow: false,
      runFlow: false,
      viewRun: false,
      inviteContact: false,
      isChecklistDismissed: false,

      completeBuildFlow: () => set({ buildFlow: true }),
      completePublishFlow: () => set({ publishFlow: true }),
      completeRunFlow: () => set({ runFlow: true }),
      completeViewRun: () => set({ viewRun: true }),
      completeInviteContact: () => set({ inviteContact: true }),
      dismissChecklist: () => set({ isChecklistDismissed: true }),
      resetOnboarding: () =>
        set({
          buildFlow: false,
          publishFlow: false,
          runFlow: false,
          viewRun: false,
          inviteContact: false,
          isChecklistDismissed: false,
        }),
    }),
    {
      name: 'ai-flow-onboarding',
    }
  )
);
