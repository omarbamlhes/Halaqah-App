import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/halaqahs/teacher/students-overview');
        setStudents(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = students.filter(s =>
    s.studentName.includes(search) || s.halaqahName.includes(search)
  );

  const uniqueStudents = new Set(students.map(s => s.studentId)).size;
  const uniqueHalaqahs = new Set(students.map(s => s.halaqahId)).size;
  const totalRecitations = students.reduce((sum, s) => sum + s.totalRecitations, 0);
  const totalMemorized = [...new Map(students.map(s => [s.studentId, s.memorizedSurahs])).values()].reduce((a, b) => a + b, 0);

  const evaluatedStudents = students.filter(s => s.avgHifdh !== null);
  const avgScore = evaluatedStudents.length > 0
    ? ((evaluatedStudents.reduce((sum, s) => sum + (s.avgHifdh + s.avgTajweed + s.avgFluency) / 3, 0)) / evaluatedStudents.length).toFixed(1)
    : '-';

  const scoreBadge = (val) => {
    if (val === null) return <span className="text-xs text-gray-400">-</span>;
    const color = val >= 8 ? 'bg-green-100 text-green-700' : val >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{val}</span>;
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
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{uniqueStudents}</p>
          <p className="text-xs text-gray-500 mt-1">إجمالي الطلاب</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalRecitations}</p>
          <p className="text-xs text-gray-500 mt-1">إجمالي التسميعات</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{avgScore}</p>
          <p className="text-xs text-gray-500 mt-1">متوسط الدرجات</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalMemorized}</p>
          <p className="text-xs text-gray-500 mt-1">سور محفوظة</p>
        </div>
      </div>

      <div className="mb-6 animate-fade-in-up">
        <input
          type="text"
          placeholder="ابحث بالاسم أو الحلقة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center animate-fade-in-up">
          <p className="text-gray-400 text-lg mb-2">
            {students.length === 0 ? 'لا يوجد طلاب بعد' : 'لا توجد نتائج للبحث'}
          </p>
          {students.length === 0 && (
            <p className="text-gray-400 text-sm">أضف طلابًا لحلقاتك لمتابعة تقدمهم</p>
          )}
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in-up">
          {filtered.map((s) => (
            <div key={`${s.studentId}-${s.halaqahId}`} className="bg-white rounded-xl shadow-sm border p-5 card-hover">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800">{s.studentName}</h3>
                    <span className="inline-block bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                      {s.halaqahName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                    <span>التسميعات: <strong className="text-gray-700">{s.totalRecitations}</strong> ({s.evaluatedRecitations} مقيّم)</span>
                    <span className="flex items-center gap-1">
                      الحفظ: {scoreBadge(s.avgHifdh)}
                      التجويد: {scoreBadge(s.avgTajweed)}
                      الطلاقة: {scoreBadge(s.avgFluency)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 mt-1">
                    <span>سور محفوظة: <strong className="text-green-600">{s.memorizedSurahs}</strong> | قيد الحفظ: <strong className="text-yellow-600">{s.inProgressSurahs}</strong></span>
                    {s.lastRecitationDate && (
                      <span>آخر تسميع: {new Date(s.lastRecitationDate).toLocaleDateString('ar')}</span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/teacher/students/${s.studentId}`}
                  className="bg-primary-50 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 transition whitespace-nowrap"
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
