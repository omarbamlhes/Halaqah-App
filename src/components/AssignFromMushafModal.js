import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toArabicNumber } from '../services/quranApi';

// نافذة إنشاء واجب من نطاق آيات محدد في المصحف (للمعلم)
export default function AssignFromMushafModal({ surahNumber, surahName, fromAyah, toAyah, onClose, onCreated }) {
  const [halaqahs, setHalaqahs] = useState([]);
  const [selectedHalaqah, setSelectedHalaqah] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingHalaqahs, setLoadingHalaqahs] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ studentId: '', dueDate: '', type: 'review', notes: '', allStudents: false });

  // تحميل حلقات المعلم
  useEffect(() => {
    api.get('/halaqahs')
      .then((res) => setHalaqahs(res.data))
      .catch(() => setError('تعذّر تحميل الحلقات'))
      .finally(() => setLoadingHalaqahs(false));
  }, []);

  // تحميل طلاب الحلقة المختارة
  useEffect(() => {
    if (!selectedHalaqah) { setStudents([]); return; }
    setLoadingStudents(true);
    api.get(`/halaqahs/${selectedHalaqah}`)
      .then((res) => setStudents(res.data.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  }, [selectedHalaqah]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedHalaqah) return setError('اختر الحلقة');
    if (!form.allStudents && !form.studentId) return setError('اختر الطالب أو فعّل «كل الطلاب»');
    if (!form.dueDate) return setError('حدد موعد التسليم');

    setSubmitting(true);
    try {
      const base = {
        halaqahId: parseInt(selectedHalaqah, 10),
        surahNumber,
        fromAyah,
        toAyah,
        dueDate: form.dueDate,
        type: form.type,
        notes: form.notes || undefined,
      };

      if (form.allStudents) {
        const assignments = students.map((s) => ({ ...base, studentId: s.id }));
        await api.post('/reviews/bulk', { assignments });
        setSuccess(`تم إنشاء الواجب لـ ${toArabicNumber(students.length)} طالب`);
      } else {
        await api.post('/reviews', { ...base, studentId: parseInt(form.studentId, 10) });
        setSuccess('تم إنشاء الواجب بنجاح');
      }
      setTimeout(() => onCreated(), 900);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الواجب');
    } finally {
      setSubmitting(false);
    }
  };

  const rangeText = toAyah !== fromAyah
    ? `من الآية ${toArabicNumber(fromAyah)} إلى ${toArabicNumber(toAyah)}`
    : `الآية ${toArabicNumber(fromAyah)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">إنشاء واجب</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* ملخص النطاق */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2 text-sm text-emerald-800 dark:text-emerald-200">
            سورة {surahName} — {rangeText}
          </div>

          {/* الحلقة */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">الحلقة</label>
            <select
              value={selectedHalaqah}
              onChange={(e) => { setSelectedHalaqah(e.target.value); setForm((f) => ({ ...f, studentId: '', allStudents: false })); }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
              disabled={loadingHalaqahs}
            >
              <option value="">{loadingHalaqahs ? 'جاري التحميل...' : 'اختر الحلقة'}</option>
              {halaqahs.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* الطالب */}
          {selectedHalaqah && (
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                <input
                  type="checkbox"
                  checked={form.allStudents}
                  onChange={(e) => setForm((f) => ({ ...f, allStudents: e.target.checked, studentId: '' }))}
                  className="rounded"
                />
                إسناد لكل طلاب الحلقة ({toArabicNumber(students.length)})
              </label>
              {!form.allStudents && (
                <select
                  value={form.studentId}
                  onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
                  disabled={loadingStudents}
                >
                  <option value="">{loadingStudents ? 'جاري التحميل...' : 'اختر الطالب'}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* النوع + الموعد */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">النوع</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
              >
                <option value="review">مراجعة</option>
                <option value="new">حفظ جديد</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">موعد التسليم</label>
              <input
                type="date"
                min={today}
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">ملاحظات (اختياري)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm resize-none"
              placeholder="مثال: مع مراعاة أحكام التجويد"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">{success}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {submitting ? 'جاري الإنشاء...' : 'إنشاء الواجب'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
