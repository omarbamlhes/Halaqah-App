import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/parent/children'),
      api.get('/dashboard'),
    ]).then(([childRes, dashRes]) => {
      setChildren(childRes.data);
      setDashData(dashRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadChildren = async () => {
    try {
      const [childRes, dashRes] = await Promise.all([
        api.get('/parent/children'),
        api.get('/dashboard'),
      ]);
      setChildren(childRes.data);
      setDashData(dashRes.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setAdding(true);
    try {
      const { data } = await api.post('/parent/children', { email });
      setSuccess(`تم ربط الطالب "${data.student.name}" بنجاح`);
      setEmail('');
      loadChildren();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (studentId, name) => {
    if (!window.confirm(`هل تريد إلغاء ربط "${name}"؟`)) return;
    try {
      await api.delete(`/parent/children/${studentId}`);
      loadChildren();
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) return <LoadingSpinner />;

  const childStats = dashData?.children || [];
  const statsMap = {};
  childStats.forEach(c => { statsMap[c.id] = c; });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title={`مرحبا، ${user.name}`}
        subtitle="لوحة تحكم ولي الأمر - متابعة تقدم أبنائك"
        verse="رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ"
      />

      {/* Add child form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">ربط طالب جديد</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            placeholder="البريد الإلكتروني للطالب"
            dir="ltr"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="gradient-primary text-white px-6 py-3 rounded-lg font-medium btn-glow disabled:opacity-50"
          >
            {adding ? 'جاري الربط...' : 'ربط'}
          </button>
        </form>
        {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2 animate-fade-in">{error}</p>}
        {success && <p className="text-green-600 dark:text-green-400 text-sm mt-2 animate-fade-in">{success}</p>}
      </div>

      {/* Children with stats */}
      <div className="animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">أبنائي ({children.length})</h2>
        <div className="space-y-4">
          {children.map((child) => {
            const s = statsMap[child.id];
            return (
              <div key={child.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 card-hover">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{child.name}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500" dir="ltr">{child.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/parent/child/${child.id}`}
                      className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition"
                    >
                      عرض التقدم
                    </Link>
                    <button
                      onClick={() => handleRemove(child.id, child.name)}
                      className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>

                {s && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{s.memorizedSurahs}</p>
                      <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-0.5">سور محفوظة</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{s.attendanceRate}%</p>
                      <p className="text-[10px] text-green-500 dark:text-green-400 mt-0.5">الحضور</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{s.averageScore || 0}</p>
                      <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-0.5">المعدل</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{s.totalRecitations}</p>
                      <p className="text-[10px] text-yellow-500 dark:text-yellow-400 mt-0.5">تسميعات</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {children.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-400 dark:text-gray-500">لم تربط أي طالب بعد</p>
              <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">أدخل بريد الطالب الإلكتروني لربطه</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
