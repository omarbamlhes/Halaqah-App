import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const s = io('http://localhost:3001');
    setSocket(s);

    s.on('connect', () => {
      s.emit('subscribe:notifications', user.id);
    });

    s.on('evaluation:new', (data) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, ...data }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, dismissNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
