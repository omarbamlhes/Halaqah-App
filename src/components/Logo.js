export default function Logo({ size = 40, withText = false, dark = false }) {
  const textColor = dark ? '#ffffff' : '#15803d';
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer ring - حلقة */}
        <circle cx="60" cy="60" r="56" stroke="url(#ringGrad)" strokeWidth="4" fill="none" opacity="0.3" />
        <circle cx="60" cy="60" r="48" stroke="url(#ringGrad)" strokeWidth="2" fill="none" opacity="0.15" />

        {/* Inner circle with gradient */}
        <circle cx="60" cy="60" r="42" fill="url(#bgGrad)" />

        {/* Open book / mushaf */}
        <path d="M60 40 C60 40, 42 42, 36 48 L36 78 C42 72, 60 70, 60 70" fill="#ffffff" opacity="0.9" />
        <path d="M60 40 C60 40, 78 42, 84 48 L84 78 C78 72, 60 70, 60 70" fill="#ffffff" opacity="0.75" />

        {/* Book spine */}
        <line x1="60" y1="40" x2="60" y2="70" stroke="#15803d" strokeWidth="1.5" opacity="0.4" />

        {/* Text lines on left page */}
        <line x1="42" y1="52" x2="56" y2="51" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="40" y1="57" x2="56" y2="56" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="39" y1="62" x2="55" y2="61" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

        {/* Text lines on right page */}
        <line x1="64" y1="51" x2="78" y2="52" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <line x1="64" y1="56" x2="80" y2="57" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="65" y1="61" x2="81" y2="62" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />

        {/* Star decoration */}
        <circle cx="60" cy="84" r="3" fill="#fbbf24" opacity="0.8" />
        <circle cx="50" cy="82" r="1.5" fill="#fbbf24" opacity="0.5" />
        <circle cx="70" cy="82" r="1.5" fill="#fbbf24" opacity="0.5" />

        <defs>
          <linearGradient id="bgGrad" x1="20" y1="20" x2="100" y2="100">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="120" y2="120">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>
      {withText && (
        <span className="text-2xl font-bold" style={{ color: textColor, fontFamily: 'Amiri, serif' }}>
          حلقة
        </span>
      )}
    </span>
  );
}
