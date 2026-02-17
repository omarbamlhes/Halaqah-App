import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HalaqahListPage() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [publicHalaqahs, setPublicHalaqahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('my');
  const { user } = useAuth();

  useEffect(() => {
    loadHalaqahs();
  }, []);

  const loadHalaqahs = async () => {
    try {
      const [myRes, publicRes] = await Promise.all([
        api.get('/halaqahs'),
        api.get('/halaqahs/public'),
      ]);
      setHalaqahs(myRes.data);
      setPublicHalaqahs(publicRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id) => {
    try {
      await api.post(`/halaqahs/${id}/join`);
      loadHalaqahs();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const myIds = halaqahs.map(h => h.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">الحلقات</h1>
        {user.role === 'teacher' && (
          <Link
            to="/halaqahs/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            إنشاء حلقة جديدة
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('my')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            tab === 'my' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          حلقاتي ({halaqahs.length})
        </button>
        {user.role === 'student' && (
          <button
            onClick={() => setTab('public')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              tab === 'public' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            جميع الحلقات ({publicHalaqahs.length})
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(tab === 'my' ? halaqahs : publicHalaqahs).map((h) => (
          <div key={h.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 card-animated card-hover">
            <Link to={`/halaqahs/${h.id}`}>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">{h.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{h.description || 'بدون وصف'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">المعلم: {h.teacher?.name}</p>
            </Link>
            {tab === 'public' && user.role === 'student' && !myIds.includes(h.id) && (
              <button
                onClick={() => handleJoin(h.id)}
                className="mt-3 w-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 py-2 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition"
              >
                انضمام
              </button>
            )}
          </div>
        ))}
        {(tab === 'my' ? halaqahs : publicHalaqahs).length === 0 && (
          <p className="text-gray-400 dark:text-gray-500 col-span-full text-center py-8">
            {tab === 'my' ? 'لا توجد حلقات بعد' : 'لا توجد حلقات متاحة'}
          </p>
        )}
      </div>
    </div>
  );
}
