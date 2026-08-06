// خدمة جلب نص القرآن الكريم والصوت المرجعي من alquran.cloud
// مع تخزين مؤقت في الذاكرة و localStorage لتقليل الطلبات الشبكية

const BASE = 'https://api.alquran.cloud/v1';

// القرّاء المتاحون (edition identifier -> اسم عربي)
export const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط (مرتّل)' },
  { id: 'ar.husary', name: 'محمود الحصري' },
  { id: 'ar.minshawi', name: 'محمد المنشاوي' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم' },
];

const memCache = new Map();

// نسخة الكاش — نرفعها عند تغيير بنية البيانات لإبطال الكاش القديم في localStorage
const CACHE_VER = 'v3';
function cacheKey(surahNumber, reciter) {
  return `quran:${CACHE_VER}:${surahNumber}:${reciter}`;
}

// جلب سورة كاملة (آيات فيها النص + رابط الصوت لكل آية)
export async function getSurah(surahNumber, reciter = 'ar.alafasy') {
  const key = cacheKey(surahNumber, reciter);

  if (memCache.has(key)) return memCache.get(key);

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      memCache.set(key, parsed);
      return parsed;
    }
  } catch (e) { /* تجاهل أخطاء التخزين */ }

  const res = await fetch(`${BASE}/surah/${surahNumber}/${reciter}`);
  if (!res.ok) throw new Error('تعذّر جلب السورة');
  const json = await res.json();
  if (json.code !== 200) throw new Error('استجابة غير متوقعة');

  // الـ API يُلحق البسملة بنص أول آية في معظم السور (عدا الفاتحة والتوبة).
  // نزيلها لأننا نعرض البسملة منفصلة فوق السورة. نقارن بعد تجريد التشكيل واختلاف
  // أشكال الألف (ٱ/أ/إ/آ) لتفادي فروق ترميز Unicode بين المصادر.
  const stripTashkeel = (s) =>
    s.replace(/[ً-ٰٟـۖ-ۭ]/g, '').replace(/[ٱأإآ]/g, 'ا');
  const BASMALA_NORM = stripTashkeel('بسم الله الرحمن الرحيم');
  const stripBasmala = (surahNum, ayahNum, text) => {
    if (ayahNum !== 1 || surahNum === 1 || surahNum === 9) return text;
    const words = text.split(' ');
    const first4 = stripTashkeel(words.slice(0, 4).join(' ')).trim();
    if (first4 === BASMALA_NORM) return words.slice(4).join(' ').trim();
    return text;
  };

  const data = {
    number: json.data.number,
    name: json.data.name,
    englishName: json.data.englishName,
    revelationType: json.data.revelationType,
    numberOfAyahs: json.data.numberOfAyahs,
    ayahs: json.data.ayahs.map((a) => ({
      numberInSurah: a.numberInSurah,
      text: stripBasmala(json.data.number, a.numberInSurah, a.text),
      audio: a.audio,
      page: a.page,
      juz: a.juz,
      sajda: a.sajda && a.sajda !== false,
    })),
  };

  memCache.set(key, data);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* الحد الأقصى للتخزين — تجاهل */ }

  return data;
}

// تحويل الأرقام الإنجليزية إلى أرقام عربية (١٢٣)
export function toArabicNumber(n) {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}
