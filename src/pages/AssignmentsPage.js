import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { HeroSection } from '../components/IslamicDecor';
import quranData from '../data/quran-metadata.json';

const getSurahName = (num) => quranData.find(s => s.number === num)?.name || '';
const getSurahAyahs = (num) => quranData.find(s => s.number === num)?.ayahs || 0;

export default function AssignmentsPage() {
  const { user } = useAuth();
  return user.role === 'teacher' ? <TeacherView /> : <StudentView />;
}

// ─── Student View ───
function StudentView() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    api.get('/reviews/my')
      .then(res => setAssignments(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    try {
      await api.patch(`/reviews/${id}/complete`);
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const filtered = assignments.filter(a =>
    tab === 'pending' ? a.status === 'pending' : a.status === 'completed'
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title="واجباتي"
        subtitle="متابعة واجبات الحفظ والمراجعة"
        icon={<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        verse="وَقُلْ رَبِّ زِدْنِي عِلْمًا"
      />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'pending'
              ? 'gradient-primary text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'
          }`}
        >
          معلقة ({assignments.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setTab('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'completed'
              ? 'gradient-primary text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700'
          }`}
        >
          مكتملة ({assignments.filter(a => a.status === 'completed').length})
        </button>
      </div>

      {/* Assignment Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">
            {tab === 'pending' ? 'لا توجد واجبات معلقة' : 'لا توجد واجبات مكتملة'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(a => {
            const isOverdue = a.status === 'pending' && a.dueDate < today;
            return (
              <div
                key={a.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-5 card-hover animate-fade-in-up ${
                  isOverdue ? 'border-red-300 dark:border-red-700' : 'dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">
                        {getSurahName(a.surahNumber)}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        a.type === 'new'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      }`}>
                        {a.type === 'new' ? 'حفظ' : 'مراجعة'}
                      </span>
                      {isOverdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                          متأخر
                        </span>
                      )}
                      {a.status === 'completed' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      الآيات: {a.fromAyah} - {a.toAyah}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      الموعد: {new Date(a.dueDate).toLocaleDateString('ar')}
                    </p>
                    {a.halaqah && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {a.halaqah.name}
                      </p>
                    )}
                    {a.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        {a.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-stretch">
                    <Link
                      to={`/mushaf?surah=${a.surahNumber}&from=${a.fromAyah}&to=${a.toAyah}`}
                      className="flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition whitespace-nowrap"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7.975 7.975 0 015.657 2.343m0 0a7.975 7.975 0 010 11.314M9 10v4a1 1 0 001 1h1l3 3V6l-3 3H10a1 1 0 00-1 1z" /></svg>
                      استمع للواجب
                    </Link>
                    {a.status === 'pending' && (
                      <button
                        onClick={() => handleComplete(a.id)}
                        className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium btn-glow whitespace-nowrap"
                      >
                        أتممت
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Teacher View ───
function TeacherView() {
  const [halaqahs, setHalaqahs] = useState([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    studentId: '', surahNumber: '', fromAyah: 1, toAyah: 1, dueDate: '', type: 'review', notes: '', allStudents: false,
  });

  // Load halaqahs
  useEffect(() => {
    api.get('/halaqahs')
      .then(res => {
        setHalaqahs(res.data);
        if (res.data.length > 0) setSelectedHalaqah(res.data[0].id.toString());
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load assignments + students when halaqah changes
  useEffect(() => {
    if (!selectedHalaqah) return;
    setLoading(true);
    Promise.all([
      api.get(`/reviews/halaqah/${selectedHalaqah}`),
      api.get(`/halaqahs/${selectedHalaqah}`),
    ])
      .then(([reviewsRes, halaqahRes]) => {
        setAssignments(reviewsRes.data);
        setStudents(halaqahRes.data.students || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedHalaqah]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (form.allStudents && students.length > 0) {
        const assignmentsList = students.map(s => ({
          studentId: s.id,
          halaqahId: parseInt(selectedHalaqah),
          surahNumber: parseInt(form.surahNumber),
          fromAyah: parseInt(form.fromAyah),
          toAyah: parseInt(form.toAyah),
          dueDate: form.dueDate,
          type: form.type,
          notes: form.notes || undefined,
        }));
        const res = await api.post('/reviews/bulk', { assignments: assignmentsList });
        setAssignments(prev => [...res.data, ...prev]);
      } else {
        const res = await api.post('/reviews', {
          studentId: parseInt(form.studentId),
          halaqahId: parseInt(selectedHalaqah),
          surahNumber: parseInt(form.surahNumber),
          fromAyah: parseInt(form.fromAyah),
          toAyah: parseInt(form.toAyah),
          dueDate: form.dueDate,
          type: form.type,
          notes: form.notes || undefined,
        });
        setAssignments(prev => [{ ...res.data, student: students.find(s => s.id === parseInt(form.studentId)) }, ...prev]);
      }
      setForm({ studentId: '', surahNumber: '', fromAyah: 1, toAyah: 1, dueDate: '', type: 'review', notes: '', allStudents: false });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      setAssignments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const completedCount = assignments.filter(a => a.status === 'completed').length;
  const pendingCount = assignments.filter(a => a.status === 'pending' && a.dueDate >= today).length;
  const overdueCount = assignments.filter(a => a.status === 'pending' && a.dueDate < today).length;

  const maxAyahs = form.surahNumber ? getSurahAyahs(parseInt(form.surahNumber)) : 1;

  if (loading && halaqahs.length === 0) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <HeroSection
        title="إدارة الواجبات"
        subtitle="تكليف الطلاب بالحفظ والمراجعة ومتابعة إنجازهم"
        icon={<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
        verse="عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ"
      />

      {/* Halaqah Filter */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={selectedHalaqah}
          onChange={e => setSelectedHalaqah(e.target.value)}
          className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-800 dark:text-gray-200"
        >
          {halaqahs.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary text-white px-4 py-2 rounded-lg text-sm font-medium btn-glow"
        >
          {showForm ? 'إلغاء' : 'تكليف جديد'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">مكتمل</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pendingCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">معلق</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">متأخر</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 mb-6 animate-fade-in-up">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">تكليف جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* All students toggle */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={form.allStudents}
                  onChange={e => setForm({ ...form, allStudents: e.target.checked, studentId: '' })}
                  className="rounded"
                />
                تكليف جميع الطلاب
              </label>
            </div>

            {/* Student select */}
            {!form.allStudents && (
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الطالب</label>
                <select
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                  required
                >
                  <option value="">اختر طالب</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Surah */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">السورة</label>
              <select
                value={form.surahNumber}
                onChange={e => setForm({ ...form, surahNumber: e.target.value, fromAyah: 1, toAyah: getSurahAyahs(parseInt(e.target.value)) || 1 })}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                required
              >
                <option value="">اختر سورة</option>
                {quranData.map(s => (
                  <option key={s.number} value={s.number}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* From Ayah */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">من آية</label>
              <input
                type="number"
                min="1"
                max={maxAyahs}
                value={form.fromAyah}
                onChange={e => setForm({ ...form, fromAyah: parseInt(e.target.value) || 1 })}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* To Ayah */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">إلى آية</label>
              <input
                type="number"
                min="1"
                max={maxAyahs}
                value={form.toAyah}
                onChange={e => setForm({ ...form, toAyah: parseInt(e.target.value) || 1 })}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">النوع</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="review">مراجعة</option>
                <option value="new">حفظ جديد</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">الموعد النهائي</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
              <textarea
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                placeholder="ملاحظات للطالب..."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="submit" className="gradient-primary text-white px-6 py-2 rounded-lg text-sm font-medium btn-glow">
              {form.allStudents ? `تكليف الجميع (${students.length})` : 'إنشاء تكليف'}
            </button>
          </div>
        </form>
      )}

      {/* Assignments Table */}
      {loading ? (
        <LoadingSpinner />
      ) : assignments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-8 text-center">
          <p className="text-gray-400 dark:text-gray-500">لا توجد واجبات في هذه الحلقة</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden animate-fade-in-up">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الطالب</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">السورة</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الآيات</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">النوع</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الموعد</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-300 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {assignments.map(a => {
                  const isOverdue = a.status === 'pending' && a.dueDate < today;
                  return (
                    <tr key={a.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition ${isOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{a.student?.name || '-'}</td>
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{getSurahName(a.surahNumber)}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{a.fromAyah}-{a.toAyah}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          a.type === 'new'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                          {a.type === 'new' ? 'حفظ' : 'مراجعة'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {new Date(a.dueDate).toLocaleDateString('ar')}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'completed' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">مكتمل</span>
                        ) : isOverdue ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">متأخر</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">معلق</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.status === 'pending' && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition text-xs"
                          >
                            حذف
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
