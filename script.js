'use strict';

/* ─────────────────────────────────────────────
   OneAI — script.js
   Modules:
   1. ThemeManager
   2. ModalManager
   3. InstallTabs
   4. Carousel
   5. DeviceDownloadSelector
   6. ChangelogFilter
   7. CopyButtons
   8. LogoEasterEgg
   9. MobileMenu
   10. FAB
───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  ModalManager.init();
  InstallTabs.init();
  Carousel.init();
  DeviceDownloadSelector.init();
  ChangelogFilter.init();
  CopyButtons.init();
  LogoEasterEgg.init();
  MobileMenu.init();
  FAB.init();
});

/* ═══════════════════════════════════════════
   1. ThemeManager
   ═══════════════════════════════════════════ */
const ThemeManager = {
  html: document.documentElement,
  toggleBtn: null,

  init() {
    this.toggleBtn = document.getElementById('themeToggle');
    const saved = this._getSaved();
    this._apply(saved);
    this.toggleBtn?.addEventListener('click', () => this.toggle());
  },

  _getSaved() {
    try { return localStorage.getItem('oneai-theme'); } catch { return null; }
  },

  _apply(theme) {
    const resolved = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.html.setAttribute('data-theme', resolved);
    this._updateIcon(resolved);
  },

  toggle() {
    const current = this.html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.html.setAttribute('data-theme', next);
    try { localStorage.setItem('oneai-theme', next); } catch {}
    this._updateIcon(next);
  },

  _updateIcon(theme) {
    if (!this.toggleBtn) return;
    const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
    const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    this.toggleBtn.innerHTML = theme === 'dark' ? sun : moon;
    this.toggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
};

/* ═══════════════════════════════════════════
   2. ModalManager
   ═══════════════════════════════════════════ */
const ModalManager = {
  _stack: [],

  init() {
    // Openers mapping: triggerID → modalID
    const openers = {
      donateBtn:      'donateModal',
      mDonateBtn:     'donateModal',
      changelogBtn:   'changelogModal',
      mChangelogBtn:  'changelogModal',
      installGuideBtn:'installModal',
      heroInstallBtn: 'installModal',
      mInstallBtn:    'installModal',
      footerInstallBtn:'installModal',
      heroDownloadBtn:'download',   // scroll
      fabDownload:    'download',   // scroll
    };

    Object.entries(openers).forEach(([btnId, target]) => {
      const btn = document.getElementById(btnId);
      if (!btn) return;
      btn.addEventListener('click', () => {
        if (target === 'download') {
          document.getElementById('download')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          MobileMenu.close();
        } else {
          this.open(target);
          MobileMenu.close();
        }
      });
    });

    // Close buttons (data-close attribute)
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => this.close(btn.dataset.close));
    });

    // Click on backdrop
    document.querySelectorAll('.modal').forEach(modal => {
      modal.querySelector('.modal-backdrop')?.addEventListener('click', () => this.close(modal.id));
    });

    // Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this._stack.length) {
        this.close(this._stack[this._stack.length - 1]);
      }
    });
  },

  open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    this._stack.push(id);
    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = modal.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
      focusable?.focus();
    });
  },

  close(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('hidden', '');
    this._stack = this._stack.filter(i => i !== id);
    if (!this._stack.length) document.body.style.overflow = '';
  }
};

/* ═══════════════════════════════════════════
   3. InstallTabs
   ═══════════════════════════════════════════ */
const InstallTabs = {
  init() {
    document.querySelectorAll('.install-tabs').forEach(tabsEl => {
      tabsEl.querySelectorAll('.itab').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = 'tab-' + btn.dataset.tab;
          const panel = document.getElementById(targetId);
          if (!panel) return;

          // Deactivate all in same modal
          const modal = btn.closest('.modal-panel');
          modal?.querySelectorAll('.itab').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          modal?.querySelectorAll('.itab-content').forEach(c => c.classList.remove('active'));

          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');
          panel.classList.add('active');
        });
      });
    });
  }
};

/* ═══════════════════════════════════════════
   4. Carousel
   ═══════════════════════════════════════════ */
const Carousel = {
  images: [
    { src: 'https://i.imgur.com/g0J8vV3.jpeg', alt: 'OneAI — Home Screen' },
    { src: 'https://i.imgur.com/xymeNw6.jpeg', alt: 'OneAI — Settings' },
    { src: 'https://i.imgur.com/utXiMyt.jpeg', alt: 'OneAI — Notification Shade' },
    { src: 'https://i.imgur.com/1XXnpdk.jpeg', alt: 'OneAI — App Drawer' },
    { src: 'https://i.imgur.com/ungWGYR.jpeg', alt: 'OneAI — Control Center' },
    { src: 'https://i.imgur.com/McEPGiA.jpeg', alt: 'OneAI — Lock Screen' },
  ],
  current: 0,
  total: 0,
  autoTimer: null,
  track: null,
  dots: [],

  init() {
    this.track = document.getElementById('carouselTrack');
    const dotsEl = document.getElementById('carouselDots');
    const counter = document.getElementById('slideCounter');
    const totalEl = document.getElementById('slideTotalCount');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (!this.track) return;

    this.total = this.images.length;
    if (totalEl) totalEl.textContent = this.total;

    // Build slides
    this.images.forEach((img, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${this.total}: ${img.alt}`);
      slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');

      const el = document.createElement('img');
      el.alt = img.alt;
      el.loading = 'lazy';
      el.src = img.src;
      el.width = 800;
      el.height = 450;
      el.onerror = () => { el.src = 'https://picsum.photos/seed/phone/800/450'; };

      slide.appendChild(el);
      this.track.appendChild(slide);
    });

    // Build dots
    if (dotsEl) {
      this.images.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => this.go(i));
        dotsEl.appendChild(dot);
        this.dots.push(dot);
      });
    }

    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());

    // Keyboard
    document.addEventListener('keydown', e => {
      const modal = document.querySelector('.modal:not([hidden])');
      if (modal) return;
      if (e.key === 'ArrowLeft') this.prev();
      if (e.key === 'ArrowRight') this.next();
    });

    // Touch / swipe
    let startX = 0;
    this.track.parentElement.addEventListener('pointerdown', e => { startX = e.clientX; });
    this.track.parentElement.addEventListener('pointerup', e => {
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 40) { diff > 0 ? this.next() : this.prev(); }
    });

    // Pause on hover
    const carousel = document.getElementById('carousel');
    carousel?.addEventListener('mouseenter', () => this.stopAuto());
    carousel?.addEventListener('mouseleave', () => this.startAuto());

    this._update(counter);
    this.startAuto();
  },

  go(index) {
    this.current = (index + this.total) % this.total;
    const counter = document.getElementById('slideCounter');
    this._update(counter);
  },
  next() { this.go(this.current + 1); },
  prev() { this.go(this.current - 1); },

  _update(counter) {
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    if (counter) counter.textContent = this.current + 1;

    this.dots.forEach((dot, i) => {
      const active = i === this.current;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    // Update aria-hidden on slides
    this.track.querySelectorAll('.carousel-slide').forEach((s, i) => {
      s.setAttribute('aria-hidden', i !== this.current ? 'true' : 'false');
    });
  },

  startAuto() {
    this.stopAuto();
    this.autoTimer = setInterval(() => this.next(), 5000);
  },
  stopAuto() {
    if (this.autoTimer) { clearInterval(this.autoTimer); this.autoTimer = null; }
  }
};

/* ═══════════════════════════════════════════
   5. DeviceDownloadSelector
   ═══════════════════════════════════════════ */
const DeviceDownloadSelector = {
  devices: {
    's21-g991b':   { name: 'Galaxy S21 (SM-G991B)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/1YCKz-LFOxCd-jonXhY6LtgT-NPMJtlwJ/view?usp=drivesdk' },
    's21-g991n':   { name: 'Galaxy S21 (SM-G991N)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/1NrdrBYR7NOHXHsPdd7_dwBqxVWx98NLw/view?usp=drivesdk' },
    's21p-g996b':  { name: 'Galaxy S21+ (SM-G996B)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/1uAdBa1Pp27MDYGxala-529dTLUe9taoZ/view?usp=drivesdk' },
    's21u-g998b':  { name: 'Galaxy S21 Ultra (SM-G998B)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/1DZP9p9zfifgVkM0_EyguHmuy9bEDhOlD/view?usp=drivesdk' },
    's21u-g998n':  { name: 'Galaxy S21 Ultra (SM-G998N)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/16NO0Ik4P7MLHYWx3Ij7ie1nUSGwgpSBh/view?usp=drivesdk' },
    's21fe-g990e': { name: 'Galaxy S21 FE (SM-G990E)', note: 'One UI 8 · Android 14', url: 'https://drive.google.com/file/d/1mzq8ET6AeaaRU5ALZHCYA8B-DJqdZ6a_/view?usp=drivesdk' },
  },

  init() {
    const select = document.getElementById('deviceSelect');
    const result = document.getElementById('downloadResult');
    if (!select || !result) return;

    select.addEventListener('change', () => {
      const key = select.value;
      if (!key) {
        result.innerHTML = this._placeholder();
        return;
      }
      const device = this.devices[key];
      result.innerHTML = device ? this._card(device) : '';
    });
  },

  _placeholder() {
    return `<div class="download-placeholder">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
      <p>Select your device model above</p>
    </div>`;
  },

  _card(d) {
    return `<div class="download-card">
      <div class="download-card-info">
        <h4>${d.name}</h4>
        <p>${d.note} · OneAI v7.3</p>
      </div>
      <div class="download-card-actions">
        <a class="dl-btn" href="${d.url}" target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download
        </a>
        <button class="dl-btn dl-btn--ghost" onclick="ModalManager.open('installModal')">
          Install Guide
        </button>
      </div>
    </div>`;
  }
};

/* ═══════════════════════════════════════════
   6. ChangelogFilter
   ═══════════════════════════════════════════ */
const ChangelogFilter = {
  init() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        // Update active btn
        btn.closest('.changelog-filters').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show/hide sections
        document.querySelectorAll('.changelog-section').forEach(section => {
          if (filter === 'all') {
            section.style.display = '';
          } else {
            section.style.display = section.dataset.type === filter ? '' : 'none';
          }
        });
      });
    });
  }
};

/* ═══════════════════════════════════════════
   7. CopyButtons
   ═══════════════════════════════════════════ */
const CopyButtons = {
  init() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        if (!text) return;
        try {
          await navigator.clipboard.writeText(text);
          this._feedback(btn);
        } catch {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'absolute';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
          this._feedback(btn);
        }
      });
    });
  },

  _feedback(btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg> Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 1800);
  }
};

/* ═══════════════════════════════════════════
   8. LogoEasterEgg
   ═══════════════════════════════════════════ */
const LogoEasterEgg = {
  eggSrc: 'https://i.imgur.com/ENTi5Li.jpeg',
  required: 5,
  windowMs: 1200,
  clicks: [],
  showing: false,
  originalSrc: '',

  init() {
    const wrap = document.getElementById('logoWrap');
    const img  = document.getElementById('logoImg');
    if (!wrap || !img) return;
    this.originalSrc = img.src;
    // Preload
    const pre = new Image(); pre.src = this.eggSrc;

    const attempt = () => {
      const now = Date.now();
      this.clicks = this.clicks.filter(t => now - t <= this.windowMs);
      if (this.clicks.length >= this.required) {
        this.clicks = [];
        this._toggle(img);
      }
    };

    wrap.addEventListener('click', () => { this.clicks.push(Date.now()); attempt(); });
    wrap.addEventListener('keydown', e => { if (e.key === 'Enter') this._toggle(img); });
  },

  _toggle(img) {
    const next = this.showing ? this.originalSrc : this.eggSrc;
    img.classList.add('fading');
    setTimeout(() => {
      img.src = next;
      img.classList.remove('fading');
      this.showing = !this.showing;
    }, 300);
  }
};

/* ═══════════════════════════════════════════
   9. MobileMenu
   ═══════════════════════════════════════════ */
const MobileMenu = {
  btn: null,
  menu: null,
  open: false,

  init() {
    this.btn  = document.getElementById('hamburger');
    this.menu = document.getElementById('mobileMenu');
    if (!this.btn || !this.menu) return;
    this.btn.addEventListener('click', () => this.toggle());
  },

  toggle() {
    this.open = !this.open;
    this.btn.classList.toggle('open', this.open);
    this.menu.classList.toggle('open', this.open);
    this.btn.setAttribute('aria-expanded', String(this.open));
    this.menu.setAttribute('aria-hidden', String(!this.open));
  },

  close() {
    if (!this.open) return;
    this.open = false;
    this.btn?.classList.remove('open');
    this.menu?.classList.remove('open');
    this.btn?.setAttribute('aria-expanded', 'false');
    this.menu?.setAttribute('aria-hidden', 'true');
  }
};

/* ═══════════════════════════════════════════
   10. FAB
   ═══════════════════════════════════════════ */
const FAB = {
  init() {
    const fab = document.getElementById('fabDownload');
    if (!fab) return;
    fab.addEventListener('click', () => {
      document.getElementById('download')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Hide FAB when download section is in view
    const downloadSection = document.getElementById('download');
    if (!downloadSection || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(entries => {
      fab.style.opacity = entries[0].isIntersecting ? '0' : '';
      fab.style.pointerEvents = entries[0].isIntersecting ? 'none' : '';
    }, { threshold: 0.3 });

    observer.observe(downloadSection);
  }
};
