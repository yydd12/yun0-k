(() => {
  'use strict';

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll shadow ---------- */
  const header = document.getElementById('header');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  hamburger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  });

  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });

  /* ---------- Theme toggle (persisted) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) root.setAttribute('data-theme', stored);

  themeToggle.addEventListener('click', () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const current = root.getAttribute('data-theme') || (prefersDark ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ---------- Scroll-spy active nav link ---------- */
  const sections = [...document.querySelectorAll('main > section, .hero')];
  const navLinks = [...document.querySelectorAll('.nav__link')];

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  sections.forEach((section) => spyObserver.observe(section));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
    revealObserver.observe(el);
  });

  /* ---------- GitHub link dropdown ---------- */
  const closeAllDropdowns = () => {
    document.querySelectorAll('.gh-dropdown.open').forEach((dd) => {
      dd.classList.remove('open');
      dd.querySelector('.gh-dropdown__trigger').setAttribute('aria-expanded', 'false');
      const card = dd.closest('.project-card');
      if (card) card.classList.remove('project-card--elevated');
    });
  };

  document.querySelectorAll('.gh-dropdown__trigger').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = trigger.closest('.gh-dropdown');
      const card = trigger.closest('.project-card');
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      dropdown.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (card) card.classList.toggle('project-card--elevated', !isOpen);
    });
  });

  document.addEventListener('click', () => closeAllDropdowns());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });

  /* ---------- Project detail modal ---------- */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  let lastFocusedEl = null;

  const openProjectModal = (key) => {
    const template = document.getElementById(`project-modal-${key}`);
    if (!template) return;
    modalBody.innerHTML = '';
    modalBody.appendChild(template.content.cloneNode(true));
    lastFocusedEl = document.activeElement;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalClose.focus();
  };

  const closeProjectModal = () => {
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedEl) lastFocusedEl.focus();
  };

  document.querySelectorAll('[data-open-project]').forEach((btn) => {
    btn.addEventListener('click', () => openProjectModal(btn.getAttribute('data-open-project')));
  });

  modalClose.addEventListener('click', closeProjectModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeProjectModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) closeProjectModal();
  });

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(textarea);
    return ok;
  };

  modalBody.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.modal-copy');
    if (!copyBtn) return;
    const value = copyBtn.getAttribute('data-copy');

    const showCopied = () => {
      const original = copyBtn.textContent;
      copyBtn.textContent = '복사됨';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.classList.remove('copied');
      }, 1500);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(showCopied, () => {
        if (fallbackCopy(value)) showCopied();
      });
    } else if (fallbackCopy(value)) {
      showCopied();
    }
  });

  /* ---------- Contact form (front-end only demo) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '메시지가 성공적으로 전송되었습니다. 감사합니다!';
    form.reset();
    setTimeout(() => { status.textContent = ''; }, 4000);
  });
})();
