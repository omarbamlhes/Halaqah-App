import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SessionsPage() {
  const { halaqahId } = useParams();
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadSessions(); }, [halaqahId]);

  const loadSessions = async () => {
    try {
      const { data } = await api.get(`/sessions?halaqahId=${halaqahId}`);
      setSessions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sessions', { halaqahId: parseInt(halaqahId), scheduledAt: date, notes });
      setShowForm(false);
      setDate('');
      setNotes('');
      loadSessions();
    } catch (err) { alert(err.response?.data?.message || 'حدث خطأ'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/sessions/${id}`, { status });
      loadSessions();
    } catch (err) { alert('حدث خطأ'); }
  };

  const statusLabels = { scheduled: 'مجدولة', in_progress: 'جارية', completed: 'مكتملة', cancelled: 'ملغاة' };
  const statusColors = { scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', in_progress: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300', completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' };

  const filteredSessions = statusFilter === 'all' ? sessions : sessions.filter(s => s.status === statusFilter);
  const filterOptions = [
    { key: 'all', label: 'الكل' },
    { key: 'scheduled', label: 'مجدولة' },
    { key: 'in_progress', label: 'جارية' },
    { key: 'completed', label: 'مكتملة' },
    { key: 'cancelled', label: 'ملغاة' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">جلسات الحلقة</h1>
        {user.role === 'teacher' && (
          <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
            {showForm ? 'إلغاء' : 'جلسة جديدة'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">التاريخ والوقت</label>
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" dir="ltr" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">ملاحظات</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="ملاحظات اختيارية" />
          </div>
          <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition">إنشاء الجلسة</button>
        </form>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {filterOptions.map((opt) => {
          const count = opt.key === 'all' ? sessions.length : sessions.filter(s => s.status === opt.key).length;
          return (
            <button
              key={opt.key}
              onClick={() => setStatusFilter(opt.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                statusFilter === opt.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredSessions.map((s) => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 flex justify-between items-center card-animated">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{new Date(s.scheduledAt).toLocaleString('ar')}</p>
              {s.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.notes}</p>}
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${statusColors[s.status]}`}>{statusLabels[s.status]}</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/sessions/${s.id}`} className="text-primary-600 dark:text-primary-400 text-sm hover:underline">التفاصيل</Link>
              {user.role === 'teacher' && s.status === 'scheduled' && (
                <button onClick={() => handleStatusChange(s.id, 'in_progress')} className="text-yellow-600 dark:text-yellow-400 text-sm hover:underline">بدء</button>
              )}
              {user.role === 'teacher' && s.status === 'in_progress' && (
                <button onClick={() => handleStatusChange(s.id, 'completed')} className="text-green-600 dark:text-green-400 text-sm hover:underline">إنهاء</button>
              )}
            </div>
          </div>
        ))}
        {filteredSessions.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-center py-8">{statusFilter === 'all' ? 'لا توجد جلسات بعد' : 'لا توجد جلسات بهذه الحالة'}</p>}
      </div>
    </div>
  );
}
