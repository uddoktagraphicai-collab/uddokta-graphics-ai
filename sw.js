// EDS অ্যাপ: ইনস্টল আর অফলাইনের জন্য (অপ্টিমাইজড ও নিরাপদ ক্যাশিং)
var C = 'ug-v45';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) {
    return c.addAll([
      './',
      '/index.html',
      '/manifest.json',
      '/images/icon-192.png',
      '/images/logos/logo.png'
    ]);
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  // লোকাল ডেভেলপমেন্টে (Live Server / localhost) সার্ভিস ওয়ার্কার ইন্টারসেপ্ট বন্ধ রাখা
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;

  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // API এবং সংবেদনশীল পাথ কখনোই সার্ভিস ওয়ার্কারে ক্যাশ করা হবে না
  if (u.pathname.indexOf('/api') === 0 || u.pathname.indexOf('/supabase') === 0) return;

  var req = e.request;
  if (u.pathname.indexOf('/samples/') === 0 || u.pathname.indexOf('/logos/') === 0) {
    req = new Request('/images' + u.pathname + u.search, e.request);
  }
  if (u.pathname.indexOf('/app') === 0) {
    e.respondWith(fetch(req).then(function (r) {
      if (r && (r.status === 301 || r.status === 302 || r.type === 'opaqueredirect')) {
        return r;
      }
      if (!r || !r.ok) {
        return caches.match('/app.html').then(function (m) { return m || caches.match('app.html') || fetch('/app.html'); });
      }
      var cp = r.clone();
      caches.open(C).then(function (c) { c.put(req, cp); });
      return r;
    }).catch(function () {
      return caches.match('/app.html').then(function (m) { return m || caches.match('app.html') || fetch('/app.html'); });
    }));
    return;
  }
  if (u.pathname.indexOf('/admin') === 0) {
    // অ্যাডমিন পেজ সর্বদা নেটওয়ার্ক থেকে লোড হবে (ক্যাশে সংরক্ষণ নয়)
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    if (r && r.ok) {
      var cp = r.clone();
      caches.open(C).then(function (c) { c.put(req, cp); });
    }
    return r;
  }).catch(function () {
    return caches.match(req).then(function (m) { return m || caches.match('/index.html') || caches.match('index.html'); });
  }));
});
