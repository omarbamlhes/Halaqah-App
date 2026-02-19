// ─── Islamic Decoration Components ───
// Shared Islamic geometric patterns, verse watermarks, and HeroSection

// ─── Islamic Geometric Pattern (8-pointed star tessellation) ───
export function IslamicPattern({ opacity = 0.07, id = 'islamicStar' }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M80,40 L56,34 L68,12 L46,24 L40,0 L34,24 L12,12 L24,34 L0,40 L24,46 L12,68 L34,56 L40,80 L46,56 L68,68 L56,46 Z"
              fill="none" stroke="white" strokeWidth="1"
            />
            <polygon
              points="56,34 46,24 34,24 24,34 24,46 34,56 46,56 56,46"
              fill="none" stroke="white" strokeWidth="0.6"
            />
            <circle cx="40" cy="40" r="6" fill="none" stroke="white" strokeWidth="0.5" />
            <polygon points="40,36 44,40 40,44 36,40" fill="white" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}

// ─── Dome SVG Decoration ───
function DomeDecor() {
  return (
    <div className="absolute left-0 bottom-0 pointer-events-none opacity-[0.07]">
      <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dome arch */}
        <path d="M10,100 Q10,30 60,10 Q110,30 110,100" stroke="white" strokeWidth="1.5" fill="none" />
        {/* Inner arch */}
        <path d="M25,100 Q25,50 60,25 Q95,50 95,100" stroke="white" strokeWidth="1" fill="none" />
        {/* Mihrab niche */}
        <path d="M45,100 Q45,65 60,50 Q75,65 75,100" stroke="white" strokeWidth="0.8" fill="none" />
        {/* Crescent on top */}
        <circle cx="60" cy="10" r="5" stroke="white" strokeWidth="0.8" fill="none" />
        <circle cx="62" cy="9" r="3.5" stroke="white" strokeWidth="0.6" fill="none" />
      </svg>
    </div>
  );
}

// ─── Floating Golden Stars ───
function GoldenStars() {
  return (
    <>
      <div className="floating absolute top-4 left-[12%] opacity-20 pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="floating-reverse absolute top-8 right-[8%] opacity-15 pointer-events-none" style={{ animationDelay: '2s' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div className="floating-slow absolute bottom-3 left-[25%] opacity-10 pointer-events-none" style={{ animationDelay: '4s' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    </>
  );
}

// ─── Verse Watermark ───
function VerseWatermark({ verse }) {
  if (!verse) return null;
  return (
    <div
      className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden"
      style={{ opacity: 0.06 }}
    >
      <p
        className="text-white text-3xl md:text-5xl font-bold pb-3 whitespace-nowrap"
        style={{ fontFamily: 'Amiri, serif' }}
      >
        {verse}
      </p>
    </div>
  );
}

// ─── HeroSection — Unified Hero with Islamic Decor ───
export function HeroSection({ title, subtitle, icon, verse, children }) {
  return (
    <div className="gradient-hero rounded-2xl p-8 mb-8 animate-fade-in relative overflow-hidden">
      {/* Decorations */}
      <IslamicPattern opacity={0.06} id="heroPattern" />
      <DomeDecor />
      <GoldenStars />
      <VerseWatermark verse={verse} />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-5">
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          {subtitle && <p className="text-green-200 text-sm">{subtitle}</p>}
        </div>
      </div>

      {/* Extra content (back links, stats, etc.) */}
      {children && <div className="relative z-10 mt-3">{children}</div>}
    </div>
  );
}

export default HeroSection;
