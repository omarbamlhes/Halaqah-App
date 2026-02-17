import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function HalaqahDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [halaqah, setHalaqah] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHalaqah();
  }, [id]);

  const loadHalaqah = async () => {
    try {
      const { data } = await api.get(`/halaqahs/${id}`);
      setHalaqah(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return;
    try {
      await api.delete(`/halaqahs/${id}`);
      navigate('/halaqahs');
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleLeave = async () => {
    try {
      await api.delete(`/halaqahs/${id}/leave`);
      navigate('/halaqahs');
    } catch (err) {
      alert(err.response?.data?.message || 'حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">جاري التحميل...</p>
      </div>
    );
  }

  if (!halaqah) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-500 dark:text-red-400">الحلقة غير موجودة</p>
      </div>
    );
  }

  const isTeacher = user.role === 'teacher' && halaqah.teacherId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{halaqah.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{halaqah.description || 'بدون وصف'}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">المعلم: {halaqah.teacher?.name}</p>
          </div>
          <div className="flex gap-2">
            {isTeacher && (
              <>
                <Link
                  to={`/halaqahs/${id}/sessions`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-700 transition"
                >
                  الجلسات
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                >
                  حذف
                </button>
              </>
            )}
            {user.role === 'student' && (
              <button
                onClick={handleLeave}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition"
              >
                مغادرة
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
          الطلاب ({halaqah.students?.length || 0})
        </h2>
        {halaqah.students?.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {halaqah.students.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{s.name}</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">{s.email}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  انضم {new Date(s.joinedAt).toLocaleDateString('ar')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-4">لا يوجد طلاب بعد</p>
        )}
      </div>
    </div>
  );
}
