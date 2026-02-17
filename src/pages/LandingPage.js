import { Link } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import Logo from '../components/Logo';

// ─── Scroll Reveal Hook ───
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

// ─── Counter Animation Hook ───
function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  const start = useCallback(() => setStarted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [start]);

  useEffect(() => {
    if (!started) return;

    let startTime = null;
    let animFrame;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        animFrame = requestAnimationFrame(animate);
      }
    }

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [started, end, duration]);

  return { count, ref };
}

// ─── Section Wrapper with Scroll Reveal ───
function RevealSection({ children, className = '', stagger = false }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${className}`}>
      {children}
    </div>
  );
}

// ─── Islamic Geometric Pattern (8-pointed star tessellation) ───
function IslamicPattern({ opacity = 0.07 }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="islamicStar" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* 8-pointed star: alternating outer tips and inner concave vertices */}
            <path
              d="M80,40 L56,34 L68,12 L46,24 L40,0 L34,24 L12,12 L24,34 L0,40 L24,46 L12,68 L34,56 L40,80 L46,56 L68,68 L56,46 Z"
              fill="none" stroke="white" strokeWidth="1"
            />
            {/* Inner octagon connecting the concave points */}
            <polygon
              points="56,34 46,24 34,24 24,34 24,46 34,56 46,56 56,46"
              fill="none" stroke="white" strokeWidth="0.6"
            />
            {/* Center ornament */}
            <circle cx="40" cy="40" r="6" fill="none" stroke="white" strokeWidth="0.5" />
            {/* Tiny diamond at center */}
            <polygon points="40,36 44,40 40,44 36,40" fill="white" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamicStar)" />
      </svg>
    </div>
  );
}

// ─── Floating Decorations for Hero ───
function HeroDecorations() {
  return (
    <>
      {/* Islamic geometric pattern background */}
      <IslamicPattern opacity={0.08} />

      {/* Floating stars */}
      <div className="floating absolute top-16 right-[10%] opacity-20">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="floating-reverse absolute top-32 left-[15%] opacity-15" style={{ animationDelay: '2s' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="floating-slow absolute bottom-20 right-[20%] opacity-10" style={{ animationDelay: '4s' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

      {/* Floating circles */}
      <div className="floating hero-particle w-32 h-32 bg-white top-10 left-[5%]" style={{ animationDelay: '1s' }} />
      <div className="floating-reverse hero-particle w-20 h-20 bg-green-300 bottom-10 right-[8%]" style={{ animationDelay: '3s' }} />
      <div className="floating-slow hero-particle w-16 h-16 bg-yellow-300 top-1/2 left-[80%]" style={{ animationDelay: '5s' }} />

      {/* Floating book icon */}
      <div className="floating-reverse absolute bottom-24 left-[12%] opacity-10" style={{ animationDelay: '1.5s' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0.5">
          <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
    </>
  );
}

// ─── Data ───
const features = [
  {
    title: 'إدارة الحلقات',
    description: 'أنشئ حلقاتك وأدرها بسهولة مع نظام أكواد الانضمام للطلاب',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: 'تسجيل التسميعات',
    description: 'سجّل تسميعات الطلاب بتحديد السورة والآيات مع ملاحظات المعلم',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    title: 'التقييم الشامل',
    description: 'قيّم الحفظ والتجويد والأداء بدرجات تفصيلية وملاحظات',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
  {
    title: 'متابعة التقدم',
    description: 'تابع تقدم الطالب عبر شبكة السور الـ 114 بألوان توضيحية',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'محادثة مباشرة',
    description: 'تواصل فوري بين المعلم والطلاب داخل كل حلقة',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    title: 'متابعة أولياء الأمور',
    description: 'يتابع ولي الأمر تقدم أبنائه وتقييماتهم بشكل مستمر',
    icon: (
      <svg className="w-10 h-10 icon-hover-animate" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const stats = [
  { label: 'سورة في القرآن', value: 114, icon: '📖' },
  { label: 'جزء كامل', value: 30, icon: '🕌' },
  { label: 'آية كريمة', value: 6236, icon: '✨' },
  { label: 'دور مختلف', value: 3, icon: '👥' },
];

const roles = [
  {
    title: 'المعلم',
    gradient: 'from-green-600 to-green-400',
    borderColor: 'border-green-500',
    bgLight: 'gradient-card-green',
    items: [
      'إنشاء وإدارة الحلقات',
      'تسجيل التسميعات والتقييمات',
      'متابعة تقدم جميع الطلاب',
      'التواصل مع الطلاب عبر المحادثة',
    ],
  },
  {
    title: 'الطالب',
    gradient: 'from-blue-600 to-blue-400',
    borderColor: 'border-blue-500',
    bgLight: 'gradient-card-blue',
    items: [
      'الانضمام للحلقات بكود',
      'استعراض التسميعات والتقييمات',
      'متابعة تقدم الحفظ الشخصي',
      'التواصل مع المعلم والزملاء',
    ],
  },
  {
    title: 'ولي الأمر',
    gradient: 'from-amber-600 to-amber-400',
    borderColor: 'border-amber-500',
    bgLight: 'gradient-card-gold',
    items: [
      'ربط حسابات الأبناء',
      'متابعة تقدم كل ابن',
      'الاطلاع على التقييمات',
      'إشعارات فورية بالنتائج',
    ],
  },
];

// ─── Stat Card with Counter ───
function StatCard({ stat }) {
  const { count, ref } = useCountUp(stat.value, stat.value > 1000 ? 2500 : 1500);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl mb-2">{stat.icon}</div>
      <div className="text-4xl md:text-5xl font-bold text-white mb-1">
        {count.toLocaleString('ar-EG')}+
      </div>
      <div className="text-green-200 text-lg">{stat.label}</div>
    </div>
  );
}

// ─── Main Component ───
export default function LandingPage() {
  return (
    <div>
      {/* ══════ Hero Section ══════ */}
      <section className="gradient-hero text-white py-24 px-4 relative overflow-hidden min-h-[85vh] flex items-center">
        <HeroDecorations />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6 animate-bounce-in">
            <Logo size={80} dark />
          </div>
          <h1
            className="text-5xl md:text-7xl font-bold mb-4 gradient-text-animated"
            style={{ fontFamily: 'Amiri, serif' }}
          >
            حلقة
          </h1>
          <p className="text-2xl md:text-3xl font-semibold mb-4 opacity-95 animate-fade-in-up">
            منصة إدارة حلقات القرآن الكريم
          </p>
          <p className="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            نظام متكامل يربط المعلم والطالب وولي الأمر لمتابعة حفظ القرآن الكريم وتقييم الأداء بسهولة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/register"
              className="gradient-primary text-white px-8 py-3.5 rounded-xl text-lg font-semibold btn-glow shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              ابدأ الآن
            </Link>
            <Link
              to="/login"
              className="border-2 border-white/70 text-white px-8 py-3.5 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-700 hover:scale-105 transition-all duration-300"
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ══════ Stats Section ══════ */}
      <section className="bg-green-800 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <StatCard key={idx} stat={stat} />
          ))}
        </div>
      </section>

      {/* ══════ Features Section ══════ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100" style={{ fontFamily: 'Amiri, serif' }}>
              مميزات المنصة
            </h2>
            <div className="w-20 h-1 gradient-primary rounded-full mx-auto mt-4" />
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <RevealSection key={idx}>
                <div className={`group card-hover bg-gray-50 dark:bg-gray-800 rounded-xl p-7 text-center h-full border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700 transition-colors stagger-${idx + 1}`}>
                  <div className="text-green-600 dark:text-green-400 flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ Roles Section ══════ */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <RevealSection className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100" style={{ fontFamily: 'Amiri, serif' }}>
              لكل دور مميزاته
            </h2>
            <div className="w-20 h-1 gradient-primary rounded-full mx-auto mt-4" />
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, idx) => (
              <RevealSection key={idx}>
                <div className={`card-hover bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-t-4 ${role.borderColor} h-full stagger-${idx + 1}`}>
                  <div className={`bg-gradient-to-l ${role.gradient} text-white text-center py-5`}>
                    <h3 className="text-2xl font-bold">{role.title}</h3>
                  </div>
                  <ul className="p-6 space-y-3">
                    {role.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-200">
                        <svg className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════ CTA Section ══════ */}
      <section className="gradient-hero text-white py-20 px-4 relative overflow-hidden">
        {/* Islamic pattern + subtle decoration */}
        <IslamicPattern opacity={0.05} />
        <div className="floating-slow hero-particle w-40 h-40 bg-white top-0 right-[5%]" />
        <div className="floating hero-particle w-24 h-24 bg-green-300 bottom-0 left-[10%]" style={{ animationDelay: '2s' }} />

        <RevealSection className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-5" style={{ fontFamily: 'Amiri, serif' }}>
            ابدأ رحلتك مع القرآن الكريم
          </h2>
          <p className="text-lg opacity-90 mb-10 leading-relaxed">
            انضم إلى منصة حلقة وابدأ بإدارة حلقاتك أو متابعة حفظك بكل سهولة
          </p>
          <Link
            to="/register"
            className="inline-block gradient-primary text-white px-12 py-4 rounded-xl text-xl font-semibold btn-glow shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            سجّل الآن مجانًا
          </Link>
        </RevealSection>
      </section>
    </div>
  );
}
