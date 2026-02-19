import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo from '../components/Logo';
import BadgesSection from '../components/BadgesSection';
import quranData from '../data/quran-metadata.json';
import timeAgo from '../utils/timeAgo';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (user.role === 'parent') return <Navigate to="/parent" />;
  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const getSurahName = (num) => quranData.find(s => s.number === num)?.name || '';

  const scoreColor = (v) =>
    v >= 8 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30'
    : v >= 5 ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in flex items-center gap-5">
        <Logo size={56} dark />
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">مرحبا، {user.name}</h1>
          <p className="text-green-200 text-sm">
            {user.role === 'teacher' ? 'لوحة تحكم المعلم' : 'لوحة تحكم الطالب'}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      {user.role === 'teacher' ? (
        <TeacherDashboard data={data} getSurahName={getSurahName} scoreColor={scoreColor} />
      ) : (
        <StudentDashboard data={data} user={user} getSurahName={getSurahName} scoreColor={scoreColor} />
      )}
    </div>
  );
}

function TeacherDashboard({ data, getSurahName, scoreColor }) {
  const statCards = [
    { value: data.halaqahCount, label: 'حلقاتي', color: 'text-primary-600 dark:text-primary-400', iconBg: 'bg-primary-100 dark:bg-primary-900/40', gradient: 'gradient-card-green',
      icon: <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { value: data.studentCount, label: 'الطلاب', color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/40', gradient: 'gradient-card-blue',
      icon: <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { value: data.sessionCount, label: 'الجلسات', color: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40', gradient: 'gradient-card-gold',
      icon: <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { value: data.evaluationCount, label: 'التقييمات', color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/40', gradient: 'gradient-card-purple',
      icon: <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.gradient} rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center card-animated card-hover`}>
            <div className={`stat-icon ${card.iconBg}`}>{card.icon}</div>
            <p className={`text-3xl font-bold ${card.color} animate-count-up`}>{card.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Rate */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">نسبة الحضور العامة</h3>
          <span className={`text-2xl font-bold ${data.attendanceRate >= 80 ? 'text-green-600 dark:text-green-400' : data.attendanceRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {data.attendanceRate}%
          </span>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
          <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${data.attendanceRate}%` }}></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8 animate-fade-in">
        <Link to="/halaqahs/new" className="gradient-primary text-white px-5 py-2.5 rounded-lg font-medium btn-glow text-sm">
          إنشاء حلقة جديدة
        </Link>
        <Link to="/halaqahs" className="bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 px-5 py-2.5 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-sm">
          إدارة الحلقات
        </Link>
        <Link to="/teacher/students" className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm">
          نظرة على الطلاب
        </Link>
      </div>

      {/* Two columns: Recent Sessions + Recent Evaluations */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-fade-in-up">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">آخر الجلسات</h3>
          {data.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {data.recentSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 card-hover">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{s.halaqahName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(s.scheduledAt).toLocaleDateString('ar')}</p>
                  </div>
                  <Link to={`/halaqahs/${s.halaqahId}/sessions`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">عرض</Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">لا توجد جلسات بعد</p>
          )}
        </div>

        {/* Recent Evaluations */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-fade-in-up">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">آخر التقييمات</h3>
          {data.recentEvaluations.length > 0 ? (
            <div className="space-y-3">
              {data.recentEvaluations.map((e) => (
                <div key={e.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 card-hover">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{e.studentName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{getSurahName(e.surahNumber)} ({e.fromAyah}-{e.toAyah})</p>
                  </div>
                  <div className="flex gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.hifdh)}`}>{e.hifdh}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.tajweed)}`}>{e.tajweed}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.fluency)}`}>{e.fluency}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">لا توجد تقييمات بعد</p>
          )}
        </div>
      </div>

      {/* Halaqah Summaries */}
      {data.halaqahSummaries.length > 0 && (
        <div className="animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">ملخص الحلقات</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.halaqahSummaries.map((h) => (
              <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 card-animated card-hover">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3">{h.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{h.studentCount}</p>
                    <p className="text-[10px] text-blue-500 dark:text-blue-400">طلاب</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 text-center">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{h.sessionCount}</p>
                    <p className="text-[10px] text-yellow-500 dark:text-yellow-400">جلسات</p>
                  </div>
                </div>
                {h.lastSession && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">آخر جلسة: {timeAgo(h.lastSession)}</p>
                )}
                <div className="flex gap-2">
                  <Link to={`/halaqahs/${h.id}`} className="text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition">التفاصيل</Link>
                  <Link to={`/halaqahs/${h.id}/sessions`} className="text-sm bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition">الجلسات</Link>
                  <Link to={`/halaqahs/${h.id}/chat`} className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">المحادثة</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StudentDashboard({ data, user, getSurahName, scoreColor }) {
  const statCards = [
    { value: data.halaqahCount, label: 'حلقاتي', color: 'text-primary-600 dark:text-primary-400', iconBg: 'bg-primary-100 dark:bg-primary-900/40', gradient: 'gradient-card-green',
      icon: <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { value: data.recitationCount, label: 'تسميعاتي', color: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/40', gradient: 'gradient-card-purple',
      icon: <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> },
    { value: data.memorizedSurahs, label: 'سور محفوظة', color: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/40', gradient: 'gradient-card-blue',
      icon: <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg> },
    { value: `${data.attendanceRate}%`, label: 'الحضور', color: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-yellow-100 dark:bg-yellow-900/40', gradient: 'gradient-card-gold',
      icon: <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.gradient} rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center card-animated card-hover`}>
            <div className={`stat-icon ${card.iconBg}`}>{card.icon}</div>
            <p className={`text-3xl font-bold ${card.color} animate-count-up`}>{card.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Average Score + Streak */}
      <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">المعدل العام</p>
          <p className={`text-3xl font-bold ${data.averageScore >= 8 ? 'text-green-600 dark:text-green-400' : data.averageScore >= 5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
            {data.averageScore}/10
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">السلسلة الحالية</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {data.currentStreak} <span className="text-base">يوم</span>
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-8">
        <BadgesSection studentId={user.id} compact />
      </div>

      {/* Recent Evaluations */}
      {data.recentEvaluations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 mb-8 animate-fade-in-up">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">آخر التقييمات</h3>
          <div className="space-y-3">
            {data.recentEvaluations.map((e) => (
              <div key={e.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3 card-hover">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                    {getSurahName(e.surahNumber)} - آية {e.fromAyah} إلى {e.toAyah}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.type === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                      {e.type === 'new' ? 'جديد' : 'مراجعة'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(e.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.hifdh)}`}>{e.hifdh}/10</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.tajweed)}`}>{e.tajweed}/10</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${scoreColor(e.fluency)}`}>{e.fluency}/10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex gap-3 animate-fade-in">
        <Link to="/halaqahs" className="bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 px-5 py-2.5 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition text-sm">
          حلقاتي
        </Link>
        <Link to="/progress" className="bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-sm">
          تقدم الحفظ
        </Link>
      </div>
    </>
  );
}
