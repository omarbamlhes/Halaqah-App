/* eslint-disable no-restricted-globals */
// Service Worker لتطبيق حلقة — يوفّر عملاً جزئياً بدون إنترنت
// استراتيجية: app shell بالكاش أولاً، والطلبات الأخرى شبكة أولاً مع كاش احتياطي

const CACHE_VERSION = 'halaqah-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/logo192.png',
  '/logo512.png',
];

// تثبيت: تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

// تفعيل: حذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // فقط طلبات GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // تجاهل طلبات الـ API (البيانات الحيّة) وطلبات السوكِت — لا نخزّنها
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/socket.io')) return;

  // طلبات التنقّل (الصفحات): شبكة أولاً ثم index.html من الكاش عند انقطاع النت
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // الأصول الثابتة (JS/CSS/صور/خطوط): كاش أولاً ثم الشبكة، وتحديث الكاش في الخلفية
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
