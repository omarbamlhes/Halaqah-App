import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [halaqahFilter, setHalaqahFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/halaqahs/teacher/students-overview');
        setStudents(res.data);

        const halaqahIds = [...new Set(res.data.map(s => s.halaqahId))];
        const statsPromises = halaqahIds.map(id =>
          api.get(`/sessions/attendance/stats?halaqahId=${id}`).catch(() => ({ data: [] }))
        );
        const statsResults = await Promise.all(statsPromises);
        const statsMap = {};
        statsResults.forEach(r => {
          r.data.forEach(s => {
            const key = `${s.studentId}`;
            if (!statsMap[key] || s.totalSessions > statsMap[key].totalSessions) {
              statsMap[key] = s;
            }
          });
        });
        setAttendanceStats(statsMap);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = students.filter(s =>
    (s.studentName.includes(search) || s.halaqahName.includes(search)) &&
    (!halaqahFilter || s.halaqahId === parseInt(halaqahFilter))
  );

  const uniqueHalaqahsList = [...new Map(students.map(s => [s.halaqahId, s.halaqahName])).entries()];

  const uniqueStudents = new Set(students.map(s => s.studentId)).size;
  const uniqueHalaqahs = new Set(students.map(s => s.halaqahId)).size;
  const totalRecitations = students.reduce((sum, s) => sum + s.totalRecitations, 0);
  const totalMemorized = [...new Map(students.map(s => [s.studentId, s.memorizedSurahs])).values()].reduce((a, b) => a + b, 0);

  const evaluatedStudents = students.filter(s => s.avgHifdh !== null);
  const avgScore = evaluatedStudents.length > 0
    ? ((evaluatedStudents.reduce((sum, s) => sum + (s.avgHifdh + s.avgTajweed + s.avgFluency) / 3, 0)) / evaluatedStudents.length).toFixed(1)
    : '-';

  const scoreBadge = (val) => {
    if (val === null) return <span className="text-xs text-gray-400 dark:text-gray-500">-</span>;
    const color = val >= 8 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : val >= 5 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{val}</span>;
  };

  const attendanceBadge = (studentId) => {
    const stats = attendanceStats[`${studentId}`];
    if (!stats || stats.totalSessions === 0) return null;
    const rate = stats.attendanceRate;
    const color = rate >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : rate >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{rate}%</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-2">نظرة عامة على الطلاب</h1>
        <p className="text-green-200 text-sm">
          {uniqueStudents} طالب في {uniqueHalaqahs} حلقة
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-in-up">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{uniqueStudents}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">إجمالي الطلاب</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalRecitations}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">إجمالي التسميعات</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{avgScore}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">متوسط الدرجات</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalMemorized}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">سور محفوظة</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 animate-fade-in-up">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الحلقة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] md:max-w-sm px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
        />
        {uniqueHalaqahsList.length > 1 && (
          <select
            value={halaqahFilter}
            onChange={(e) => setHalaqahFilter(e.target.value)}
            className="px-4 py-2.5 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
          >
            <option value="">كل الحلقات</option>
            {uniqueHalaqahsList.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-12 text-center animate-fade-in-up">
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">
            {students.length === 0 ? 'لا يوجد طلاب بعد' : 'لا توجد نتائج للبحث'}
          </p>
          {students.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 text-sm">أضف طلابًا لحلقاتك لمتابعة تقدمهم</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up">
          {filtered.map((s) => (
            <div key={`${s.studentId}-${s.halaqahId}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{s.studentName}</h3>
                    <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs px-2 py-0.5 rounded-full">
                      {s.halaqahName}
                    </span>
                    {attendanceBadge(s.studentId) && (
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        الحضور: {attendanceBadge(s.studentId)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>التسميعات: <strong className="text-gray-700 dark:text-gray-200">{s.totalRecitations}</strong> ({s.evaluatedRecitations} مقيّم)</span>
                    <span className="flex items-center gap-1">
                      الحفظ: {scoreBadge(s.avgHifdh)}
                      التجويد: {scoreBadge(s.avgTajweed)}
                      الطلاقة: {scoreBadge(s.avgFluency)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>سور محفوظة: <strong className="text-green-600 dark:text-green-400">{s.memorizedSurahs}</strong> | قيد الحفظ: <strong className="text-yellow-600 dark:text-yellow-400">{s.inProgressSurahs}</strong></span>
                    {s.lastRecitationDate && (
                      <span>آخر تسميع: {new Date(s.lastRecitationDate).toLocaleDateString('ar')}</span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/teacher/students/${s.studentId}`}
                  className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/50 transition whitespace-nowrap"
                >
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
