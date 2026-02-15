import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="gradient-hero rounded-t-2xl p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">حلقة</h1>
          <p className="text-green-200 text-sm">منصة إدارة حلقات القرآن الكريم</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="example@email.com"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="••••••"
                dir="ltr"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-lg font-medium btn-glow disabled:opacity-50 transition"
            >
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
