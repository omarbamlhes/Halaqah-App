import { IslamicPattern } from './IslamicDecor';

export default function Footer() {
  return (
    <footer className="mt-auto border-t dark:border-gray-700 bg-white dark:bg-gray-800 py-6 transition-colors relative overflow-hidden">
      <IslamicPattern opacity={0.03} id="footerPattern" />
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 relative z-10">
        <p className="text-sm text-gray-400 dark:text-gray-500">
          <span style={{ fontFamily: 'Amiri, serif' }} className="text-primary-600 dark:text-primary-400 font-bold">حلقة</span> - منصة إدارة حلقات القرآن الكريم
        </p>
        <p
          className="text-xs text-gray-200 dark:text-gray-700"
          style={{ fontFamily: 'Amiri, serif' }}
        >
          وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
        </p>
        <p className="text-xs text-gray-300 dark:text-gray-600" dir="ltr">
          {new Date().getFullYear()} &copy; Halaqah
        </p>
      </div>
    </footer>
  );
}
