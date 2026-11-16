(function(){
var U = (function () {
  try {
    var p = new URLSearchParams(location.search).get('api');
    if (p) { localStorage.setItem('UG_API_URL', p); return p; }
  } catch (e) {}
  return (typeof localStorage !== 'undefined' && localStorage.getItem('UG_API_URL')) ||
    'https://jfrpvijkfcsfewtljnah.supabase.co/functions/v1/api';
})();
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function conv(s){return esc(s).replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/\n/g,"<br>")}
function ok(u){return /^(\/|https?:\/\/|mailto:|tel:|app\.html|#)/.test(u)}
function apply(t){var i,e,v,n=document.querySelectorAll("[data-lp]");for(i=0;i<n.length;i++){e=n[i];v=t[e.getAttribute("data-lp")];if(v&&e.getAttribute("data-lpv")!==v){e.innerHTML=conv(v);e.setAttribute("data-lpv",v)}}
n=document.querySelectorAll("[data-lph]");for(i=0;i<n.length;i++){e=n[i];v=t[e.getAttribute("data-lph")];if(v&&ok(v))e.setAttribute("href",v)}}

function applyLandingConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return;

  // 1. Visibility Toggles
  if (cfg.visibility) {
    var v = cfg.visibility;
    var secMap = {
      hero: document.querySelector('section.hero'),
      gallery: document.getElementById('gallery'),
      how: document.getElementById('how'),
      pains: document.querySelector('.pains') ? document.querySelector('.pains').closest('section') : null,
      reviews: document.getElementById('reviews'),
      pricing: document.getElementById('price'),
      faqs: document.getElementById('faq'),
      cta: document.querySelector('.end') ? document.querySelector('.end').closest('section') : null
    };
    for (var k in secMap) {
      if (secMap[k]) {
        if (v[k] === false) secMap[k].style.display = 'none';
        else secMap[k].style.display = '';
      }
    }
  }

  // 2. Hero Section
  if (cfg.hero) {
    var h = cfg.hero;
    var badge = document.querySelector('.hero .badge');
    if (badge) {
      if (h.badge) {
        var sp = badge.querySelector('span');
        if (sp) sp.innerHTML = conv(h.badge);
      }
      if (h.badge_link) badge.setAttribute('href', h.badge_link);
    }
    var h1 = document.querySelector('.hero h1');
    if (h1 && h.title) h1.innerHTML = conv(h.title);

    var sub = document.querySelector('.hero p.sub');
    if (sub && h.subtitle) sub.innerHTML = conv(h.subtitle);

    var priBtn = document.querySelector('.hero .cta a.btn.pri');
    if (priBtn) {
      if (h.btn_text) {
        var sp2 = priBtn.querySelector('span');
        if (sp2) sp2.innerHTML = conv(h.btn_text);
      }
      if (h.btn_link) priBtn.setAttribute('href', h.btn_link);
    }

    var ghBtn = document.querySelector('.hero .cta a.btn.gh');
    if (ghBtn) {
      if (h.sec_btn_text) ghBtn.innerHTML = conv(h.sec_btn_text);
      if (h.sec_btn_link) ghBtn.setAttribute('href', h.sec_btn_link);
    }

    var pnote = document.querySelector('.hero p.pnote');
    if (pnote && h.note) pnote.innerHTML = conv(h.note);

    // 2.1 Hero Mockup Images (.vis .stack)
    var heroStack = document.querySelector('.hero .vis .stack');
    if (heroStack) {
      var imgVf = heroStack.querySelector('img.vf, img.vm');
      if (imgVf && h.img) imgVf.src = h.img;

      var imgVl = heroStack.querySelector('img.vl');
      if (imgVl && h.img_left) imgVl.src = h.img_left;

      var imgVr = heroStack.querySelector('img.vr');
      if (imgVr && h.img_right) imgVr.src = h.img_right;
    }

    // 2.2 Hero Notice / Disclaimer Box (.hero aside.notice, aside.notice)
    var notices = document.querySelectorAll('aside.notice');
    if (notices && notices.length) {
      notices.forEach(function (n) {
        if (h.notice_show === false) {
          n.style.display = 'none';
        } else {
          n.style.display = '';
          var nTitle = n.querySelector('p b');
          if (nTitle && h.notice_title) {
            nTitle.innerHTML = conv(h.notice_title);
            nTitle.setAttribute('data-lpv', '1');
          }
          var nSpan = n.querySelector('p span:not(.ni)');
          if (nSpan && h.notice_text) {
            nSpan.innerHTML = conv(h.notice_text);
            nSpan.setAttribute('data-lpv', '1');
          }
        }
      });
    }
  }

  // 2.5 Gallery Section (Sample Designs)
  if (Array.isArray(cfg.gallery) && cfg.gallery.length) {
    var galEl = document.querySelector('.gal');
    if (galEl) {
      var giNodes = galEl.querySelectorAll('figure.gi');
      cfg.gallery.forEach(function (g, i) {
        if (giNodes[i]) {
          var img = giNodes[i].querySelector('img');
          var cap = giNodes[i].querySelector('figcaption');
          if (img) {
            if (g.img) img.src = g.img;
            if (g.title) img.alt = g.title + ' স্টাইলের নমুনা ডিজাইন';
          }
          if (cap && g.title) cap.innerHTML = conv(g.title);
        }
      });
    }
  }

  // 2.6 How It Works (Steps)
  if (Array.isArray(cfg.steps) && cfg.steps.length) {
    var stepsEl = document.querySelector('.steps');
    if (stepsEl) {
      var stNodes = stepsEl.querySelectorAll('li.step');
      cfg.steps.forEach(function (s, i) {
        if (stNodes[i]) {
          var img = stNodes[i].querySelector('.shot img');
          var h3 = stNodes[i].querySelector('.sc h3, .stx h3, h3');
          var p = stNodes[i].querySelector('.sc p, .stx p, p');
          if (img && s.img) img.src = s.img;
          if (h3 && s.title) h3.innerHTML = conv(s.title);
          if (p && s.desc) p.innerHTML = conv(s.desc);
        }
      });
    }
  }

  // 3. Pains & Solutions
  if (Array.isArray(cfg.pains) && cfg.pains.length) {
    var pCards = document.querySelectorAll('.pains .pr');
    cfg.pains.forEach(function (p, i) {
      if (pCards[i]) {
        var pbP = pCards[i].querySelector('.pb p');
        var pgP = pCards[i].querySelector('.pg p');
        if (pbP && p.prob) pbP.innerHTML = conv(p.prob);
        if (pgP && p.sol) pgP.innerHTML = conv(p.sol);
      }
    });
  }

  // 4. Customer Reviews
  if (cfg.reviews_meta) {
    var rHead = document.querySelector('#reviews h2');
    if (rHead && cfg.reviews_meta.title) rHead.innerHTML = conv(cfg.reviews_meta.title);
    var rSub = document.querySelector('#reviews p.lead');
    if (rSub && cfg.reviews_meta.subtitle) rSub.innerHTML = conv(cfg.reviews_meta.subtitle);
  }

  if (Array.isArray(cfg.reviews) && cfg.reviews.length) {
    var revsEl = document.querySelector('.revs');
    var dotsEl = document.querySelector('.rev-dots');
    if (revsEl) {
      revsEl.innerHTML = cfg.reviews.map(function (r, i) {
        var starStr = '★'.repeat(r.rating || 5);
        var init = esc(r.initial || (r.name ? r.name.charAt(0) : 'ক'));
        var imgHtml = r.img ? '<img src="' + esc(r.img) + '" alt="' + esc(r.name) + '" loading="lazy">'
          : '<div class="bb" style="width:72%"></div><div class="bb me" style="width:58%"></div><div class="ph"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>' + esc(r.text || 'কাস্টমারের আসল রিভিউ') + '</span></div><div class="bb" style="width:82%"></div><div class="bb me" style="width:48%"></div>';
        return '<figure class="rv"><div class="rs">' + imgHtml + '</div><figcaption class="who"><div class="who-left"><i>' + init + '</i><div class="who-meta"><b>' + esc(r.name || 'কাস্টমার') + '</b><small><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' + esc(r.badge || 'ভেরিফাইড ক্লায়েন্ট') + '</small></div></div><span class="who-stars">' + starStr + '</span></figcaption></figure>';
      }).join('');

      if (dotsEl) {
        dotsEl.innerHTML = cfg.reviews.map(function (r, i) {
          return '<button class="rev-dot' + (i === 0 ? ' active' : '') + '" type="button" role="tab" aria-label="রিভিউ ' + (i + 1) + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '" data-idx="' + i + '"></button>';
        }).join('');
      }

      if (window.__initSlider) window.__initSlider();
    }
  }

  // 5. Pricing Section
  if (cfg.pricing) {
    var pr = cfg.pricing;
    var prHead = document.querySelector('#price h2');
    if (prHead && pr.title) prHead.innerHTML = conv(pr.title);

    var plH3 = document.querySelector('#price .pl h3');
    if (plH3 && pr.plan_name) plH3.innerHTML = conv(pr.plan_name);

    var prSpan = document.querySelector('#price .price span');
    if (prSpan && pr.price) prSpan.innerHTML = conv(pr.price);

    var prSmall = document.querySelector('#price .price small');
    if (prSmall && pr.period) prSmall.innerHTML = conv(pr.period);

    var perEl = document.querySelector('#price .per');
    if (perEl && pr.sub_price) perEl.innerHTML = conv(pr.sub_price);

    if (Array.isArray(pr.features) && pr.features.length) {
      var featUl = document.querySelector('#price .pl ul');
      if (featUl) {
        featUl.innerHTML = pr.features.map(function (f) {
          return '<li><svg aria-hidden="true" viewbox="0 0 20 20"><path d="M5 10.5l3.2 3L15 6.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2"></path></svg><span>' + conv(f) + '</span></li>';
        }).join('');
      }
    }

    var prBtn = document.querySelector('#price .pl a.btn.pri');
    if (prBtn) {
      if (pr.btn_text) {
        var psp = prBtn.querySelector('span');
        if (psp) psp.innerHTML = conv(pr.btn_text);
      }
      if (pr.btn_link) prBtn.setAttribute('href', pr.btn_link);
    }

    var prNote = document.querySelector('#price p.note');
    if (prNote && pr.note) prNote.innerHTML = conv(pr.note);
  }

  // 6. FAQ Section
  if (cfg.faqs_meta) {
    var fHead = document.querySelector('#faq h2');
    if (fHead && cfg.faqs_meta.title) fHead.innerHTML = conv(cfg.faqs_meta.title);
  }

  if (Array.isArray(cfg.faqs) && cfg.faqs.length) {
    var faqsEl = document.querySelector('.faqs');
    if (faqsEl) {
      faqsEl.innerHTML = cfg.faqs.map(function (f, i) {
        return '<details class="fq"' + (i === 0 ? ' open=""' : '') + '><summary><span>' + esc(f.q) + '</span><span aria-hidden="true" class="pm"></span></summary><p>' + conv(f.a) + '</p></details>';
      }).join('');
    }
  }

  // 7. Final CTA Section
  if (cfg.cta) {
    var c = cfg.cta;
    var endEl = document.querySelector('.end');
    if (endEl) {
      var eh2 = endEl.querySelector('h2');
      if (eh2 && c.title) eh2.innerHTML = conv(c.title);
      var ep = endEl.querySelector('p');
      if (ep && c.subtitle) ep.innerHTML = conv(c.subtitle);
      var eBtn = endEl.querySelector('a.btn.pri');
      if (eBtn) {
        if (c.btn_text) {
          var esp = eBtn.querySelector('span');
          if (esp) esp.innerHTML = conv(c.btn_text);
        }
        if (c.btn_link) eBtn.setAttribute('href', c.btn_link);
      }
    }
  }
}

var currentLandingConfig = null;

try {
  var cachedCfg = JSON.parse(localStorage.getItem("lp_config") || "null");
  if (cachedCfg) {
    currentLandingConfig = cachedCfg;
    applyLandingConfig(cachedCfg);
  }
} catch(e) {}
try{apply(JSON.parse(localStorage.getItem("lp_t")||"{}"))}catch(e){}
if (currentLandingConfig) applyLandingConfig(currentLandingConfig);

var postgrestLandingUrl = 'https://jfrpvijkfcsfewtljnah.supabase.co/rest/v1/landing_config?id=eq.main&select=data';
var anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmcnB2aWprZmNzZmV3dGxqbmFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3MjIwODcsImV4cCI6MjExMDI5ODA4N30.p3KtKt4ml0Xn2gSlx_yzF4EKzIBwq_QxHt0VvVqKd5U';

fetch(postgrestLandingUrl, {
  headers: {
    'apikey': anonKey,
    'Authorization': 'Bearer ' + anonKey
  }
}).then(function (r) {
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}).then(function (arr) {
  if (arr && arr[0] && arr[0].data) {
    currentLandingConfig = arr[0].data;
    try { localStorage.setItem('lp_config', JSON.stringify(arr[0].data)); } catch (e) {}
    applyLandingConfig(arr[0].data);
  }
}).catch(function (err) {
  console.warn('PostgREST landing_config fetch error:', err);
});

if(U)fetch(U+"?q="+encodeURIComponent(JSON.stringify({action:"lp"}))+"&t="+Date.now()).then(function(r){return r.json()}).then(function(r){
  if(r&&r.ok){
    if (r.t) {
      try{localStorage.setItem("lp_t",JSON.stringify(r.t))}catch(e){}
      apply(r.t);
    }
    if (r.config) {
      currentLandingConfig = r.config;
      try { localStorage.setItem("lp_config", JSON.stringify(r.config)); } catch(e) {}
      applyLandingConfig(r.config);
    } else if (currentLandingConfig) {
      applyLandingConfig(currentLandingConfig);
    }
  }
}).catch(function(){});

window.addEventListener('storage', function (e) {
  if (e.key === 'lp_config' && e.newValue) {
    try {
      var newCfg = JSON.parse(e.newValue);
      if (newCfg) {
        currentLandingConfig = newCfg;
        applyLandingConfig(newCfg);
      }
    } catch (err) {}
  }
});
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a) return;
  var href = a.getAttribute('href');
  if (!href || href === '#') return;
  var target = document.querySelector(href);
  if (target) {
    e.preventDefault();
    var headerEl = document.querySelector('header');
    var navOffset = (headerEl ? headerEl.offsetHeight : 68) + 12;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
    try { history.replaceState(null, '', location.pathname); } catch (err) {}
  }
});
try {
  (function () {
    var headerEl = document.querySelector('header');
    if (!headerEl) return;
    var onScroll = function () {
      if ((window.pageYOffset || document.documentElement.scrollTop || 0) > 10) {
        headerEl.classList.add('scrolled');
      } else {
        headerEl.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();
} catch (e) {}
try {
  function initSlider() {
    var revs = document.querySelector('.revs');
    if (!revs) return;
    var cards = revs.querySelectorAll('.rv');
    if (!cards.length) return;
    var dots = document.querySelectorAll('.rev-dot');
    var prevBtn = document.querySelector('.rev-btn.prev');
    var nextBtn = document.querySelector('.rev-btn.next');
    var liveDot = document.querySelector('.rev-live-dot');

    var currentIndex = 0;
    var autoplayTimer = null;
    var isPaused = false;
    var isInteracting = false;
    var AUTOPLAY_INTERVAL = 4000;

    function isDesktop() {
      return window.innerWidth >= 900;
    }

    function getCardStep() {
      if (cards.length > 1) {
        var s = cards[1].offsetLeft - cards[0].offsetLeft;
        if (s > 50) return s;
      }
      return cards[0].offsetWidth + 18;
    }

    function getMaxScroll() {
      return Math.max(0, revs.scrollWidth - revs.clientWidth);
    }

    function getActiveIndex() {
      var sl = revs.scrollLeft;
      if (isDesktop()) {
        var step = getCardStep();
        var idx = Math.round(sl / step);
        if (idx < 0) idx = 0;
        if (idx >= cards.length) idx = cards.length - 1;
        return idx;
      } else {
        var cw = revs.clientWidth;
        var best = 0;
        var minD = Infinity;
        for (var i = 0; i < cards.length; i++) {
          var cardCenter = cards[i].offsetLeft - revs.offsetLeft + cards[i].offsetWidth / 2;
          var viewCenter = sl + cw / 2;
          var diff = Math.abs(cardCenter - viewCenter);
          if (diff < minD) {
            minD = diff;
            best = i;
          }
        }
        return best;
      }
    }

    function updateDots(activeIdx) {
      currentIndex = activeIdx;
      for (var j = 0; j < dots.length; j++) {
        if (j === activeIdx) {
          dots[j].classList.add('active');
          dots[j].setAttribute('aria-selected', 'true');
        } else {
          dots[j].classList.remove('active');
          dots[j].setAttribute('aria-selected', 'false');
        }
      }
    }

    function scrollToCard(idx) {
      if (idx < 0) idx = 0;
      if (idx >= cards.length) idx = cards.length - 1;
      currentIndex = idx;
      var maxScroll = getMaxScroll();
      var targetLeft = 0;

      if (isDesktop()) {
        var target = cards[idx];
        if (target) {
          targetLeft = target.offsetLeft - revs.offsetLeft;
        } else {
          targetLeft = idx * getCardStep();
        }
      } else {
        var target = cards[idx];
        if (target) {
          targetLeft = target.offsetLeft - revs.offsetLeft - (revs.clientWidth - target.offsetWidth) / 2;
        }
      }

      if (targetLeft < 0) targetLeft = 0;
      if (targetLeft > maxScroll) targetLeft = maxScroll;

      revs.scrollTo({ left: targetLeft, behavior: 'smooth' });
      updateDots(idx);
    }

    function nextSlide() {
      var maxScroll = getMaxScroll();
      var sl = revs.scrollLeft;

      if (isDesktop()) {
        var step = getCardStep();
        if (sl >= maxScroll - 15) {
          scrollToCard(0);
        } else {
          var curIdx = Math.round(sl / step);
          var nextIdx = curIdx + 1;
          if (nextIdx >= cards.length) {
            scrollToCard(0);
          } else {
            scrollToCard(nextIdx);
          }
        }
      } else {
        var nextIdx = (currentIndex + 1) % cards.length;
        scrollToCard(nextIdx);
      }
    }

    function prevSlide() {
      var maxScroll = getMaxScroll();
      var sl = revs.scrollLeft;

      if (isDesktop()) {
        var step = getCardStep();
        if (sl <= 15) {
          var lastIdx = Math.min(cards.length - 1, Math.round(maxScroll / step));
          scrollToCard(lastIdx);
        } else {
          var curIdx = Math.round(sl / step);
          var prevIdx = Math.max(0, curIdx - 1);
          scrollToCard(prevIdx);
        }
      } else {
        var prevIdx = (currentIndex - 1 + cards.length) % cards.length;
        scrollToCard(prevIdx);
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (isPaused || isInteracting) return;
      if (liveDot) liveDot.style.opacity = '1';
      autoplayTimer = setInterval(function () {
        if (!isPaused && !isInteracting) {
          nextSlide();
        }
      }, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
      if (liveDot) liveDot.style.opacity = '0.35';
    }

    function restartAutoplayWithDelay(delay) {
      stopAutoplay();
      setTimeout(function () {
        if (!isPaused && !isInteracting) {
          startAutoplay();
        }
      }, delay || 2500);
    }

    var scrollTimer;
    revs.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var active = getActiveIndex();
        updateDots(active);
      }, 50);
    }, { passive: true });

    function bindNavBtn(btn, action) {
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        action();
        restartAutoplayWithDelay(4000);
      });
    }

    bindNavBtn(prevBtn, prevSlide);
    bindNavBtn(nextBtn, nextSlide);

    for (var k = 0; k < dots.length; k++) {
      (function (i) {
        dots[i].addEventListener('click', function (e) {
          e.preventDefault();
          scrollToCard(i);
          restartAutoplayWithDelay(4000);
        });
      })(k);
    }

    revs.addEventListener('mouseenter', function () {
      isPaused = true;
      stopAutoplay();
    });
    revs.addEventListener('mouseleave', function () {
      isPaused = false;
      startAutoplay();
    });

    revs.addEventListener('touchstart', function () {
      isInteracting = true;
      stopAutoplay();
    }, { passive: true });

    revs.addEventListener('touchend', function () {
      isInteracting = false;
      restartAutoplayWithDelay(3000);
    }, { passive: true });

    var isMouseDown = false;
    var startX = 0;
    var scrollLeftInit = 0;
    var hasMoved = false;

    revs.addEventListener('mousedown', function (e) {
      isMouseDown = true;
      hasMoved = false;
      isInteracting = true;
      stopAutoplay();
      startX = e.pageX - revs.offsetLeft;
      scrollLeftInit = revs.scrollLeft;
      revs.classList.add('dragging');
      revs.style.scrollBehavior = 'auto';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isMouseDown) return;
      var x = e.pageX - revs.offsetLeft;
      var walk = (x - startX);
      if (Math.abs(walk) > 6) {
        hasMoved = true;
      }
      revs.scrollLeft = scrollLeftInit - walk;
    });

    window.addEventListener('mouseup', function () {
      if (isMouseDown) {
        isMouseDown = false;
        revs.classList.remove('dragging');
        revs.style.scrollBehavior = '';
        isInteracting = false;
        if (hasMoved) {
          var active = getActiveIndex();
          scrollToCard(active);
        }
        restartAutoplayWithDelay(3500);
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var rect = revs.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') {
          nextSlide();
          restartAutoplayWithDelay(4000);
        } else if (e.key === 'ArrowLeft') {
          prevSlide();
          restartAutoplayWithDelay(4000);
        }
      }
    });

    window.addEventListener('resize', function () {
      updateDots(getActiveIndex());
    });

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            isPaused = false;
            startAutoplay();
          } else {
            isPaused = true;
            stopAutoplay();
          }
        });
      }, { threshold: 0.15 });
      var sec = document.getElementById('reviews');
      if (sec) obs.observe(sec);
    } else {
      startAutoplay();
    }
  }
  window.__initSlider = initSlider;
  initSlider();
} catch (e) {}
window.__lpApply=apply; window.__lpApplyConfig=applyLandingConfig;
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
})()
