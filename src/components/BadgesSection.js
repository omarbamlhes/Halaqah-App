import { useState, useEffect } from 'react';
import api from '../api/axios';

const BADGE_STYLES = {
  first_recitation:   { bg: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', bar: 'bg-blue-400', icon: '📖' },
  ten_recitations:    { bg: 'bg-indigo-50 dark:bg-indigo-900/30', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', bar: 'bg-indigo-400', icon: '📚' },
  fifty_recitations:  { bg: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', bar: 'bg-purple-400', icon: '🎓' },
  first_surah:        { bg: 'bg-green-50 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300', bar: 'bg-green-400', icon: '🌱' },
  ten_surahs:         { bg: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-400', icon: '🌳' },
  juz_amma:           { bg: 'bg-yellow-50 dark:bg-yellow-900/30', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300', bar: 'bg-yellow-400', icon: '👑' },
  perfect_attendance: { bg: 'bg-teal-50 dark:bg-teal-900/30', border: 'border-teal-200 dark:border-teal-800', text: 'text-teal-700 dark:text-teal-300', bar: 'bg-teal-400', icon: '✅' },
  seven_day_streak:   { bg: 'bg-orange-50 dark:bg-orange-900/30', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', bar: 'bg-orange-400', icon: '🔥' },
  excellent_eval:     { bg: 'bg-amber-50 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-400', icon: '⭐' },
};

export default function BadgesSection({ studentId, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    api.get(`/badges/student/${studentId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4"></div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>)}
      </div>
    </div>
  );

  if (!data) return null;

  const { badges, streak, stats } = data;

  if (compact) {
    const earned = badges.filter(b => b.earned);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">الأوسمة والإنجازات</h3>
          <a href="/progress" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">عرض الكل &larr;</a>
        </div>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{streak.current}</p>
            <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">السلسلة الحالية</p>
          </div>
          <div className="flex-1 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{streak.longest}</p>
            <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">أطول سلسلة</p>
          </div>
          <div className="flex-1 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.earnedBadges}/{stats.totalBadges}</p>
            <p className="text-xs text-green-500 dark:text-green-400 mt-0.5">أوسمة محققة</p>
          </div>
        </div>
        {earned.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {earned.map(b => {
              const style = BADGE_STYLES[b.id];
              return (
                <span key={b.id} className={`${style.bg} ${style.border} ${style.text} border rounded-full px-3 py-1 text-sm font-medium`}>
                  {style.icon} {b.name}
                </span>
              );
            })}
          </div>
        )}
        {earned.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-sm text-center">لم تحصل على أوسمة بعد — واصل التقدم!</p>}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 animate-fade-in-up">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">الأوسمة والإنجازات</h2>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak.current}</p>
          <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">السلسلة الحالية</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{streak.longest}</p>
          <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">أطول سلسلة</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.earnedBadges}/{stats.totalBadges}</p>
          <p className="text-xs text-green-500 dark:text-green-400 mt-1">أوسمة محققة</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {badges.map(b => {
          const style = BADGE_STYLES[b.id];
          const pct = b.progress.target > 0 ? Math.round((b.progress.current / b.progress.target) * 100) : 0;
          return (
            <div
              key={b.id}
              className={`rounded-xl border p-3 text-center transition ${
                b.earned
                  ? `${style.bg} ${style.border}`
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="text-2xl mb-1">{style.icon}</div>
              <p className={`text-sm font-bold ${b.earned ? style.text : 'text-gray-500 dark:text-gray-400'}`}>{b.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{b.description}</p>
              {!b.earned && (
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 overflow-hidden">
                    <div className={`${style.bar} h-full rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{b.progress.current}/{b.progress.target}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
