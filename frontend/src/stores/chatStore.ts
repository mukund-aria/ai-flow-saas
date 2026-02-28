import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Message, PendingPlan, Clarification, Rejection, ResponseMode, MessageAttachment, Phase2Data } from '@/types';

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
  setMessagePhase2: (messageId: string, phase2: Phase2Data) => void;
  setError: (error: string | null) => void;
  setPrefillMessage: (message: string | null) => void;
  setEnhancementsDismissed: (dismissed: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  cancelStream: () => void;
  clearMessages: () => void;
  loadMessages: (messages: Message[]) => void;
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

  setMessagePhase2: (messageId, phase2) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, phase2 } : m
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
}));
