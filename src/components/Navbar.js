import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const roleLabel = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر' };

  const navLinks = [];
  navLinks.push({ to: '/', label: 'الرئيسية' });

  if (user.role === 'parent') {
    navLinks.push({ to: '/parent', label: 'أبنائي' });
  } else {
    navLinks.push({ to: '/halaqahs', label: 'الحلقات' });
    if (user.role === 'teacher') {
      navLinks.push({ to: '/halaqahs/new', label: 'إنشاء حلقة' });
    }
    if (user.role === 'student') {
      navLinks.push({ to: '/progress', label: 'تقدم الحفظ' });
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b-2 border-transparent" style={{ borderImage: 'linear-gradient(to left, #14532d, #22c55e, #14532d) 1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-primary-700">حلقة</Link>
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user.name} <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full mr-1">{roleLabel[user.role]}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700 transition"
            >
              خروج
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
