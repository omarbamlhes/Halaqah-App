import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(() => {
    if (!user) return;
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const s = io('http://localhost:3001');
    setSocket(s);

    s.on('connect', () => {
      s.emit('subscribe:notifications', user.id);
    });

    s.on('notification:new', (data) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, ...data }]);
      setUnreadCount((prev) => prev + 1);
      setTimeout(() => {
        setToasts((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    // Keep legacy support for evaluation:new
    s.on('evaluation:new', (data) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type: 'evaluation_received', ...data }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    // Fetch initial unread count
    api.get('/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count))
      .catch(() => {});

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = useCallback(async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
    } catch (e) {}
  }, []);

  return (
    <SocketContext.Provider value={{
      socket,
      toasts,
      dismissToast,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshUnreadCount,
      // Legacy compat
      notifications: toasts,
      dismissNotification: dismissToast,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
