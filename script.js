(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ── language: English / العربية, with full RTL mirroring ── */
  const root = document.documentElement;
  const swappable = $$('[data-en]');
  const setLang = (lang) => {
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    swappable.forEach((el) => {
      const val = el.dataset[lang];
      if (val != null) el.innerHTML = val;
    });
    try { localStorage.setItem('brooj-lang', lang); } catch (e) {}
  };
  let saved = 'en';
  try { saved = localStorage.getItem('brooj-lang') || 'en'; } catch (e) {}
  if (saved === 'ar') setLang('ar');

  const langBtn = $('#lang');
  if (langBtn) langBtn.addEventListener('click', () => setLang(root.lang === 'ar' ? 'en' : 'ar'));

  /* ── newsletter (demo only: nothing is stored or sent) ── */
  const news = $('#news'), newsMsg = $('#newsMsg'), newsEmail = $('#newsEmail');
  if (news) {
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((newsEmail.value || '').trim());
      const ar = root.lang === 'ar';
      newsMsg.textContent = ok
        ? (ar ? 'شكراً لك، سنبقيك على اطلاع.' : 'Thank you, we will keep you posted.')
        : (ar ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      if (ok) newsEmail.value = '';
    });
  }

  /* ── nav ── */
  const nav = $('#nav'), burger = $('#burger');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (nav && burger) {
    const set = (open) => {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    $$('.drawer a', nav).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  /* ── slow reveals: fades, image settles, hairline rules ── */
  const reveals = new Set($$('.fade, .veil, .rule'));
  const show = (el) => { el.classList.add('in'); reveals.delete(el); };

  if (reduced) {
    reveals.forEach(show);
  } else {
    const check = () => {
      const vh = innerHeight;
      reveals.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.9) show(el); });
    };
    requestAnimationFrame(check);
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      }), { threshold: 0.12 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* ── videos, tuned for slow networks ──
     posters render instantly; only the hero preloads (metadata);
     the space video carries data-src and loads when scrolled near;
     videos play only while on screen. */
  const vids = $$('video');
  vids.forEach((v) => { v.muted = true; v.setAttribute('muted', ''); });
  const loadSrc = (v) => { if (v.dataset.src) { v.src = v.dataset.src; delete v.dataset.src; v.load(); } };

  if (reduced) {
    vids.forEach(loadSrc);
  } else {
    const manage = () => {
      const vh = innerHeight;
      vids.forEach((v) => {
        const r = v.getBoundingClientRect();
        if (r.top < vh + 600 && r.bottom > -600) loadSrc(v);
        const onScreen = r.top < vh + 100 && r.bottom > -100;
        if (onScreen) { if (v.paused) v.play().catch(() => {}); }
        else if (!v.paused) v.pause();
      });
    };
    addEventListener('scroll', manage, { passive: true });
    addEventListener('resize', manage);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) manage(); });
    manage();
  }
})();
