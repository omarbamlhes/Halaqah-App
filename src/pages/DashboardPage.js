import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { user } = useAuth();
  const [halaqahs, setHalaqahs] = useState([]);
  const [stats, setStats] = useState({ totalStudents: 0, totalSessions: 0, totalRecitations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  if (user.role === 'parent') return <Navigate to="/parent" />;

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
        } catch (e) {}
      }

      setStats({ totalStudents, totalSessions, totalRecitations });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { value: halaqahs.length, label: 'حلقاتي', gradient: 'gradient-card-green', color: 'text-primary-600' },
  ];

  if (user.role === 'teacher') {
    statCards.push({ value: stats.totalStudents, label: 'الطلاب', gradient: 'gradient-card-blue', color: 'text-blue-600' });
  }
  statCards.push({ value: stats.totalSessions, label: 'الجلسات', gradient: 'gradient-card-gold', color: 'text-yellow-600' });
  if (user.role === 'student') {
    statCards.push({ value: stats.totalRecitations, label: 'تسميعاتي', gradient: 'gradient-card-purple', color: 'text-purple-600' });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">مرحبا، {user.name}</h1>
        <p className="text-green-200 text-sm">
          {user.role === 'teacher' ? 'لوحة تحكم المعلم' : 'لوحة تحكم الطالب'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.gradient} rounded-xl shadow-sm border p-5 text-center card-animated card-hover`}>
            <p className={`text-3xl font-bold ${card.color} animate-count-up`}>{card.value}</p>
            <p className="text-sm text-gray-600 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {user.role === 'teacher' && (
        <div className="flex gap-3 mb-8 animate-fade-in">
          <Link to="/halaqahs/new" className="gradient-primary text-white px-5 py-2.5 rounded-lg font-medium btn-glow text-sm">
            إنشاء حلقة جديدة
          </Link>
          <Link to="/halaqahs" className="bg-white border-2 border-primary-200 text-primary-700 px-5 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition text-sm">
            إدارة الحلقات
          </Link>
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-800 mb-4">حلقاتي</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {halaqahs.map((h) => (
          <div key={h.id} className="bg-white rounded-xl shadow-sm border p-5 card-animated card-hover">
            <h3 className="font-bold text-gray-800 mb-2">{h.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{h.description || 'بدون وصف'}</p>
            <div className="flex gap-2">
              <Link to={`/halaqahs/${h.id}`} className="text-sm bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition">التفاصيل</Link>
              <Link to={`/halaqahs/${h.id}/chat`} className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">المحادثة</Link>
              {user.role === 'teacher' && (
                <Link to={`/halaqahs/${h.id}/sessions`} className="text-sm bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition">الجلسات</Link>
              )}
            </div>
          </div>
        ))}
        {halaqahs.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">لا توجد حلقات بعد</p>}
      </div>
    </div>
  );
}
