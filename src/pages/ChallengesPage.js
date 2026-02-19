import { useState, useEffect } from 'react';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';

export default function ChallengesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/challenges/today')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return null;

  const { challenges, streak } = data;
  const completed = challenges.filter(c => c.status === 'completed').length;
  const total = challenges.length;

  const typeIcons = {
    attend_session: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    new_recitation: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    review_recitation: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    get_good_score: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  const statusColors = {
    active: 'border-blue-200 dark:border-blue-800',
    completed: 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10',
    expired: 'border-gray-200 dark:border-gray-700 opacity-50',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <HeroSection
        title="التحديات اليومية"
        subtitle="أكمل التحديات واكسب نقاط إضافية"
        icon={
          <svg className="w-14 h-14 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      {/* Streak & Progress */}
      <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">سلسلة التحديات</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {streak} <span className="text-base">يوم</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">تقدم اليوم</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {completed}/{total}
          </p>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-full rounded-full transition-all"
              style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Challenge Cards */}
      <div className="space-y-4 animate-fade-in-up">
        {challenges.map(challenge => (
          <div key={challenge.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 ${statusColors[challenge.status]} p-5 transition card-hover`}>
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl ${
                challenge.status === 'completed'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {typeIcons[challenge.challengeType]}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{challenge.description}</h3>
                  <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                    +{challenge.bonusPoints} نقطة
                  </span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        challenge.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(challenge.currentValue / challenge.targetValue) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {challenge.currentValue}/{challenge.targetValue}
                  </span>
                </div>

                {challenge.status === 'completed' && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">
                    تم الإكمال
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
