import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/stores/notificationStore';
import { X, CheckCheck, Bell, Loader2, AlertTriangle, CheckCircle2, PlayCircle, XCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

function getNotificationIcon(type: string) {
  switch (type) {
    case 'STEP_COMPLETED':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'STEP_OVERDUE':
    case 'FLOW_STALLED':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'FLOW_COMPLETED':
      return <PlayCircle className="w-4 h-4 text-green-600" />;
    case 'FLOW_CANCELLED':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'REMINDER':
      return <Bell className="w-4 h-4 text-violet-500" />;
    case 'ESCALATION':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-400" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationPanel() {
  const navigate = useNavigate();
  const { notifications, isLoading, isOpen, setOpen, markRead, markAllRead, dismiss } =
    useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setOpen]);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter((n) => !n.readAt);

  return (
    <div
      ref={panelRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-[400px] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bell className="w-8 h-8 mb-2" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.readAt ? 'bg-violet-50/50' : ''
              }`}
              onClick={() => {
                if (!notification.readAt) markRead(notification.id);
                if (notification.flowId) {
                  navigate(`/flows/${notification.flowId}`);
                  setOpen(false);
                }
              }}
            >
              {/* Unread indicator */}
              <div className="flex-shrink-0 mt-1">
                {!notification.readAt ? (
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                ) : (
                  <div className="w-2 h-2" />
                )}
              </div>

              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {notification.body}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {timeAgo(notification.createdAt)}
                </p>
              </div>

              {/* Dismiss */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(notification.id);
                }}
                className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-500 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
