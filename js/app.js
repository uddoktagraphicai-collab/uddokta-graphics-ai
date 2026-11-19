var TX = {}; try { TX = (JSON.parse(localStorage.getItem('eds_c3')) || {}).texts || {}; } catch (e) {}
function T(k, d, h) { var v = TX[k]; v = String(v != null && v !== '' ? v : d).replace(/[<>"]/g, function (c) { return { '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); if (h) v = v.replace(/\*([^*]+)\*/g, '<' + h + ' class="o">$1</' + h + '>'); return v; }
// --- উদ্যোক্তা গ্রাফিক্স AI — ক্লায়েন্ট অ্যাপ (Supabase Edge Functions) ---
// --- ১. কনফিগ, গ্লোবাল স্টেট ও হেল্পার ফাংশন ---
var API_URL = 'https://jfrpvijkfcsfewtljnah.supabase.co/functions/v1/api';
var $ = function (id) { return document.getElementById(id); };
var S = { phone: '', member: null, c: null, tpl: null, cmd: '', copied: false, filter: 'all', after: '', setup: null, payPending: false };
var LS = { get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
var BN = function (n) { return String(n == null ? '' : n).replace(/\d/g, function (d) { return '০১২৩৪৫৬৭৮৯'[d]; }); };
var MON = [(T('t3bd0acef', 'জানুয়ারি')), (T('ta15e222b', 'ফেব্রুয়ারি')), (T('t2d929504', 'মার্চ')), (T('t6d596cff', 'এপ্রিল')), (T('t2f4e0226', 'মে')), (T('tbc0c9bc6', 'জুন')), (T('t8b7dbf28', 'জুলাই')), (T('t405f1ca2', 'আগস্ট')), (T('t504232b6', 'সেপ্টেম্বর')), (T('t65abe4cf', 'অক্টোবর')), (T('tdfddf529', 'নভেম্বর')), (T('ta04b807e', 'ডিসেম্বর'))];
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var safeHref = function (u) { var s = String(u || '').trim(); return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(s) ? s : '#'; };

function imgUrl(u) {
  if (!u || typeof u !== 'string') return u || '';
  if (/^(https?:|\/\/|data:|blob:)/i.test(u)) return u;
  if (u.indexOf('images/') === 0) return u;
  if (u.indexOf('samples/') === 0 || u.indexOf('logos/') === 0) return 'images/' + u;
  if (/^(eps-|icon-)/.test(u)) return 'images/' + u;
  return u;
}
function fixImgs(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) { for (var i = 0; i < obj.length; i++) fixImgs(obj[i]); return obj; }
  for (var k in obj) {
    if (k === 'img' && typeof obj[k] === 'string') {
      obj[k] = imgUrl(obj[k]);
    } else if (typeof obj[k] === 'object') {
      fixImgs(obj[k]);
    }
  }
  return obj;
}

var APPNAME = (T('t9cece10c', 'উদ্যোক্তা গ্রাফিক্স AI'));
var DEFAULT_LOGO = 'images/logos/logo.png';
var DEFAULT_EPS_CHECKOUT = 'images/eps-checkout.png';
var DEFAULT_EPS_FOOTER_DESKTOP = 'images/eps-footer-desktop.png';
var DEFAULT_EPS_FOOTER_MOBILE = 'images/eps-footer-mobile.png';
var LOGO = DEFAULT_LOGO;
function applyAppBrandAssets(st) {
  st = st || {};
  var newLogo = String(st.site_logo || '').trim() || DEFAULT_LOGO;
  LOGO = newLogo;
  var fav = document.querySelector('link[rel="icon"]');
  if (fav) fav.href = newLogo;
  document.querySelectorAll('.brandmark img, .tlogo img').forEach(function (img) {
    if (img.getAttribute('src') !== newLogo) img.src = newLogo;
  });
}
try {
  var _ba = JSON.parse(localStorage.getItem('ug_brand_assets') || 'null');
  if (_ba) applyAppBrandAssets(_ba);
} catch (e) {}

var EYE_ICON = '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
var EYE_OFF_ICON = '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
window.togglePass = function(id, btn) {
  var el = document.getElementById(id);
  if (!el) return;
  var isPass = (el.type === 'password');
  el.type = isPass ? 'text' : 'password';
  if (btn) {
    btn.innerHTML = isPass ? ((typeof I !== 'undefined' && I.eyeOff) || EYE_OFF_ICON) : ((typeof I !== 'undefined' && I.eye) || EYE_ICON);
    var tip = isPass ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন';
    btn.setAttribute('aria-label', tip);
    btn.setAttribute('title', tip);
  }
};
// --- ২. এসভিজি আইকনসমগ্র ---
var I = {
  eye: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff: '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  home: '<svg class="i" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/></svg>',
  globe: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>',
  grid: '<svg class="i" viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  play: '<svg class="i" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m10.5 9.3 4.2 2.7-4.2 2.7z"/></svg>',
  user: '<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c1.2-3.6 4.1-5.4 7.5-5.4s6.3 1.8 7.5 5.4"/></svg>',
  back: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.2"><path d="M15 5l-7 7 7 7"/></svg>',
  arr: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  lock: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  chk: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.4"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  x: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.4"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  zoom: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2.2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  clip: '<svg class="i" viewBox="0 0 24 24"><path d="M20 11.5 12.4 19a5 5 0 0 1-7.1-7.1l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/></svg>',
  out: '<svg class="i" viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4"/><path d="M6 12h10"/></svg>',
  pen: '<svg class="i" viewBox="0 0 24 24" width="16" height="16"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  wifi: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5.5 12a10 10 0 0 1 13 0"/><path d="M9 15.5a5 5 0 0 1 6 0"/><path d="M3 3l18 18"/></svg>',
  clock: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  menu: '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  plus: '<svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  doc: '<svg class="i" viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>',
  wa: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.7-1.2 2.2 2.2 0 00.2-1.2c-.1-.1-.3-.2-.5-.3z"/></svg>',
  call: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.6 3.6 1 1 0 01-.25 1z"/></svg>',
  fb: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M13.5 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V10.4H7.8v3h2.6V21z"/></svg>'
};

// --- ৩. সেন্ট্রাল API ক্লায়েন্ট (Supabase) ---
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB2aWprZmNzZmV3dGxqbmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MjIwODcsImV4cCI6MjExMDI5ODA4N30.p3KtKt4ml0Xn2gSlx_yzF4EKzIBwq_QxHt0VvVqKd5U';
var SUPABASE_RPC_URL = 'https://jfrpvijkfcsfewtljnah.supabase.co/rest/v1/rpc';

function rpc(fn, data) {
  return fetch(SUPABASE_RPC_URL + '/' + fn, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    },
    body: JSON.stringify(data || {})
  }).then(function (r) {
    return r.text();
  }).then(function (t) {
    try { return JSON.parse(t); } catch (e) { return { ok: false, err: t }; }
  });
}

function getSha256(text) {
  if (window.crypto && window.crypto.subtle && window.TextEncoder) {
    return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }
  var hash = 0;
  for (var i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Promise.resolve('fallback_' + Math.abs(hash));
}

function api(action, data) {
  data = data || {}; data.action = action;
  if (typeof S !== 'undefined' && S.tok && !data.tok) data.tok = S.tok;
  if (window.MOCK) return MOCK(data);
  return fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function (r) { return r.text(); }).then(function (t) {
    var parsed;
    try { parsed = JSON.parse(t); } catch (e) { throw new Error((T('t50b6ef8a', 'সার্ভার থেকে ভুল উত্তর:') + ' ') + t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90)); }
    if (parsed && parsed.auth === false && typeof S !== 'undefined' && S.phone) {
      ['eds_phone', 'eds_tok', 'eds_m'].forEach(LS.del);
      S.phone = ''; S.tok = ''; S.member = null;
      toast(parsed.err || 'সেশনের মেয়াদ শেষ, আবার লগইন করুন', 1);
      go('login');
    }
    return parsed;
  });
}
function errMsg(e) { return (e && e.message && e.message.indexOf('সার্ভার') === 0) ? e.message : (T('t76afe202', 'সার্ভারে পৌঁছানো যাচ্ছে না, একটু পরে আবার চেষ্টা করুন')); }
var FB_PIXEL_ID = '', FB_LAST_VIEW = '';
function initMetaPixel(pid) {
  pid = String(pid || '').replace(/\D/g, '');
  if (!pid || pid.length < 8 || FB_PIXEL_ID === pid) return;
  FB_PIXEL_ID = pid;
  try {
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = true; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    }
    window.fbq('init', pid);
    window.fbq('track', 'PageView');
    FB_LAST_VIEW = CUR || 'init';
  } catch (e) {}
}
function fbTrack(ev, params) {
  if (!FB_PIXEL_ID || typeof window.fbq !== 'function') return;
  try {
    if (params) window.fbq('track', ev, params);
    else window.fbq('track', ev);
  } catch (e) {}
}
var _topProgressTimer = null;
function setTopProgress(pct) {
  var b = $('top-progress');
  if (!b) return;
  if (pct === 0) {
    b.style.opacity = '1';
    b.style.width = '0%';
  } else if (pct === 100) {
    b.style.width = '100%';
    setTimeout(function () {
      b.style.opacity = '0';
      setTimeout(function () { b.style.width = '0%'; }, 250);
    }, 200);
  } else {
    b.style.opacity = '1';
    b.style.width = pct + '%';
  }
}
function startTopProgress() {
  setTopProgress(18);
  clearInterval(_topProgressTimer);
  var current = 18;
  _topProgressTimer = setInterval(function () {
    if (current < 85) {
      current += Math.random() * 14;
      setTopProgress(Math.min(current, 85));
    }
  }, 140);
}
function finishTopProgress() {
  clearInterval(_topProgressTimer);
  setTopProgress(100);
}

function busy(on, text) {
  var el = $('loading');
  if (!el) return;
  var txt = $('loading-text');
  if (txt) txt.textContent = text || T('ta2a767e8', 'লোড হচ্ছে…');
  if (on) {
    startTopProgress();
    el.classList.add('show');
    el.style.display = 'flex';
  } else {
    finishTopProgress();
    el.classList.remove('show');
    setTimeout(function () {
      if (!el.classList.contains('show')) el.style.display = 'none';
    }, 220);
  }
}
function toast(m, err) { var t = $('toast'); t.textContent = String(m == null ? '' : m); t.className = 'toast show' + (err ? ' err' : ''); clearTimeout(t._t); t._t = setTimeout(function () { t.className = 'toast'; }, err ? 5000 : 2400); }
var MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmtDate(s) {
  if (!s) return '';
  var raw = String(s).trim();
  var mDateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (mDateOnly) {
    var mi = parseInt(mDateOnly[2], 10) - 1;
    var dn = parseInt(mDateOnly[3], 10);
    if (mi >= 0 && mi < 12) return String(dn).padStart(2, '0') + ' ' + MON_EN[mi] + ' ' + mDateOnly[1];
  }
  try {
    var d = new Date(raw);
    if (!isNaN(d.getTime())) {
      var bd = new Date(d.getTime() + 6 * 3600000);
      var day = String(bd.getUTCDate()).padStart(2, '0');
      var mon = MON_EN[bd.getUTCMonth()];
      var yr = bd.getUTCFullYear();
      var h24 = bd.getUTCHours();
      var ampm = h24 >= 12 ? 'PM' : 'AM';
      var h12 = h24 % 12; if (h12 === 0) h12 = 12;
      var hr = String(h12).padStart(2, '0');
      var min = String(bd.getUTCMinutes()).padStart(2, '0');
      return day + ' ' + mon + ' ' + yr + ', ' + hr + ':' + min + ' ' + ampm;
    }
  } catch (e) {}
  return esc(raw);
}
function gl(s) { try { return Array.from(new Intl.Segmenter('bn', { granularity: 'grapheme' }).segment(s), function (x) { return x.segment; }); } catch (e) { return Array.from(s); } }
function M() { return S.member || {}; }
function paid() { return !!M().paid; }
function locked() { var m = M(); return !m.paid && !(m.left > 0); }
function price() { return (S.c && S.c.settings && S.c.settings.price) || '399'; }
function K() { return (S.c && S.c.contact) || {}; }
function wa(text) { var n = K().whatsapp || ''; return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : ''); }

// --- ৪. পেজ নেভিগেশন ও রাউটার ---
var CUR = '', NOHIST = ['login', 'off'];
var FLOW = { write: 'style', ready: 'style', fix: 'style', member: 'home', wait: 'home', paid: 'home', setup: 'home', policy: 'acct' };
var BARE = ['login', 'off'];
function routeUrl(v) {
  if (location.protocol === 'file:') return '#' + (v || 'home');
  var b = '/app';
  return (v && v !== 'home') ? (b + '/' + v) : (b + '/home');
}
function getRoute() {
  if (location.hash && location.hash.length > 1) {
    return location.hash.slice(1).replace(/^\/+/, '').split('?')[0];
  }
  var p = location.pathname.replace(/\/+$/, '');
  var parts = p.split('/').filter(Boolean);
  for (var i = 0; i < parts.length; i++) {
    if (parts[i] === 'app' || parts[i] === 'app.html') {
      return parts[i + 1] || '';
    }
  }
  if (parts.length === 1 && parts[0] !== 'app' && parts[0] !== 'app.html' && parts[0] !== 'index.html') {
    return parts[0];
  }
  return '';
}
window.addEventListener('popstate', function (e) {
  if ($('zv')) { closeZoom(); history.pushState({ v: CUR }, '', routeUrl(CUR)); return; }
  if (!$('ov').hidden) { closeSheet(); history.pushState({ v: CUR }, '', routeUrl(CUR)); return; }
  if (document.body.classList.contains('drawer-on')) { drawer(false); history.pushState({ v: CUR }, '', routeUrl(CUR)); return; }
  var v = (e.state && e.state.v) || getRoute() || 'home';
  if (NOHIST.indexOf(CUR) > -1 && v !== CUR && !S.phone && CUR === 'login') { go(v, true); return; }
  go(v, true);
});
function goBack() { if (history.state && history.length > 1) history.back(); else go('home'); }
function go(v, fromHist) {
  if (!V[v]) v = 'home';
  var prevCur = CUR;
  if (!fromHist && v !== CUR) { if (NOHIST.indexOf(v) > -1 || !CUR) history.replaceState({ v: v }, '', routeUrl(v)); else history.pushState({ v: v }, '', routeUrl(v)); }
  CUR = v; drawer(false);
  var tab = FLOW[v] || v;
  document.body.className = BARE.indexOf(v) > -1 ? 'bare' : '';
  $('app').innerHTML = (BARE.indexOf(v) > -1 ? '' : side(tab)) + '<section class="view on">' + V[v]() + '</section>' + (BARE.indexOf(v) > -1 ? '' : drawerHtml(tab));
  window.scrollTo(0, 0);
  if (prevCur && v !== prevCur && FB_LAST_VIEW !== v) {
    FB_LAST_VIEW = v;
    fbTrack('PageView');
  }
  if (AFTER[v]) AFTER[v]();
}
function rerender() { var y = window.scrollY; go(CUR, true); window.scrollTo(0, y); }
function drawer(on) { document.body.classList.toggle('drawer-on', !!on); if (on) history.pushState({ v: CUR, d: 1 }, '', routeUrl(CUR)); }
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); var v = a.getAttribute('data-go'); if (v === 'back') goBack(); else nav(v); return; }
  if (e.target.closest('.dov')) { goBack(); }
});
function nav(v) {
  if (v === 'member') { if (!S.phone) { S.after = 'member'; return go('login'); } if (paid()) return go('acct'); return go(S.payPending ? 'wait' : 'member'); }
  if (v === 'acct' && !S.phone) { S.after = ''; return go('login'); }
  if (v === 'setup') { if (!S.phone) return go('login'); S.setup = null; }
  go(v);
}

// --- ৫. লেআউট কম্পোনেন্টস (সাইডবার, হেডার, বটম বার) ---
var TABS = [['home', (T('tc51a0460', 'হোম')), 'home'], ['style', (T('te28e2a93', 'স্টাইল')), 'grid'], ['guide', (T('t5ca7944f', 'গাইড')), 'play'], ['acct', (T('tfaa77e7f', 'অ্যাকাউন্ট')), 'user']];
function memPill() { var m = M(); if (m.paid) return '<span class="pill"><i></i>' + BN(m.daysLeft) + (' ' + T('t7c65ea3d', 'দিন বাকি') + '</span>'); return '<a class="pill lk" data-go="member">' + I.lock + (T('tbc82fc73', 'মেম্বারশিপ নিন') + '</a>'); }
function memPillL() { var m = M(); if (m.paid) return ('<span class="pill"><i></i>' + T('t306387c1', 'মেম্বারশিপ চালু ·') + ' ') + BN(m.daysLeft) + (' ' + T('t7c65ea3d', 'দিন বাকি') + '</span>'); return '<a class="pill lk" data-go="member">' + I.lock + (T('t925d8832', 'মেম্বারশিপ নিন · ৳')) + BN(price()) + (T('t95c37f70', '/বছর') + '</a>'); }
function logoBox(cls) { var m = M(), lg = (m && m.logo_url) || LS.get('eds_logo'); return '<div class="' + (cls || 'blogo') + '">' + (lg ? '<img src="' + esc(lg) + '" alt="">' : '<b>' + esc((m.brand || (T('t1de5edba', 'উ'))).slice(0, 1)) + '</b>') + '</div>'; }
function side(tab) {
  var m = M(), mem;
  if (m.paid) { var pct = Math.max(4, Math.min(100, Math.round((m.daysLeft || 0) / Number((S.c && S.c.settings.days) || 365) * 100))); mem = ('<div class="mem"><div class="lab"><i></i>' + T('t5cf553ff', 'মেম্বারশিপ চালু') + '</div><b>') + BN(m.daysLeft) + (' ' + T('t7c65ea3d', 'দিন বাকি') + '</b><p>' + T('tdfca5565', 'মেয়াদ:') + ' ') + fmtDate(m.expiry) + '</p><div class="bar"><span style="width:' + pct + '%"></span></div></div>'; }
  else mem = '<div class="mem"><div class="lab" style="color:var(--or)"><i style="background:var(--or)"></i>' + (m.expired ? (T('t91e4d553', 'মেয়াদ শেষ')) : (T('t806d0cd6', 'ঘুরে দেখছেন'))) + '</div><b>' + (m.expired ? (T('tb5cd28f6', 'মেয়াদ বাড়িয়ে নিন')) : (T('tab1e6d53', 'সব স্টাইল লক করা'))) + ('</b><p>' + T('t667044e8', '৳')) + BN(price()) + (' ' + T('t39e90da0', '/ বছর · প্রতিদিন ১ টাকা') + '</p><a class="btn" data-go="member" style="height:42px;font-size:15px;margin-top:12px">' + T('tbc82fc73', 'মেম্বারশিপ নিন') + '</a></div>');
  var me = S.phone ? '<div class="me">' + logoBox('av') + '<div>' + esc(m.brand || (T('t527707e0', 'আপনার ব্র্যান্ড'))) + '<small>' + esc(S.phone) + ('</small></div><a data-go="logout" title="' + T('te5ff418f', 'লগআউট') + '">') + I.out + '</a></div>'
    : '<div class="me"><div class="av" style="background:var(--card2);color:var(--mut)">' + I.user.replace('class="i"', 'class="i" width="18" height="18"') + ('</div><div>' + T('tb5baccc8', 'অতিথি') + '<small>' + T('t15b7f843', 'লগইন করা নেই') + '</small></div><a data-go="login" style="font-size:14px;color:var(--ink2);text-decoration:none">' + T('t86b9a1b4', 'লগইন') + '</a></div>');
  var siteBtn = '<a class="site-visit" href="/" target="_blank" rel="noopener">' + I.globe + '<span>মূল ওয়েবসাইট দেখুন</span><span class="sv-arr">↗</span></a>';
  return '<aside class="side"><div class="brandmark"><img src="' + LOGO + '" alt=""><div>' + APPNAME + '<small>by eCom Design Solution</small></div></div><nav class="nav">' +
    TABS.map(function (t) { return '<a data-go="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + I[t[2]] + t[1] + '</a>'; }).join('') + '</nav><div class="sfoot">' + mem + siteBtn + me + '</div></aside>';
}
function topm() { return '<header class="top2"><a class="hb" onclick="drawer(true)">' + I.menu + '</a><div class="brandmark"><img src="' + LOGO + '" alt=""><div>' + APPNAME + '</div></div>' + memPill() + '</header>'; }
function tabs2(tab) {
  var TB = [['home', (T('tc51a0460', 'হোম')), 'home'], ['style', (T('te28e2a93', 'স্টাইল')), 'grid'], null, ['guide', (T('t5ca7944f', 'গাইড')), 'play'], ['acct', (T('tfaa77e7f', 'অ্যাকাউন্ট')), 'user']];
  return '<nav class="tabs2">' + TB.map(function (t) { return t ? '<a data-go="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + I[t[2]] + t[1] + '</a>' : '<a class="fab" data-go="style"><span>' + I.plus + ('</span>' + T('t701f00f3', 'নতুন') + '</a>'); }).join('') + '</nav>';
}
function drawerHtml(tab) {
  var m = M(), P = (S.c && S.c.policies) || [];
  var nav1 = [['home', (T('tc51a0460', 'হোম')), 'home'], ['style', (T('te28e2a93', 'স্টাইল')), 'grid'], ['guide', (T('tcd1a5d7c', 'গাইড ও সাপোর্ট')), 'play'], ['acct', (T('tfaa77e7f', 'অ্যাকাউন্ট')), 'user']];
  if (paid() || m.brand) nav1.push(['setup', (T('t3c51e190', 'ব্র্যান্ড এডিট')), 'pen']);
  var head = paid() ? '<div class="dbr">' + logoBox() + '<div style="flex:1"><b class="n">' + esc(m.brand || '') + ('</b><small><i></i>' + T('t306387c1', 'মেম্বারশিপ চালু ·') + ' ') + BN(m.daysLeft) + (' ' + T('t7c65ea3d', 'দিন বাকি') + '</small><div class="dbar"><span style="width:') + Math.max(4, Math.min(100, Math.round((m.daysLeft || 0) / 3.65))) + '%"></span></div></div></div>'
    : '<div class="dlk"><b>' + (m.expired ? (T('tbae2d2ef', 'মেম্বারশিপের মেয়াদ শেষ')) : (T('tef18c220', 'অ্যাপটা ঘুরে দেখছেন'))) + ('</b><p>' + T('t667044e8', '৳')) + BN(price()) + (' ' + T('tc3e6ee6a', '/ বছর · প্রতিদিন মাত্র ১ টাকা') + '</p><a class="btn" data-go="member">' + T('tbc82fc73', 'মেম্বারশিপ নিন') + '</a>') + (S.phone ? '' : ('<a class="btn sec" data-go="login">' + T('t704040d2', 'লগইন করুন') + '</a>')) + '</div>';
  return '<div class="dov"></div><aside class="dr"><div class="dtop"><div class="brandmark"><img src="' + LOGO + '" alt=""><div>' + APPNAME + '</div></div><a class="hb" onclick="goBack()">' + I.x + '</a></div>' + head +
    '<nav>' + nav1.map(function (n) { return '<a data-go="' + n[0] + '" class="' + (n[0] === tab ? 'on' : '') + '">' + I[n[2]].replace('width="16" height="16"', '') + n[1] + '</a>'; }).join('') + '</nav>' +
    (P.length ? ('<div class="dsec">' + T('t05e84ffe', 'পলিসি') + '</div><nav class="dsm" style="margin-top:0">') + P.map(function (p) { return '<a onclick="openPolicy(\'' + esc(p.key) + '\')">' + I.doc + esc(p.title) + '</a>'; }).join('') + '</nav>' : '') +
    '<div class="dfoot"><a class="site-visit" href="/" target="_blank" rel="noopener">' + I.globe + '<span>মূল ওয়েবসাইট দেখুন</span><span class="sv-arr">↗</span></a>' +
    (S.phone ? '<a data-go="logout">' + I.out + (T('te5ff418f', 'লগআউট') + '</a>') : '') + '</div></aside>';
}
function wtop(title, right) { return '<header class="wtop"><a class="back" data-go="back">' + I.back + '</a><h1>' + title + '</h1><span>' + (right || '') + '</span></header>'; }
function lback(txt) { return '<a class="lback lonly" data-go="back">' + I.back + txt + '</a>'; }
function head(h, sub, pill) { return '<div class="lhead"><div><div class="h1">' + h + '</div>' + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>' + (pill ? '<span class="lonly">' + memPillL() + '</span>' : '') + '</div>'; }
function steps(n) { return '<div class="steps"><div class="' + (n > 1 ? 'done' : 'cur') + ('">' + T('t8788c4ca', '১ · স্টাইল') + '</div><div class="') + (n > 2 ? 'done' : n === 2 ? 'cur' : '') + ('">' + T('t765c038c', '২ · লেখা') + '</div><div class="') + (n === 3 ? 'cur' : '') + ('">' + T('t3fbba423', '৩ · কমান্ড') + '</div></div>'); }
function thumb(t) { return t.img ? '<img src="' + esc(imgUrl(t.img)) + '" alt="" loading="lazy">' : '<div class="ph">' + esc(t.name) + '</div>'; }
function zb(t) { return t.img ? '<span class="zb" data-z="' + esc(imgUrl(t.img)) + '" onclick="zoomImg(this.dataset.z,event)">' + I.zoom + '</span>' : ''; }
function zoomImg(src, ev) {
  if (ev) { ev.stopPropagation(); ev.preventDefault(); }
  src = imgUrl(src);
  if (!src || $('zv')) return;
  var d = document.createElement('div'); d.className = 'zv'; d.id = 'zv';
  d.innerHTML = '<img src="' + esc(src) + '" alt=""><a class="zx" onclick="closeZoom()">' + I.x + '</a>';
  d.addEventListener('click', function () { closeZoom(); });
  document.body.appendChild(d); document.body.classList.add('zv-on');
}
function closeZoom() { var d = $('zv'); if (d) d.remove(); document.body.classList.remove('zv-on'); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeZoom(); });
function catName(id) { var c = ((S.c && S.c.cats) || []).filter(function (x) { return x.id === id; })[0]; return c ? c.name : ''; }

// --- ৬. পেজ ভিউ ও টেমপ্লেট রেন্ডারিং ---
var V = {}, AFTER = {};
V.home = function () {
  var m = M(), c = S.c || { posts: [] };
  var card;
  if (m.brand) card = '<div class="bcard"><div class="bstrip">' + [m.c1, m.c2, m.c3].map(function (x) { return '<span style="background:' + esc(x || '#2F2F37') + '"></span>'; }).join('') + '</div><div class="bbody"><div class="bhead">' + logoBox() + '<div><div class="bname">' + esc(m.brand) + '</div><div class="btag">' + esc(m.tagline || '') + '</div></div>' + (paid() ? '<a class="ghost bedit" data-go="setup">' + I.pen + ('<span class="lonly">' + T('t15ec6584', 'এডিট') + '</span></a>') : '') + '</div><div class="bmeta">' + (m.biz ? '<span class="tag">' + esc(m.biz) + '</span>' : '') + (((m && m.logo_url) || LS.get('eds_logo')) ? ('<span class="tag">' + T('t12119b8c', 'লোগো যুক্ত আছে') + '</span>') : '') + (paid() ? '<a class="tag" onclick="openHistorySheet()" style="cursor:pointer;color:var(--or)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-1px;margin-right:3px"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>ডিজাইন হিস্ট্রি</a>' : '') + ('</div><div class="swl">' + T('t97b81d98', 'ব্র্যান্ডের রং') + '</div><div class="sw">') + [m.c1, m.c2, m.c3].map(function (x) { return '<div><span style="background:' + esc(x || '#2F2F37') + '"></span><em>' + esc(x || '') + '</em></div>'; }).join('') + '</div></div></div>';
  else card = ('<div class="bcard demo"><div class="bbody"><div class="bhead"><div class="blogo"><b>' + T('tcc9293bb', 'লোগো') + '</b></div><div><div class="bname">' + T('t527707e0', 'আপনার ব্র্যান্ড') + '</div><div class="btag">' + T('t35f7c58c', 'মেম্বারশিপ নেওয়ার পর এখানে আপনার লোগো, নাম আর রং বসবে') + '</div></div></div><div class="swl">' + T('t97b81d98', 'ব্র্যান্ডের রং') + '</div><div class="sw"><div><span></span><em>' + T('taeb09803', 'রং ১') + '</em></div><div><span></span><em>' + T('t9056bba1', 'রং ২') + '</em></div><div><span></span><em>' + T('ta58c1b16', 'রং ৩') + '</em></div></div></div></div>');
  var start = paid() ? ('<div class="start lonly"><h3>' + T('t7a4bc152', 'নতুন একটা ডিজাইন শুরু করুন') + '</h3><p>' + T('t555fadf4', 'আপনার ব্র্যান্ডের রং আর লোগো কমান্ডে নিজে থেকেই বসে যাবে।') + '</p><ol><li><b>১</b>' + T('tbf3bc1bf', 'স্টাইল বেছে নিন') + '</li><li><b>২</b>' + T('t0974fdc0', 'দরকারি ঘরগুলো পূরণ করুন') + '</li><li><b>৩</b>' + T('t6d493797', 'কমান্ড কপি করে ChatGPT-তে দিন') + '</li></ol><a class="btn" data-go="style"><span class="plus">+</span>' + T('t316fbe7c', 'নতুন ডিজাইন বানান')) + I.arr + '</a></div>'
    : '<div class="start lonly"><h3>' + (m.expired ? (T('t108a9c64', 'মেয়াদ বাড়িয়ে আবার শুরু করুন')) : (T('t27428ec2', 'মেম্বারশিপ নিয়ে শুরু করুন'))) + ('</h3><p>' + T('t667044e8', '৳')) + BN(price()) + (' ' + T('tbc359041', '/ বছর · মাসে ৳')) + BN(c.settings ? c.settings.monthly : 33) + (' ' + T('t337422af', '· প্রতিদিন মাত্র ১ টাকা') + '</p><ol><li><b>১</b>' + T('tf0346f9f', 'মোবাইল নম্বর দিয়ে লগইন') + '</li><li><b>২</b>' + T('t84c4bec5', 'পেমেন্ট, তারপর মেম্বারশিপ চালু') + '</li><li><b>৩</b>' + T('t3d7dcb33', 'ব্র্যান্ড সেটআপ করে ডিজাইন শুরু') + '</li></ol><a class="btn" data-go="member">' + T('tbc82fc73', 'মেম্বারশিপ নিন')) + I.arr + '</a></div>';
  var mob = paid() ? ('<a class="btn newd" data-go="style"><span class="plus">+</span>' + T('t316fbe7c', 'নতুন ডিজাইন বানান')) + I.arr + '</a>'
    : ('<div class="monly"><a class="btn" data-go="member" style="margin-top:16px">' + T('t925d8832', 'মেম্বারশিপ নিন · ৳')) + BN(price()) + (T('t95c37f70', '/বছর')) + I.arr + ('</a><a class="btn sec" data-go="style">' + T('tbea7246b', 'আগে স্টাইলগুলো দেখুন') + '</a></div>');
  var P = c.posts || [];
  var ups = P.length ? ('<div class="sec"><h2>' + T('t92e2981f', 'সর্বশেষ আপডেট') + '</h2></div><div class="ups">') + P.map(function (p) { return '<a class="up" href="' + esc(safeHref(p.link || '#')) + '" target="_blank" rel="noopener noreferrer">' + (p.img ? '<img src="' + esc(imgUrl(p.img)) + '" alt="" loading="lazy">' : '<div class="ph"></div>') + '<div><small>' + esc(p.tag) + '</small><p>' + esc(p.title) + '</p></div></a>'; }).join('') + '</div>' : '';
  var title = paid() ? (T('tc743244a', 'আজকে কোন *ডিজাইনটা* বানাবেন?', 'span')) : (T('ta78ba8e4', 'অ্যাপটা *ঘুরে দেখুন*', 'span'));
  var sub = paid() ? (T('t2ef7839e', 'স্টাইল বেছে নিন, কয়েকটা ঘর পূরণ করুন, কমান্ড রেডি।')) : (T('t2bfbbdef', 'সব স্টাইল আর কোন স্টাইলে কী লিখতে হয়, দেখে নিন। কমান্ড বানাতে মেম্বারশিপ লাগবে।'));
  if (S.payPending && !paid()) sub = (T('t89f7a3bc', 'আপনার পেমেন্ট যাচাই হচ্ছে। চালু হলেই সব খুলে যাবে।'));
  return topm() + '<div class="main">' + head(('<span style="display:block;font-size:14px;color:var(--mut);font-weight:400;margin-bottom:4px">' + T('tc802677e', 'আসসালামু আলাইকুম') + '</span>') + title, sub, 1) +
    (m.expired ? '<div class="lockbar" data-go="member">' + I.lock + ('<div><b>' + T('tbae2d2ef', 'মেম্বারশিপের মেয়াদ শেষ') + '</b><span>' + T('tf04447c9', 'মেয়াদ বাড়ালে আবার সব স্টাইল খুলে যাবে') + '</span></div></div>') : '') +
    '<div class="homegrid">' + card + start + '</div>' + mob + ups + '</div>' + tabs2('home');
};
V.style = function () {
  var c = S.c; if (!c) return topm() + ('<div class="main"><p class="empty">' + T('ta2a767e8', 'লোড হচ্ছে…') + '</p></div>') + tabs2('style');
  var cats = c.cats.filter(function (x) { return c.tpls.some(function (t) { return t.cat === x.id; }); });
  var chips = '<div class="chips"><span class="chip' + (S.filter === 'all' ? ' on' : '') + ('" onclick="setFilter(\'all\')">' + T('t05a1920d', 'সব') + ' <b>') + BN(c.tpls.length) + '</b></span>' + cats.map(function (x) { var n = c.tpls.filter(function (t) { return t.cat === x.id; }).length; return '<span class="chip' + (S.filter === x.id ? ' on' : '') + '" onclick="setFilter(\'' + esc(x.id) + '\')">' + esc(x.name) + ' <b>' + BN(n) + '</b></span>'; }).join('') + '</div>';
  var L = !paid();
  var list = c.tpls.filter(function (t) { return S.filter === 'all' || t.cat === S.filter; }).slice().sort(function (a, b) { return (b.pop ? 1 : 0) - (a.pop ? 1 : 0); });
  var grid = '<div class="grid" id="sgrid">' + (list.map(function (t) { return '<a class="st" onclick="openTpl(\'' + esc(t.id) + '\')">' + (L ? '<span class="lk">' + I.lock + '</span>' : '') + thumb(t) + zb(t) + '<div><h3>' + esc(t.name) + '</h3><p>' + esc(catName(t.cat)) + (t.pop ? ('<span class="pop">' + T('ta23fec95', 'জনপ্রিয়') + '</span>') : '') + '</p></div></a>'; }).join('') || ('<p class="empty">' + T('t7e00b8e6', 'এই ভাগে এখনো কোনো স্টাইল নেই') + '</p>')) + '</div>';
  return topm() + '<div class="main">' + head(L ? (T('tdfa5a366', 'সব *স্টাইল* দেখুন', 'span')) : (T('tff935a29', 'একটা *স্টাইল* বেছে নিন', 'span')), L ? (T('t664d6768', 'যেকোনো স্টাইলে ট্যাপ করে দেখুন কী কী লিখতে হয়।')) : (T('t05b40446', 'যেমন পোস্ট বানাতে চান, তেমন স্টাইলে ট্যাপ করুন।')), 1) + chips + grid + '</div>' + tabs2('style');
};
function setFilter(id) { S.filter = id; rerender(); }
function openTpl(id) { var t = S.c.tpls.filter(function (x) { return x.id === id; })[0]; if (!t) return; S.tpl = t; S.vals = {}; go('write'); }
function fieldHtml(f, i, L) {
  var v = (S.vals && S.vals[i]) || '', n = gl(v).length;
  var ph = f.ex ? (T('t706f9437', 'যেমন:') + ' ') + f.ex : (T('t_f_ph', 'এখানে আপনার লেখা দিন…'));
  var box = f.lim > 60 ? '<textarea class="in" rows="2" style="height:auto;padding-top:12px;min-height:76px" data-i="' + i + '" ' + (L ? 'disabled ' : '') + 'placeholder="' + esc(ph) + '" oninput="cnt(this)">' + esc(v) + '</textarea>'
    : '<input class="in" data-i="' + i + '" ' + (L ? 'disabled ' : '') + 'value="' + esc(v) + '" placeholder="' + esc(ph) + '" oninput="cnt(this)">';
  return '<div class="fl' + (f.lim > 20 ? ' full' : '') + '"><label><span>' + esc(f.name) + (f.req ? '' : ('<em>' + T('t34544152', 'ঐচ্ছিক') + '</em>')) + '</span><small id="cn' + i + '">' + BN(n) + '/' + BN(f.lim) + '</small></label>' + box + '</div>';
}
V.write = function () {
  var t = S.tpl; if (!t) return V.style();
  var L = !paid(), fd = t.fdef || [];
  var pick = '<div class="pick">' + (t.img ? '<img class="zi" data-z="' + esc(imgUrl(t.img)) + '" onclick="zoomImg(this.dataset.z,event)" src="' + esc(imgUrl(t.img)) + '" alt="">' : '<div class="ph" style="width:68px;height:68px;border-radius:8px">' + '' + '</div>') + '<div><h3>' + esc(t.name) + '</h3><p>' + esc(catName(t.cat)) + ('</p></div><a class="ghost" data-go="back">' + T('tebbe473a', 'বদলান') + '</a></div>');
  var need = t.attach ? '<div class="need">' + I.clip + ('<span>' + T('tb694c355', 'ChatGPT-তে সাথে দিবেন:') + ' <b>') + esc(t.attach) + '</b></span></div>' : '';
  var fields = fd.length ? '<div class="fgrid">' + fd.map(function (f, i) { return fieldHtml(f, i, L); }).join('') + '</div>' : ('<div class="fhs" style="margin-top:10px">' + T('t3ab3cf34', 'এই স্টাইলে কিছু লিখতে হবে না। শুধু নিচের বাটনে চাপুন, তারপর ChatGPT-তে ছবি আর লোগো দিন।') + '</div>');
  var cta = L ? '<div class="cta"><a class="btn" data-go="member">' + I.lock + (T('tc3a18770', 'মেম্বারশিপ নিয়ে কমান্ড বানান') + '</a><p>' + T('t667044e8', '৳')) + BN(price()) + (' ' + T('t6248e81d', '/ বছর · প্রতিদিন মাত্র ১ টাকা · যত খুশি ডিজাইন') + '</p></div>')
    : ('<div class="cta"><a class="btn" onclick="doCmd()">' + T('t90b3fa5b', 'কাস্টমাইজড কমান্ড বানান')) + I.arr + ('</a><p>' + T('t41f304a5', 'আপনার ব্র্যান্ডের রং আর লোগোর নিয়ম কমান্ডে নিজে থেকেই যুক্ত হবে') + '</p></div>');
  return wtop(L ? (T('t9895f452', 'লেখার ঘর')) : (T('tb821bf1e', 'লেখাগুলো দিন')), L ? '' : (T('t7b52d211', 'ধাপ ২/৩'))) + '<div class="wmain">' + lback((T('t8a7cd058', 'স্টাইলে ফিরে যান'))) +
    '<div class="lonly">' + head((T('t20c50749', 'লেখাগুলো *দিন*', 'span')), (T('t481a3a77', 'যেটুকু লেখা ডিজাইনে থাকবে, শুধু সেটুকু লিখুন।'))) + '</div>' + steps(2) +
    '<div class="wl"><aside class="wsample lonly">' + (t.img ? '<img class="zi" data-z="' + esc(imgUrl(t.img)) + '" onclick="zoomImg(this.dataset.z,event)" src="' + esc(imgUrl(t.img)) + '" alt="">' : '') + '<div class="wsb"><h3>' + esc(t.name) + '</h3><p>' + esc(catName(t.cat)) + '</p>' + need + ('<a class="ghost" data-go="back">' + T('tf21357fb', 'অন্য স্টাইল বেছে নিন') + '</a></div></aside>') +
    '<div class="wform">' + pick + need + ('<div class="fh">' + T('tebe29e6a', 'ডিজাইনের লেখা') + '</div><div class="fhs">') + (L ? (T('t1f84cfa2', 'এই স্টাইলে এই ঘরগুলো পূরণ করতে হবে। মেম্বারশিপ নিলে লিখতে পারবেন।')) : (T('t34f77970', 'উদাহরণ দেখে নিজের মতো লিখুন। ঐচ্ছিক ঘর খালি রাখতে পারেন।'))) + '</div>' + fields + cta + '</div></div></div>';
};
function cnt(el) {
  var i = el.dataset.i, f = S.tpl.fdef[i], g = gl(el.value);
  if (g.length > f.lim) { el.value = g.slice(0, f.lim).join(''); g = g.slice(0, f.lim); }
  S.vals[i] = el.value;
  var c = $('cn' + i); c.textContent = BN(g.length) + '/' + BN(f.lim); c.classList.toggle('full', g.length >= f.lim);
}
function doCmd() {
  if (!paid()) return nav('member');
  var vals = {}, fd = S.tpl.fdef || [], miss = '';
  document.querySelectorAll('.wform .in').forEach(function (el) { var v = el.value.trim(); if (v) vals[el.dataset.i] = v; });
  fd.forEach(function (f, i) { if (f.req && !vals[i] && !miss) miss = f.name; });
  if (miss) return toast('"' + miss + (T('t5b117ba5', '" ঘরটা লিখুন')), 1);
  busy(1);
  api('cmd', { phone: S.phone, tid: S.tpl.id, vals: vals }).then(function (r) {
    busy(0); if (!r.ok) return toast(r.err, 1);
    if (r.member) setMember(r.member);
    if (r.locked) return nav('member');
    S.cmd = r.cmd; S.copied = false; S.cmdFail = false; go('ready');
  }).catch(function (e) { busy(0); toast(errMsg(e), 1); });
}
V.ready = function () {
  var t = S.tpl || {}, on = S.copied;
  var prev = esc((S.cmd || '').split('\n').slice(0, 7).join('\n'));
  return wtop((T('t3791b727', 'কমান্ড রেডি')), (T('teea2d5c5', 'ধাপ ৩/৩'))) + '<div class="wmain">' + lback((T('t19e67d85', 'লেখায় ফিরে যান'))) + steps(3) +
    '<div class="done-h"><span class="tick">' + I.chk + ('</span><div><div class="h1" style="font-size:24px;margin:0">' + T('t8fce7fcc', 'কাস্টমাইজড কমান্ড *রেডি*', 'span') + '</div><div class="sub" style="margin-top:2px">') + esc(t.name) + ' · ' + esc(M().brand || '') + '</div></div></div>' +
    ('<div class="done-wrap"><div><div class="cmd"><div class="ch"><b>' + T('tef7841d5', 'আপনার কাস্টমাইজড কমান্ড') + '</b><span>' + T('t2c79a8ff', 'পুরোটাই কপি হবে') + '</span></div><pre>') + prev + '</pre><div class="fade"></div></div>' +
    (S.cmdFail ? ('<div class="cmdbox"><p>' + T('te73f05ac', 'কপি হয়নি। নিচের লেখায় চেপে ধরে "Select all", তারপর "Copy" করুন।') + '</p><textarea id="cmdta" readonly>') + esc(S.cmd) + '</textarea></div>' : '') + '</div>' +
    '<div class="done-side"><ol class="nlist"><li class="' + (on ? '' : 'on') + ('"><b>১</b><span>' + T('t430aa22c', 'নিচের বাটনে চেপে কমান্ড কপি করুন') + '</span></li><li class="') + (on ? 'on' : '') + ('"><b>২</b><span>' + T('t27b0d1eb', 'ChatGPT খুলে কমান্ড পেস্ট করুন') + '</span></li><li><b>৩</b><span>' + T('t71aee20c', 'সাথে') + ' <b style="all:unset;color:var(--ink)">') + esc(t.attach || (T('tcc9293bb', 'লোগো'))) + ('</b> ' + T('tab406271', 'অ্যাটাচ করে সেন্ড করুন') + '</span></li></ol>') +
    '<div class="acts">' + (on ? '<a class="btn done" onclick="copyCmd()">' + I.chk + (T('tc56af407', 'কপি হয়েছে') + '</a><a class="btn go" href="' + T('t8e5f728a', 'https://chatgpt.com/') + '" target="_blank" rel="noopener">' + T('t713a9b7e', 'ChatGPT-তে যান')) + I.arr + '</a>' : ('<a class="btn" onclick="copyCmd()">' + T('t92ad8eea', 'কমান্ড কপি করুন') + '</a><a class="btn off">' + T('t713a9b7e', 'ChatGPT-তে যান') + '</a>')) + '</div></div></div>' +
    ('<a class="fixlink" data-go="fix"><span>' + T('t91abed36', 'ডিজাইনে কোনো সমস্যা হয়েছে?') + '<small>' + T('t6987706c', 'রেডি লাইন কপি করে একই চ্যাটে দিন') + '</small></span>') + I.arr + '</a></div>';
};
function copyText(t, ok, fail) {
  var fb = function () { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); var good = false; try { good = document.execCommand('copy'); } catch (e) {} a.remove(); if (good) ok(); else fail(); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(ok, fb); else fb();
}
function copyCmd() { if (!S.cmd) return; copyText(S.cmd, function () { S.copied = true; S.cmdFail = false; rerender(); toast((T('t326a08d3', 'কাস্টমাইজড কমান্ড কপি হয়েছে'))); }, function () { S.cmdFail = true; rerender(); toast((T('tff61bb77', 'কপি হয়নি, নিচের লেখা থেকে কপি করুন')), 1); }); }
V.fix = function () {
  var F = (S.c && S.c.fixes) || [];
  return wtop((T('t65c93e4d', 'ঠিক করুন'))) + '<div class="wmain">' + lback((T('tfecdd8f6', 'কমান্ডে ফিরে যান'))) + head((T('t5e13f3c1', 'ডিজাইন *ঠিক করুন*', 'span')), (T('tad2e2804', 'যে সমস্যা হয়েছে সেটা চাপুন। লেখা কপি হবে, একই চ্যাটে পেস্ট করুন।'))) +
    '<div class="fxs">' + F.map(function (f, i) { return '<div class="fx" id="fx' + i + '"><div><b>' + esc(f.t) + '</b><span>' + esc(String(f.line || '').slice(0, 60)) + (String(f.line || '').length > 60 ? '…' : '') + '</span></div><a class="ghost" onclick="copyFix(' + i + (')">' + T('tbabd82c0', 'কপি') + '</a></div>'); }).join('') + '</div></div>';
};
function copyFix(i) { copyText(S.c.fixes[i].line, function () { var e = $('fx' + i); if (e) { e.classList.add('cp'); e.querySelector('.ghost').textContent = (T('tc56af407', 'কপি হয়েছে')); } toast((T('tc442460f', 'লাইন কপি হয়েছে'))); }, function () { toast((T('t2d3122fb', 'কপি হয়নি, আবার চাপুন')), 1); }); }

// --- ৭. লগইন ও ওটিপি ভেরিফিকেশন (বিকাশ মডেল: ওটিপি + পাসওয়ার্ড) ---
var LOGIN_STEP = 'phone'; // 'phone' | 'otp' | 'set_password' | 'password'
var PENDING_PHONE = '';
var PENDING_MEMBER = null;
var PENDING_PAY = false;
var PENDING_SETUP_TOKEN = '';
var OTP_TIMER = null;
var OTP_SECONDS = 60;

V.login = function () {
  var aside = '<aside class="apanel"><div class="brandmark"><img src="' + LOGO + '" alt="" style="width:36px;height:36px"><div>' + APPNAME + ('<small>by eCom Design Solution</small></div></div><div><h2>' + T('t776bb62f', 'মাত্র *১ টাকায়* আপনার ব্র্যান্ডের প্রফেশনাল গ্রাফিক ডিজাইন', 'span') + '</h2><p>' + T('t91286b8e', 'পছন্দের স্টাইল বাছুন, দুই লাইন লিখুন, কাস্টমাইজড কমান্ড কপি করে ChatGPT-তে দিন।') + '</p></div><div class="ag">') +
    ((S.c && S.c.tpls) || []).filter(function (t) { return t.img; }).slice(0, 4).map(function (t) { return '<img src="' + esc(imgUrl(t.img)) + '" alt="">'; }).join('') + '</div></aside>';

  var formBody = '';
  var isEmail = Boolean(PENDING_PHONE && PENDING_PHONE.indexOf('@') !== -1);
  var targetLabel = isEmail ? esc(PENDING_PHONE) : ('+৮৮ ' + esc(PENDING_PHONE));
  var changeLabel = isEmail ? 'ইমেইল পরিবর্তন' : 'নম্বর পরিবর্তন';

  if (LOGIN_STEP === 'otp') {
    formBody = '<a class="lback" onclick="editPhone()" style="display:inline-flex;cursor:pointer">' + I.back + changeLabel + '</a>' +
      '<div class="h1">ওটিপি কোড <em>লিখুন</em></div>' +
      '<div class="sub"><span style="color:var(--ink);font-weight:700">' + targetLabel + '</span>-এ ৪ সংখ্যার ওটিপি পাঠানো হয়েছে।</div>' +
      '<div class="fl"><label><span>৪ সংখ্যার ওটিপি কোড</span></label><input class="in otp-in" id="lotp" type="tel" inputmode="numeric" placeholder="• • • •" maxlength="4" autocomplete="one-time-code" onkeydown="if(event.key===\'Enter\')doVerifyOtp()"></div>' +
      '<div class="small" id="otp-timer-box" style="margin-top:16px">পুনরায় কোড পাঠান (<span id="otp-sec">' + OTP_SECONDS + '</span>s)</div>' +
      '<div style="height:10px"></div>' +
      '<a class="btn" onclick="doVerifyOtp()">ওটিপি যাচাই করুন' + I.arr + '</a>' +
      '<p class="terms" style="margin-top:16px"><a onclick="editPhone()" style="color:var(--mut);cursor:pointer">ভুল হয়েছে? ' + changeLabel + ' করুন</a></p>';
  } else if (LOGIN_STEP === 'set_password') {
    formBody = '<a class="lback" onclick="editPhone()" style="display:inline-flex;cursor:pointer">' + I.back + changeLabel + '</a>' +
      '<div class="h1">পাসওয়ার্ড <em>সেট করুন</em></div>' +
      '<div class="sub"><span style="color:var(--ink);font-weight:700">' + targetLabel + '</span>-এর জন্য একটি পাসওয়ার্ড বা পিন সেট করুন। পরের বার ওটিপি ছাড়াই এটি দিয়ে সরাসরি লগইন করতে পারবেন।</div>' +
      '<div class="fl"><label><span>নতুন পাসওয়ার্ড</span></label><div class="pass-wrap"><input class="in" id="npass" type="password" placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন" maxlength="64" onkeydown="if(event.key===\'Enter\')doSetPassword()"><button type="button" class="eye-btn" onclick="togglePass(\'npass\',this)" aria-label="পাসওয়ার্ড দেখুন" title="পাসওয়ার্ড দেখুন">' + I.eye + '</button></div></div>' +
      '<div class="fl" style="margin-top:12px"><label><span>পাসওয়ার্ড নিশ্চিত করুন</span></label><div class="pass-wrap"><input class="in" id="cpass" type="password" placeholder="একই পাসওয়ার্ড পুনরায় লিখুন" maxlength="64" onkeydown="if(event.key===\'Enter\')doSetPassword()"><button type="button" class="eye-btn" onclick="togglePass(\'cpass\',this)" aria-label="পাসওয়ার্ড দেখুন" title="পাসওয়ার্ড দেখুন">' + I.eye + '</button></div></div>' +
      '<div style="height:12px"></div>' +
      '<a class="btn" onclick="doSetPassword()">পাসওয়ার্ড সেভ ও লগইন করুন' + I.arr + '</a>' +
      '<p class="terms" style="margin-top:16px"><a onclick="editPhone()" style="color:var(--mut);cursor:pointer">' + changeLabel + ' করতে চান? ফিরে যান</a></p>';
  } else if (LOGIN_STEP === 'password') {
    formBody = '<a class="lback" onclick="editPhone()" style="display:inline-flex;cursor:pointer">' + I.back + changeLabel + '</a>' +
      '<div class="h1">পাসওয়ার্ড <em>লিখুন</em></div>' +
      '<div class="sub"><span style="color:var(--ink);font-weight:700">' + targetLabel + '</span>-এর পাসওয়ার্ড দিয়ে লগইন করুন।</div>' +
      '<div class="fl"><label><span>পাসওয়ার্ড / পিন</span></label><div class="pass-wrap"><input class="in" id="lpass" type="password" placeholder="আপনার পাসওয়ার্ড লিখুন" maxlength="20" onkeydown="if(event.key===\'Enter\')doLoginPassword()"><button type="button" class="eye-btn" onclick="togglePass(\'lpass\',this)" aria-label="পাসওয়ার্ড দেখুন" title="পাসওয়ার্ড দেখুন">' + I.eye + '</button></div></div>' +
      '<div style="height:12px"></div>' +
      '<a class="btn" onclick="doLoginPassword()">লগইন করুন' + I.arr + '</a>' +
      '<p class="terms" style="margin-top:18px"><a onclick="doForgotPassword()" style="color:var(--or);font-weight:600;cursor:pointer">পাসওয়ার্ড ভুলে গেছেন? ওটিপি দিয়ে রিসেট করুন</a></p>' +
      '<p class="terms" style="margin-top:8px"><a onclick="editPhone()" style="color:var(--mut);cursor:pointer">ভুল হয়েছে? ' + changeLabel + ' করুন</a></p>';
  } else {
    formBody = '<a class="lback" data-go="back" style="display:inline-flex">' + I.back + (T('tb2052257', 'ফিরে যান') + '</a><div class="h1">মোবাইল বা ইমেইল <em>দিন</em></div><div class="sub">যে নম্বর বা ইমেইল দিয়ে মেম্বারশিপ নেবেন, সেটা দিন (প্রবাসী কাস্টমাররা ইমেইল এড্রেস দিয়ে লগইন করতে পারবেন)।</div>') +
      ('<div class="fl"><label><span>মোবাইল নম্বর অথবা ইমেইল</span><small>যেমন: 017... অথবা name@gmail.com</small></label><input class="in" id="lphone" type="text" placeholder="মোবাইল নম্বর (017...) অথবা ইমেইল এড্রেস" value="' + esc(PENDING_PHONE) + '" onkeydown="if(event.key===\'Enter\')doPhoneSubmit()"></div><div style="height:22px"></div>') +
      ('<a class="btn" onclick="doPhoneSubmit()">' + T('t67d12dbe', 'চালিয়ে যান')) + I.arr + ('</a><p class="terms">' + T('t56007083', 'চালিয়ে গেলে আপনি') + ' <a onclick="openPolicy(\'terms\')" style="color:var(--ink2);cursor:pointer">' + T('tb97fa88f', 'শর্তাবলি') + '</a> ' + T('t098326f9', 'আর') + ' <a onclick="openPolicy(\'privacy\')" style="color:var(--ink2);cursor:pointer">' + T('t419acdf7', 'প্রাইভেসি পলিসি') + '</a> ' + T('ta418880d', 'মেনে নিচ্ছেন') + '</p>');
  }

  return '<div class="auth">' + aside + '<div class="aform"><div class="alogo"><img src="' + LOGO + '" alt="">' + APPNAME + '</div><div class="abox">' + formBody + '</div></div></div>';
};

AFTER.login = function () {
  if (LOGIN_STEP === 'otp') {
    var otp = $('lotp');
    if (otp) setTimeout(function () { otp.focus(); }, 80);
  } else if (LOGIN_STEP === 'set_password') {
    var np = $('npass');
    if (np) setTimeout(function () { np.focus(); }, 80);
  } else if (LOGIN_STEP === 'password') {
    var lp = $('lpass');
    if (lp) setTimeout(function () { lp.focus(); }, 80);
  } else {
    var p = $('lphone');
    if (p) setTimeout(function () { p.focus(); }, 80);
  }
};

function normAuthInput(raw) {
  var s = String(raw || '').trim();
  if (!s) return { val: '', type: '' };
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(s)) {
    return { val: s.toLowerCase(), type: 'email' };
  }
  var p = s.replace(/\D/g, '');
  if (p.indexOf('880') === 0) p = p.slice(2);
  if (/^01\d{9}$/.test(p)) {
    return { val: p, type: 'phone' };
  }
  return { val: '', type: '' };
}

function doLogin() {
  doPhoneSubmit();
}

function doPhoneSubmit() {
  var pInput = $('lphone');
  var raw = pInput ? pInput.value : PENDING_PHONE;
  var parsed = normAuthInput(raw);
  if (!parsed.type) {
    return toast('১১ সংখ্যার মোবাইল নম্বর অথবা সঠিক ইমেইল এড্রেস দিন', 1);
  }
  PENDING_PHONE = parsed.val;
  busy(1);

  rpc('check_member_auth', { p_phone: parsed.val }).then(function (auth) {
    busy(0);
    if (auth && auth.verified && auth.has_password) {
      LOGIN_STEP = 'password';
      renderLogin();
      toast('পাসওয়ার্ড লিখে লগইন করুন');
    } else {
      doSendOtp();
    }
  }).catch(function () {
    busy(0);
    doSendOtp();
  });
}

function doSendOtp() {
  var p = PENDING_PHONE;
  busy(1);
  api('login', { phone: p }).then(function (r) {
    busy(0);
    if (!r.ok) return toast(r.err, 1);
    PENDING_MEMBER = r.member;
    PENDING_PAY = !!r.pending;
    LOGIN_STEP = 'otp';
    renderLogin();
    startOtpCountdown();
    if (p.indexOf('@') !== -1) {
      toast('আপনার ইমেইলে ৪ ডিজিটের ওটিপি পাঠানো হয়েছে ✓');
    } else {
      toast('আপনার মোবাইলে ৪ ডিজিটের ওটিপি পাঠানো হয়েছে ✓');
    }
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e) || 'ওটিপি পাঠাতে সমস্যা হয়েছে। তথ্য যাচাই করুন।', 1);
  });
}

function startOtpCountdown() {
  clearInterval(OTP_TIMER);
  OTP_SECONDS = 60;
  OTP_TIMER = setInterval(function () {
    OTP_SECONDS--;
    var box = $('otp-timer-box');
    if (!box) { clearInterval(OTP_TIMER); return; }
    if (OTP_SECONDS > 0) {
      box.innerHTML = 'পুনরায় কোড পাঠান (<span id="otp-sec">' + OTP_SECONDS + '</span>s)';
    } else {
      clearInterval(OTP_TIMER);
      box.innerHTML = '<a onclick="doSendOtp()" style="color:var(--or);font-weight:700;cursor:pointer">পুনরায় ওটিপি পাঠান</a>';
    }
  }, 1000);
}

function editPhone() {
  clearInterval(OTP_TIMER);
  LOGIN_STEP = 'phone';
  renderLogin();
}

function renderLogin() {
  var container = $('app');
  if (container && CUR === 'login') {
    container.innerHTML = V.login();
    AFTER.login();
  }
}

function doVerifyOtp() {
  var otpEl = $('lotp');
  var enteredOtp = otpEl ? otpEl.value.replace(/\D/g, '') : '';
  if (!enteredOtp || enteredOtp.length < 4) {
    return toast('৪ সংখ্যার ওটিপি কোড লিখুন', 1);
  }
  busy(1);

  rpc('verify_member_otp_and_grant', { p_phone: PENDING_PHONE, p_otp: enteredOtp }).then(function (r) {
    busy(0);
    if (!r || !r.ok) {
      return toast((r && r.err) || (r && r.message) || 'ভুল ওটিপি কোড! সঠিক কোডটি দিন।', 1);
    }
    PENDING_SETUP_TOKEN = r.setup_token || '';
    clearInterval(OTP_TIMER);
    LOGIN_STEP = 'set_password';
    renderLogin();
    toast('ওটিপি যাচাই হয়েছে! এবার পাসওয়ার্ড সেট করুন ✓');
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e) || 'ওটিপি যাচাই করতে সমস্যা হয়েছে', 1);
  });
}

function doSetPassword() {
  var np = $('npass') ? $('npass').value : '';
  var cp = $('cpass') ? $('cpass').value : '';
  if (!np || np.length < 6) {
    return toast('কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড লিখুন', 1);
  }
  if (np !== cp) {
    return toast('দুই ঘরের পাসওয়ার্ড মেলেনি! একই পাসওয়ার্ড দিন', 1);
  }
  if (!PENDING_SETUP_TOKEN) {
    return toast('আগে ওটিপি যাচাই করুন', 1);
  }
  busy(1);
  api('set_password', {
    phone: PENDING_PHONE,
    password: np,
    setup_token: PENDING_SETUP_TOKEN
  }).then(function (r) {
    if (!r || !r.ok) {
      busy(0);
      toast((r && r.err) || 'পাসওয়ার্ড সেট করা যায়নি, আবার ওটিপি যাচাই করুন', 1);
      return;
    }
    PENDING_SETUP_TOKEN = '';
    S.tok = r.session_token || '';
    if (S.tok) LS.set('eds_tok', S.tok);
    return api('me', { phone: PENDING_PHONE, tok: S.tok }).then(function (meRes) {
      busy(0);
      S.phone = PENDING_PHONE;
      LS.set('eds_phone', PENDING_PHONE);
      if (meRes && meRes.ok && meRes.member) {
        setMember(meRes.member);
        S.payPending = !!meRes.pending;
      } else if (r.member) {
        setMember(r.member);
      } else {
        setMember(PENDING_MEMBER || { phone: PENDING_PHONE, status: 'new', paid: false, verified: true });
      }
      LOGIN_STEP = 'phone';
      fbTrack('CompleteRegistration', { content_name: 'Member Account', status: true });
      toast('পাসওয়ার্ড সেট ও ভেরিফিকেশন সম্পন্ন হয়েছে ✓');
      afterLogin();
    });
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e) || 'পাসওয়ার্ড সেট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন', 1);
  });
}

function doLoginPassword() {
  var lp = $('lpass') ? $('lpass').value : '';
  if (!lp) return toast('পাসওয়ার্ড লিখুন', 1);
  busy(1);
  api('login_password', { phone: PENDING_PHONE, password: lp }).then(function (r) {
    if (!r || !r.ok) {
      busy(0);
      toast((r && r.err) || 'ভুল পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন বা রিসেট করুন', 1);
      return;
    }
    S.tok = r.session_token || '';
    if (S.tok) LS.set('eds_tok', S.tok);
    return api('me', { phone: PENDING_PHONE, tok: S.tok }).then(function (meRes) {
      busy(0);
      S.phone = PENDING_PHONE;
      LS.set('eds_phone', PENDING_PHONE);
      if (meRes && meRes.ok && meRes.member) {
        setMember(meRes.member);
        S.payPending = !!meRes.pending;
      } else if (r.member) {
        setMember(r.member);
      } else {
        setMember({ phone: PENDING_PHONE, status: 'new', paid: false, verified: true });
      }
      LOGIN_STEP = 'phone';
      toast('সফলভাবে লগইন হয়েছে ✓');
      afterLogin();
    });
  }).catch(function (e) {
    busy(0);
    toast('লগইন করা যায়নি: ' + (e.message || 'সার্ভারে পৌঁছানো যাচ্ছে না'), 1);
  });
}

function doForgotPassword() {
  busy(1);
  api('login', { phone: PENDING_PHONE }).then(function (r) {
    busy(0);
    if (!r.ok) return toast(r.err || 'সমস্যা হয়েছে', 1);
    LOGIN_STEP = 'otp';
    renderLogin();
    startOtpCountdown();
    if (PENDING_PHONE && PENDING_PHONE.indexOf('@') !== -1) {
      toast('পাসওয়ার্ড রিসেট করতে ইমেইলে ওটিপি পাঠানো হয়েছে ✓');
    } else {
      toast('পাসওয়ার্ড রিসেট করতে মোবাইলে ওটিপি পাঠানো হয়েছে ✓');
    }
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e) || 'ওটিপি পাঠাতে সমস্যা হয়েছে', 1);
  });
}

function afterLogin() {
  var m = M(), a = S.after; S.after = '';
  if (m.blocked) { toast((T('t61693e01', 'অ্যাকাউন্টটা বন্ধ আছে, WhatsApp-এ যোগাযোগ করুন')), 1); return go('home'); }
  if (m.paid) return m.brand ? go(a && a !== 'member' ? a : 'home') : (S.setup = null, go('setup'));
  go(S.payPending ? 'wait' : 'member');
}
function setMember(m) {
  S.member = m;
  LS.set('eds_m', m);
  if (m && m.logo_url) {
    LS.set('eds_logo', m.logo_url);
  }
}

// --- ৮. মেম্বারশিপ ও পেমেন্ট হিস্ট্রি ---
function payCalc() {
  var st = (S.c && S.c.settings) || {};
  var base = Number(st.price) || Number(price()) || 0;
  var rawFee = st.gateway_fee;
  var pct = (rawFee !== undefined && rawFee !== null && String(rawFee).trim() !== '')
    ? Math.max(0, parseFloat(rawFee) || 0)
    : 0;
  var fee = (base > 0 && pct > 0)
    ? Math.ceil(Number(((base * pct) / 100).toFixed(4)))
    : 0;
  return { base: base, pct: pct, fee: fee, total: base + fee, days: Number(st.days) || 365 };
}
function refreshPaySettings(silent) {
  return rpc('get_public_pay_settings').then(function (r) {
    if (r && r.ok) {
      if (!S.c) S.c = {};
      if (!S.c.settings) S.c.settings = {};
      var changed = (
        String(S.c.settings.price || '') !== String(r.price) ||
        String(S.c.settings.days || '') !== String(r.days) ||
        String(S.c.settings.monthly || '') !== String(r.monthly) ||
        String(S.c.settings.gateway_fee !== undefined ? S.c.settings.gateway_fee : '') !== String(r.gateway_fee) ||
        String(S.c.settings.site_logo || '') !== String(r.site_logo || '') ||
        String(S.c.settings.eps_checkout_banner || '') !== String(r.eps_checkout_banner || '') ||
        String(S.c.settings.eps_footer_desktop || '') !== String(r.eps_footer_desktop || '') ||
        String(S.c.settings.eps_footer_mobile || '') !== String(r.eps_footer_mobile || '')
      );
      S.c.settings.price = String(r.price);
      S.c.settings.monthly = String(r.monthly);
      S.c.settings.days = String(r.days);
      S.c.settings.gateway_fee = String(r.gateway_fee);
      S.c.settings.meta_pixel_id = String(r.meta_pixel_id || '');
      S.c.settings.site_logo = String(r.site_logo || '');
      S.c.settings.eps_checkout_banner = String(r.eps_checkout_banner || '');
      S.c.settings.eps_footer_desktop = String(r.eps_footer_desktop || '');
      S.c.settings.eps_footer_mobile = String(r.eps_footer_mobile || '');
      if (S.c.settings.meta_pixel_id) initMetaPixel(S.c.settings.meta_pixel_id);
      applyAppBrandAssets(S.c.settings);
      try {
        LS.set('eds_c3', S.c);
        localStorage.setItem('ug_brand_assets', JSON.stringify({
          site_logo: S.c.settings.site_logo,
          eps_checkout_banner: S.c.settings.eps_checkout_banner,
          eps_footer_desktop: S.c.settings.eps_footer_desktop,
          eps_footer_mobile: S.c.settings.eps_footer_mobile
        }));
      } catch (e) {}
      if (!silent && changed && (CUR === 'member' || CUR === 'home' || CUR === 'paid' || CUR === 'login')) {
        rerender();
      }
    }
    return payCalc();
  }).catch(function () {
    return payCalc();
  });
}
V.member = function () {
  var c = S.c || { settings: {} }, st = c.settings || {};
  var pc = payCalc();
  var feat = [(T('tfdb31ebe', 'সব স্টাইল খোলা')), (T('t7f56b9bd', 'যত খুশি ডিজাইনের কাস্টমাইজড কমান্ড')), (T('t237c40ea', 'ডিজাইন ঠিক করার রেডি লাইন')), (T('t5a04ad75', 'নতুন স্টাইল আসলে সাথে সাথে পাবেন'))];
  var waText = (T('t823bc87c', 'আসসালামু আলাইকুম, আমি') + ' ') + APPNAME + (T('tf4fc0064', '-এর মেম্বারশিপ নিতে চাই। আমার নম্বর:') + ' ') + (S.phone || '');
  var epsCkImg = String(st.eps_checkout_banner || '').trim() || DEFAULT_EPS_CHECKOUT;
  var epsFdImg = String(st.eps_footer_desktop || '').trim() || DEFAULT_EPS_FOOTER_DESKTOP;
  var epsFmImg = String(st.eps_footer_mobile || '').trim() || String(st.eps_footer_desktop || '').trim() || DEFAULT_EPS_FOOTER_MOBILE;
  var pay = ('<a class="btn" onclick="doPay()" style="margin-top:22px">' + T('t1dd64f9d', 'পেমেন্ট করুন · ৳')) + BN(pc.base) + I.arr + '</a>' +
    '<img class="epsck" src="' + esc(epsCkImg) + '" alt="Pay with EPS">' +
    ('<p class="paynote">' + T('te835d181', 'পেমেন্ট হলেই মেম্বারশিপ নিজে থেকে চালু হবে।') + (pc.fee > 0 ? '<span class="payfee-hint">অনলাইন পেমেন্ট গেটওয়ে চার্জ (' + BN(pc.pct) + '%) প্রযোজ্য।</span>' : '') + '</p>') +
    '<a class="wa-help" href="' + esc(wa(waText)) + '" target="_blank" rel="noopener"><i>' + I.wa + ('</i>' + T('t44d56f65', 'সমস্যা হলে WhatsApp-এ মেসেজ দিন') + '</a>');
  return wtop((T('tea80659b', 'মেম্বারশিপ'))) + '<div class="wmain">' + lback((T('tb2052257', 'ফিরে যান'))) + head((T('t05dd299b', 'পুরো বছরের ডিজাইন, *এক পেমেন্টে*', 'span')), (T('te8f6325d', 'সব স্টাইল খুলে যাবে, যত খুশি কাস্টমাইজড কমান্ড বানাতে পারবেন।'))) +
    ('<div class="mgrid"><div class="mcard"><h3>' + T('td7b944f3', 'বার্ষিক মেম্বারশিপ') + '</h3><div class="mprice">' + T('t667044e8', '৳')) + BN(pc.base) + ('<small> ' + T('te4e3d29a', '/ বছর') + '</small></div><div class="mper">' + T('tbfba3042', 'মাসে মাত্র') + ' <b>' + T('t667044e8', '৳')) + BN(st.monthly || Math.max(1, Math.round(pc.base / 12))) + ('</b> ' + T('t0df3de41', '· প্রতিদিন মাত্র *১ টাকা*', 'b') + '</div>') +
    '<ul class="feat">' + feat.map(function (f) { return '<li>' + I.chk + f + '</li>'; }).join('') + '</ul>' + pay + '</div>' +
    ('<div class="why"><h3>' + T('t6711ac3e', 'যা যা বানাতে পারবেন') + '</h3><p>') + ((c.cats || []).map(function (x) { return x.name; }).join(', ') || (T('tf859e237', 'প্রোডাক্ট, অফার, উৎসব'))) + ': ' + BN((c.tpls || []).length) + (T('tbd3fc74a', 'টা স্টাইল, নতুন আসছে নিয়মিত।') + '</p><div class="wsg">') + (c.tpls || []).filter(function (t) { return t.img; }).slice(0, 6).map(function (t) { return '<img src="' + esc(imgUrl(t.img)) + '" alt="">'; }).join('') + '</div></div></div>' +
    '<picture class="epsft"><source media="(min-width:900px)" srcset="' + esc(epsFdImg) + '"><img src="' + esc(epsFmImg) + '" alt="Pay with Visa, Mastercard, bKash, Nagad, Rocket and more — verified by EPS"></picture></div>';
};
AFTER.member = function () {
  refreshPaySettings(false).then(function (pc) {
    fbTrack('ViewContent', { content_name: 'Annual Membership', content_type: 'product', value: pc.base, currency: 'BDT' });
  });
};
function doPay() {
  if (!S.phone) { S.after = 'member'; return go('login'); }
  busy(1);
  refreshPaySettings(true).then(function (pc) {
    busy(0);
    if (pc.fee > 0) {
      var payIcon = '<svg class="i" viewBox="0 0 24 24" style="stroke-width:2"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>';
      openSheet(
        '<div class="sic" style="background:rgba(243,146,0,.12);border:1px solid rgba(243,146,0,.35);color:var(--or)">' + payIcon + '</div>' +
        '<h3>পেমেন্ট নিশ্চিত করুন</h3>' +
        '<div class="pay-sum">' +
          '<div class="ps-row"><span>মেম্বারশিপ প্যাকেজ (' + BN(pc.days) + ' দিন)</span><b>৳' + BN(pc.base) + '</b></div>' +
          '<div class="ps-row"><span>অনলাইন গেটওয়ে চার্জ (' + BN(pc.pct) + '%)</span><b>+৳' + BN(pc.fee) + '</b></div>' +
          '<div class="ps-row tot"><span>সর্বমোট পরিশোধযোগ্য</span><b>৳' + BN(pc.total) + '</b></div>' +
        '</div>' +
        '<p class="pay-sum-note">বিকাশ, নগদ, রকেট বা কার্ড অটোমেটিক পেমেন্ট গেটওয়ে (EPS) প্রক্রিয়াকরণ ফি হিসেবে ' + BN(pc.pct) + '% চার্জ যুক্ত হয়েছে। পেমেন্ট সম্পন্ন হলেই সাথে সাথে মেম্বারশিপ চালু হবে।</p>' +
        '<a class="btn" onclick="confirmPayStart()">৳' + BN(pc.total) + ' পরিশোধ করতে এগিয়ে যান' + I.arr + '</a>' +
        '<a class="btn sec" style="margin-top:10px" onclick="closeSheet()">বাতিল</a>'
      );
      return;
    }
    confirmPayStart();
  });
}
function confirmPayStart() {
  closeSheet();
  var pc = payCalc();
  fbTrack('InitiateCheckout', { content_name: 'Annual Membership', value: pc.total, currency: 'BDT', num_items: 1 });
  busy(1);
  api('pay_start', { phone: S.phone }).then(function (r) {
    if (!r.ok) { busy(0); return toast(r.err, 1); }
    if (!r.url || !/^https:\/\//i.test(String(r.url))) { busy(0); return toast('অবৈধ পেমেন্ট লিংক পাওয়া গেছে', 1); }
    location.href = r.url;
  }).catch(function (e) { busy(0); toast(errMsg(e), 1); });
}
V.wait = function () {
  var waText = (T('t823bc87c', 'আসসালামু আলাইকুম, আমি') + ' ') + APPNAME + (T('t0433bd79', '-এর মেম্বারশিপের পেমেন্ট করেছি, কিন্তু চালু হয়নি। আমার নম্বর:') + ' ') + (S.phone || '');
  return wtop((T('tddd8a7fa', 'পেমেন্ট'))) + '<div class="main"><div class="res"><div class="ic n">' + I.clock + ('</div><h1>' + T('t56a5f99c', 'পেমেন্ট যাচাই হচ্ছে') + '</h1><p>' + T('t4451375a', 'পেমেন্ট করে থাকলে কয়েক সেকেন্ডের মধ্যে মেম্বারশিপ চালু হয়ে যাবে। টাকা কাটা না হলে আবার পেমেন্ট করতে পারেন।') + '</p><div style="height:26px"></div>') +
    ('<a class="btn" onclick="checkPaid()">' + T('t11571235', 'চালু হয়েছে কিনা দেখুন') + '</a><a class="btn sec" onclick="doPay()">' + T('t3e637f70', 'আবার পেমেন্ট করুন') + '</a><a class="btn sec" href="') + esc(wa(waText)) + ('" target="_blank" rel="noopener">' + T('t928c6fb1', 'WhatsApp-এ জানান') + '</a></div></div>');
};
function checkPaid() {
  busy(1);
  api('me', { phone: S.phone }).then(function (r) {
    busy(0); if (r.ok && r.member) setMember(r.member); S.payPending = !!r.pending;
    if (paid()) { go('paid'); } else { if (CUR !== 'wait') go('wait'); toast((T('tc0b3e194', 'এখনো চালু হয়নি। পেমেন্ট করে থাকলে একটু পরে আবার দেখুন।'))); }
  }).catch(function (e) { busy(0); toast(errMsg(e), 1); });
}
V.paid = function () {
  var m = M(), pc = payCalc();
  return '<div class="main"><div class="res"><div class="ic g">' + I.chk + ('</div><h1>' + T('tea80659b', 'মেম্বারশিপ') + ' <span style="color:var(--ok)">' + T('tb90a540c', 'চালু') + '</span> ' + T('tf942219a', 'হয়েছে') + '</h1><p>') + (m.brand ? (T('t3a906776', 'এখন থেকে সব স্টাইল খোলা। ডিজাইন শুরু করুন।')) : (T('t787cd6d8', 'পেমেন্ট সফল। এখন আপনার ব্র্যান্ড সেটআপ করে নিন, তারপর ডিজাইন শুরু।'))) + ('</p><div class="meta"><div><span>' + T('te02414be', 'প্ল্যান') + '</span>' + T('td7b944f3', 'বার্ষিক মেম্বারশিপ') + '</div><div><span>' + T('t0fce3e67', 'টাকা') + '</span>' + T('t667044e8', '৳')) + BN(pc.total) + ('</div><div><span>' + T('t0b41b6d2', 'মেয়াদ') + '</span>') + fmtDate(m.expiry) + (' ' + T('t1106742d', 'পর্যন্ত') + '</div></div>') +
    (m.brand ? ('<a class="btn" data-go="style">' + T('t622af877', 'ডিজাইন শুরু করুন')) + I.arr + '</a>' : ('<a class="btn" data-go="setup">' + T('td552eb86', 'ব্র্যান্ড সেটআপ করুন')) + I.arr + '</a>') + '</div></div>';
};
AFTER.paid = function () {
  var m = M(), key = (S.phone || '') + '_' + (m.expiry || '');
  if (!key || LS.get('eds_fb_last_pur') === key) return;
  refreshPaySettings(true).then(function (pc) {
    if (LS.get('eds_fb_last_pur') === key) return;
    LS.set('eds_fb_last_pur', key);
    fbTrack('Purchase', { content_name: 'Annual Membership', content_type: 'product', value: pc.total, currency: 'BDT', num_items: 1 });
  });
};

// --- ৯. ব্র্যান্ড ও লোগো সেটআপ ---
function setupState() {
  if (S.setup) return S.setup;
  var m = M();
  S.setup = { name: m.brand || '', tag: m.tagline || '', biz: m.biz || '', colors: m.c1 ? [m.c1, m.c2, m.c3] : [], shape: m.shape || 'square', logo: m.logo_url || LS.get('eds_logo') || '' };
  return S.setup;
}
V.setup = function () {
  var s = setupState(), m = M(), biz = (S.c && S.c.biz) || [];
  var isUnlocked = !!(m.brand_unlocked || (m.note && m.note.indexOf('[UNLOCKED]') > -1));
  var isLocked = !!(m.brand && !isUnlocked);
  var SH = [['wide', (T('tfc8fd0be', 'চওড়া')), 'width:44px;height:18px'], ['square', (T('tbdd31078', 'চৌকো')), 'width:28px;height:28px'], ['tall', (T('t67bca444', 'লম্বা')), 'width:18px;height:36px']];
  var cols = s.colors.length ? '<div class="cols">' + s.colors.map(function (c, i) { return '<div><span style="background:' + esc(c) + '"></span><em>' + esc(c) + '</em>' + (!isLocked ? '<input type="color" value="' + esc(c) + '" oninput="setColor(' + i + ',this.value)">' : '') + '</div>'; }).join('') + '</div><p class="hint">' + (isLocked ? 'লোগো থেকে সংরক্ষিত ৩টি ব্র্যান্ড কালার' : T('tc35c4b67', 'রঙে চেপে বদলাতে পারবেন')) + '</p>' : '<p class="hint" style="margin-top:0">' + T('te19b54d7', 'লোগো দিলে রং নিজে থেকে বের হয়ে আসবে') + '</p>';
  var logoBoxHtml = isLocked
    ? '<div class="up1 disabled" style="cursor:not-allowed;opacity:0.9"><div class="lg">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="">' : '<b>' + T('tcc9293bb', 'লোগো') + '</b>') + '</div><div><b>' + (s.logo ? 'লোগো সংরক্ষিত ✓' : 'লোগো নেই') + '</b><span>লোগো লক করা আছে</span></div><span class="ghost" style="color:var(--ok);border-color:rgba(52,199,123,.3);background:rgba(52,199,123,.08);cursor:not-allowed">🔒 লকড</span></div>'
    : '<label class="up1" for="sfile"><div class="lg">' + (s.logo ? '<img src="' + esc(s.logo) + '" alt="">' : ('<b>' + T('tcc9293bb', 'লোগো') + '</b>')) + '</div><div><b>' + (s.logo ? (T('tdca652b2', 'লোগো নেওয়া হয়েছে ✓')) : (T('t460c9379', 'লোগোর ছবি দিন'))) + '</b>' + (s.logo ? (T('tc5ea0ba4', 'লোগো থেকে রং নিজে বের হয়ে গেছে')) : (T('t76422b4a', 'PNG বা JPG, সাদা বা স্বচ্ছ ব্যাকগ্রাউন্ড হলে ভালো'))) + '</div><span class="ghost">' + (s.logo ? (T('tebbe473a', 'বদলান')) : (T('t00685af0', 'বেছে নিন'))) + '</span></label><input type="file" accept="image/*" id="sfile" hidden onchange="pickLogo(this)">';
  var waText = 'আসসালামু আলাইকুম, আমি আমার উদ্যোক্তা গ্রাফিক্স অ্যাকাউন্টের (' + (S.phone || m.phone || '') + ') ব্র্যান্ড তথ্য বা লোগো পরিবর্তন করতে চাই।';
  var ctaHtml = !isLocked
    ? '<div class="cta" style="position:static;padding:0;border:0;background:none;margin-top:24px"><a class="btn" onclick="doSetup()">' + T('t8fa7b0ec', 'সেভ করে শুরু করুন') + I.arr + '</a></div>'
    : '<div style="margin-top:24px;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:18px;display:flex;flex-direction:column;gap:12px">' +
        '<div style="display:flex;align-items:flex-start;gap:12px">' +
          '<div style="width:38px;height:38px;border-radius:50%;background:rgba(243,146,0,0.12);color:var(--or);display:grid;place-items:center;font-size:18px;flex:none;margin-top:2px">🔒</div>' +
          '<div style="flex:1">' +
            '<b style="font-size:15px;color:var(--ink);display:block">ব্র্যান্ড প্রোফাইল লক করা আছে</b>' +
            '<span style="font-size:13px;color:var(--mut);line-height:1.5;display:block;margin-top:3px">আপনার ব্র্যান্ডের নিরাপত্তা ও পলিসির স্বার্থে একবার সেটআপের পর তথ্য লক থাকে। কোনো তথ্য পরিবর্তন বা নতুন লোগো দিতে চাইলে অ্যাডমিনের সাথে যোগাযোগ করুন।</span>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:4px">' +
          '<a class="btn sm" href="' + esc(wa(waText)) + '" target="_blank" rel="noopener" style="background:#25D366;color:#fff;border:0;display:inline-flex;align-items:center;gap:8px;padding:0 18px;height:42px;font-size:14px;border-radius:8px">' + I.wa + ' অ্যাডমিনের সাথে যোগাযোগ করুন ↗</a>' +
          '<a class="btn sm sec" onclick="go(\'home\')" style="height:42px;padding:0 18px;font-size:14px;border-radius:8px">ডিজাইনে ফিরে যান</a>' +
        '</div>' +
      '</div>';

  return wtop((T('tec0a11b4', 'ব্র্যান্ড সেটআপ'))) + '<div class="wmain">' + lback((T('tb2052257', 'ফিরে যান'))) + head((T('t18968120', 'আপনার *ব্র্যান্ড* সেটআপ', 'span')), (isLocked ? 'নিরাপত্তার স্বার্থে ব্র্যান্ড তথ্য লক করা আছে। পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।' : T('td0c3b535', 'শুধু একবার। এরপর প্রতিটা কমান্ডে এগুলো নিজে থেকেই বসে যাবে।'))) +
    '<div class="setgrid" style="margin-top:22px"><div class="card"><h3>' + T('tcc9293bb', 'লোগো') + '</h3><div style="height:12px"></div>' + logoBoxHtml +
    '<div class="fl"><label><span>' + T('t79ee0900', 'লোগোর আকার') + '</span></label><div class="shapes">' +
    SH.map(function (x) { return '<div class="shp' + (s.shape === x[0] ? ' on' : '') + '" ' + (isLocked ? 'style="cursor:not-allowed;opacity:0.8"' : 'onclick="setShape(\'' + x[0] + '\')"') + '><i style="' + x[2] + '"></i>' + x[1] + '</div>'; }).join('') + '</div></div>' +
    '<div class="fl"><label><span>' + T('t97b81d98', 'ব্র্যান্ডের রং') + '</span>' + (s.colors.length ? ('<small>' + T('tef9bf36a', 'লোগো থেকে') + '</small>') : '') + '</label>' + cols + '</div></div>' +
    '<div class="card"><h3>' + T('t149ae164', 'ব্র্যান্ডের তথ্য') + '</h3>' +
    '<div class="fl"><label><span>' + T('t580a7bdc', 'ব্র্যান্ডের নাম') + '</span><small>' + (isLocked ? '🔒 লকড' : T('td6835426', 'পরে বদলানো যাবে না')) + '</small></label><input class="in" id="sname" value="' + esc(s.name) + '" ' + (isLocked ? 'disabled style="cursor:not-allowed;background:var(--card2)"' : '') + ' oninput="S.setup.name=this.value" placeholder="' + T('tb64ace7b', 'যেমন: পল্লী বাজার') + '"></div>' +
    '<div class="fl"><label><span>' + T('t95505337', 'ট্যাগলাইন') + '<em>' + T('t34544152', 'ঐচ্ছিক') + '</em></span></label><input class="in" id="stag" value="' + esc(s.tag) + '" ' + (isLocked ? 'disabled style="cursor:not-allowed;background:var(--card2)"' : 'oninput="S.setup.tag=this.value"') + ' placeholder="' + T('t238cd1bb', 'যেমন: খাঁটি গাওয়া ঘি আর অর্গানিক খাবার') + '"></div>' +
    '<div class="fl"><label><span>' + T('td62d06b4', 'ব্যবসার ধরন') + '</span></label><div class="sel"><select class="in" id="sbiz" ' + (isLocked ? 'disabled style="cursor:not-allowed;background:var(--card2)"' : 'onchange="S.setup.biz=this.value"') + '><option value="">' + T('t00685af0', 'বেছে নিন') + '</option>' +
    biz.map(function (b) { return '<option' + (b === s.biz ? ' selected' : '') + '>' + esc(b) + '</option>'; }).join('') + '</select></div></div>' +
    ctaHtml + '</div></div></div>';
};
function setShape(x) { setupState().shape = x; rerender(); }
function setColor(i, v) { setupState().colors[i] = v.toUpperCase(); var d = document.querySelectorAll('.cols div')[i]; if (d) { d.querySelector('span').style.background = v; d.querySelector('em').textContent = v.toUpperCase(); } }
function pickLogo(inp) { var f = inp.files[0]; if (f) readLogo(f); }
function readLogo(file) {
  if (!file) return;
  var objUrl = (window.URL && window.URL.createObjectURL) ? URL.createObjectURL(file) : null;
  var im = new Image();
  im.onload = function () {
    if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch (e) {} }
    var max = 120, sc = Math.min(1, max / Math.max(im.width, im.height));
    var w = Math.max(1, Math.round(im.width * sc)), h = Math.max(1, Math.round(im.height * sc));
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var x = cv.getContext('2d'); x.drawImage(im, 0, 0, w, h);
    var d = x.getImageData(0, 0, w, h).data, tot = 0, cnt0 = {}, minX = w, minY = h, maxX = 0, maxY = 0, hasAlpha = false;
    for (var y = 0; y < h; y++) for (var i = 0; i < w; i++) {
      var o = (y * w + i) * 4, r = d[o], g = d[o + 1], b = d[o + 2], a = d[o + 3];
      if (a < 240) hasAlpha = true;
      if (a < 128 || (r > 238 && g > 238 && b > 238)) continue; tot++;
      if (i < minX) minX = i; if (i > maxX) maxX = i; if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (a < 230) continue; var key = (r >> 5) + ',' + (g >> 5) + ',' + (b >> 5); var c0 = cnt0[key] || (cnt0[key] = [0, 0, 0, 0]); c0[0]++; c0[1] += r; c0[2] += g; c0[3] += b;
    }
    var keys = Object.keys(cnt0).sort(function (a, b) { return cnt0[b][0] - cnt0[a][0]; }), picked = [];
    keys.forEach(function (k) {
      var c0 = cnt0[k]; if (picked.length >= 3 || c0[0] < tot * 0.03) return;
      var p = [Math.round(c0[1] / c0[0]), Math.round(c0[2] / c0[0]), Math.round(c0[3] / c0[0])];
      if (picked.every(function (q) { return Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) + Math.abs(q[2] - p[2]) > 150; })) picked.push(p);
    });
    var hex = function (p) { return '#' + p.map(function (n) { return ('0' + Math.min(255, n).toString(16)).slice(-2); }).join('').toUpperCase(); };
    var s = setupState(); s.colors = picked.map(hex); ['#FFFFFF', '#1D1D21', '#F39200'].forEach(function (f) { if (s.colors.length < 3 && s.colors.indexOf(f) < 0) s.colors.push(f); });
    var bw = Math.max(1, maxX - minX + 1), bh = Math.max(1, maxY - minY + 1), ratio = bw / bh;
    s.shape = ratio > 1.6 ? 'wide' : ratio < 0.75 ? 'tall' : 'square';

    // লোগো অপ্টিমাইজড কম্প্রেশন (~২০০ পিক্সেল max, ২০-৩০ KB)
    var maxDim = 200, ts = Math.min(1, maxDim / Math.max(im.width, im.height));
    var tw = Math.max(1, Math.round(im.width * ts)), th = Math.max(1, Math.round(im.height * ts));
    var t = document.createElement('canvas'); t.width = tw; t.height = th;
    var tctx = t.getContext('2d');
    tctx.imageSmoothingEnabled = true;
    tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(im, 0, 0, tw, th);

    var compressed = '';
    try {
      compressed = t.toDataURL('image/webp', 0.82);
    } catch (e) {}
    if (!compressed || !compressed.startsWith('data:image/webp')) {
      if (!hasAlpha) {
        compressed = t.toDataURL('image/jpeg', 0.82);
      } else {
        compressed = t.toDataURL('image/png');
      }
    }
    // Safety check: ২০-৩০ KB এর মধ্যে নিশ্চিত রাখতে প্রয়োজনে আরেকটু স্কেল ডাউন
    if (compressed.length > 40000) {
      try {
        var t2 = document.createElement('canvas');
        var sc2 = Math.min(1, 140 / Math.max(tw, th));
        t2.width = Math.max(1, Math.round(tw * sc2));
        t2.height = Math.max(1, Math.round(th * sc2));
        var tctx2 = t2.getContext('2d');
        tctx2.imageSmoothingEnabled = true;
        tctx2.imageSmoothingQuality = 'high';
        tctx2.drawImage(t, 0, 0, t2.width, t2.height);
        var c2 = t2.toDataURL('image/webp', 0.75);
        if (c2 && c2.startsWith('data:image/webp')) compressed = c2;
        else if (!hasAlpha) compressed = t2.toDataURL('image/jpeg', 0.75);
        else compressed = t2.toDataURL('image/png');
      } catch (e) {}
    }
    s.logo = compressed;
    rerender();
  };
  im.onerror = function () {
    if (objUrl) { try { URL.revokeObjectURL(objUrl); } catch (e) {} }
    toast((T('t76422b4a', 'লোগোর ছবি লোড করা যায়নি, অন্য ছবি দিন')), 1);
  };
  if (objUrl) {
    im.src = objUrl;
  } else {
    var rd = new FileReader();
    rd.onload = function () { im.src = rd.result; };
    rd.readAsDataURL(file);
  }
}
function doSetup() {
  var s = setupState(), m = M();
  var isUnlocked = !!(m.brand_unlocked || (m.note && m.note.indexOf('[UNLOCKED]') > -1));
  if (m.brand && !isUnlocked) {
    return toast('ব্র্যান্ড তথ্য লক করা আছে। পরিবর্তনের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।', 1);
  }
  var n = (m.brand && !isUnlocked ? m.brand : ($('sname') ? $('sname').value : '')).trim();
  s.tag = $('stag') ? $('stag').value.trim() : '';
  s.biz = $('sbiz') ? $('sbiz').value : '';
  if (!n) return toast((T('t7adc25a0', 'ব্র্যান্ডের নাম দিন')), 1);
  if (!s.biz) return toast((T('tfa9b9ec1', 'ব্যবসার ধরন বেছে নিন')), 1);
  if (!s.colors.length) return toast((T('t460c9379', 'লোগোর ছবি দিন')), 1);
  busy(1);
  api('brand', { phone: S.phone, brand: n, tagline: s.tag, biz: s.biz, c1: s.colors[0], c2: s.colors[1], c3: s.colors[2], shape: s.shape, logo: s.logo || '' }).then(function (r) {
    busy(0); if (!r.ok) return toast(r.err, 1);
    var first = !m.brand; if (s.logo) LS.set('eds_logo', s.logo); setMember(r.member); S.setup = null;
    if (isUnlocked) {
      rpc('lock_member_brand', { p_phone: S.phone, p_session_token: S.tok || '' }).catch(function () {});
      if (S.member) S.member.brand_unlocked = false;
    }
    go('home'); if (first) firstTime(); else toast((T('t2fdc2806', 'ব্র্যান্ড সেভ হয়েছে ✓')));
  }).catch(function (e) { busy(0); toast(errMsg(e), 1); });
}

// --- ১০. গাইড ও ভিডিও টিউটোরিয়াল ---
function ytId(u) { var m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ''; }
var INST = null;
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); INST = e; if (CUR === 'guide') rerender(); });
window.addEventListener('appinstalled', function () { INST = null; if (CUR === 'guide') rerender(); });
function doInstall() { if (INST) { INST.prompt(); INST.userChoice.then(function () { INST = null; rerender(); }); } }
function instCard() {
  if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone) return '';
  var ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua), inapp = /FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\//.test(ua);
  var msg = INST ? (T('teeb7b158', 'এক ট্যাপে ফোনের হোম স্ক্রিনে যোগ হবে')) : inapp ? (T('tfcdee2ff', 'ফেসবুকের ভেতরের ব্রাউজারে ইনস্টল হয় না। উপরের ⋮ মেনু থেকে "Chrome-এ খুলুন" চাপুন, তারপর এখানে এসে এটা চাপুন')) : ios ? (T('tf2be94ed', 'Safari-র শেয়ার বাটন চেপে "Add to Home Screen" চাপুন')) : (T('td2bfe5c7', 'Chrome-এর ⋮ মেনু থেকে "হোম স্ক্রিনে যোগ করুন" বা "ইনস্টল করুন" চাপুন'));
  return '<a class="cl"' + (INST ? ' onclick="doInstall()"' : '') + '><i class="bi" style="background:#F39200">' + I.plus + '</i><div><b>' + (T('te04f7b25', 'অ্যাপ হিসেবে ইনস্টল করুন')) + '</b><small>' + msg + '</small></div>' + (INST ? '<u>›</u>' : '') + '</a>';
}
V.guide = function () {
  var k = K(), id = ytId(k.guide_video);
  var title = k.guide_title || (T('t99711718', 'কীভাবে ব্যবহার করবেন'));
  var vid = '<div class="vid">' + (id ? '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>' : ('<span class="soon">' + T('tdf3d19d8', 'ভিডিও শীঘ্রই আসছে') + '</span>')) + '</div>';
  var cls = (k.whatsapp ? '<a class="cl" href="' + esc(wa()) + '" target="_blank" rel="noopener"><i class="bi" style="background:#25D366">' + I.wa + ('</i><div><b>' + T('t15f62a30', 'WhatsApp সাপোর্ট') + '</b><small>' + T('t092e4343', 'ডিজাইনে আটকে গেলে মেসেজ দিন') + '</small></div><u>›</u></a>') : '') +
    (k.call ? '<a class="cl" href="tel:' + esc(k.call) + '"><i class="bi" style="background:#34C77B">' + I.call + ('</i><div><b>' + T('tf32a2f4e', 'কল করুন') + '</b><small>') + esc(k.call_time || '') + '</small></div><u>›</u></a>' : '') +
    (k.group_link ? '<a class="cl" href="' + esc(safeHref(k.group_link)) + '" target="_blank" rel="noopener noreferrer"><i class="bi" style="background:#1877F2">' + I.fb + ('</i><div><b>' + T('t9b354e1e', 'ফেসবুক গ্রুপ') + '</b><small>' + T('t1440fc79', 'নিজের বানানো ডিজাইন শেয়ার করুন, মতামত নিন') + '</small></div><u>›</u></a>') : '');
  var live = k.class_name ? ('<div class="live"><div><em>' + T('t7a8616c6', 'পরের লাইভ ক্লাস') + '</em><b>') + esc(k.class_name) + '</b><small>' + esc(k.class_time || '') + '</small></div>' + (k.class_link ? '<a class="ghost" href="' + esc(safeHref(k.class_link)) + ('" target="_blank" rel="noopener noreferrer">' + T('tf814b430', 'জয়েন করুন') + '</a>') : '') + '</div>' : '';
  return topm() + '<div class="main">' + head(esc(title), esc(k.guide_sub || (T('tcc6099e0', 'নিচের ভিডিওটা একবার দেখে নিন, তাহলেই পুরো অ্যাপ ব্যবহার করতে পারবেন।'))), 1) +
    '<div class="gl">' + vid + '<div><div class="cls">' + instCard() + cls + '</div>' + live + '</div></div></div>' + tabs2('guide');
};

// --- ১১. ইউজার অ্যাকাউন্ট, টার্মস ও পলিসি ---
V.acct = function () {
  var m = M(), P = (S.c && S.c.policies) || [];
  if (!S.phone) return topm() + '<div class="main">' + head((T('tfaa77e7f', 'অ্যাকাউন্ট')), (T('td8f488d7', 'লগইন করলে এখানে আপনার ব্র্যান্ড, মেম্বারশিপ আর পেমেন্ট দেখা যাবে।'))) + ('<div style="max-width:420px;margin-top:22px"><a class="btn" data-go="login">' + T('t704040d2', 'লগইন করুন')) + I.arr + '</a></div>' +
    (P.length ? ('<div class="card" style="max-width:420px;margin-top:20px"><h3>' + T('t05e84ffe', 'পলিসি') + '</h3><div class="links" style="margin-top:4px">') + P.map(function (p) { return '<a onclick="openPolicy(\'' + esc(p.key) + '\')">' + esc(p.title) + '</a>'; }).join('') + '</div></div>' : '') + '</div>' + tabs2('acct');
  var st = m.paid ? ('<b class="ok" style="font-weight:400">' + T('tb90a540c', 'চালু') + '</b>') : m.expired ? ('<b style="font-weight:400;color:#F0606A">' + T('t91e4d553', 'মেয়াদ শেষ') + '</b>') : '<b style="font-weight:400;color:var(--or)">' + (S.payPending ? (T('t56a5f99c', 'পেমেন্ট যাচাই হচ্ছে')) : (T('te23c569d', 'নেওয়া হয়নি'))) + '</b>';
  var isUnlocked = !!(m.brand_unlocked || (m.note && m.note.indexOf('[UNLOCKED]') > -1));
  var brand = m.brand ? ('<div class="card"><h3>' + T('tc471512c', 'ব্র্যান্ড') + ' ') + (m.paid ? ('<a data-go="setup">' + (isUnlocked ? 'এডিট করুন 🔓' : 'দেখুন 🔒') + '</a>') : '') + '</h3><div style="display:flex;gap:12px;align-items:center;margin:14px 0 4px">' + logoBox().replace('class="blogo"', 'class="blogo" style="width:52px;height:52px"') + '<div><div style="font-size:17px;font-weight:700">' + esc(m.brand) + '</div><div style="font-size:13.5px;color:var(--mut)">' + esc(m.biz || '') + ' · ' + esc(S.phone) + '</div></div></div><div class="sw" style="margin-top:12px">' + [m.c1, m.c2, m.c3].map(function (c) { return '<div><span style="background:' + esc(c || '#2F2F37') + ';height:22px"></span></div>'; }).join('') + '</div></div>'
    : ('<div class="card"><h3>' + T('tc471512c', 'ব্র্যান্ড') + '</h3><p style="color:var(--mut);font-size:14px;margin-top:8px">' + T('t30850dcc', 'মেম্বারশিপ চালু হলে ব্র্যান্ড সেটআপ করবেন।') + '</p><div style="font-size:14px;color:var(--ink2);margin-top:8px">') + esc(S.phone) + '</div></div>';
  var mem = ('<div class="card"><h3>' + T('tea80659b', 'মেম্বারশিপ') + '</h3><div class="kv" style="margin-top:8px"><div><span>' + T('tc9dfad7d', 'অবস্থা') + '</span>') + st + '</div>' + (m.expiry ? ('<div><span>' + T('t0b41b6d2', 'মেয়াদ') + '</span>') + fmtDate(m.expiry) + '</div>' : '') + (m.paid ? ('<div><span>' + T('t9e6f5013', 'বাকি') + '</span>') + BN(m.daysLeft) + (' ' + T('t79af515e', 'দিন') + '</div>') : '') + '</div>' +
    (m.paid ? ('<a class="btn sec" data-go="member" style="height:46px;font-size:15px;margin-top:16px">' + T('td42fb54e', 'মেয়াদ বাড়ান') + '</a>') : '<a class="btn" data-go="member" style="height:46px;font-size:15px;margin-top:16px">' + (S.payPending ? (T('tf3cd0bbd', 'পেমেন্টের অবস্থা দেখুন')) : (T('t925d8832', 'মেম্বারশিপ নিন · ৳')) + BN(price()) + (T('t95c37f70', '/বছর'))) + '</a>') + '</div>';
  var hist = '<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center"><h3>আমার তৈরি ডিজাইন হিস্ট্রি</h3><small id="uhist-count" style="color:var(--mut)"></small></div><div id="uhist" style="margin-top:12px"><div class="empty">লোড হচ্ছে…</div></div></div>';
  return topm() + '<div class="main">' + head((T('tfaa77e7f', 'অ্যাকাউন্ট')), '', 0) + '<div class="acgrid"><div class="col">' + brand + mem + '</div><div class="col">' + hist + ('<div class="card"><h3>' + T('t81b0f76c', 'পেমেন্টের তালিকা') + '</h3><div class="kv" id="apay" style="margin-top:8px"><div><span>' + T('ta2a767e8', 'লোড হচ্ছে…') + '</span></div></div></div>') +
    ('<div class="card"><h3>' + T('tdb057a16', 'অন্যান্য') + '</h3><div class="links" style="margin-top:4px"><a data-go="guide">' + T('te1727a11', 'গাইড আর সাপোর্ট') + '</a>') + P.map(function (p) { return '<a onclick="openPolicy(\'' + esc(p.key) + '\')">' + esc(p.title) + '</a>'; }).join('') + '</div></div>' +
    '<a class="btn out" data-go="logout">' + I.out + (T('te5ff418f', 'লগআউট') + '</a></div></div></div>') + tabs2('acct');
};
AFTER.acct = function () {
  if (!S.phone) return;
  api('mypay', { phone: S.phone }).then(function (r) {
    var P = (r && r.ok && r.pays) || [], el = $('apay'); if (!el) return;
    el.innerHTML = P.length ? P.map(function (p) { var c = p.status === 'সফল' ? 'ok' : ''; return '<div><span>' + esc(p.date) + ' · ' + esc(p.method) + ('</span><span style="color:var(--ink)">' + T('t667044e8', '৳')) + BN(p.amount) + ' <b class="' + c + '" style="font-weight:400;margin-left:8px;' + (c ? '' : 'color:var(--or)') + '">' + esc(p.status) + '</b></span></div>'; }).join('') : ('<div><span>' + T('t72706eea', 'এখনো কোনো পেমেন্ট নেই') + '</span></div>');
  }).catch(function () { var el = $('apay'); if (el) el.innerHTML = ('<div><span>' + T('t54e54179', 'লোড করা যায়নি') + '</span></div>'); });
  loadUserHistory();
};
function loadUserHistory() {
  var el = $('uhist'); if (!el) return;
  api('my_history', { phone: S.phone }).then(function (r) {
    var H = (r && r.ok && r.history) || [];
    S.userHistoryCache = H;
    var cnt = $('uhist-count'); if (cnt) cnt.textContent = H.length ? BN(H.length) + ' টি' : '';
    if (!H.length) {
      el.innerHTML = '<p class="empty" style="padding:10px 0;font-size:13px;color:var(--mut)">এখনো কোনো ডিজাইন তৈরি করা হয়নি</p>';
      return;
    }
    el.innerHTML = '<div class="uhist-list">' + H.slice(0, 5).map(function (h) {
      var d = fmtDate(h.created_at);
      return '<div class="uhist-item" style="display:flex;gap:10px;padding:10px;background:var(--card2);border:1px solid var(--line);border-radius:10px;margin-bottom:8px;align-items:center">' +
        (h.style_img ? '<img src="' + esc(imgUrl(h.style_img)) + '" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex:none">' : '<div style="width:44px;height:44px;border-radius:6px;background:rgba(243,146,0,.1);display:flex;align-items:center;justify-content:center;color:var(--or);font-weight:700;flex:none">ডি</div>') +
        '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px">' +
            '<b style="font-size:13.5px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(h.style_name || 'ডিজাইন') + '</b>' +
            '<small style="font-size:11px;color:var(--mut);flex:none">' + d + '</small>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--mut);margin:2px 0 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(h.cmd.slice(0, 60)) + '…</div>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn sm" onclick="copyHistoryCmd(\'' + esc(h.id) + '\', event)" style="height:26px;font-size:11.5px;padding:0 10px">কমান্ড কপি</button>' +
            '<button class="btn sm sec" onclick="viewHistoryDetail(\'' + esc(h.id) + '\')" style="height:26px;font-size:11.5px;padding:0 10px">বিস্তারিত</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('') + (H.length > 5 ? '<a class="ghost" onclick="openHistorySheet()" style="display:block;text-align:center;margin-top:10px;font-size:13px;color:var(--or);cursor:pointer">সব হিস্ট্রি দেখুন (' + BN(H.length) + ') →</a>' : '') + '</div>';
  }).catch(function () {
    if (el) el.innerHTML = '<p class="empty">হিস্ট্রি লোড করা যায়নি</p>';
  });
}
function copyHistoryCmd(id, ev) {
  if (ev) ev.stopPropagation();
  var h = (S.userHistoryCache || []).filter(function (x) { return x.id === id; })[0];
  if (!h || !h.cmd) return toast('কমান্ড পাওয়া যায়নি', 1);
  navigator.clipboard.writeText(h.cmd).then(function () {
    toast('কমান্ড কপি হয়েছে ✓');
  }).catch(function () {
    toast('কপি করা যায়নি', 1);
  });
}
function viewHistoryDetail(id) {
  var h = (S.userHistoryCache || []).filter(function (x) { return x.id === id; })[0];
  if (!h) return;
  var d = fmtDate(h.created_at);
  var html = '<div style="text-align:left">' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
      (h.style_img ? '<img src="' + esc(imgUrl(h.style_img)) + '" style="width:54px;height:54px;object-fit:cover;border-radius:8px">' : '') +
      '<div><h3 style="margin:0;font-size:18px">' + esc(h.style_name || 'ডিজাইন') + '</h3><small style="color:var(--mut)">' + d + '</small></div>' +
    '</div>' +
    '<div style="margin-bottom:8px"><b style="font-size:13px;color:var(--mut)">তৈরি করা সম্পূর্ণ কমান্ড:</b></div>' +
    '<div style="max-height:180px;overflow-y:auto;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:12px;font-size:13px;line-height:1.6;color:var(--ink);user-select:all;word-break:break-word">' + esc(h.cmd) + '</div>' +
    '<div style="display:flex;gap:10px;margin-top:16px">' +
      '<button class="btn" onclick="copyHistoryCmd(\'' + esc(h.id) + '\');closeSheet()" style="flex:1">কমান্ড কপি করুন</button>' +
      '<a class="btn sec" href="https://chatgpt.com" target="_blank" rel="noopener" style="flex:1">ChatGPT খুলুন ↗</a>' +
    '</div>' +
  '</div>';
  openSheet(html);
}
function openHistorySheet() {
  if (!S.phone) return go('login');
  busy(1);
  api('my_history', { phone: S.phone, limit: 50 }).then(function (r) {
    busy(0);
    var H = (r && r.ok && r.history) || [];
    S.userHistoryCache = H;
    if (!H.length) return toast('কোনো ডিজাইন হিস্ট্রি নেই');
    var items = H.map(function (h) {
      var d = fmtDate(h.created_at);
      return '<div style="display:flex;gap:12px;padding:12px;background:var(--card2);border:1px solid var(--line);border-radius:10px;margin-bottom:8px;align-items:center">' +
        (h.style_img ? '<img src="' + esc(imgUrl(h.style_img)) + '" style="width:48px;height:48px;object-fit:cover;border-radius:6px;flex:none">' : '<div style="width:48px;height:48px;border-radius:6px;background:rgba(243,146,0,.1);display:flex;align-items:center;justify-content:center;color:var(--or);font-weight:700;flex:none">ডি</div>') +
        '<div style="flex:1;min-width:0">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px">' +
            '<b style="font-size:14px;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(h.style_name || 'ডিজাইন') + '</b>' +
            '<small style="font-size:11.5px;color:var(--mut);flex:none">' + d + '</small>' +
          '</div>' +
          '<div style="font-size:12px;color:var(--mut);margin:3px 0 8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(h.cmd.slice(0, 70)) + '…</div>' +
          '<div style="display:flex;gap:8px">' +
            '<button class="btn sm" onclick="copyHistoryCmd(\'' + esc(h.id) + '\', event)" style="height:28px;font-size:12px;padding:0 12px">কমান্ড কপি</button>' +
            '<button class="btn sm sec" onclick="viewHistoryDetail(\'' + esc(h.id) + '\')" style="height:28px;font-size:12px;padding:0 12px">বিস্তারিত</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var sheetHtml = '<div style="text-align:left">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">' +
        '<h3 style="margin:0">আমার তৈরি ডিজাইন (' + BN(H.length) + ')</h3>' +
        '<a class="ghost" onclick="clearAllHistory()" style="font-size:12.5px;color:#F0606A;cursor:pointer">হিস্ট্রি মুছুন</a>' +
      '</div>' +
      '<div style="max-height:60vh;overflow-y:auto;padding-right:4px">' + items + '</div>' +
    '</div>';
    openSheet(sheetHtml);
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e), 1);
  });
}
function clearAllHistory() {
  if (!confirm('আপনি কি সব তৈরি করা ডিজাইন হিস্ট্রি মুছে ফেলতে চান?')) return;
  busy(1);
  api('clear_history', { phone: S.phone }).then(function (r) {
    busy(0);
    if (!r.ok) return toast(r.err, 1);
    toast('হিস্ট্রি মুছে ফেলা হয়েছে ✓');
    S.userHistoryCache = [];
    closeSheet();
    if (CUR === 'acct') loadUserHistory();
  }).catch(function (e) {
    busy(0);
    toast(errMsg(e), 1);
  });
}
function sanitizePolicyHtml(raw) {
  var ALLOWED = { P: 1, H2: 1, H3: 1, UL: 1, OL: 1, LI: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, BR: 1, BLOCKQUOTE: 1, HR: 1, A: 1, DIV: 1, SPAN: 1 };
  var box;
  if (typeof DOMParser !== 'undefined') {
    box = new DOMParser().parseFromString(String(raw || ''), 'text/html').body;
  } else {
    var d = document.implementation.createHTMLDocument('');
    box = d.body;
    box.innerHTML = String(raw || '');
  }
  function cleanNode(node) {
    if (node.nodeType === 3) return document.createTextNode(node.nodeValue || '');
    if (node.nodeType !== 1) return null;
    var tag = node.tagName.toUpperCase();
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'IFRAME' || tag === 'OBJECT') return null;
    if (!ALLOWED[tag]) {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < node.childNodes.length; i++) {
        var ch = cleanNode(node.childNodes[i]);
        if (ch) frag.appendChild(ch);
      }
      return frag;
    }
    var el = document.createElement(tag === 'DIV' ? 'p' : tag.toLowerCase());
    if (tag === 'A') {
      var href = String(node.getAttribute('href') || '').trim();
      if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) {
        el.setAttribute('href', href);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
    for (var j = 0; j < node.childNodes.length; j++) {
      var c2 = cleanNode(node.childNodes[j]);
      if (c2) el.appendChild(c2);
    }
    return el;
  }
  var out = document.createElement('div');
  for (var k = 0; k < box.childNodes.length; k++) {
    var cn = cleanNode(box.childNodes[k]);
    if (cn) out.appendChild(cn);
  }
  return out.innerHTML;
}
function renderPolicyHtml(raw) {
  var s = String(raw || '').trim();
  if (!s) return '<p class="empty">' + T('ted3b57ef', 'শীঘ্রই আসছে') + '</p>';
  if (/<(p|h2|h3|ul|ol|li|strong|b|em|i|u|br|blockquote|hr|a|div)\b/i.test(s)) {
    return sanitizePolicyHtml(s);
  }
  return s.split(/\n\s*\n/).map(function (t) { return '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>'; }).join('');
}
function openPolicy(k) { S.policy = k; go('policy'); }
V.policy = function () {
  var P = (S.c && S.c.policies) || [], p = P.filter(function (x) { return x.key === S.policy; })[0] || P[0];
  if (!p) return wtop((T('t05e84ffe', 'পলিসি'))) + ('<div class="wmain"><p class="empty">' + T('ted3b57ef', 'শীঘ্রই আসছে') + '</p></div>');
  return wtop(esc(p.title)) + '<div class="wmain">' + lback((T('tb2052257', 'ফিরে যান'))) + head(esc(p.title), '') +
    '<div class="ptabs">' + P.map(function (x) { return '<span class="chip' + (x.key === p.key ? ' on' : '') + '" onclick="S.policy=\'' + esc(x.key) + '\';rerender()">' + esc(x.title) + '</span>'; }).join('') + '</div>' +
    '<div class="doc">' + renderPolicyHtml(p.text) + '</div></div>';
};
AFTER.policy = function () {
  rpc('get_public_policies').then(function (r) {
    if (r && r.ok && Array.isArray(r.policies)) {
      if (!S.c) S.c = {};
      var prev = JSON.stringify(S.c.policies || []);
      var next = JSON.stringify(r.policies);
      S.c.policies = r.policies;
      try { LS.set('eds_c3', S.c); } catch (e) {}
      if (CUR === 'policy' && prev !== next) rerender();
    }
  }).catch(function () {});
};
V.logout = function () { return V.acct(); };
AFTER.logout = function () {
  history.replaceState({ v: 'acct' }, '', routeUrl('acct')); CUR = 'acct'; AFTER.acct();
  openSheet('<div class="sic" style="background:rgba(240,96,106,.1);border:1px solid rgba(240,96,106,.35);color:#F0606A">' + I.out + ('</div><h3>' + T('t3117d148', 'লগআউট করবেন?') + '</h3><p>' + T('td2b63e14', 'আবার ঢুকতে মোবাইল নম্বর লাগবে। আপনার ব্র্যান্ড আর মেম্বারশিপ ঠিক থাকবে।') + '</p><a class="btn out" style="margin-top:0" onclick="doLogout()">' + T('tc2e8e6fc', 'লগআউট করুন') + '</a><a class="btn sec" onclick="closeSheet()">' + T('tca21daf1', 'বাতিল') + '</a>'));
};
function doLogout() {
  if (S.tok) rpc('logout_member_session', { p_session_token: S.tok }).catch(function () {});
  ['eds_phone', 'eds_tok', 'eds_m', 'eds_logo'].forEach(LS.del);
  S.phone = '';
  S.tok = '';
  S.member = null;
  S.payPending = false;
  LOGIN_STEP = 'phone';
  PENDING_PHONE = '';
  PENDING_SETUP_TOKEN = '';
  clearInterval(OTP_TIMER);
  closeSheet();
  toast(T('t8e30c14b', 'সফলভাবে লগআউট হয়েছে'));
  setTimeout(function () {
    if (location.protocol === 'file:') {
      location.href = 'index.html';
    } else {
      location.href = '/';
    }
  }, 400);
}
V.off = function () { return '<div class="main"><div class="res"><div class="ic n">' + I.wifi + ('</div><h1>' + T('td7866732', 'ইন্টারনেট সংযোগ নেই') + '</h1><p>' + T('te11bb195', 'ইন্টারনেট চালু করে আবার চেষ্টা করুন।') + '</p><div style="height:26px"></div><a class="btn" onclick="location.reload()">' + T('tbfbc9c0b', 'আবার চেষ্টা করুন') + '</a></div></div>'); };

// --- ১২. বটম শীট মডাল ডায়ালগ ---
function openSheet(h) { $('sheet').innerHTML = '<div class="grab"></div>' + h; $('ov').hidden = false; }
function closeSheet() { $('ov').hidden = true; $('sheet').innerHTML = ''; }
function firstTime() {
  openSheet('<div class="sic" style="background:rgba(243,146,0,.1);border:1px solid rgba(243,146,0,.35);color:var(--or)">' + I.play + ('</div><h3>' + T('t47905a16', 'স্বাগতম,') + ' ') + esc(M().brand || '') + ('!</h3><p>' + T('tc363b5b1', 'কীভাবে ব্যবহার করবেন, তার ছোট একটা ভিডিও গাইড পেজে আছে। প্রথমবার একবার দেখে নিন।') + '</p><a class="btn" onclick="closeSheet();go(\'guide\')">' + T('t283c3bdd', 'ভিডিও দেখুন') + '</a><a class="btn sec" onclick="closeSheet()">' + T('tee8d8e09', 'পরে দেখব') + '</a>'));
}

// --- ১৩. অ্যাপ্লিকেশন ইনিশিয়ালাইজেশন ও বুট ---
function boot() {
  S.c = fixImgs(LS.get('eds_c3')); S.phone = LS.get('eds_phone') || ''; S.tok = LS.get('eds_tok') || ''; S.member = LS.get('eds_m');
  if (!S.phone || !S.tok) {
    if (S.phone && !S.tok) { ['eds_phone', 'eds_m'].forEach(LS.del); }
    S.phone = ''; S.tok = ''; S.member = null;
  }
  var start = getRoute() || 'home', back = /[?&]pay=back/.test(location.search), backFail = /[?&]st=fail/.test(location.search);
  if (back) { try { history.replaceState(null, '', routeUrl('home')); } catch (e) {} start = 'home'; }
    var entry = '';
  if (start === 'checkout') { entry = 'checkout'; start = 'home'; }
  if (['terms', 'privacy', 'refund'].indexOf(start) > -1) { S.policy = start; start = 'policy'; }
  else if (!V[start] || ['ready', 'write', 'wait', 'paid', 'logout', 'setup', 'policy'].indexOf(start) > -1) start = 'home';
  if (S.c) {
    if (S.c.settings && S.c.settings.meta_pixel_id) initMetaPixel(S.c.settings.meta_pixel_id);
    go(start); if (entry === 'checkout') nav('member');
  }
  api('content').then(function (r) {
    if (!r.ok) return toast((T('t9cfa3898', 'সার্ভার:') + ' ') + (r.err || (T('t63de2ba5', 'কন্টেন্ট আসেনি'))), 1);
    var first = !S.c; r = fixImgs(r);
    S.c = r; TX = r.texts || {}; APPNAME = T('t9cece10c', 'উদ্যোক্তা গ্রাফিক্স AI');
    if (r.settings) {
      if (r.settings.meta_pixel_id) initMetaPixel(r.settings.meta_pixel_id);
      applyAppBrandAssets(r.settings);
      try {
        localStorage.setItem('ug_brand_assets', JSON.stringify({
          site_logo: String(r.settings.site_logo || ''),
          eps_checkout_banner: String(r.settings.eps_checkout_banner || ''),
          eps_footer_desktop: String(r.settings.eps_footer_desktop || ''),
          eps_footer_mobile: String(r.settings.eps_footer_mobile || '')
        }));
      } catch (e) {}
    }
    LS.set('eds_c3', r);
    if (first && !CUR) { go(start); if (entry === 'checkout') nav('member'); }
    else if (['home', 'style', 'guide', 'member', 'login', 'acct'].indexOf(CUR) > -1) rerender();
  }).catch(function (e) { if (!S.c) go('off'); else toast(errMsg(e), 1); });
  if (S.phone && S.tok) {
    api('me', { phone: S.phone, tok: S.tok }).then(function (r) {
      if (!r || !r.ok) return;
      if (r.member) setMember(r.member);
      S.payPending = !!r.pending;
      if (S.c && ['home', 'style', 'acct', 'member', 'guide', 'setup'].indexOf(CUR) > -1) rerender();
      if (back) { if (r.member && r.member.paid) go('paid'); else if (backFail) { go('member'); toast((T('t5c67b0ef', 'পেমেন্ট হয়নি, টাকা কাটা হয়নি। আবার চেষ্টা করতে পারেন।')), 1); } else go('wait'); return; }
      if (r.member && r.member.paid && !r.member.brand && S.c && ['home', 'member'].indexOf(CUR) > -1) go('setup');
    }).catch(function () {});
  }
}
boot();
if ('serviceWorker' in navigator) {
  if (location.protocol === 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  } else if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then(function (regs) {
      regs.forEach(function (r) { r.unregister(); });
    });
  }
}
