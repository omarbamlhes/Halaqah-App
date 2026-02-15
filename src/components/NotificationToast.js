import { useSocket } from '../contexts/SocketContext';
import quranData from '../data/quran-metadata.json';

export default function NotificationToast() {
  const { notifications, dismissNotification } = useSocket() || {};

  if (!notifications?.length) return null;

  return (
    <div className="fixed top-20 left-4 z-50 space-y-2" style={{ maxWidth: '320px' }}>
      {notifications.map((n) => {
        const surah = quranData.find(s => s.number === n.surahNumber);
        const avg = Math.round(((n.hifdh || 0) + (n.tajweed || 0) + (n.fluency || 0)) / 3 * 10) / 10;
        return (
          <div
            key={n.id}
            className="bg-white rounded-xl shadow-lg border border-green-200 p-4 toast-enter cursor-pointer"
            onClick={() => dismissNotification(n.id)}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {avg}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">تقييم جديد</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {surah?.name} - آية {n.fromAyah} إلى {n.toAyah}
                </p>
                <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                  <span>حفظ: {n.hifdh}/10</span>
                  <span>تجويد: {n.tajweed}/10</span>
                  <span>طلاقة: {n.fluency}/10</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
