import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', label: 'طالب', desc: 'حفظ ومراجعة القرآن' },
    { value: 'teacher', label: 'معلم', desc: 'إدارة الحلقات والتقييم' },
    { value: 'parent', label: 'ولي أمر', desc: 'متابعة تقدم الأبناء' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="gradient-hero rounded-t-2xl p-8 text-center flex flex-col items-center">
          <Logo size={64} dark />
          <h1 className="text-3xl font-bold text-white mt-3 mb-1" style={{ fontFamily: 'Amiri, serif' }}>حلقة</h1>
          <p className="text-green-200 text-sm">انضم إلينا في رحلة حفظ القرآن</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">إنشاء حساب جديد</h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">الاسم</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="الاسم الكامل"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="example@email.com"
                dir="ltr"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="6 أحرف على الأقل"
                dir="ltr"
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">نوع الحساب</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`py-3 px-2 rounded-lg border-2 font-medium transition text-sm ${
                      role === r.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <span className="block">{r.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-70">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-3 rounded-lg font-medium btn-glow disabled:opacity-50 transition"
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
