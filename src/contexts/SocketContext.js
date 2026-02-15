import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribe:notifications', user.id);
    });

    socket.on('evaluation:new', (data) => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, ...data }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 5000);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, notifications, dismissNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
