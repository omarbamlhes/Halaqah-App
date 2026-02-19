import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HeroSection } from '../components/IslamicDecor';
import api from '../api/axios';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameMsg, setNameMsg] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [nameErr, setNameErr] = useState('');
  const [passErr, setPassErr] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const roleLabel = { teacher: 'معلم', student: 'طالب', parent: 'ولي أمر' };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameMsg('');
    setNameErr('');
    setSavingName(true);
    try {
      const { data } = await api.patch('/auth/profile', { name });
      setNameMsg('تم تحديث الاسم بنجاح');
      const saved = JSON.parse(localStorage.getItem('user'));
      saved.name = data.name;
      localStorage.setItem('user', JSON.stringify(saved));
      window.location.reload();
    } catch (err) {
      setNameErr(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    if (newPassword.length < 6) { setPassErr('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    setSavingPass(true);
    try {
      await api.patch('/auth/password', { currentPassword, newPassword });
      setPassMsg('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassErr(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <HeroSection
        title="حسابي"
        subtitle={`${user.email} - ${roleLabel[user.role]}`}
        verse="رَبِّ زِدْنِي عِلْمًا"
      />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">تعديل الاسم</h2>
        <form onSubmit={handleUpdateName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              required
            />
          </div>
          {nameErr && <p className="text-red-500 dark:text-red-400 text-sm">{nameErr}</p>}
          {nameMsg && <p className="text-green-600 dark:text-green-400 text-sm">{nameMsg}</p>}
          <button type="submit" disabled={savingName} className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium btn-glow disabled:opacity-50">
            {savingName ? 'جاري الحفظ...' : 'حفظ'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 animate-fade-in-up">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">تغيير كلمة المرور</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              dir="ltr"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              placeholder="6 أحرف على الأقل"
              dir="ltr"
              minLength={6}
              required
            />
          </div>
          {passErr && <p className="text-red-500 dark:text-red-400 text-sm">{passErr}</p>}
          {passMsg && <p className="text-green-600 dark:text-green-400 text-sm">{passMsg}</p>}
          <button type="submit" disabled={savingPass} className="gradient-primary text-white px-6 py-2.5 rounded-lg font-medium btn-glow disabled:opacity-50">
            {savingPass ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}
