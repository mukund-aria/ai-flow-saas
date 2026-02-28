import { create } from 'zustand';
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  type AppNotification,
} from '@/lib/api';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  previousUnreadCount: number;
  hasNewNotifications: boolean;
  _newNotifTimeout: ReturnType<typeof setTimeout> | null;
  isLoading: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  previousUnreadCount: 0,
  hasNewNotifications: false,
  _newNotifTimeout: null,
  isLoading: false,
  isOpen: false,

  setOpen: (open) => {
    set({ isOpen: open });
    if (open) {
      get().fetchNotifications();
    }
  },

  toggleOpen: () => {
    const nextOpen = !get().isOpen;
    set({ isOpen: nextOpen });
    if (nextOpen) {
      get().fetchNotifications();
    }
  },

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await listNotifications();
      set({ notifications, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const count = await getUnreadNotificationCount();
      set({ unreadCount: count });
      const prev = get().previousUnreadCount;
      if (count > prev && prev > 0) {
        if (get()._newNotifTimeout) clearTimeout(get()._newNotifTimeout!);
        set({ hasNewNotifications: true });
        const timeout = setTimeout(() => set({ hasNewNotifications: false }), 5000);
        set({ _newNotifTimeout: timeout });
      }
      set({ previousUnreadCount: count });
    } catch {
      // silently ignore polling failures
    }
  },

  markRead: async (id) => {
    try {
      await markNotificationRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch {
      // ignore
    }
  },

  markAllRead: async () => {
    try {
      await markAllNotificationsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch {
      // ignore
    }
  },

  dismiss: async (id) => {
    try {
      await dismissNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    } catch {
      // ignore
    }
  },
}));
