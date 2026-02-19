import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import timeAgo from '../utils/timeAgo';

const TYPE_CONFIG = {
  evaluation_received: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: '📝' },
  session_created: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: '📅' },
  badge_earned: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', icon: '🏆' },
  student_joined: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: '👋' },
  review_assigned: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', icon: '📖' },
  child_evaluation: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400', icon: '👨‍👧' },
};

export default function NotificationsPage() {
  const { markAsRead, markAllAsRead } = useSocket() || {};
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = 1) => {
    try {
      const { data } = await api.get(`/notifications?page=${p}`);
      setNotifications(data.items);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    if (markAsRead) await markAsRead(id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (markAllAsRead) await markAllAsRead();
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) return <LoadingSpinner />;

  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">الإشعارات</h1>
          <p className="text-green-200 text-sm">جميع التنبيهات والتحديثات</p>
        </div>
      </div>

      {hasUnread && (
        <div className="flex justify-end mb-4 animate-fade-in">
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium transition"
          >
            تعليم الكل كمقروء
          </button>
        </div>
      )}

      <div className="space-y-3 animate-fade-in-up">
        {notifications.map((n) => {
          const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.evaluation_received;
          return (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 card-hover cursor-pointer transition relative ${
                !n.isRead ? 'border-r-4 border-r-primary-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 ${config.bg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-sm ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <svg className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-400 dark:text-gray-500 text-lg font-medium">لا توجد إشعارات</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">ستظهر هنا عند وجود تحديثات جديدة</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => { load(page - 1); }}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
          >
            السابق
          </button>
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => { load(page + 1); }}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
}
