import Logo from './Logo';

export default function LoadingSpinner({ text = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="relative mb-4">
        <div className="spinner" style={{ width: 56, height: 56 }}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size={28} />
        </div>
      </div>
      <p className="text-gray-400 dark:text-gray-500 text-sm">{text}</p>
    </div>
  );
}
