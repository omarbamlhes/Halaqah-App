import { useState, useEffect, forwardRef } from 'react';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';

const ProgressReport = forwardRef(function ProgressReport({ studentName, studentId, progress, recitations }, ref) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (studentId) {
      api.get(`/badges/student/${studentId}`)
        .then(res => setBadges(res.data))
        .catch(() => {});
    }
  }, [studentId]);

  const memorized = progress.filter(p => p.status === 'memorized').length;
  const inProgress = progress.filter(p => p.status === 'in_progress').length;
  const needsReview = progress.filter(p => p.status === 'needs_review').length;

  const statusColors = {
    not_started: '#f3f4f6',
    in_progress: '#fef3c7',
    memorized: '#bbf7d0',
    needs_review: '#fed7aa',
  };

  const badgeIcons = {
    first_recitation: '🎤',
    ten_recitations: '🔟',
    fifty_recitations: '🏅',
    first_memorized: '⭐',
    five_memorized: '🌟',
    ten_memorized: '💫',
    perfect_score: '💯',
    streak_7: '🔥',
    streak_30: '🏆',
    juz_amma: '📖',
  };

  const today = new Date().toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div ref={ref} style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', backgroundColor: '#ffffff', color: '#1f2937', fontFamily: 'system-ui, sans-serif', direction: 'rtl', padding: '40px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #16a34a', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a', marginBottom: '8px' }}>تقرير تقدم الحفظ</h1>
        <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151' }}>{studentName}</p>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{today}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '30px' }}>
        <div style={{ flex: 1, backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{memorized}</p>
          <p style={{ fontSize: '14px', color: '#4b5563' }}>سورة محفوظة</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fffbeb', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>{inProgress}</p>
          <p style={{ fontSize: '14px', color: '#4b5563' }}>قيد الحفظ</p>
        </div>
        <div style={{ flex: 1, backgroundColor: '#fff7ed', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ea580c' }}>{needsReview}</p>
          <p style={{ fontSize: '14px', color: '#4b5563' }}>تحتاج مراجعة</p>
        </div>
      </div>

      {/* Surah Grid */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>السور (114)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px' }}>
          {quranData.map((surah) => {
            const p = progress.find(pr => pr.surahNumber === surah.number);
            const status = p?.status || 'not_started';
            return (
              <div key={surah.number} style={{ backgroundColor: statusColors[status], borderRadius: '6px', padding: '4px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#374151' }}>{surah.number}</p>
                <p style={{ fontSize: '8px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{surah.name}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#f3f4f6', display: 'inline-block', border: '1px solid #d1d5db' }}></span> لم يبدأ</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#fef3c7', display: 'inline-block' }}></span> جاري</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#bbf7d0', display: 'inline-block' }}></span> محفوظ</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: '#fed7aa', display: 'inline-block' }}></span> يحتاج مراجعة</span>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>الأوسمة المكتسبة ({badges.length})</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {badges.map((b) => (
              <div key={b.id} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '18px' }}>{badgeIcons[b.badgeType] || '🏅'}</span>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{b.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Recitations Table */}
      {recitations.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>آخر التسميعات</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>السورة</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>الآيات</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>النوع</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>التاريخ</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>حفظ</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>تجويد</th>
                <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>طلاقة</th>
              </tr>
            </thead>
            <tbody>
              {recitations.slice(0, 20).map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{quranData.find(s => s.number === r.surahNumber)?.name}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{r.fromAyah} - {r.toAyah}</td>
                  <td style={{ padding: '8px 12px', color: '#374151' }}>{r.type === 'new' ? 'جديد' : 'مراجعة'}</td>
                  <td style={{ padding: '8px 12px', color: '#6b7280' }}>{new Date(r.createdAt).toLocaleDateString('ar')}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#374151', fontWeight: '600' }}>{r.evaluation?.hifdh ?? '-'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#374151', fontWeight: '600' }}>{r.evaluation?.tajweed ?? '-'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: '#374151', fontWeight: '600' }}>{r.evaluation?.fluency ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '12px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
        تم إنشاء هذا التقرير بواسطة تطبيق حلقة قرآن
      </div>
    </div>
  );
});

export default ProgressReport;
