export default function LoadingSpinner({ text = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="spinner mb-4"></div>
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}
