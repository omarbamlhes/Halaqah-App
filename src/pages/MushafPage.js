import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import quranData from '../data/quran-metadata.json';
import { getSurah, RECITERS, toArabicNumber } from '../services/quranApi';
import { HeroSection } from '../components/IslamicDecor';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import AssignFromMushafModal from '../components/AssignFromMushafModal';

export default function MushafPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = parseInt(searchParams.get('surah') || '1', 10);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // نطاق آيات ممرّر عبر الرابط (من واجب مثلاً) — يُلتقط مرة واحدة عند التحميل
  const [pendingRange] = useState(() => {
    const f = parseInt(searchParams.get('from'), 10);
    const t = parseInt(searchParams.get('to'), 10);
    return Number.isInteger(f) ? { from: f, to: Number.isInteger(t) ? t : f } : null;
  });

  const [surahNumber, setSurahNumber] = useState(initialSurah);
  const [reciter, setReciter] = useState('ar.alafasy');
  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // تحديد نطاق آيات (للحفظ / الواجب): آية بداية وآية نهاية
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  // حالة التشغيل الصوتي
  const [playingAyah, setPlayingAyah] = useState(null);
  const [continuous, setContinuous] = useState(false);
  const audioRef = useRef(null);
  const ayahRefs = useRef({});

  const meta = useMemo(() => quranData.find((s) => s.number === surahNumber), [surahNumber]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setSurah(null);
    getSurah(surahNumber, reciter)
      .then((data) => { if (!cancelled) setSurah(data); })
      .catch(() => { if (!cancelled) setError('تعذّر تحميل السورة، تأكد من اتصال الإنترنت وحاول مجدداً.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surahNumber, reciter]);

  // مزامنة السورة مع رابط الصفحة
  useEffect(() => {
    setSearchParams({ surah: String(surahNumber) }, { replace: true });
  }, [surahNumber, setSearchParams]);

  // تطبيق النطاق الممرّر من الرابط (واجب) بعد تحميل السورة: تحديد + تمرير للآية
  const appliedRangeRef = useRef(false);
  useEffect(() => {
    if (!surah || !pendingRange || appliedRangeRef.current) return;
    appliedRangeRef.current = true;
    setRangeStart(pendingRange.from);
    setRangeEnd(pendingRange.to);
    setTimeout(() => {
      const el = ayahRefs.current[pendingRange.from];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);
  }, [surah, pendingRange]);

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlayingAyah(null);
    setContinuous(false);
  };

  // تحميل مسبق لصوت آية (يبدأ التخزين المؤقت قبل الحاجة إليه — لتلاوة متصلة بلا فراغات)
  const preloadAyah = (ayahNum) => {
    const ayah = surah?.ayahs.find((a) => a.numberInSurah === ayahNum);
    if (!ayah || !ayah.audio) return null;
    const a = new Audio();
    a.preload = 'auto';
    a.src = ayah.audio;
    a.load();
    return a;
  };

  // stopAt: آخر آية يتوقف عندها التشغيل المتتابع (لتشغيل نطاق الواجب فقط)
  // preloaded: عنصر صوت جرى تحميله مسبقاً للآية الحالية (لتشغيل فوري بلا انتظار)
  const playAyah = (ayahNum, cont = false, stopAt = null, preloaded = null) => {
    if (!surah) return;
    const ayah = surah.ayahs.find((a) => a.numberInSurah === ayahNum);
    if (!ayah || !ayah.audio) return;

    if (audioRef.current) audioRef.current.pause();
    const audio = preloaded || new Audio(ayah.audio);
    audioRef.current = audio;
    setPlayingAyah(ayahNum);
    setContinuous(cont);

    // تمرير الآية الجارية إلى وسط الشاشة
    const el = ayahRefs.current[ayahNum];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const lastAyah = stopAt ?? surah.numberOfAyahs;

    // ابدأ تحميل الآية التالية الآن (أثناء تشغيل الحالية) لتلاوة متصلة
    const nextPreloaded = (cont && ayahNum < lastAyah) ? preloadAyah(ayahNum + 1) : null;

    audio.onended = () => {
      if (cont && ayahNum < lastAyah) {
        playAyah(ayahNum + 1, true, stopAt, nextPreloaded);
      } else {
        setPlayingAyah(null);
        setContinuous(false);
        audioRef.current = null;
      }
    };
    audio.onerror = () => { setPlayingAyah(null); setContinuous(false); };
    audio.play().catch(() => { setPlayingAyah(null); setContinuous(false); });
  };

  // تشغيل النطاق المحدد فقط (من rangeStart إلى rangeEnd)
  const playRange = () => {
    if (rangeStart === null) return;
    playAyah(rangeStart, true, rangeEnd ?? rangeStart);
  };

  useEffect(() => () => { if (audioRef.current) audioRef.current.pause(); }, []);

  const handleAyahSelect = (ayahNum) => {
    // اختيار النطاق: أول ضغطة = بداية، ثانية = نهاية، ثالثة = إعادة تعيين
    if (rangeStart === null || (rangeStart !== null && rangeEnd !== null)) {
      setRangeStart(ayahNum);
      setRangeEnd(null);
    } else {
      if (ayahNum >= rangeStart) setRangeEnd(ayahNum);
      else { setRangeEnd(rangeStart); setRangeStart(ayahNum); }
    }
  };

  const inRange = (ayahNum) => {
    if (rangeStart === null) return false;
    const end = rangeEnd ?? rangeStart;
    return ayahNum >= rangeStart && ayahNum <= end;
  };

  const clearRange = () => { setRangeStart(null); setRangeEnd(null); };

  const rangeLabel = rangeStart !== null
    ? `من الآية ${toArabicNumber(rangeStart)}${rangeEnd !== null && rangeEnd !== rangeStart ? ` إلى ${toArabicNumber(rangeEnd)}` : ''}`
    : null;

  const showBasmala = surahNumber !== 1 && surahNumber !== 9;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <HeroSection
        title="المصحف الشريف"
        verse="إِنَّهُ لَقُرْآنٌ كَرِيمٌ"
      />

      {/* شريط التحكم */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mt-6 sticky top-16 z-20">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">السورة</label>
            <select
              value={surahNumber}
              onChange={(e) => { stopAudio(); clearRange(); setSurahNumber(parseInt(e.target.value, 10)); }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            >
              {quranData.map((s) => (
                <option key={s.number} value={s.number}>
                  {toArabicNumber(s.number)}. {s.name} ({toArabicNumber(s.ayahs)} آية)
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">القارئ</label>
            <select
              value={reciter}
              onChange={(e) => { stopAudio(); setReciter(e.target.value); }}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 text-sm"
            >
              {RECITERS.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            {playingAyah && continuous ? (
              <button onClick={stopAudio} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
                إيقاف
              </button>
            ) : (
              <button onClick={() => playAyah(1, true)} disabled={!surah} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50">
                تشغيل السورة
              </button>
            )}
          </div>
        </div>

        {/* شريط النطاق المحدد */}
        {rangeLabel && (
          <div className="mt-3 flex flex-wrap items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            <span className="text-sm text-amber-800 dark:text-amber-200 font-medium">
              النطاق المحدد: {meta?.name} — {rangeLabel}
            </span>
            <button
              onClick={() => (playingAyah && continuous ? stopAudio() : playRange())}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition"
            >
              {playingAyah && continuous ? 'إيقاف' : '▶ تشغيل النطاق'}
            </button>
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="mr-auto px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition"
              >
                أنشئ واجب بهذا النطاق
              </button>
            )}
            <button onClick={clearRange} className={`text-xs text-amber-700 dark:text-amber-300 underline ${user?.role === 'teacher' ? '' : 'mr-auto'}`}>
              إلغاء التحديد
            </button>
          </div>
        )}
      </div>

      {/* عنوان السورة */}
      {meta && (
        <div className="text-center mt-8 mb-4">
          <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-arabic">سورة {meta.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {meta.type === 'meccan' ? 'مكية' : 'مدنية'} • {toArabicNumber(meta.ayahs)} آية
          </p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {error && (
        <div className="text-center py-12 text-red-500 dark:text-red-400">{error}</div>
      )}

      {/* نص المصحف */}
      {surah && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          {showBasmala && (
            <p className="text-center text-2xl md:text-3xl text-gray-800 dark:text-gray-100 mb-6 leading-loose" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          )}
          <div
            className="mushaf-text text-justify text-2xl md:text-3xl text-gray-800 dark:text-gray-100"
            style={{ fontFamily: "'Amiri Quran', 'Amiri', 'Traditional Arabic', serif", lineHeight: 2.7 }}
            dir="rtl"
          >
            {surah.ayahs.map((ayah) => {
              const selected = inRange(ayah.numberInSurah);
              const playing = playingAyah === ayah.numberInSurah;
              return (
                <span
                  key={ayah.numberInSurah}
                  ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                  onClick={() => handleAyahSelect(ayah.numberInSurah)}
                  className={`ayah ${
                    playing ? 'bg-emerald-200 dark:bg-emerald-800/60' : selected ? 'bg-amber-100 dark:bg-amber-900/40' : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                  title={`الآية ${ayah.numberInSurah} — اضغط للتحديد`}
                >
                  {ayah.text}
                  {ayah.sajda && <span className="text-amber-600 dark:text-amber-400" title="سجدة تلاوة"> ۩</span>}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); playing ? stopAudio() : playAyah(ayah.numberInSurah); }}
                    className={`ayah-marker ${playing ? 'ayah-marker--playing' : ''}`}
                    title={playing ? 'إيقاف' : 'استماع لهذه الآية'}
                    aria-label={playing ? 'إيقاف' : `استماع للآية ${ayah.numberInSurah}`}
                  >
                    {playing ? '⏸' : toArabicNumber(ayah.numberInSurah)}
                  </span>
                </span>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 font-sans">
            اضغط على النص لتحديد نطاق الآيات • اضغط على رقم الآية للاستماع
          </p>
        </div>
      )}

      {showAssignModal && rangeStart !== null && (
        <AssignFromMushafModal
          surahNumber={surahNumber}
          surahName={meta?.name}
          fromAyah={rangeStart}
          toAyah={rangeEnd ?? rangeStart}
          onClose={() => setShowAssignModal(false)}
          onCreated={() => { setShowAssignModal(false); clearRange(); }}
        />
      )}
    </div>
  );
}
