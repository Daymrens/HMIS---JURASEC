import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: number) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!confirm('Clear all notifications?')) return;
    setNotifications([]);
    localStorage.setItem('notifications', JSON.stringify([]));
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
    }
  };

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Notification Center</h3>
          <p className="text-sm text-gray-600">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary">
              ✓ Mark All Read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn btn-secondary">
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'unread'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`card border-2 ${getColor(notification.type)} ${
                !notification.read ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getIcon(notification.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12 text-gray-500">
            <p className="text-4xl mb-3">🔔</p>
            <p>No notifications</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Utility function to add notifications
export const addNotification = (
  type: Notification['type'],
  title: string,
  message: string
) => {
  const notifications = JSON.parse(
    localStorage.getItem('notifications') || '[]'
  );

  const newNotification: Notification = {
    id: Date.now(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  notifications.unshift(newNotification);

  // Keep only last 50 notifications
  const trimmed = notifications.slice(0, 50);

  localStorage.setItem('notifications', JSON.stringify(trimmed));

  // Trigger custom event for real-time updates
  window.dispatchEvent(new Event('notification-added'));
};
