import { useState, useEffect } from 'react';

// زر عائم يقترح تثبيت التطبيق على الجوال (PWA)
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // إذا كان مُثبّتاً بالفعل، لا نعرض شيئاً
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // إن سبق للمستخدم إغلاق الاقتراح، نحترم اختياره
    if (localStorage.getItem('pwaInstallDismissed') === '1') return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installed = () => setVisible(false);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem('pwaInstallDismissed', '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-emerald-100 dark:border-gray-700 p-4 animate-[fadeInUp_0.3s_ease-out]" dir="rtl">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xl">📱</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800 dark:text-white">ثبّت تطبيق حلقة</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">أضِف المنصّة إلى شاشتك الرئيسية لوصول أسرع وعمل بدون إنترنت.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={install} className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition">
              تثبيت
            </button>
            <button onClick={dismiss} className="px-3 py-1.5 rounded-lg text-gray-500 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              لاحقاً
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm" aria-label="إغلاق">✕</button>
      </div>
    </div>
  );
}
