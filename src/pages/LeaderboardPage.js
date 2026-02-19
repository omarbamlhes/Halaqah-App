import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [halaqahId, setHalaqahId] = useState('');
  const [halaqahs, setHalaqahs] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    api.get('/halaqahs').then(res => setHalaqahs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period });
    if (tab === 'my' && halaqahId) params.set('halaqahId', halaqahId);
    api.get(`/points/leaderboard?${params}`)
      .then(res => setLeaderboard(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period, halaqahId, tab]);

  const medals = ['', 'text-yellow-500', 'text-gray-400', 'text-amber-600'];
  const medalIcons = ['', '🥇', '🥈', '🥉'];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title="لوحة المتصدرين"
        subtitle="تنافس مع زملائك واجمع أكبر عدد من النقاط"
        icon={
          <svg className="w-14 h-14 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        }
      />

      {/* Tabs & Filters */}
      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in">
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => { setTab('all'); setHalaqahId(''); }}
            className={`px-4 py-2 text-sm font-medium transition ${tab === 'all' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            عام
          </button>
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 text-sm font-medium transition ${tab === 'my' ? 'gradient-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            حلقاتي
          </button>
        </div>

        {tab === 'my' && halaqahs.length > 0 && (
          <select
            value={halaqahId}
            onChange={e => setHalaqahId(e.target.value)}
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200"
          >
            <option value="">كل الحلقات</option>
            {halaqahs.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        )}

        <div className="flex bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden mr-auto">
          {[
            { key: 'weekly', label: 'هذا الأسبوع' },
            { key: 'monthly', label: 'هذا الشهر' },
            { key: 'all', label: 'الكل' },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-2 text-xs font-medium transition ${period === p.key ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading ? (
        <LoadingSpinner />
      ) : leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center animate-fade-in">
          <p className="text-gray-400 dark:text-gray-500">لا توجد بيانات بعد</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden animate-fade-in-up">
          <div className="divide-y dark:divide-gray-700">
            {leaderboard.map((entry) => {
              const isMe = entry.studentId === user?.id;
              return (
                <div
                  key={entry.studentId}
                  className={`flex items-center gap-4 px-5 py-4 transition ${
                    isMe ? 'bg-primary-50/50 dark:bg-primary-900/20 border-r-4 border-primary-500' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">{medalIcons[entry.rank]}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-400 dark:text-gray-500">{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    entry.rank === 1 ? 'bg-yellow-500' : entry.rank === 2 ? 'bg-gray-400' : entry.rank === 3 ? 'bg-amber-600' : 'bg-primary-500'
                  }`}>
                    {entry.studentName?.charAt(0)}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <p className={`font-medium ${isMe ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-gray-100'}`}>
                      {entry.studentName}
                      {isMe && <span className="text-xs mr-2 text-primary-500">(أنت)</span>}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="text-left">
                    <span className={`text-lg font-bold ${medals[entry.rank] || 'text-gray-700 dark:text-gray-200'}`}>
                      {entry.totalPoints}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">نقطة</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
