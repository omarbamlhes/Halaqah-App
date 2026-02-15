export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="text-sm text-gray-400">
          <span style={{ fontFamily: 'Amiri, serif' }} className="text-primary-600 font-bold">حلقة</span> - منصة إدارة حلقات القرآن الكريم
        </p>
        <p className="text-xs text-gray-300" dir="ltr">
          {new Date().getFullYear()} &copy; Halaqah
        </p>
      </div>
    </footer>
  );
}
