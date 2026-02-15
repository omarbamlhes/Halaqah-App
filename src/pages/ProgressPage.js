import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [progRes, revRes] = await Promise.all([
        api.get(`/recitations/progress/${user.id}`),
        api.get(`/reviews/student/${user.id}`),
      ]);
      setProgress(progRes.data);
      setReviews(revRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/reviews/${id}/complete`);
      load();
    } catch (err) { alert('حدث خطأ'); }
  };

  const getProgressForSurah = (num) => progress.find(p => p.surahNumber === num);
  const statusColors = { not_started: 'bg-gray-100', in_progress: 'bg-yellow-100', memorized: 'bg-green-200', needs_review: 'bg-orange-100' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">تقدم الحفظ</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 mb-4">السور (114)</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {quranData.map((surah) => {
            const p = getProgressForSurah(surah.number);
            const status = p?.status || 'not_started';
            return (
              <div key={surah.number} className={`${statusColors[status]} rounded-lg p-2 text-center card-hover cursor-default`} title={`${surah.name} - ${surah.ayahs} آية`}>
                <p className="text-xs font-bold text-gray-700">{surah.number}</p>
                <p className="text-[10px] text-gray-500 truncate">{surah.name}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border"></span> لم يبدأ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100"></span> جاري</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200"></span> محفوظ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100"></span> يحتاج مراجعة</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 mb-4">المراجعات المطلوبة ({reviews.filter(r => r.status === 'pending').length})</h2>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex justify-between items-center border rounded-lg p-3 card-hover">
              <div>
                <p className="font-medium text-gray-800">{quranData.find(s => s.number === r.surahNumber)?.name} - آية {r.fromAyah} إلى {r.toAyah}</p>
                <p className="text-xs text-gray-400">مطلوب قبل: {new Date(r.dueDate).toLocaleDateString('ar')}</p>
              </div>
              {r.status === 'pending' ? (
                <button onClick={() => handleComplete(r.id)} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition">إتمام</button>
              ) : (
                <span className="text-green-600 text-sm">مكتملة</span>
              )}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد مراجعات</p>}
        </div>
      </div>
    </div>
  );
}
