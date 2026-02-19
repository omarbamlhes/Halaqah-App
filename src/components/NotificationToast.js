import { useSocket } from '../contexts/SocketContext';

const TYPE_STYLES = {
  evaluation_received: { bg: 'bg-green-500', icon: '📝' },
  session_created: { bg: 'bg-blue-500', icon: '📅' },
  badge_earned: { bg: 'bg-yellow-500', icon: '🏆' },
  student_joined: { bg: 'bg-purple-500', icon: '👋' },
  review_assigned: { bg: 'bg-orange-500', icon: '📖' },
  child_evaluation: { bg: 'bg-teal-500', icon: '👨‍👧' },
};

export default function NotificationToast() {
  const { toasts, dismissToast } = useSocket() || {};

  if (!toasts?.length) return null;

  return (
    <div className="fixed top-20 left-4 z-50 space-y-2" style={{ maxWidth: '340px' }}>
      {toasts.map((n) => {
        const style = TYPE_STYLES[n.type] || TYPE_STYLES.evaluation_received;
        return (
          <div
            key={n.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 toast-enter cursor-pointer"
            onClick={() => dismissToast(n.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 ${style.bg} rounded-full flex items-center justify-center text-white text-lg flex-shrink-0`}>
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 dark:text-gray-100 text-sm">{n.title || 'إشعار جديد'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.message || ''}</p>
                {n.metadata?.hifdh != null && (
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                    <span>حفظ: {n.metadata.hifdh}/10</span>
                    <span>تجويد: {n.metadata.tajweed}/10</span>
                    <span>طلاقة: {n.metadata.fluency}/10</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
