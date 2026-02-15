import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentChildProgressPage() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [studentId]);

  const load = async () => {
    try {
      const res = await api.get(`/parent/children/${studentId}/progress`);
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-red-500">لا يمكن عرض بيانات هذا الطالب</p></div>;

  const getProgressForSurah = (num) => data.progress.find(p => p.surahNumber === num);
  const statusColors = { not_started: 'bg-gray-100', in_progress: 'bg-yellow-100', memorized: 'bg-green-200', needs_review: 'bg-orange-100' };

  const memorized = data.progress.filter(p => p.status === 'memorized').length;
  const inProgress = data.progress.filter(p => p.status === 'in_progress').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
        <Link to="/parent" className="text-green-200 text-sm hover:text-white transition mb-2 inline-block">&larr; العودة لقائمة الأبناء</Link>
        <h1 className="text-2xl font-bold text-white mb-1">تقدم حفظ: {data.student.name}</h1>
        <div className="flex gap-6 mt-3">
          <span className="text-green-200 text-sm">محفوظ: <strong className="text-white">{memorized}</strong> سورة</span>
          <span className="text-green-200 text-sm">قيد الحفظ: <strong className="text-white">{inProgress}</strong> سورة</span>
        </div>
      </div>

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
        <h2 className="text-lg font-bold text-gray-800 mb-4">آخر التسميعات</h2>
        <div className="space-y-3">
          {data.recentRecitations.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 card-hover">
              <p className="font-medium text-gray-800">
                {quranData.find(s => s.number === r.surahNumber)?.name} - آية {r.fromAyah} إلى {r.toAyah}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(r.createdAt).toLocaleDateString('ar')}
                <span className={`inline-block mr-2 px-2 py-0.5 rounded-full text-xs ${r.type === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                  {r.type === 'new' ? 'جديد' : 'مراجعة'}
                </span>
              </p>
            </div>
          ))}
          {data.recentRecitations.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد تسميعات بعد</p>}
        </div>
      </div>
    </div>
  );
}
