import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function CreateHalaqahPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/halaqahs', { name, description });
      navigate('/halaqahs');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إنشاء حلقة جديدة</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الحلقة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="مثال: حلقة الفجر"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="وصف مختصر للحلقة"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحلقة'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/halaqahs')}
              className="bg-gray-200 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
