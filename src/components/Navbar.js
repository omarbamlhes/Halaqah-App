import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
      navLinks.push({ to: '/teacher/students', label: 'الطلاب' });
    }
    if (user.role === 'student') {
      navLinks.push({ to: '/progress', label: 'تقدم الحفظ' });
    }
  }
  navLinks.push({ to: '/profile', label: 'حسابي' });

  return (
    <nav className="bg-white shadow-sm border-b-2 border-transparent" style={{ borderImage: 'linear-gradient(to left, #14532d, #22c55e, #14532d) 1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center"><Logo size={32} withText /></Link>
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
            <span className="hidden sm:inline text-sm text-gray-500">
              {user.name} <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full mr-1">{roleLabel[user.role]}</span>
            </span>
            <button
              onClick={handleLogout}
              className="hidden sm:inline text-sm text-red-500 hover:text-red-700 transition"
            >
              خروج
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t bg-white animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-3 mt-2">
              <p className="px-3 text-sm text-gray-500 mb-2">
                {user.name} <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full mr-1">{roleLabel[user.role]}</span>
              </p>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block w-full text-right px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
