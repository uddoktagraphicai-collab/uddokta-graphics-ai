// EDS অ্যাপ: ইনস্টল আর অফলাইনের জন্য
var C = 'ug-v43';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) {
    return c.addAll([
      './',
      '/index.html',
      '/app.html',
      '/admin.html',
      '/css/index.css',
      '/css/app.css',
      '/css/admin.css',
      '/js/index.js',
      '/js/app.js',
      '/js/admin.js',
      '/manifest.json',
      '/images/icon-192.png',
      '/images/icon-512.png',
      '/images/logos/logo.png',
      '/images/hero/hero-main.jpg',
      '/images/hero/hero-left.jpg',
      '/images/hero/hero-right.jpg',
      '/images/gallery/gal-1.jpg',
      '/images/gallery/gal-2.jpg',
      '/images/gallery/gal-3.jpg',
      '/images/gallery/gal-4.jpg',
      '/images/gallery/gal-5.jpg',
      '/images/gallery/gal-6.jpg',
      '/images/gallery/gal-7.jpg',
      '/images/gallery/gal-8.jpg',
      '/images/steps/step-1.jpg',
      '/images/steps/step-2.jpg',
      '/images/steps/step-3.jpg',
      '/images/steps/step-4.jpg',
      '/images/samples/polli-quality.jpg',
      '/images/samples/amannah-action.jpg',
      '/images/samples/feena-offer.jpg',
      '/images/samples/tr-offer.jpg',
      '/images/samples/gadget-watt.jpg',
      '/images/samples/dental.jpg'
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
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  var req = e.request;
  if (u.pathname.indexOf('/samples/') === 0 || u.pathname.indexOf('/logos/') === 0) {
    req = new Request('/images' + u.pathname + u.search, e.request);
  }
  if (u.pathname.indexOf('/app') === 0) {
    e.respondWith(fetch(req).then(function (r) {
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
    e.respondWith(fetch(req).then(function (r) {
      if (!r || !r.ok) {
        return caches.match('/admin.html').then(function (m) { return m || caches.match('admin.html') || fetch('/admin.html'); });
      }
      var cp = r.clone();
      caches.open(C).then(function (c) { c.put(req, cp); });
      return r;
    }).catch(function () {
      return caches.match('/admin.html').then(function (m) { return m || caches.match('admin.html') || fetch('/admin.html'); });
    }));
    return;
  }
  e.respondWith(fetch(req).then(function (r) {
    var cp = r.clone();
    caches.open(C).then(function (c) { c.put(req, cp); });
    return r;
  }).catch(function () {
    return caches.match(req).then(function (m) { return m || caches.match('/index.html') || caches.match('index.html'); });
  }));
});
