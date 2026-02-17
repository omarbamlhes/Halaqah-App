import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChatPage() {
  const { halaqahId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom', { halaqahId: parseInt(halaqahId), userId: user.id, userName: user.name });

    const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const handleTyping = (name) => setTyping(name);
    const handleStopTyping = () => setTyping('');
    const handleOnlineUsers = (users) => setOnlineUsers(users);

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);
    socket.on('onlineUsers', handleOnlineUsers);

    loadMessages();

    return () => {
      socket.emit('leaveRoom', parseInt(halaqahId));
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
      socket.off('onlineUsers', handleOnlineUsers);
    };
  }, [socket, halaqahId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${halaqahId}`);
      setMessages(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('sendMessage', {
      senderId: user.id,
      halaqahId: parseInt(halaqahId),
      content: input.trim(),
    });
    setInput('');
    socket.emit('stopTyping', parseInt(halaqahId));
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing', { halaqahId: parseInt(halaqahId), userName: user.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stopTyping', parseInt(halaqahId));
    }, 2000);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">المحادثة</h1>
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{onlineUsers.length} متصل</span>
            <div className="flex -space-x-1 space-x-reverse">
              {onlineUsers.slice(0, 5).map((u) => (
                <span key={u.userId} className="w-6 h-6 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white dark:border-gray-900" title={u.userName}>
                  {u.userName[0]}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 overflow-y-auto mb-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender?.id === user.id ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
              m.sender?.id === user.id
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
            }`}>
              {m.sender?.id !== user.id && (
                <p className="text-xs font-medium mb-1 opacity-70">{m.sender?.name}</p>
              )}
              <p className="text-sm">{m.content}</p>
              <p className={`text-[10px] mt-1 ${m.sender?.id === user.id ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                {new Date(m.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {typing && <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{typing} يكتب...</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
          placeholder="اكتب رسالة..."
        />
        <button type="submit" className="gradient-primary text-white px-6 py-3 rounded-xl font-medium btn-glow">
          إرسال
        </button>
      </form>
    </div>
  );
}
