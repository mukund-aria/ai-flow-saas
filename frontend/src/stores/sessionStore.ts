import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session } from '@/types';

interface SessionStore {
  currentSessionId: string | null;
  sessions: Session[];

  setCurrentSession: (sessionId: string | null) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  removeSession: (sessionId: string) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  clearCurrentSession: () => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      currentSessionId: null,
      sessions: [],

      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        })),

      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSessionId:
            state.currentSessionId === sessionId ? null : state.currentSessionId,
        })),

      updateSession: (sessionId, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates } : s
          ),
        })),

      clearCurrentSession: () => set({ currentSessionId: null }),
    }),
    {
      name: 'ai-flow-copilot-session',
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
      }),
    }
  )
);
