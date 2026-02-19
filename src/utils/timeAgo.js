export default function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 60) return 'الآن';

  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return 'منذ دقيقة';
  if (minutes === 2) return 'منذ دقيقتين';
  if (minutes <= 10) return `منذ ${minutes} دقائق`;
  if (minutes < 60) return `منذ ${minutes} دقيقة`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return 'منذ ساعة';
  if (hours === 2) return 'منذ ساعتين';
  if (hours <= 10) return `منذ ${hours} ساعات`;
  if (hours < 24) return `منذ ${hours} ساعة`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days <= 10) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${days} يوم`;

  const months = Math.floor(days / 30);
  if (months === 1) return 'منذ شهر';
  if (months === 2) return 'منذ شهرين';
  if (months <= 10) return `منذ ${months} أشهر`;
  if (months < 12) return `منذ ${months} شهر`;

  return d.toLocaleDateString('ar');
}
