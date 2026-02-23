import { useState, useEffect, forwardRef } from 'react';
import api from '../api/axios';
import quranData from '../data/quran-metadata.json';

/* ── Helper: 8-pointed Islamic star polygon ── */
function star8(cx, cy, R, r) {
  const pts = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i / 16) - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`);
  }
  return pts.join(' ');
}

/* ── Islamic geometric pattern background ── */
const IslamicPattern = ({ h = 280 }) => {
  const elems = [];
  const sp = 60;
  const cols = Math.ceil(800 / sp) + 1;
  const rows = Math.ceil(h / sp) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * sp + (r % 2 ? sp / 2 : 0);
      const y = r * sp;
      elems.push(
        <g key={`${r}-${c}`}>
          <polygon points={star8(x, y, 13, 5.5)} fill="none" stroke="#fbbf24" strokeWidth="0.5" />
          <circle cx={x} cy={y} r="1.5" fill="#fbbf24" />
        </g>
      );
    }
  }
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }} viewBox={`0 0 800 ${h}`} preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {elems}
    </svg>
  );
};

/* ── Inline PDF logo (no Tailwind) ── */
const PdfLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" stroke="url(#pRG)" strokeWidth="4" fill="none" opacity="0.3" />
    <circle cx="60" cy="60" r="48" stroke="url(#pRG)" strokeWidth="2" fill="none" opacity="0.15" />
    <circle cx="60" cy="60" r="42" fill="url(#pBG)" />
    <path d="M60 40 C60 40, 42 42, 36 48 L36 78 C42 72, 60 70, 60 70" fill="#fff" opacity="0.9" />
    <path d="M60 40 C60 40, 78 42, 84 48 L84 78 C78 72, 60 70, 60 70" fill="#fff" opacity="0.75" />
    <line x1="60" y1="40" x2="60" y2="70" stroke="#15803d" strokeWidth="1.5" opacity="0.4" />
    <line x1="42" y1="52" x2="56" y2="51" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="40" y1="57" x2="56" y2="56" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <line x1="39" y1="62" x2="55" y2="61" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <line x1="64" y1="51" x2="78" y2="52" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <line x1="64" y1="56" x2="80" y2="57" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    <line x1="65" y1="61" x2="81" y2="62" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <circle cx="60" cy="84" r="3" fill="#fbbf24" opacity="0.8" />
    <circle cx="50" cy="82" r="1.5" fill="#fbbf24" opacity="0.5" />
    <circle cx="70" cy="82" r="1.5" fill="#fbbf24" opacity="0.5" />
    <defs>
      <linearGradient id="pBG" x1="20" y1="20" x2="100" y2="100">
        <stop offset="0%" stopColor="#15803d" />
        <stop offset="100%" stopColor="#22c55e" />
      </linearGradient>
      <linearGradient id="pRG" x1="0" y1="0" x2="120" y2="120">
        <stop offset="0%" stopColor="#14532d" />
        <stop offset="100%" stopColor="#4ade80" />
      </linearGradient>
    </defs>
  </svg>
);

/* ── Islamic arch border (bottom of header/top of footer) ── */
const ArchBorder = ({ flip = false }) => (
  <svg width="800" height="18" viewBox="0 0 800 18" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', transform: flip ? 'scaleY(-1)' : 'none' }}>
    {Array.from({ length: 16 }).map((_, i) => (
      <path key={i} d={`M${i * 50},18 C${i * 50 + 12},2 ${i * 50 + 38},2 ${(i + 1) * 50},18`} fill="none" stroke="#fbbf24" strokeWidth="1.2" opacity="0.5" />
    ))}
    <line x1="0" y1="17.5" x2="800" y2="17.5" stroke="#fbbf24" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

/* ── Ornamental section divider ── */
const Divider = () => (
  <div style={{ textAlign: 'center', margin: '22px 0' }}>
    <svg width="440" height="24" viewBox="0 0 440 24" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="12" x2="170" y2="12" stroke="#b8860b" strokeWidth="0.7" opacity="0.35" />
      <line x1="20" y1="9" x2="160" y2="9" stroke="#b8860b" strokeWidth="0.3" opacity="0.2" />
      <line x1="20" y1="15" x2="160" y2="15" stroke="#b8860b" strokeWidth="0.3" opacity="0.2" />
      <polygon points={star8(220, 12, 9, 4)} fill="#b8860b" opacity="0.3" />
      <circle cx="220" cy="12" r="2" fill="#b8860b" opacity="0.5" />
      <polygon points="176,12 181,8 186,12 181,16" fill="#b8860b" opacity="0.25" />
      <polygon points="254,12 259,8 264,12 259,16" fill="#b8860b" opacity="0.25" />
      <line x1="270" y1="12" x2="430" y2="12" stroke="#b8860b" strokeWidth="0.7" opacity="0.35" />
      <line x1="280" y1="9" x2="420" y2="9" stroke="#b8860b" strokeWidth="0.3" opacity="0.2" />
      <line x1="280" y1="15" x2="420" y2="15" stroke="#b8860b" strokeWidth="0.3" opacity="0.2" />
    </svg>
  </div>
);

/* ── Section title with decorative lines ── */
const SectionTitle = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, #b8860b, transparent)', opacity: 0.3 }} />
    <h2 style={{ fontSize: 19, fontWeight: 'bold', color: '#14532d', fontFamily: 'Amiri, serif', margin: 0, whiteSpace: 'nowrap' }}>
      {children}
    </h2>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #b8860b, transparent)', opacity: 0.3 }} />
  </div>
);

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
  const pct = Math.round((memorized / 114) * 100);

  const statusStyle = {
    not_started: { bg: '#f9fafb', border: '#d1d5db' },
    in_progress: { bg: '#fef3c7', border: '#f59e0b' },
    memorized: { bg: '#dcfce7', border: '#16a34a' },
    needs_review: { bg: '#ffedd5', border: '#ea580c' },
  };

  const badgeIcons = {
    first_recitation: '🎤', ten_recitations: '🔟', fifty_recitations: '🏅',
    first_memorized: '⭐', five_memorized: '🌟', ten_memorized: '💫',
    perfect_score: '💯', streak_7: '🔥', streak_30: '🏆', juz_amma: '📖',
  };

  const today = new Date().toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });

  function scoreColor(v) {
    if (v == null || v === '-') return '#9ca3af';
    if (v >= 9) return '#16a34a';
    if (v >= 7) return '#374151';
    return '#ea580c';
  }

  return (
    <div ref={ref} style={{ position: 'absolute', left: '-9999px', top: 0, width: 800, backgroundColor: '#fff', color: '#1f2937', fontFamily: 'Amiri, "Traditional Arabic", system-ui, sans-serif', direction: 'rtl', overflow: 'hidden' }}>

      {/* ── Watermark ── */}
      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontSize: 85, color: '#14532d', opacity: 0.025, fontFamily: 'Amiri, serif', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0 }}>
        بسم الله الرحمن الرحيم
      </div>

      {/* ════════════════ HEADER ════════════════ */}
      <div style={{ backgroundColor: '#14532d', position: 'relative', overflow: 'hidden' }}>
        <IslamicPattern h={280} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '30px 40px 0' }}>
          {/* بسم الله */}
          <p style={{ fontSize: 24, color: '#fbbf24', fontFamily: 'Amiri, serif', margin: '0 0 18px', letterSpacing: '2px', opacity: 0.95 }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>

          {/* Logo + Name */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <PdfLogo size={58} />
            <span style={{ fontSize: 38, fontWeight: 'bold', color: '#fbbf24', fontFamily: 'Amiri, serif' }}>حلقة</span>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 28, fontWeight: 'bold', color: '#ffffff', margin: '0 0 14px', fontFamily: 'Amiri, serif' }}>تقرير تقدم الحفظ</h1>

          {/* Student info with golden divider */}
          <div style={{ display: 'inline-block', borderTop: '1px solid rgba(251,191,36,0.3)', borderBottom: '1px solid rgba(251,191,36,0.3)', padding: '8px 32px', marginBottom: 22 }}>
            <p style={{ fontSize: 21, fontWeight: 600, color: '#bbf7d0', margin: '0 0 4px' }}>{studentName}</p>
            <p style={{ fontSize: 14, color: '#86efac', margin: 0 }}>{today}</p>
          </div>
        </div>
        <ArchBorder />
      </div>

      {/* ════════════════ VERSE STRIP ════════════════ */}
      <div style={{ background: 'linear-gradient(to left, #fef9e7, #fdf6e3, #fef9e7)', padding: '14px 40px', textAlign: 'center', borderBottom: '2px solid #e8d48b' }}>
        <p style={{ fontSize: 20, color: '#78350f', fontFamily: 'Amiri, serif', margin: 0, lineHeight: 1.8 }}>
          ﴿ وَلَقَدْ يَسَّرْنَا ٱلْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
        </p>
        <p style={{ fontSize: 12, color: '#92400e', margin: '4px 0 0', opacity: 0.7 }}>سورة القمر — الآية ١٧</p>
      </div>

      {/* ════════════════ CONTENT ════════════════ */}
      <div style={{ padding: '0 40px', position: 'relative', zIndex: 1 }}>

        {/* ── Progress Bar ── */}
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', borderRadius: 14, padding: '22px 26px', margin: '28px 0', border: '1px solid #bbf7d0', boxShadow: '0 2px 10px rgba(20,83,45,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 17, fontWeight: 'bold', color: '#14532d' }}>نسبة الإنجاز الكلية</span>
            <span style={{ fontSize: 28, fontWeight: 'bold', color: '#15803d' }}>{pct}%</span>
          </div>
          <div style={{ backgroundColor: '#d1d5db', borderRadius: 10, height: 18, overflow: 'hidden', border: '1px solid #c5ccd3' }}>
            <div style={{ width: `${Math.max(pct, 2)}%`, height: '100%', borderRadius: 10, background: 'linear-gradient(to left, #14532d, #15803d, #22c55e, #4ade80)' }} />
          </div>
          <p style={{ fontSize: 14, color: '#4b5563', marginTop: 10, textAlign: 'center' }}>
            {memorized} من 114 سورة محفوظة
          </p>
        </div>

        <Divider />

        {/* ── Stat Cards ── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
          {[
            { n: memorized, label: 'سورة محفوظة', color: '#16a34a', bgLight: '#f0fdf4', iconPath: 'M9 12l2 2 4-4' },
            { n: inProgress, label: 'قيد الحفظ', color: '#f59e0b', bgLight: '#fffbeb', iconPath: 'M12 6v6l4 2' },
            { n: needsReview, label: 'تحتاج مراجعة', color: '#ea580c', bgLight: '#fff7ed', iconPath: 'M12 9v4m0 3h.01' },
          ].map((card, i) => (
            <div key={i} style={{ flex: 1, background: card.bgLight, borderRadius: 14, padding: '20px 16px', textAlign: 'center', border: `1px solid ${card.color}33`, borderTop: `5px solid ${card.color}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d={card.iconPath} stroke={card.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="10" stroke={card.color} strokeWidth="2" />
                </svg>
              </div>
              <p style={{ fontSize: 32, fontWeight: 'bold', color: card.color, margin: '0 0 4px' }}>{card.n}</p>
              <p style={{ fontSize: 14, color: '#4b5563', margin: 0, fontWeight: 500 }}>{card.label}</p>
            </div>
          ))}
        </div>

        <Divider />

        {/* ── Surah Grid ── */}
        <div style={{ marginBottom: 8 }}>
          <SectionTitle>خريطة السور (114)</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 5 }}>
            {quranData.map((surah) => {
              const p = progress.find(pr => pr.surahNumber === surah.number);
              const status = p?.status || 'not_started';
              const st = statusStyle[status];
              return (
                <div key={surah.number} style={{ backgroundColor: st.bg, border: `1.5px solid ${st.border}`, borderRadius: 5, padding: '3px 2px', textAlign: 'center', position: 'relative' }}>
                  {status === 'memorized' && (
                    <div style={{ position: 'absolute', top: 2, left: 2, width: 5, height: 5, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                  )}
                  <p style={{ fontSize: 11, fontWeight: 'bold', color: '#374151', margin: 0 }}>{surah.number}</p>
                  <p style={{ fontSize: 7.5, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{surah.name}</p>
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 14, justifyContent: 'center' }}>
            {[
              { label: 'لم يبدأ', bg: '#f9fafb', border: '#d1d5db' },
              { label: 'جاري الحفظ', bg: '#fef3c7', border: '#f59e0b' },
              { label: 'محفوظ', bg: '#dcfce7', border: '#16a34a' },
              { label: 'يحتاج مراجعة', bg: '#ffedd5', border: '#ea580c' },
            ].map(item => (
              <span key={item.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, backgroundColor: item.bg, border: `1.5px solid ${item.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 11, color: '#374151', fontWeight: 500 }}>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Badges ── */}
        {badges.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: 8 }}>
              <SectionTitle>الأوسمة المكتسبة ({badges.length})</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {badges.map((b) => (
                  <div key={b.id} style={{ background: 'linear-gradient(135deg, #fef9e7, #fdf6e3)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #f5d68a', boxShadow: '0 1px 4px rgba(180,135,50,0.08)' }}>
                    <span style={{ fontSize: 24, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>{badgeIcons[b.badgeType] || '🏅'}</span>
                    <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{b.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Recitations Table ── */}
        {recitations.length > 0 && (
          <>
            <Divider />
            <div style={{ marginBottom: 8 }}>
              <SectionTitle>آخر التسميعات</SectionTitle>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #d1d5db', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to left, #14532d, #166534)' }}>
                    {['السورة', 'الآيات', 'النوع', 'التاريخ'].map(h => (
                      <th key={h} style={{ padding: '11px 12px', textAlign: 'right', color: '#fff', fontWeight: 600, fontSize: 13 }}>{h}</th>
                    ))}
                    {['حفظ', 'تجويد', 'طلاقة'].map(h => (
                      <th key={h} style={{ padding: '11px 12px', textAlign: 'center', color: '#fbbf24', fontWeight: 600, fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recitations.slice(0, 20).map((r, idx) => (
                    <tr key={r.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fdf8', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', color: '#374151', fontWeight: 500 }}>{quranData.find(s => s.number === r.surahNumber)?.name}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{r.fromAyah} - {r.toAyah}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, backgroundColor: r.type === 'new' ? '#dcfce7' : '#e0f2fe', color: r.type === 'new' ? '#15803d' : '#0369a1' }}>
                          {r.type === 'new' ? 'جديد' : 'مراجعة'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280', fontSize: 12 }}>{new Date(r.createdAt).toLocaleDateString('ar')}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: 15, color: scoreColor(r.evaluation?.hifdh) }}>{r.evaluation?.hifdh ?? '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: 15, color: scoreColor(r.evaluation?.tajweed) }}>{r.evaluation?.tajweed ?? '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, fontSize: 15, color: scoreColor(r.evaluation?.fluency) }}>{r.evaluation?.fluency ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Bottom verse before footer ── */}
        <div style={{ textAlign: 'center', margin: '28px 0 0', padding: '16px 0', borderTop: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: 17, color: '#14532d', fontFamily: 'Amiri, serif', margin: 0, opacity: 0.7 }}>
            ﴿ رَبِّ ٱشْرَحْ لِي صَدْرِي ❊ وَيَسِّرْ لِي أَمْرِي ﴾
          </p>
          <p style={{ fontSize: 11, color: '#6b7280', margin: '4px 0 0' }}>سورة طه — الآيتان ٢٥-٢٦</p>
        </div>
      </div>

      {/* ════════════════ FOOTER ════════════════ */}
      <div style={{ backgroundColor: '#14532d', position: 'relative', overflow: 'hidden', marginTop: 8 }}>
        <IslamicPattern h={140} />
        <ArchBorder flip />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '16px 40px 22px' }}>
          {/* Hadith */}
          <p style={{ fontSize: 17, color: '#fbbf24', fontFamily: 'Amiri, serif', margin: '0 0 14px', opacity: 0.95 }}>
            «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
          </p>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <PdfLogo size={28} />
            <span style={{ fontSize: 22, fontWeight: 'bold', color: '#fbbf24', fontFamily: 'Amiri, serif' }}>حلقة</span>
          </div>
          <p style={{ fontSize: 12, color: '#86efac', margin: 0 }}>تم إنشاء هذا التقرير بواسطة تطبيق حلقة قرآن</p>
        </div>
      </div>
    </div>
  );
});

export default ProgressReport;
