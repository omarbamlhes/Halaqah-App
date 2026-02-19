import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';
import BadgesSection from '../components/BadgesSection';
import ProgressReport from '../components/ProgressReport';
import { exportToPdf } from '../utils/exportPdf';

export default function ParentChildProgressPage() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => { load(); }, [studentId]);

  const load = async () => {
    try {
      const res = await api.get(`/parent/children/${studentId}/progress`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-red-500 dark:text-red-400">لا يمكن عرض بيانات هذا الطالب</p></div>;

  const getProgressForSurah = (num) => data.progress.find(p => p.surahNumber === num);
  const statusColors = { not_started: 'bg-gray-100 dark:bg-gray-700', in_progress: 'bg-yellow-100 dark:bg-yellow-900/40', memorized: 'bg-green-200 dark:bg-green-900/40', needs_review: 'bg-orange-100 dark:bg-orange-900/40' };

  const memorized = data.progress.filter(p => p.status === 'memorized').length;
  const inProgress = data.progress.filter(p => p.status === 'in_progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <HeroSection
        title={`تقدم حفظ: ${data.student.name}`}
        verse="وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا"
      >
        <Link to="/parent" className="text-green-200 text-sm hover:text-white transition mb-2 inline-block">&larr; العودة لقائمة الأبناء</Link>
        <div className="flex items-center gap-6 mt-2">
          <span className="text-green-200 text-sm">محفوظ: <strong className="text-white">{memorized}</strong> سورة</span>
          <span className="text-green-200 text-sm">قيد الحفظ: <strong className="text-white">{inProgress}</strong> سورة</span>
          <button
            onClick={async () => { setExporting(true); try { await exportToPdf(reportRef.current, `تقرير-${data.student.name}`); } finally { setExporting(false); } }}
            disabled={exporting}
            className="mr-auto bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </button>
        </div>
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
        <BadgesSection studentId={parseInt(studentId)} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">آخر التسميعات</h2>
        <div className="space-y-3">
          {data.recentRecitations.map((r) => (
            <div key={r.id} className="border dark:border-gray-700 rounded-lg p-3 card-hover">
              <p className="font-medium text-gray-800 dark:text-gray-100">
                {quranData.find(s => s.number === r.surahNumber)?.name} - آية {r.fromAyah} إلى {r.toAyah}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {new Date(r.createdAt).toLocaleDateString('ar')}
                <span className={`inline-block mr-2 px-2 py-0.5 rounded-full text-xs ${r.type === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                  {r.type === 'new' ? 'جديد' : 'مراجعة'}
                </span>
              </p>
            </div>
          ))}
          {data.recentRecitations.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-center py-4">لا توجد تسميعات بعد</p>}
        </div>
      </div>

      <ProgressReport
        ref={reportRef}
        studentName={data.student.name}
        studentId={parseInt(studentId)}
        progress={data.progress}
        recitations={data.recentRecitations}
      />
    </div>
  );
}
