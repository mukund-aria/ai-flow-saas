/**
 * Flow Run Chat Store
 *
 * Zustand store for in-flow chat conversations between coordinators and assignees.
 * Supports both coordinator (multi-conversation) and assignee (single-conversation) modes.
 */

import { create } from 'zustand';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ============================================================================
// Types
// ============================================================================

export interface ChatMessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
}

export interface ChatMessage {
  id: string;
  senderType: 'user' | 'contact';
  senderName: string;
  senderUserId?: string;
  senderContactId?: string;
  content: string | null;
  attachments: ChatMessageAttachment[];
  createdAt: string;
}

export interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    content: string | null;
    senderName: string;
    senderType: 'user' | 'contact';
    createdAt: string;
  } | null;
  resolvedAt: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

interface FlowRunChatStore {
  // State
  isOpen: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  pollingInterval: ReturnType<typeof setInterval> | null;

  // Actions
  setOpen: (open: boolean) => void;
  toggle: () => void;

  // Coordinator actions
  fetchConversations: (flowRunId: string) => Promise<void>;
  selectConversation: (conversationId: string, flowRunId: string) => Promise<void>;
  backToList: () => void;
  sendMessage: (flowRunId: string, conversationId: string, content: string) => Promise<void>;
  toggleResolved: (flowRunId: string, conversationId: string, resolved: boolean) => Promise<void>;

  // Assignee actions
  fetchAssigneeMessages: (token: string) => Promise<void>;
  sendAssigneeMessage: (token: string, content: string) => Promise<void>;

  // Polling
  startPolling: (fetcher: () => Promise<void>) => void;
  stopPolling: () => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useFlowRunChatStore = create<FlowRunChatStore>((set, get) => ({
  isOpen: false,
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  pollingInterval: null,

  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  fetchConversations: async (flowRunId) => {
    set({ isLoadingConversations: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/flows/${flowRunId}/conversations`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        set({ conversations: data.data });
      }
    } catch (err) {
      set({ error: 'Failed to load conversations' });
    } finally {
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (conversationId, flowRunId) => {
    set({ activeConversationId: conversationId, isLoadingMessages: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/flows/${flowRunId}/conversations/${conversationId}/messages`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        set({ messages: data.data });
      }
    } catch (err) {
      set({ error: 'Failed to load messages' });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  backToList: () => {
    set({ activeConversationId: null, messages: [] });
  },

  sendMessage: async (flowRunId, conversationId, content) => {
    set({ isSending: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/flows/${flowRunId}/conversations/${conversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ messages: [...s.messages, data.data] }));
      }
    } catch (err) {
      set({ error: 'Failed to send message' });
    } finally {
      set({ isSending: false });
    }
  },

  toggleResolved: async (flowRunId, conversationId, resolved) => {
    try {
      await fetch(`${API_BASE}/flows/${flowRunId}/conversations/${conversationId}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved }),
      });
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, resolvedAt: resolved ? new Date().toISOString() : null }
            : c
        ),
      }));
    } catch (err) {
      set({ error: 'Failed to update conversation' });
    }
  },

  fetchAssigneeMessages: async (token) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/public/task/${token}/messages`);
      const data = await res.json();
      if (data.success) {
        set({ messages: data.data });
      }
    } catch (err) {
      set({ error: 'Failed to load messages' });
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  sendAssigneeMessage: async (token, content) => {
    set({ isSending: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/public/task/${token}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.success) {
        set((s) => ({ messages: [...s.messages, data.data] }));
      }
    } catch (err) {
      set({ error: 'Failed to send message' });
    } finally {
      set({ isSending: false });
    }
  },

  startPolling: (fetcher) => {
    const { pollingInterval } = get();
    if (pollingInterval) clearInterval(pollingInterval);
    const interval = setInterval(fetcher, 30000); // 30 seconds
    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  reset: () => {
    const { pollingInterval } = get();
    if (pollingInterval) clearInterval(pollingInterval);
    set({
      isOpen: false,
      conversations: [],
      activeConversationId: null,
      messages: [],
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSending: false,
      error: null,
      pollingInterval: null,
    });
  },
}));
