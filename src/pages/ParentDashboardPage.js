import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ParentDashboardPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadChildren(); }, []);

  const loadChildren = async () => {
    try {
      const { data } = await api.get('/parent/children');
      setChildren(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">مرحبا، {user.name}</h1>
        <p className="text-green-200 text-sm">لوحة تحكم ولي الأمر - متابعة تقدم أبنائك</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 mb-4">ربط طالب جديد</h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
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
        {error && <p className="text-red-500 text-sm mt-2 animate-fade-in">{error}</p>}
        {success && <p className="text-green-600 text-sm mt-2 animate-fade-in">{success}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 mb-4">أبنائي ({children.length})</h2>
        <div className="space-y-3">
          {children.map((child) => (
            <div key={child.id} className="flex justify-between items-center border rounded-xl p-4 card-hover">
              <div>
                <p className="font-bold text-gray-800">{child.name}</p>
                <p className="text-sm text-gray-400" dir="ltr">{child.email}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/parent/child/${child.id}`}
                  className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition"
                >
                  عرض التقدم
                </Link>
                <button
                  onClick={() => handleRemove(child.id, child.name)}
                  className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm hover:bg-red-100 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ))}
          {children.length === 0 && (
            <p className="text-gray-400 text-center py-8">لم تربط أي طالب بعد. أدخل بريد الطالب الإلكتروني لربطه.</p>
          )}
        </div>
      </div>
    </div>
  );
}
