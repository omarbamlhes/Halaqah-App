import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSocket } from '../contexts/SocketContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, cycleTheme, isDark } = useTheme();
  const { unreadCount } = useSocket() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // ─── Guest Navbar (Landing/Login/Register) ───
  if (!user) {
    const isLanding = location.pathname === '/';
    return (
      <nav className={isLanding
        ? 'absolute top-0 left-0 right-0 z-50 bg-transparent'
        : 'bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors'
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center"><Logo size={32} dark={isLanding} withText /></Link>
            <div className="flex items-center gap-3">
              <button
                onClick={cycleTheme}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition ${
                  isLanding
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={`التبديل إلى الوضع ${theme === 'light' ? 'داكن' : theme === 'dark' ? 'تلقائي' : 'فاتح'}`}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
                {theme === 'system' && <span className="text-[10px]">تلقائي</span>}
              </button>
              <Link to="/login" className={`text-sm font-medium transition ${
                isLanding ? 'text-white/80 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
              }`}>
                دخول
              </Link>
              <Link to="/register" className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isLanding
                  ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                  : 'gradient-primary text-white btn-glow'
              }`}>
                حساب جديد
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const roleLabel = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر' };

  const themeLabel = theme === 'light' ? 'داكن' : theme === 'dark' ? 'تلقائي' : 'فاتح';

  const navLinks = [];
  navLinks.push({ to: '/', label: 'الرئيسية' });
  navLinks.push({ to: '/mushaf', label: 'المصحف' });

  if (user.role === 'parent') {
    navLinks.push({ to: '/parent', label: 'أبنائي' });
  } else {
    navLinks.push({ to: '/halaqahs', label: 'الحلقات' });
    if (user.role === 'teacher') {
      navLinks.push({ to: '/halaqahs/new', label: 'إنشاء حلقة' });
      navLinks.push({ to: '/teacher/students', label: 'الطلاب' });
    }
    navLinks.push({ to: '/assignments', label: 'الواجبات' });
    navLinks.push({ to: '/leaderboard', label: 'المتصدرين' });
    navLinks.push({ to: '/rewards', label: 'المكافآت' });
    if (user.role === 'student') {
      navLinks.push({ to: '/progress', label: 'تقدم الحفظ' });
      navLinks.push({ to: '/challenges', label: 'التحديات' });
    }
  }
  navLinks.push({ to: '/profile', label: 'حسابي' });

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b-2 border-transparent transition-colors" style={{ borderImage: 'linear-gradient(to left, #14532d, #22c55e, #14532d) 1' }}>
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
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/notifications"
              className="hidden sm:flex relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title="الإشعارات"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={cycleTheme}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              title={`التبديل إلى الوضع ${themeLabel}`}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              {theme === 'system' && <span className="text-[10px]">تلقائي</span>}
            </button>
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              {user.name} <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full mr-1">{roleLabel[user.role]}</span>
            </span>
            <button
              onClick={handleLogout}
              className="hidden sm:inline text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
            >
              خروج
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
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
        <div className="sm:hidden border-t dark:border-gray-700 bg-white dark:bg-gray-800 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/notifications"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              الإشعارات
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-auto">
                  {unreadCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => { cycleTheme(); }}
              className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
              الوضع {themeLabel}
            </button>
            <div className="border-t dark:border-gray-700 pt-3 mt-2">
              <p className="px-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
                {user.name} <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full mr-1">{roleLabel[user.role]}</span>
              </p>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="block w-full text-right px-3 py-2.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
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
