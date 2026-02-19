import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';
import BadgesSection from '../components/BadgesSection';
import ProgressReport from '../components/ProgressReport';
import { exportToPdf } from '../utils/exportPdf';

export default function ProgressPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [recitations, setRecitations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [progRes, recRes, revRes] = await Promise.all([
        api.get(`/recitations/progress/${user.id}`),
        api.get(`/recitations/student/${user.id}`),
        api.get(`/reviews/student/${user.id}`),
      ]);
      setProgress(progRes.data);
      setRecitations(recRes.data);
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
  const statusColors = { not_started: 'bg-gray-100 dark:bg-gray-700', in_progress: 'bg-yellow-100 dark:bg-yellow-900/40', memorized: 'bg-green-200 dark:bg-green-900/40', needs_review: 'bg-orange-100 dark:bg-orange-900/40' };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <HeroSection
        title="تقدم الحفظ"
        verse="وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ"
      >
        <button
          onClick={async () => { setExporting(true); try { await exportToPdf(reportRef.current, `تقرير-${user.name}`); } finally { setExporting(false); } }}
          disabled={exporting}
          className="bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
        >
          {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
        </button>
      </HeroSection>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">السور (114)</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {quranData.map((surah) => {
            const p = getProgressForSurah(surah.number);
            const status = p?.status || 'not_started';
            return (
              <div key={surah.number} className={`${statusColors[status]} rounded-lg p-2 text-center card-hover cursor-default`} title={`${surah.name} - ${surah.ayahs} آية`}>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{surah.number}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{surah.name}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700 border dark:border-gray-600"></span> لم يبدأ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/40"></span> جاري</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-200 dark:bg-green-900/40"></span> محفوظ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/40"></span> يحتاج مراجعة</span>
        </div>
      </div>

      <div className="mb-6">
        <BadgesSection studentId={user.id} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">المراجعات المطلوبة ({reviews.filter(r => r.status === 'pending').length})</h2>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex justify-between items-center border dark:border-gray-700 rounded-lg p-3 card-hover">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{quranData.find(s => s.number === r.surahNumber)?.name} - آية {r.fromAyah} إلى {r.toAyah}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">مطلوب قبل: {new Date(r.dueDate).toLocaleDateString('ar')}</p>
              </div>
              {r.status === 'pending' ? (
                <button onClick={() => handleComplete(r.id)} className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 dark:hover:bg-green-900/50 transition">إتمام</button>
              ) : (
                <span className="text-green-600 dark:text-green-400 text-sm">مكتملة</span>
              )}
            </div>
          ))}
          {reviews.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-center py-4">لا توجد مراجعات</p>}
        </div>
      </div>

      <ProgressReport
        ref={reportRef}
        studentName={user.name}
        studentId={user.id}
        progress={progress}
        recitations={recitations}
      />
    </div>
  );
}
