import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useEffect } from 'react';

export function NotificationBell({ isCollapsed }: { isCollapsed?: boolean }) {
  const { unreadCount, toggleOpen, fetchUnreadCount, hasNewNotifications } = useNotificationStore();

  // Poll unread count every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return (
    <button
      onClick={toggleOpen}
      className="relative flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      <span className="w-5 h-5 relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <>
            {hasNewNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-red-400 animate-ping" />
            )}
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-red-600 flex items-center justify-center text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </>
        )}
      </span>
      {!isCollapsed && <span className="flex-1 text-left">Notifications</span>}
    </button>
  );
}
