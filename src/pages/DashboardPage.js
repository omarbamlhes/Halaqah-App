import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import BadgesSection from '../components/BadgesSection';
import quranData from '../data/quran-metadata.json';

export default function DashboardPage() {
  const { user } = useAuth();
  const [halaqahs, setHalaqahs] = useState([]);
  const [recitations, setRecitations] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalSessions: 0, totalRecitations: 0 });
  const [loading, setLoading] = useState(true);
  const [halaqahSearch, setHalaqahSearch] = useState('');
  const [surahFilter, setSurahFilter] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/halaqahs');
      setHalaqahs(data);

      let totalStudents = 0;
      let totalSessions = 0;
      let totalRecitations = 0;

      for (const h of data) {
        try {
          const detail = await api.get(`/halaqahs/${h.id}`);
          totalStudents += detail.data.students?.length || 0;
          const sessions = await api.get(`/sessions?halaqahId=${h.id}`);
          totalSessions += sessions.data.length;
        } catch (e) {}
      }

      if (user.role === 'student') {
        try {
          const rec = await api.get(`/recitations/student/${user.id}`);
          totalRecitations = rec.data.length;
          setRecitations(rec.data);
        } catch (e) {}
      }

      setStats({ totalStudents, totalSessions, totalRecitations });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (user.role === 'parent') return <Navigate to="/parent" />;
  if (loading) return <LoadingSpinner />;

  const statCards = [
    { value: halaqahs.length, label: 'حلقاتي', gradient: 'gradient-card-green', color: 'text-primary-600 dark:text-primary-400', iconBg: 'bg-primary-100 dark:bg-primary-900/40',
      icon: <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  ];

  if (user.role === 'teacher') {
    statCards.push({ value: stats.totalStudents, label: 'الطلاب', gradient: 'gradient-card-blue', color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      icon: <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> });
  }
  statCards.push({ value: stats.totalSessions, label: 'الجلسات', gradient: 'gradient-card-gold', color: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
    icon: <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> });
  if (user.role === 'student') {
    statCards.push({ value: stats.totalRecitations, label: 'تسميعاتي', gradient: 'gradient-card-purple', color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      icon: <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> });
  }

  const getSurahName = (num) => quranData.find(s => s.number === num)?.name || '';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in flex items-center gap-5">
        <Logo size={56} dark />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">مرحبا، {user.name}</h1>
          <p className="text-green-200 text-sm">
            {user.role === 'teacher' ? 'لوحة تحكم المعلم' : 'لوحة تحكم الطالب'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.gradient} rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center card-animated card-hover`}>
            <div className={`stat-icon ${card.iconBg}`}>{card.icon}</div>
            <p className={`text-3xl font-bold ${card.color} animate-count-up`}>{card.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {user.role === 'student' && (
        <div className="mb-8">
          <BadgesSection studentId={user.id} compact />
        </div>
      )}

      {user.role === 'teacher' && (
        <div className="flex gap-3 mb-8 animate-fade-in">
          <Link to="/halaqahs/new" className="gradient-primary text-white px-5 py-2.5 rounded-lg font-medium btn-glow text-sm">
            إنشاء حلقة جديدة
          </Link>
          <Link to="/halaqahs" className="bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 px-5 py-2.5 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-sm">
            إدارة الحلقات
          </Link>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">حلقاتي</h2>
        {halaqahs.length > 2 && (
          <input
            type="text"
            placeholder="ابحث..."
            value={halaqahSearch}
            onChange={(e) => setHalaqahSearch(e.target.value)}
            className="px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm w-48"
          />
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {halaqahs.filter(h => !halaqahSearch || h.name.includes(halaqahSearch) || (h.description || '').includes(halaqahSearch)).map((h) => (
          <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 card-animated card-hover">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-2">{h.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{h.description || 'بدون وصف'}</p>
            <div className="flex gap-2">
              <Link to={`/halaqahs/${h.id}`} className="text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition">التفاصيل</Link>
              <Link to={`/halaqahs/${h.id}/chat`} className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">المحادثة</Link>
              <Link to={`/halaqahs/${h.id}/sessions`} className="text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition">الجلسات</Link>
            </div>
          </div>
        ))}
        {halaqahs.length === 0 && (
          <div className="col-span-full empty-state">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            <p className="text-gray-400 dark:text-gray-500">لا توجد حلقات بعد</p>
            <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">{user.role === 'teacher' ? 'أنشئ حلقتك الأولى' : 'انضم لحلقة من صفحة الحلقات'}</p>
          </div>
        )}
      </div>

      {user.role === 'student' && recitations.length > 0 && (() => {
        const surahNumbers = [...new Set(recitations.map(r => r.surahNumber))].sort((a, b) => a - b);
        const filteredRecitations = surahFilter ? recitations.filter(r => r.surahNumber === parseInt(surahFilter)) : recitations;
        return (
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">تسميعاتي ({filteredRecitations.length})</h2>
            <select
              value={surahFilter}
              onChange={(e) => setSurahFilter(e.target.value)}
              className="px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            >
              <option value="">كل السور</option>
              {surahNumbers.map(num => (
                <option key={num} value={num}>{getSurahName(num)}</option>
              ))}
            </select>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
            <div className="space-y-3">
              {filteredRecitations.map((r) => (
                <div key={r.id} className="flex justify-between items-center border dark:border-gray-700 rounded-lg p-4 card-hover">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{getSurahName(r.surahNumber)} - آية {r.fromAyah} إلى {r.toAyah}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                        {r.type === 'new' ? 'جديد' : 'مراجعة'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(r.createdAt).toLocaleDateString('ar')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.evaluation && (
                      <div className="flex gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.evaluation.hifdh >= 8 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : r.evaluation.hifdh >= 5 ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>{r.evaluation.hifdh}/10</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.evaluation.tajweed >= 8 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : r.evaluation.tajweed >= 5 ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>{r.evaluation.tajweed}/10</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${r.evaluation.fluency >= 8 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : r.evaluation.fluency >= 5 ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>{r.evaluation.fluency}/10</span>
                      </div>
                    )}
                    <Link to={`/sessions/${r.sessionId}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">تفاصيل الجلسة</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
