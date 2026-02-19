import { Bell } from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useEffect } from 'react';

export function NotificationBell() {
  const { unreadCount, toggleOpen, fetchUnreadCount } = useNotificationStore();

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
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </span>
      <span className="flex-1 text-left">Notifications</span>
    </button>
  );
}
