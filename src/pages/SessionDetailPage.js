import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';
import LoadingSpinner from '../components/LoadingSpinner';

const attendanceLabels = {
  present: 'حاضر',
  absent: 'غائب',
  late: 'متأخر',
  excused: 'معذور',
};

const attendanceColors = {
  present: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  absent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  late: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  excused: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
};

const attendanceButtonColors = {
  present: { active: 'bg-green-600 text-white', inactive: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40' },
  absent: { active: 'bg-red-600 text-white', inactive: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40' },
  late: { active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40' },
  excused: { active: 'bg-blue-600 text-white', inactive: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40' },
};

export default function SessionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [session, setSession] = useState(null);
  const [recitations, setRecitations] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', surahNumber: '', fromAyah: '1', toAyah: '', type: 'new' });
  const [evalForm, setEvalForm] = useState({ recitationId: null, hifdh: 7, tajweed: 7, fluency: 7, notes: '' });

  const [attendance, setAttendance] = useState([]);
  const [attendanceEdit, setAttendanceEdit] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  const load = async () => {
    try {
      const [sessionRes, recRes] = await Promise.all([
        api.get(`/sessions/${id}`),
        api.get(`/recitations/session/${id}`),
      ]);
      setSession(sessionRes.data);
      setRecitations(recRes.data);

      if (sessionRes.data.halaqah?.id) {
        try {
          const [halaqahRes, attRes] = await Promise.all([
            api.get(`/halaqahs/${sessionRes.data.halaqah.id}`),
            api.get(`/sessions/${id}/attendance`),
          ]);
          setStudents(halaqahRes.data.students || []);
          setAttendance(attRes.data);
        } catch (e) {}
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddRecitation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recitations', { ...form, studentId: parseInt(form.studentId), sessionId: parseInt(id), surahNumber: parseInt(form.surahNumber), fromAyah: parseInt(form.fromAyah), toAyah: parseInt(form.toAyah) });
      setShowForm(false);
      setForm({ studentId: '', surahNumber: '', fromAyah: '1', toAyah: '', type: 'new' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'حدث خطأ'); }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recitations/evaluate', evalForm);
      setEvalForm({ recitationId: null, hifdh: 7, tajweed: 7, fluency: 7, notes: '' });
      load();
    } catch (err) { alert(err.response?.data?.message || 'حدث خطأ'); }
  };

  const getSurahName = (num) => quranData.find(s => s.number === num)?.name || '';

  const scoreColor = (score) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
  };

  const startAttendanceEdit = () => {
    const formData = {};
    students.forEach(s => {
      const existing = attendance.find(a => a.studentId === s.id);
      formData[s.id] = {
        status: existing?.status || 'present',
        notes: existing?.notes || '',
      };
    });
    setAttendanceForm(formData);
    setAttendanceEdit(true);
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceForm).map(([studentId, data]) => ({
        studentId: parseInt(studentId),
        status: data.status,
        notes: data.notes || undefined,
      }));
      const res = await api.post(`/sessions/${id}/attendance`, { records });
      setAttendance(res.data);
      setAttendanceEdit(false);
    } catch (err) { alert(err.response?.data?.message || 'حدث خطأ'); }
    finally { setSavingAttendance(false); }
  };

  const presentCount = attendance.filter(a => a.status === 'present' || a.status === 'late').length;

  if (loading) return <LoadingSpinner />;
  if (!session) return <div className="max-w-4xl mx-auto px-4 py-8"><p className="text-red-500 dark:text-red-400">الجلسة غير موجودة</p></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">تفاصيل الجلسة</h1>
        <p className="text-gray-500 dark:text-gray-400">{new Date(session.scheduledAt).toLocaleString('ar')}</p>
        {session.notes && <p className="text-gray-400 dark:text-gray-500 mt-1">{session.notes}</p>}
      </div>

      {/* قسم الحضور */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            الحضور {attendance.length > 0 && `(${presentCount}/${students.length})`}
          </h2>
          {user.role === 'teacher' && (
            <button
              onClick={attendanceEdit ? () => setAttendanceEdit(false) : startAttendanceEdit}
              className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 transition"
            >
              {attendanceEdit ? 'إلغاء' : attendance.length > 0 ? 'تعديل الحضور' : 'تسجيل الحضور'}
            </button>
          )}
        </div>

        {attendanceEdit ? (
          <div className="space-y-3">
            {students.map(s => (
              <div key={s.id} className="border dark:border-gray-700 rounded-lg p-3">
                <p className="font-medium text-gray-800 dark:text-gray-100 mb-2">{s.name}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['present', 'absent', 'late', 'excused'].map(status => (
                    <button
                      key={status}
                      onClick={() => setAttendanceForm(prev => ({
                        ...prev,
                        [s.id]: { ...prev[s.id], status },
                      }))}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        attendanceForm[s.id]?.status === status
                          ? attendanceButtonColors[status].active
                          : attendanceButtonColors[status].inactive
                      }`}
                    >
                      {attendanceLabels[status]}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="ملاحظة (اختياري)"
                  value={attendanceForm[s.id]?.notes || ''}
                  onChange={(e) => setAttendanceForm(prev => ({
                    ...prev,
                    [s.id]: { ...prev[s.id], notes: e.target.value },
                  }))}
                  className="w-full px-3 py-1.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm"
                />
              </div>
            ))}
            <button
              onClick={handleSaveAttendance}
              disabled={savingAttendance}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {savingAttendance ? 'جاري الحفظ...' : 'حفظ الحضور'}
            </button>
          </div>
        ) : attendance.length > 0 ? (
          <div className="space-y-2">
            {attendance.map(a => (
              <div key={a.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-3">
                <span className="font-medium text-gray-800 dark:text-gray-100">{a.student?.name}</span>
                <div className="flex items-center gap-2">
                  {a.notes && <span className="text-xs text-gray-400 dark:text-gray-500">{a.notes}</span>}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${attendanceColors[a.status]}`}>
                    {attendanceLabels[a.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-4">لم يتم تسجيل الحضور بعد</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">التسميعات ({recitations.length})</h2>
          {user.role === 'teacher' && (
            <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-primary-700 transition">
              {showForm ? 'إلغاء' : 'إضافة تسميع'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleAddRecitation} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 grid grid-cols-2 gap-3">
            <select value={form.studentId} onChange={(e) => setForm({...form, studentId: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg" required>
              <option value="">اختر الطالب</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={form.surahNumber} onChange={(e) => setForm({...form, surahNumber: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg" required>
              <option value="">اختر السورة</option>
              {quranData.map(s => <option key={s.number} value={s.number}>{s.name}</option>)}
            </select>
            <input type="number" placeholder="من آية" value={form.fromAyah} onChange={(e) => setForm({...form, fromAyah: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg" min="1" required />
            <input type="number" placeholder="إلى آية" value={form.toAyah} onChange={(e) => setForm({...form, toAyah: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg" min="1" required />
            <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg">
              <option value="new">جديد</option>
              <option value="review">مراجعة</option>
            </select>
            <button type="submit" className="bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">إضافة</button>
          </form>
        )}

        <div className="space-y-3">
          {recitations.map((r) => (
            <div key={r.id} className="border dark:border-gray-700 rounded-lg p-4 card-animated">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{r.student?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{getSurahName(r.surahNumber)} - آية {r.fromAyah} إلى {r.toAyah}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${r.type === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
                    {r.type === 'new' ? 'جديد' : 'مراجعة'}
                  </span>
                </div>
                {user.role === 'teacher' && !r.evaluation && !evalForm.recitationId && (
                  <button onClick={() => setEvalForm({...evalForm, recitationId: r.id})} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">تقييم</button>
                )}
              </div>

              {r.evaluation && (
                <div className="mt-3 flex gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${scoreColor(r.evaluation.hifdh)}`}>حفظ {r.evaluation.hifdh}/10</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${scoreColor(r.evaluation.tajweed)}`}>تجويد {r.evaluation.tajweed}/10</span>
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${scoreColor(r.evaluation.fluency)}`}>طلاقة {r.evaluation.fluency}/10</span>
                  {r.evaluation.notes && <span className="text-xs text-gray-400 dark:text-gray-500 self-center">- {r.evaluation.notes}</span>}
                </div>
              )}

              {evalForm.recitationId === r.id && (
                <form onSubmit={handleEvaluate} className="mt-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">الحفظ</label>
                      <input type="range" min="1" max="10" value={evalForm.hifdh} onChange={(e) => setEvalForm({...evalForm, hifdh: parseInt(e.target.value)})} className="w-full" />
                      <span className="text-sm font-bold text-center block dark:text-gray-100">{evalForm.hifdh}/10</span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">التجويد</label>
                      <input type="range" min="1" max="10" value={evalForm.tajweed} onChange={(e) => setEvalForm({...evalForm, tajweed: parseInt(e.target.value)})} className="w-full" />
                      <span className="text-sm font-bold text-center block dark:text-gray-100">{evalForm.tajweed}/10</span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">الطلاقة</label>
                      <input type="range" min="1" max="10" value={evalForm.fluency} onChange={(e) => setEvalForm({...evalForm, fluency: parseInt(e.target.value)})} className="w-full" />
                      <span className="text-sm font-bold text-center block dark:text-gray-100">{evalForm.fluency}/10</span>
                    </div>
                  </div>
                  <input type="text" placeholder="ملاحظات" value={evalForm.notes} onChange={(e) => setEvalForm({...evalForm, notes: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg text-sm" />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm">حفظ التقييم</button>
                    <button type="button" onClick={() => setEvalForm({...evalForm, recitationId: null})} className="text-gray-500 dark:text-gray-400 text-sm">إلغاء</button>
                  </div>
                </form>
              )}
            </div>
          ))}
          {recitations.length === 0 && <p className="text-gray-400 dark:text-gray-500 text-center py-4">لا توجد تسميعات بعد</p>}
        </div>
      </div>
    </div>
  );
}
