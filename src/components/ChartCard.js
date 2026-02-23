export default function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 animate-fade-in-up ${className}`}>
      <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h3>
      {children}
    </div>
  );
}
