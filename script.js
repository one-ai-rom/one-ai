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
   11. i18n
   12. BackgroundCanvas
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
  i18n.init();
  BackgroundCanvas.init();
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
    's21-g991b':   { name: 'Galaxy S21 (SM-G991B)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/1YCKz-LFOxCd-jonXhY6LtgT-NPMJtlwJ/view?usp=drivesdk' },
    's21-g991n':   { name: 'Galaxy S21 (SM-G991N)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/1NrdrBYR7NOHXHsPdd7_dwBqxVWx98NLw/view?usp=drivesdk' },
    's21p-g996b':  { name: 'Galaxy S21+ (SM-G996B)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/1uAdBa1Pp27MDYGxala-529dTLUe9taoZ/view?usp=drivesdk' },
    's21u-g998b':  { name: 'Galaxy S21 Ultra (SM-G998B)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/1DZP9p9zfifgVkM0_EyguHmuy9bEDhOlD/view?usp=drivesdk' },
    's21u-g998n':  { name: 'Galaxy S21 Ultra (SM-G998N)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/16NO0Ik4P7MLHYWx3Ij7ie1nUSGwgpSBh/view?usp=drivesdk' },
    's21fe-g990e': { name: 'Galaxy S21 FE (SM-G990E)', note: 'One UI 7 · Android 15', url: 'https://drive.google.com/file/d/1mzq8ET6AeaaRU5ALZHCYA8B-DJqdZ6a_/view?usp=drivesdk' },
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

/* ═══════════════════════════════════════════
   11. i18n — Multi-language support
   ═══════════════════════════════════════════ */
const i18n = {
  _lang: 'en',
  _data: {
    en: {
      brand_sub: 'One UI Port · Galaxy S21 Series',
      nav_changelog: 'Changelog',
      nav_install: 'Install Guide',
      nav_donate: 'Donate',
      badge_stable: 'Stable Build · v7.3',
      hero_title: 'Faster. Cleaner.<br><span class="gradient-text">More in control.</span>',
      hero_lead: 'OneAI is a carefully curated One UI 7 port based on Android 15 with performance tweaks, enhanced Galaxy AI, and minimal compromises. Odin-friendly with an active community.',
      btn_download: 'Download ROM',
      btn_install_guide: 'Install Guide',
      build_latest: 'Latest Release',
      stat_devices: 'Devices',
      stat_updated: 'Last update',
      stat_base: 'Base',
      dl_title: 'Download',
      dl_sub: 'Select your device to get the right build',
      dl_label: 'Your device',
      dl_pick: '— Pick your model —',
      dl_placeholder: 'Select your device model above',
      feat_title: "What's inside",
      feat_sub: "Everything you need, nothing you don't",
      feat_ai_title: 'Enhanced Galaxy AI',
      feat_ai_desc: 'All Galaxy AI features preinstalled and significantly improved over the official version — including exclusive Chinese Galaxy AI features not available in Western builds.',
      feat_opt_title: 'Properly Optimized',
      feat_opt_desc: "Surpasses Samsung's own optimizations — minimal RAM & battery usage, enhanced performance with Proton kernel 5.5.",
      feat_knox_title: 'Deknoxed & KnoxPatch',
      feat_knox_desc: 'Knox removed for better performance, heat management and system control. Knox-related apps still work via built-in KnoxPatch.',
      feat_audio_title: 'Audio Mods',
      feat_audio_desc: 'More audio modes unlocked, compression disabled, sounds ported from ZFlip 7 for superior quality.',
      feat_patch_title: 'Patch-set',
      feat_patch_desc: 'Built-in patches for 4-digit PIN, app downgrades, FRP bypass, valid attestations, and enhanced battery info.',
      feat_comm_title: 'Active Community',
      feat_comm_desc: 'Join the Telegram group for discussion, help, updates and direct contact with the development team.',
      prev_title: 'Preview',
      prev_sub: 'See OneAI in action',
      credits_title: 'Credits',
      credits_sub: 'The team behind OneAI',
      credit_matteo: 'ROM building, system optimizations, bug fixes and releases.',
      credit_fwp: 'Testing and kernel work.',
      credit_extreme: 'KnoxPatch, verify app signature disabler patches (ExtremeROM).',
      credit_devcore: 'OneUI apps and assistance on various topics.',
      credit_beyond: 'Building and fixing Odin-flashable ROM.',
      credit_elite: 'General support and assistance.',
      credit_kusoi: 'Website, bots, and practically everything tech-adjacent.',
      footer_top: 'Back to top ↑',
      donate_title: 'Support OneAI',
      donate_sub: 'Your support keeps development active. Choose a developer to support:',
      donate_via_pp: 'Donate via PayPal →',
      cl_all: 'All',
      cl_dirty: 'Dirty-flashable over v7.2+',
      install_sub: 'This process will <strong>completely wipe your device</strong>. Before flashing, make sure you have:',
      install_check1: 'A full backup of your data',
      install_check2: 'The correct ROM file for your exact model',
      install_check3: 'Odin 3.14+ installed on Windows PC',
      install_check4: 'Samsung USB drivers installed',
      install_check5: 'At least 50% battery',
      tab_stock: 'From Stock',
      tab_custom: 'From Custom ROM',
      tab_update: 'Update',
      install_warning: 'Full wipe required — all data will be lost',
      install_warning_desc: 'Make sure you have:',
      install_step1: 'Enable Developer Options & OEM Unlock',
      install_step3: 'Flash with Odin',
      install_step4: 'Format Data & First Boot',
      custom_warning: 'From Custom ROM — Extra care needed',
    },
    it: {
      brand_sub: 'Port One UI · Serie Galaxy S21',
      nav_changelog: 'Changelog',
      nav_install: 'Guida Installazione',
      nav_donate: 'Dona',
      badge_stable: 'Build Stabile · v7.3',
      hero_title: 'Più veloce. Più pulito.<br><span class="gradient-text">Più sotto controllo.</span>',
      hero_lead: 'OneAI è un port One UI 7 basato su Android 15 curato nei minimi dettagli — ottimizzazioni prestazionali, Galaxy AI potenziata e compromessi minimi. Compatibile con Odin, community attiva.',
      btn_download: 'Scarica la ROM',
      btn_install_guide: 'Guida Installazione',
      build_latest: 'Ultima Release',
      stat_devices: 'Dispositivi',
      stat_updated: 'Aggiornamento',
      stat_base: 'Base',
      dl_title: 'Download',
      dl_sub: 'Seleziona il tuo dispositivo per la build corretta',
      dl_label: 'Il tuo dispositivo',
      dl_pick: '— Scegli il tuo modello —',
      dl_placeholder: 'Seleziona il modello sopra',
      feat_title: 'Cosa include',
      feat_sub: 'Tutto quello che serve, niente di superfluo',
      feat_ai_title: 'Galaxy AI Potenziata',
      feat_ai_desc: "Tutte le funzioni Galaxy AI preinstallate e significativamente migliorate rispetto alla versione ufficiale — incluse le funzioni esclusive Galaxy AI della versione cinese.",
      feat_opt_title: 'Ottimizzato sul serio',
      feat_opt_desc: "Supera le ottimizzazioni Samsung — consumo minimo di RAM e batteria, prestazioni migliorate con Proton kernel 5.5.",
      feat_knox_title: 'Deknoxed & KnoxPatch',
      feat_knox_desc: 'Knox rimosso per migliori prestazioni, gestione del calore e controllo di sistema. Le app Knox continuano a funzionare tramite KnoxPatch integrato.',
      feat_audio_title: 'Mod Audio',
      feat_audio_desc: 'Più modalità audio sbloccate, compressione disabilitata, suoni portati da ZFlip 7 per qualità superiore.',
      feat_patch_title: 'Patch-set',
      feat_patch_desc: 'Patch integrate per PIN a 4 cifre, downgrade app, bypass FRP, attestazioni valide e info batteria avanzate.',
      feat_comm_title: 'Community Attiva',
      feat_comm_desc: "Unisciti al gruppo Telegram per discussioni, aiuto, aggiornamenti e contatto diretto con il team di sviluppo.",
      prev_title: 'Anteprima',
      prev_sub: 'OneAI in azione',
      credits_title: 'Credits',
      credits_sub: 'Il team dietro OneAI',
      credit_matteo: 'Build della ROM, ottimizzazioni di sistema, correzioni bug e release.',
      credit_fwp: 'Testing e lavoro sul kernel.',
      credit_extreme: 'KnoxPatch, patch per disabilitare la verifica firma app (ExtremeROM).',
      credit_devcore: 'App OneUI e assistenza su vari argomenti.',
      credit_beyond: 'Build e correzione della ROM flashabile con Odin.',
      credit_elite: 'Supporto generale e assistenza.',
      credit_kusoi: 'Sito web, bot e praticamente tutto il lato tecnico.',
      footer_top: 'Torna su ↑',
      donate_title: 'Supporta OneAI',
      donate_sub: 'Il tuo supporto mantiene attivo lo sviluppo. Scegli uno sviluppatore da supportare:',
      donate_via_pp: 'Dona tramite PayPal →',
      cl_all: 'Tutti',
      cl_dirty: 'Dirty-flashable su v7.2+',
      install_sub: 'Questo processo <strong>cancellerà completamente il dispositivo</strong>. Prima di flashare, assicurati di avere:',
      install_check1: 'Un backup completo dei tuoi dati',
      install_check2: 'Il file ROM corretto per il tuo modello esatto',
      install_check3: 'Odin 3.14+ installato su PC Windows',
      install_check4: 'Driver USB Samsung installati',
      install_check5: 'Almeno il 50% di batteria',
      tab_stock: 'Da Stock',
      tab_custom: 'Da Custom ROM',
      tab_update: 'Aggiornamento',
      install_warning: 'Wipe completo richiesto — tutti i dati saranno persi',
      install_warning_desc: 'Assicurati di avere:',
      install_step1: 'Abilita Opzioni Sviluppatore & OEM Unlock',
      install_step3: 'Flasha con Odin',
      install_step4: 'Format Data & Primo Avvio',
      custom_warning: 'Da Custom ROM — Attenzione extra necessaria',
    },
    de: {
      brand_sub: 'One UI Port · Galaxy S21 Serie',
      nav_changelog: 'Änderungsprotokoll',
      nav_install: 'Installationsanleitung',
      nav_donate: 'Spenden',
      badge_stable: 'Stabiler Build · v7.3',
      hero_title: 'Schneller. Sauberer.<br><span class="gradient-text">Mehr Kontrolle.</span>',
      hero_lead: 'OneAI ist ein sorgfältig kuratierter One UI 7 Port basierend auf Android 15 — Leistungsoptimierungen, verbessertes Galaxy AI und minimale Kompromisse. Odin-kompatibel mit aktiver Community.',
      btn_download: 'ROM herunterladen',
      btn_install_guide: 'Installationsanleitung',
      build_latest: 'Neueste Version',
      stat_devices: 'Geräte',
      stat_updated: 'Letztes Update',
      stat_base: 'Basis',
      dl_title: 'Download',
      dl_sub: 'Wähle dein Gerät für den richtigen Build',
      dl_label: 'Dein Gerät',
      dl_pick: '— Modell auswählen —',
      dl_placeholder: 'Gerät oben auswählen',
      feat_title: 'Was drin ist',
      feat_sub: 'Alles was du brauchst, nichts was du nicht brauchst',
      feat_ai_title: 'Verbessertes Galaxy AI',
      feat_ai_desc: 'Alle Galaxy AI-Funktionen vorinstalliert und deutlich verbessert gegenüber der offiziellen Version — inkl. exklusiver chinesischer Galaxy AI-Funktionen.',
      feat_opt_title: 'Richtig optimiert',
      feat_opt_desc: 'Übertrifft Samsungs eigene Optimierungen — minimaler RAM- und Akkuverbrauch, verbesserte Leistung mit Proton Kernel 5.5.',
      feat_knox_title: 'Deknoxed & KnoxPatch',
      feat_knox_desc: 'Knox entfernt für bessere Leistung, Wärmemanagement und Systemkontrolle. Knox-Apps funktionieren weiterhin über KnoxPatch.',
      feat_audio_title: 'Audio-Mods',
      feat_audio_desc: 'Mehr Audio-Modi entsperrt, Komprimierung deaktiviert, Sounds vom ZFlip 7 portiert.',
      feat_patch_title: 'Patch-Set',
      feat_patch_desc: 'Integrierte Patches für 4-stellige PIN, App-Downgrades, FRP-Bypass, gültige Attestierungen und erweiterte Akkuinfo.',
      feat_comm_title: 'Aktive Community',
      feat_comm_desc: 'Tritt der Telegram-Gruppe für Diskussionen, Hilfe und Updates bei.',
      prev_title: 'Vorschau',
      prev_sub: 'OneAI in Aktion',
      credits_title: 'Credits',
      credits_sub: 'Das Team hinter OneAI',
      credit_matteo: 'ROM-Building, Systemoptimierungen, Bugfixes und Releases.',
      credit_fwp: 'Testing und Kernel-Arbeit.',
      credit_extreme: 'KnoxPatch, App-Signatur-Deaktivierungs-Patches (ExtremeROM).',
      credit_devcore: 'OneUI-Apps und Unterstützung bei verschiedenen Themen.',
      credit_beyond: 'Erstellung und Reparatur von Odin-flashbarer ROM.',
      credit_elite: 'Allgemeiner Support und Hilfe.',
      credit_kusoi: 'Website, Bots und praktisch alles Tech-Bezogene.',
      footer_top: 'Nach oben ↑',
      donate_title: 'OneAI unterstützen',
      donate_sub: 'Deine Unterstützung hält die Entwicklung am Laufen. Wähle einen Entwickler:',
      donate_via_pp: 'Via PayPal spenden →',
      cl_all: 'Alle',
      cl_dirty: 'Dirty-flashbar über v7.2+',
      install_sub: 'Dieser Vorgang <strong>löscht dein Gerät vollständig</strong>. Stelle vorher sicher, dass du hast:',
      install_check1: 'Ein vollständiges Backup deiner Daten',
      install_check2: 'Die korrekte ROM-Datei für dein genaues Modell',
      install_check3: 'Odin 3.14+ auf Windows-PC installiert',
      install_check4: 'Samsung USB-Treiber installiert',
      install_check5: 'Mindestens 50% Akku',
      tab_stock: 'Ab Werk',
      tab_custom: 'Von Custom ROM',
      tab_update: 'Update',
      install_warning: 'Vollständiges Wipe erforderlich — alle Daten gehen verloren',
      install_warning_desc: 'Stelle sicher, dass du hast:',
      install_step1: 'Entwickleroptionen & OEM-Entsperrung aktivieren',
      install_step3: 'Mit Odin flashen',
      install_step4: 'Daten formatieren & Erster Start',
      custom_warning: 'Von Custom ROM — Besondere Vorsicht erforderlich',
    },
    zh: {
      brand_sub: 'One UI 移植 · Galaxy S21 系列',
      nav_changelog: '更新日志',
      nav_install: '安装指南',
      nav_donate: '捐赠',
      badge_stable: '稳定版 · v7.3',
      hero_title: '更快。更纯净。<br><span class="gradient-text">更多掌控。</span>',
      hero_lead: 'OneAI 是一款基于 Android 15 的 One UI 7 精心定制移植版，具备性能优化、增强版 Galaxy AI 功能，妥协极少。支持 Odin 刷机，社区活跃。',
      btn_download: '下载 ROM',
      btn_install_guide: '安装指南',
      build_latest: '最新版本',
      stat_devices: '设备数',
      stat_updated: '最后更新',
      stat_base: '基础版本',
      dl_title: '下载',
      dl_sub: '选择您的设备以获取对应版本',
      dl_label: '您的设备',
      dl_pick: '— 选择型号 —',
      dl_placeholder: '请在上方选择设备型号',
      feat_title: '功能亮点',
      feat_sub: '一切所需，无多余累赘',
      feat_ai_title: '增强版 Galaxy AI',
      feat_ai_desc: '预装所有 Galaxy AI 功能，并对官方版本进行了显著改进——包含西方版本不提供的中国区独家 Galaxy AI 功能。',
      feat_opt_title: '深度优化',
      feat_opt_desc: '超越三星官方优化——极低 RAM 和电量消耗，搭配 Proton 内核 5.5 提升性能。',
      feat_knox_title: '去除 Knox & KnoxPatch',
      feat_knox_desc: '移除 Knox 以提升性能、散热管理和系统控制。Knox 相关应用通过内置 KnoxPatch 继续正常运行。',
      feat_audio_title: '音频修改',
      feat_audio_desc: '解锁更多音频模式，禁用压缩，移植来自 ZFlip 7 的高品质音效。',
      feat_patch_title: '补丁集',
      feat_patch_desc: '内置补丁：4位PIN码、应用降级、FRP绕过、有效认证和增强电池信息。',
      feat_comm_title: '活跃社区',
      feat_comm_desc: '加入 Telegram 群组，获取讨论、帮助、更新，与开发团队直接联系。',
      prev_title: '预览',
      prev_sub: '实际效果展示',
      credits_title: '鸣谢',
      credits_sub: 'OneAI 背后的团队',
      credit_matteo: 'ROM 构建、系统优化、错误修复和发布。',
      credit_fwp: '测试和内核工作。',
      credit_extreme: 'KnoxPatch、应用签名禁用补丁 (ExtremeROM)。',
      credit_devcore: 'OneUI 应用及各类技术支持。',
      credit_beyond: '构建和修复 Odin 可刷写 ROM。',
      credit_elite: '一般支持和协助。',
      credit_kusoi: '网站、机器人及几乎所有技术相关事务。',
      footer_top: '返回顶部 ↑',
      donate_title: '支持 OneAI',
      donate_sub: '您的支持让开发持续进行。选择一位开发者进行支持：',
      donate_via_pp: '通过 PayPal 捐赠 →',
      cl_all: '全部',
      cl_dirty: '可在 v7.2+ 上脏刷',
      install_sub: '此过程将<strong>完全清除您的设备</strong>。刷机前请确保您已具备：',
      install_check1: '完整的数据备份',
      install_check2: '适合您确切型号的 ROM 文件',
      install_check3: 'Windows PC 上已安装 Odin 3.14+',
      install_check4: '已安装三星 USB 驱动',
      install_check5: '至少 50% 电量',
      tab_stock: '从原版刷入',
      tab_custom: '从第三方 ROM',
      tab_update: '更新',
      install_warning: '需要完整清除 — 所有数据将丢失',
      install_warning_desc: '请确保您已具备：',
      install_step1: '启用开发者选项 & OEM 解锁',
      install_step3: '使用 Odin 刷写',
      install_step4: '格式化数据 & 首次启动',
      custom_warning: '从第三方 ROM — 需要格外小心',
    }
  },

  init() {
    // Detect browser language
    const browserLang = navigator.language?.slice(0,2).toLowerCase();
    const saved = (() => { try { return localStorage.getItem('oneai-lang'); } catch { return null; } })();
    const initial = saved || (['it','de','zh'].includes(browserLang) ? browserLang : 'en');
    this.apply(initial);

    // Desktop dropdown
    const toggleBtn = document.getElementById('langToggleBtn');
    const dropdown = document.getElementById('langDropdown');
    toggleBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdown.hasAttribute('hidden');
      if (isHidden) {
        dropdown.removeAttribute('hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        dropdown.setAttribute('hidden', '');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#langSelector')) {
        dropdown?.setAttribute('hidden', '');
        toggleBtn?.setAttribute('aria-expanded', 'false');
      }
    });

    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.apply(btn.dataset.lang);
        dropdown.setAttribute('hidden', '');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Mobile lang buttons
    document.querySelectorAll('.lang-option-mobile').forEach(btn => {
      btn.addEventListener('click', () => this.apply(btn.dataset.lang));
    });
  },

  apply(lang) {
    if (!this._data[lang]) lang = 'en';
    this._lang = lang;
    try { localStorage.setItem('oneai-lang', lang); } catch {}

    const strings = this._data[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (strings[key] !== undefined) {
        el.innerHTML = strings[key];
      }
    });

    // Update html lang attr
    document.documentElement.lang = lang;

    // Update label
    const labelMap = { en: 'EN', it: 'IT', de: 'DE', zh: '中文' };
    const labelEl = document.getElementById('langCurrentLabel');
    if (labelEl) labelEl.textContent = labelMap[lang] || lang.toUpperCase();

    // Update active states
    document.querySelectorAll('.lang-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-option-mobile').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Also refresh DeviceDownloadSelector note text
    if (typeof DeviceDownloadSelector !== 'undefined') {
      DeviceDownloadSelector._refreshNote(lang);
    }
  },

  t(key) {
    return this._data[this._lang]?.[key] ?? this._data['en']?.[key] ?? key;
  }
};

/* ═══════════════════════════════════════════
   12. BackgroundCanvas — lightweight particle network
   ═══════════════════════════════════════════ */
const BackgroundCanvas = {
  canvas: null,
  ctx: null,
  particles: [],
  raf: null,
  _reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  _mobile: window.innerWidth < 768,

  init() {
    if (this._reduced) return; // Respect reduced motion

    this.canvas = document.getElementById('bgCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this._resize();
    this._spawn();
    this._loop();

    window.addEventListener('resize', () => {
      this._resize();
      this._spawn();
    });
  },

  _resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._mobile = window.innerWidth < 768;
  },

  _spawn() {
    const count = this._mobile ? 30 : 60; // fewer on mobile
    this.particles = [];
    const w = this.canvas.width, h = this.canvas.height;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
      });
    }
  },

  _loop() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    const particles = this.particles;
    const maxDist = this._mobile ? 100 : 140;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const dotColor = isDark ? 'rgba(124,111,245,' : 'rgba(100,90,210,';
    const lineBase = isDark ? 'rgba(94,196,240,' : 'rgba(100,90,210,';

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = dotColor + '0.5)';
      ctx.fill();

      // Draw lines to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = lineBase + alpha + ')';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    this.raf = requestAnimationFrame(() => this._loop());
  }
};

