import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Message, PendingPlan, Clarification, Rejection, ResponseMode, MessageAttachment, EnhancementData, ThinkingStepInfo } from '@/types';

export type ThinkingStatus = 'thinking' | 'analyzing' | 'creating' | 'editing' | 'refining';

interface ChatStore {
  messages: Message[];
  isStreaming: boolean;
  isThinking: boolean;
  thinkingStatus: ThinkingStatus;
  streamingContent: string;
  pendingPlan: PendingPlan | null;
  error: string | null;
  prefillMessage: string | null;  // Message to prefill into the input (user can edit before sending)
  enhancementsDismissed: boolean;  // Session-level flag to hide enhancement options after user dismisses them
  abortController: AbortController | null;  // For cancelling in-flight stream requests
  thinkingSteps: ThinkingStepInfo[];
  thinkingStartTime: number | null;

  // Actions
  addUserMessage: (content: string, attachment?: MessageAttachment) => string;
  addAssistantMessage: (content: string, mode?: ResponseMode) => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setStreaming: (streaming: boolean) => void;
  setThinking: (thinking: boolean, status?: ThinkingStatus) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;
  setPendingPlan: (plan: PendingPlan | null) => void;
  setMessagePendingPlan: (messageId: string, plan: PendingPlan) => void;
  setMessageClarifications: (messageId: string, clarifications: Clarification[]) => void;
  setMessageRejection: (messageId: string, rejection: Rejection) => void;
  setMessageEnhancement: (messageId: string, enhancement: EnhancementData) => void;
  setError: (error: string | null) => void;
  setPrefillMessage: (message: string | null) => void;
  setEnhancementsDismissed: (dismissed: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  cancelStream: () => void;
  clearMessages: () => void;
  loadMessages: (messages: Message[]) => void;
  addThinkingStep: (step: number, label: string) => void;
  clearThinkingSteps: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  isThinking: false,
  thinkingStatus: 'thinking' as ThinkingStatus,
  streamingContent: '',
  pendingPlan: null,
  error: null,
  prefillMessage: null,
  enhancementsDismissed: false,
  abortController: null,
  thinkingSteps: [],
  thinkingStartTime: null,

  addUserMessage: (content, attachment) => {
    const id = nanoid();
    const message: Message = {
      id,
      role: 'user',
      content,
      timestamp: new Date(),
      attachment,
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  addAssistantMessage: (content, mode) => {
    const id = nanoid();
    const message: Message = {
      id,
      role: 'assistant',
      content,
      timestamp: new Date(),
      mode,
    };
    set((state) => ({ messages: [...state.messages, message] }));
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),

  setThinking: (thinking, status = 'thinking') => set({ isThinking: thinking, thinkingStatus: status }),

  appendStreamingContent: (chunk) => {
    set((state) => ({ streamingContent: state.streamingContent + chunk }));
  },

  clearStreamingContent: () => set({ streamingContent: '' }),

  setPendingPlan: (plan) => set({ pendingPlan: plan }),

  setMessagePendingPlan: (messageId, plan) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, pendingPlan: plan } : m
      ),
      pendingPlan: plan,
    }));
  },

  setMessageClarifications: (messageId, clarifications) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, clarifications } : m
      ),
    }));
  },

  setMessageRejection: (messageId, rejection) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, rejection } : m
      ),
    }));
  },

  setMessageEnhancement: (messageId, enhancement) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, enhancement } : m
      ),
    }));
  },

  setError: (error) => set({ error }),

  setPrefillMessage: (message) => set({ prefillMessage: message }),

  setEnhancementsDismissed: (dismissed) => set({ enhancementsDismissed: dismissed }),

  setAbortController: (controller) => set({ abortController: controller }),

  cancelStream: () => {
    const { abortController } = useChatStore.getState();
    if (abortController) {
      abortController.abort();
      set({ abortController: null });
    }
  },

  clearMessages: () =>
    set({
      messages: [],
      streamingContent: '',
      pendingPlan: null,
      error: null,
      enhancementsDismissed: false,  // Reset on new chat
    }),

  loadMessages: (messages) => set({ messages }),

  addThinkingStep: (step, label) => {
    set((state) => {
      // Mark all previous steps as done
      const updatedSteps = state.thinkingSteps.map((s) => ({ ...s, done: true }));
      // Add new active step
      updatedSteps.push({ step, label, done: false });
      return {
        thinkingSteps: updatedSteps,
        thinkingStartTime: state.thinkingStartTime ?? Date.now(),
      };
    });
  },

  clearThinkingSteps: () => set({ thinkingSteps: [], thinkingStartTime: null }),
}));
