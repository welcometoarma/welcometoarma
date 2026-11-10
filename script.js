document.addEventListener('DOMContentLoaded', function () {
  
  const isMobile = window.innerWidth <= 900;

  // --- 1. DESKTOP NAVIGATION MENU ---
  const navLinks = document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');

  function closeMenu() {
    if (navLinks) navLinks.classList.remove('open');
    if (hamburger) {
      const icon = hamburger.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (navLinks.classList.contains('open')) {
        closeMenu();
      } else {
        navLinks.classList.add('open');
        const icon = hamburger.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        }
      }
    });

    document.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() { closeMenu(); });
    });
  }

  // --- 2. LANGUAGE SWITCHER ---
  // Note: this static handler only covers elements present at DOMContentLoaded.
  // The dynamic re-query handler in the enhancement pack (below) covers
  // everything injected later (sidebar, dock, TL;DR, recommendations, etc.)
  const langBtns = document.querySelectorAll('.lang-btn');
  const langContents = document.querySelectorAll('.lang-content');
  
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      langContents.forEach(content => {
        if (content.getAttribute('data-lang') === lang) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // --- 3. THEME TOGGLE (Top Nav) ---
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = themeToggle.querySelector('i');
      const text = themeToggle.querySelector('span');
      if (document.body.classList.contains('dark')) {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark';
      } else {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light';
      }
    });
  }

  // --- 4. SCROLL TO TOP ---
  const scrollTopBtn = document.getElementById('scrollTop');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    });
    scrollTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  // --- 5. MOBILE APP ACCORDION (smooth animated open / close) ---
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bodyTransition(body) {
    if (reduceMotion) return 0;
    const d = parseFloat(getComputedStyle(body).transitionDuration);
    return isNaN(d) ? 0 : d;
  }

  function openSectionSmooth(card) {
    if (!card || !card.classList.contains('mobile-collapsed')) return;
    const body = card.querySelector('.chapter-body');

    if (card.style.display === 'none') card.style.display = '';

    card.classList.remove('mobile-collapsed');

    let parent = card.parentElement;
    while (parent) {
      if (parent.classList && parent.classList.contains('chapter-card')) {
        parent.classList.remove('mobile-collapsed');
      }
      parent = parent.parentElement;
    }

    if (!body) return;

    const dur = bodyTransition(body);
    body.style.height = '0px';
    void body.offsetHeight;

    if (dur === 0) { body.style.height = ''; return; }

    const target = body.scrollHeight;
    body.style.height = target === 0 ? '' : target + 'px';
    if (target === 0) return;

    let settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      body.style.height = '';
    }
    body.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== body || e.propertyName !== 'height') return;
      body.removeEventListener('transitionend', onEnd);
      settle();
    });
    setTimeout(settle, dur * 1000 + 250);
  }

  function closeSectionSmooth(card) {
    if (!card || card.classList.contains('mobile-collapsed')) return;
    const body = card.querySelector('.chapter-body');
    if (!body) { card.classList.add('mobile-collapsed'); return; }

    const dur = bodyTransition(body);
    if (dur === 0) { card.classList.add('mobile-collapsed'); return; }

    body.style.height = body.scrollHeight + 'px';
    void body.offsetHeight;
    card.classList.add('mobile-collapsed');

    let settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      body.style.height = '';
    }
    body.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== body || e.propertyName !== 'height') return;
      body.removeEventListener('transitionend', onEnd);
      settle();
    });
    setTimeout(settle, dur * 1000 + 250);
  }

  window.addEventListener('resize', function () {
    document.querySelectorAll('.chapter-card:not(.mobile-collapsed) .chapter-body').forEach(function (b) {
      b.style.height = '';
    });
  });

  if (isMobile) {
    document.querySelectorAll('.chapter-card').forEach(card => {
      card.classList.add('mobile-collapsed');
    });

    document.querySelectorAll('.chapter-header').forEach(header => {
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.setAttribute('aria-expanded', 'false');

      header.addEventListener('click', function() {
        const card = this.closest('.chapter-card');
        const y = card.getBoundingClientRect().top + window.pageYOffset - 110;

        if (card.classList.contains('mobile-collapsed')) {
          openSectionSmooth(card);
          this.setAttribute('aria-expanded', 'true');
          window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
          closeSectionSmooth(card);
          this.setAttribute('aria-expanded', 'false');
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });

      header.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
      });
    });
  }

  // --- 6. SMOOTH SCROLL + AUTO-OPEN SECTION ---
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    let targetElement;
    try { targetElement = document.querySelector(targetId); } catch (err) { return; }
    if (!targetElement) return;

    e.preventDefault();

    if (isMobile) {
      const card = targetElement.classList.contains('chapter-card')
        ? targetElement
        : targetElement.closest('.chapter-card');
      if (card) openSectionSmooth(card);
    }

    const headerOffset = isMobile ? 110 : 90; 
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  });

  // ================== MOBILE APP UI INJECTION ==================
  
  // 1. Inject Search Bar into Top Header (next to language)
  const navControls = document.querySelector('.nav-controls');
  if (navControls && isMobile) {
    const searchHTML = `
      <div class="header-search">
        <i class="fas fa-search"></i>
        <input type="text" id="appSearch" placeholder="Search guide...">
      </div>
    `;
    navControls.insertAdjacentHTML('afterbegin', searchHTML);
  }

  // 2. Inject 5-language Sidebar + Dock
  const mobileUIHTML = `
    <!-- Sidebar Drawer (5-language) -->
    <div class="app-sidebar" id="appSidebar">
      <div class="sidebar-header">
        <h2>
          <span class="lang-content active" data-lang="en">Menu</span>
          <span class="lang-content" data-lang="it">Menu</span>
          <span class="lang-content" data-lang="de">Menü</span>
          <span class="lang-content" data-lang="fr">Menu</span>
          <span class="lang-content" data-lang="sk">Menu</span>
        </h2>
        <button class="close-sidebar" id="closeSidebar" aria-label="Close menu"><i class="fas fa-times"></i></button>
      </div>
      <div class="sidebar-links">
        <a href="#welcome" class="sidebar-link">
          <i class="fas fa-home"></i>
          <span class="lang-content active" data-lang="en">Welcome</span>
          <span class="lang-content" data-lang="it">Benvenuto</span>
          <span class="lang-content" data-lang="de">Willkommen</span>
          <span class="lang-content" data-lang="fr">Bienvenue</span>
          <span class="lang-content" data-lang="sk">Vitajte</span>
        </a>
        <a href="#essentials" class="sidebar-link">
          <i class="fas fa-info-circle"></i>
          <span class="lang-content active" data-lang="en">Essential Info</span>
          <span class="lang-content" data-lang="it">Informazioni Essenziali</span>
          <span class="lang-content" data-lang="de">Wichtige Infos</span>
          <span class="lang-content" data-lang="fr">Infos Essentielles</span>
          <span class="lang-content" data-lang="sk">Dôležité Info</span>
        </a>
        <a href="#water" class="sidebar-link">
          <i class="fas fa-water"></i>
          <span class="lang-content active" data-lang="en">Water Tank</span>
          <span class="lang-content" data-lang="it">Serbatoio Acqua</span>
          <span class="lang-content" data-lang="de">Wassertank</span>
          <span class="lang-content" data-lang="fr">Réservoir d'eau</span>
          <span class="lang-content" data-lang="sk">Nádrž na vodu</span>
        </a>
        <a href="#power" class="sidebar-link">
          <i class="fas fa-bolt"></i>
          <span class="lang-content active" data-lang="en">Electricity</span>
          <span class="lang-content" data-lang="it">Elettricità</span>
          <span class="lang-content" data-lang="de">Strom</span>
          <span class="lang-content" data-lang="fr">Électricité</span>
          <span class="lang-content" data-lang="sk">Elektrina</span>
        </a>
        <a href="#checkin" class="sidebar-link">
          <i class="fas fa-key"></i>
          <span class="lang-content active" data-lang="en">Key & Door</span>
          <span class="lang-content" data-lang="it">Chiave e Porta</span>
          <span class="lang-content" data-lang="de">Schlüssel & Tür</span>
          <span class="lang-content" data-lang="fr">Clé & Porte</span>
          <span class="lang-content" data-lang="sk">Kľúč a Dvere</span>
        </a>
        <a href="#find" class="sidebar-link">
          <i class="fas fa-location-dot"></i>
          <span class="lang-content active" data-lang="en">Find Things</span>
          <span class="lang-content" data-lang="it">Trova Oggetti</span>
          <span class="lang-content" data-lang="de">Dinge finden</span>
          <span class="lang-content" data-lang="fr">Trouver les objets</span>
          <span class="lang-content" data-lang="sk">Nájsť veci</span>
        </a>
        <a href="#recycling" class="sidebar-link">
          <i class="fas fa-recycle"></i>
          <span class="lang-content active" data-lang="en">Recycling</span>
          <span class="lang-content" data-lang="it">Raccolta Differenziata</span>
          <span class="lang-content" data-lang="de">Recycling</span>
          <span class="lang-content" data-lang="fr">Recyclage</span>
          <span class="lang-content" data-lang="sk">Recyklácia</span>
        </a>
        <a href="#rules" class="sidebar-link">
          <i class="fas fa-list"></i>
          <span class="lang-content active" data-lang="en">House Rules</span>
          <span class="lang-content" data-lang="it">Regole della Casa</span>
          <span class="lang-content" data-lang="de">Hausregeln</span>
          <span class="lang-content" data-lang="fr">Règles de la maison</span>
          <span class="lang-content" data-lang="sk">Domové pravidlá</span>
        </a>
        <a href="#checkout" class="sidebar-link">
          <i class="fas fa-sign-out-alt"></i>
          <span class="lang-content active" data-lang="en">Check-out</span>
          <span class="lang-content" data-lang="it">Partenza</span>
          <span class="lang-content" data-lang="de">Abreise</span>
          <span class="lang-content" data-lang="fr">Départ</span>
          <span class="lang-content" data-lang="sk">Odchod</span>
        </a>
        <a href="#safety" class="sidebar-link">
          <i class="fas fa-shield-alt"></i>
          <span class="lang-content active" data-lang="en">Safety</span>
          <span class="lang-content" data-lang="it">Sicurezza</span>
          <span class="lang-content" data-lang="de">Sicherheit</span>
          <span class="lang-content" data-lang="fr">Sécurité</span>
          <span class="lang-content" data-lang="sk">Bezpečnosť</span>
        </a>
      </div>
    </div>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Glassy Bottom Dock (5-language labels) -->
    <div class="mobile-glass-dock">
      <a href="#welcome" class="dock-btn" aria-label="Home">
        <i class="fas fa-home"></i>
        <span class="dock-label">
          <span class="lang-content active" data-lang="en">Home</span>
          <span class="lang-content" data-lang="it">Home</span>
          <span class="lang-content" data-lang="de">Start</span>
          <span class="lang-content" data-lang="fr">Accueil</span>
          <span class="lang-content" data-lang="sk">Domov</span>
        </span>
      </a>
      <a href="#water" class="dock-btn" aria-label="Water">
        <i class="fas fa-water"></i>
        <span class="dock-label">
          <span class="lang-content active" data-lang="en">Water</span>
          <span class="lang-content" data-lang="it">Acqua</span>
          <span class="lang-content" data-lang="de">Wasser</span>
          <span class="lang-content" data-lang="fr">Eau</span>
          <span class="lang-content" data-lang="sk">Voda</span>
        </span>
      </a>
      <button class="dock-btn menu-btn" id="openSidebar" aria-label="Menu">
        <i class="fas fa-bars"></i>
        <span class="dock-label">
          <span class="lang-content active" data-lang="en">Menu</span>
          <span class="lang-content" data-lang="it">Menu</span>
          <span class="lang-content" data-lang="de">Menü</span>
          <span class="lang-content" data-lang="fr">Menu</span>
          <span class="lang-content" data-lang="sk">Menu</span>
        </span>
      </button>
      <a href="#power" class="dock-btn" aria-label="Power">
        <i class="fas fa-bolt"></i>
        <span class="dock-label">
          <span class="lang-content active" data-lang="en">Power</span>
          <span class="lang-content" data-lang="it">Luce</span>
          <span class="lang-content" data-lang="de">Strom</span>
          <span class="lang-content" data-lang="fr">Électro</span>
          <span class="lang-content" data-lang="sk">Prúd</span>
        </span>
      </a>
      <button class="dock-btn share-btn" aria-label="Share">
        <i class="fas fa-share-alt"></i>
        <span class="dock-label">
          <span class="lang-content active" data-lang="en">Share</span>
          <span class="lang-content" data-lang="it">Condividi</span>
          <span class="lang-content" data-lang="de">Teilen</span>
          <span class="lang-content" data-lang="fr">Partager</span>
          <span class="lang-content" data-lang="sk">Zdieľať</span>
        </span>
      </button>
    </div>

    <!-- Floating Buttons -->
    <div class="floating-buttons">
      <button class="floating-theme-toggle"><i class="fas fa-moon"></i></button>
      <button class="floating-print-btn"><i class="fas fa-print"></i></button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', mobileUIHTML);

  // ================== MOBILE APP LOGIC ==================

  // Sidebar Logic
  const openSidebarBtn = document.getElementById('openSidebar');
  const closeSidebarBtn = document.getElementById('closeSidebar');
  const appSidebar = document.getElementById('appSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    appSidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
  }
  function closeSidebar() {
    appSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', function() {
      closeSidebar();
    });
  });

  // Smart Keyword Search Logic
  const searchInput = document.getElementById('appSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const term = this.value.toLowerCase().trim();
      const keywords = term.split(' ').filter(k => k.length > 0);
      let firstMatch = null;

      document.querySelectorAll('.chapter-card').forEach(card => {
        const cardText = card.textContent.toLowerCase();
        
        if (keywords.length === 0) {
          card.style.display = 'block';
          card.classList.add('mobile-collapsed'); 
          return;
        }

        const isMatch = keywords.every(keyword => cardText.includes(keyword));

        if (isMatch) {
          card.style.display = 'block';
          card.classList.remove('mobile-collapsed'); 
          if (!firstMatch) firstMatch = card; 
        } else {
          card.style.display = 'none';
        }
      });

      if (firstMatch && keywords.length > 0) {
        const yOffset = -110;
        const y = firstMatch.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  }

  // ================== ✨ PREMIUM APP POLISH ==================

  // --- A. READING PROGRESS BAR ---
  const stickyNav = document.querySelector('.sticky-nav');
  if (stickyNav) {
    stickyNav.insertAdjacentHTML('beforeend', '<div class="reading-progress"><span></span></div>');
  }
  const progressFill = document.querySelector('.reading-progress span');
  function updateProgressBar() {
    if (!progressFill) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progressFill.style.width = (max > 0 ? Math.min(doc.scrollTop / max, 1) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar();

  // --- B. STICKY HEADER SHRINKS WHILE SCROLLING ---
  function updateNavHeightVar() {
    if (stickyNav) document.documentElement.style.setProperty('--nav-h', stickyNav.offsetHeight + 'px');
  }
  let navWasScrolled = false;
  window.addEventListener('scroll', function () {
    if (!stickyNav) return;
    const scrolled = window.scrollY > 60;
    if (scrolled !== navWasScrolled) {
      navWasScrolled = scrolled;
      stickyNav.classList.toggle('nav-scrolled', scrolled);
      requestAnimationFrame(updateNavHeightVar);
    }
  }, { passive: true });
  window.addEventListener('resize', updateNavHeightVar);
  updateNavHeightVar();

  // --- C. DOCK SCROLL-SPY ---
  const dockAnchors = document.querySelectorAll('.mobile-glass-dock .dock-btn[href^="#"]');
  let spyPending = false;
  function updateDockSpy() {
    spyPending = false;
    let currentId = null;
    document.querySelectorAll('.chapter-card').forEach(card => {
      if (card.getBoundingClientRect().top <= 160) currentId = card.id;
    });
    dockAnchors.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('href') === '#' + currentId);
    });
  }
  window.addEventListener('scroll', function () {
    if (!spyPending) { spyPending = true; requestAnimationFrame(updateDockSpy); }
  }, { passive: true });
  updateDockSpy();

  // --- D. CLEAR (✕) BUTTON IN THE SEARCH BAR ---
  if (searchInput) {
    const searchWrap = searchInput.closest('.header-search');
    if (searchWrap && !searchWrap.querySelector('.search-clear')) {
      const clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'search-clear';
      clearBtn.setAttribute('aria-label', 'Clear search');
      clearBtn.innerHTML = '<i class="fas fa-times"></i>';
      searchWrap.appendChild(clearBtn);
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
      });
    }
    searchInput.addEventListener('input', function () {
      if (searchWrap) searchWrap.classList.toggle('has-value', this.value.length > 0);
    });
  }

  // Share Logic
  const shareBtn = document.querySelector('.share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: 'Vitamin Sea Mondello Beach — Guest Guide', url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'));
      }
    });
  }

  // Floating Theme Toggle
  const floatingThemeToggle = document.querySelector('.floating-theme-toggle');
  if (floatingThemeToggle) {
    floatingThemeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const icon = floatingThemeToggle.querySelector('i');
      if (document.body.classList.contains('dark')) {
        icon.className = 'fas fa-sun';
      } else {
        icon.className = 'fas fa-moon';
      }
    });
  }

  // Floating Print
  const floatingPrintBtn = document.querySelector('.floating-print-btn');
  if (floatingPrintBtn) {
    floatingPrintBtn.addEventListener('click', () => window.print());
  }

  // --- F. MOBILE FOOTER CLEARANCE ---
  const footerEl = document.querySelector('.footer');
  const floatingBtnsEl = document.querySelector('.floating-buttons');
  if (footerEl && floatingBtnsEl && 'IntersectionObserver' in window) {
    const footerObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        floatingBtnsEl.classList.toggle('footer-visible', entry.isIntersecting);
      });
    }, { rootMargin: '0px 0px -20px 0px', threshold: 0.01 });
    footerObs.observe(footerEl);
  }

  // Image Lightbox
  const galleryImages = document.querySelectorAll('.step-gallery-item img, .mini-gallery img');
  if (galleryImages.length > 0) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<span class="close-lightbox">&times;</span><img src="" alt="Zoomed Image">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const closeLightbox = lightbox.querySelector('.close-lightbox');

    galleryImages.forEach(img => {
      img.addEventListener('click', function() {
        lightbox.classList.add('show');
        lightboxImg.src = this.src;
      });
    });

    closeLightbox.addEventListener('click', () => { lightbox.classList.remove('show'); });
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('show'); });
  }

});

/* ============================================================
   ✨ ENHANCEMENT PACK v3 — 5-language, accordion-ready
   Injects: emergency strip, TL;DR, weather chip, chapter meta,
   recommendations chapter, resume pill.
   Also: second language-switch handler that re-queries everything
   (covers the 5-language dock + sidebar + search placeholder +
   every injected element).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- EDIT HERE: host details + recommendation list ---------- */
  const CONFIG = {
    hostWhatsApp: '393310000000',   // ← digits only, no +
  };

  const RECOMMENDATIONS = [
    { emoji: '🍋', query: 'Gelateria Il Sole Mondello Palermo', name: 'Gelateria Il Sole',
      cat:  { en:'Gelato',  it:'Gelato',    de:'Eis',            fr:'Gelato',      sk:'Zmrzlina' },
      meta: { en:'5 min walk', it:'5 min a piedi', de:'5 Min. zu Fuß', fr:'5 min à pied', sk:'5 min pešo' } },
    { emoji: '🌅', query: 'Capo Gallo Mondello Palermo', name: 'Capo Gallo',
      cat:  { en:'Sunset',  it:'Tramonto',  de:'Sonnenuntergang', fr:'Coucher de soleil', sk:'Západ slnka' },
      meta: { en:'15 min drive', it:'15 min in auto', de:'15 Min. Fahrt', fr:'15 min en voiture', sk:'15 min autom' } },
    { emoji: '🍕', query: 'Antica Focacceria Mondello Palermo', name: 'Antica Focacceria',
      cat:  { en:'Pizza',   it:'Pizza',     de:'Pizza',           fr:'Pizza',       sk:'Pizza' },
      meta: { en:'8 min walk', it:'8 min a piedi', de:'8 Min. zu Fuß', fr:'8 min à pied', sk:'8 min pešo' } },
    { emoji: '🐟', query: 'Trattoria da Salvo Mondello Palermo', name: 'Trattoria da Salvo',
      cat:  { en:'Seafood', it:'Pesce',     de:'Meeresfrüchte',   fr:'Fruits de mer', sk:'Morské plody' },
      meta: { en:'Reserve ahead', it:'Prenota prima', de:'Vorher reservieren', fr:'Réservez à l\'avance', sk:'Rezervujte vopred' } },
    { emoji: '🏖', query: 'Lido Valdesi Mondello Palermo', name: 'Lido Valdesi',
      cat:  { en:'Beach chairs', it:'Sdraio', de:'Strandliegen',   fr:'Transats',    sk:'Plážové ležadlá' },
      meta: { en:'3 min walk', it:'3 min a piedi', de:'3 Min. zu Fuß', fr:'3 min à pied', sk:'3 min pešo' } },
    { emoji: '🥐', query: 'Bar Al Piccolo Mondello Palermo', name: 'Bar Al Piccolo',
      cat:  { en:'Arancina', it:'Arancina', de:'Arancina',        fr:'Arancina',    sk:'Arancina' },
      meta: { en:'Next door', it:'Accanto', de:'Direkt nebenan',  fr:'À côté',      sk:'Hneď vedľa' } },
  ];

  const TLDR = {
    water: {
      en: 'Close the outside valve → flip 2 switches → turn the black tap RIGHT → motor runs.',
      it: 'Chiudi la valvola esterna → aziona 2 interruttori → gira il rubinetto nero a DESTRA → parte il motore.',
      de: 'Außenventil schließen → 2 Schalter umlegen → schwarzen Hahn nach RECHTS drehen → Motor läuft.',
      fr: 'Fermez la vanne extérieure → basculez 2 interrupteurs → tournez le robinet noir à DROITE → le moteur tourne.',
      sk: 'Zatvorte vonkajší ventil → prepnite 2 spínače → otočte čierny ventil DOPRAVA → motor beží.',
    },
    power: {
      en: 'Check the hallway fuse box first. Still out? Flip the "Vitamin Sea" switch downstairs.',
      it: 'Controlla prima il quadro elettrico nel corridoio. Ancora niente? Aziona l\'interruttore "Vitamin Sea" al piano di sotto.',
      de: 'Prüfen Sie zuerst den Sicherungskasten im Flur. Immer noch kein Strom? Betätigen Sie den "Vitamin Sea"-Schalter unten.',
      fr: 'Vérifiez d\'abord le tableau électrique du couloir. Toujours rien ? Actionnez l\'interrupteur "Vitamin Sea" en bas.',
      sk: 'Najprv skontrolujte rozvádzač na chodbe. Stále nič? Zapnite spínač "Vitamin Sea" dole.',
    },
    checkin: {
      en: 'Lock from inside with the small knob above the handle. Lock from outside with the key. Never lock the downstairs door.',
      it: 'Chiudi dall\'interno con la manopola sopra la maniglia. Chiudi dall\'esterno con la chiave. Non chiudere mai la porta al piano terra.',
      de: 'Von innen mit dem kleinen Knopf über dem Griff verriegeln. Von außen mit dem Schlüssel. Nie die Haustür unten abschließen.',
      fr: 'Verrouillez de l\'intérieur avec le petit bouton au-dessus de la poignée. De l\'extérieur avec la clé. Ne verrouillez jamais la porte du bas.',
      sk: 'Zvnútra zamknite malým gombíkom nad kľučkou. Zvonku kľúčom. Nikdy nezamykajte dvere na prízemí.',
    },
    checkout: {
      en: 'By 10:00 → close windows, lights off, key on the white TV tray, message us when done.',
      it: 'Entro le 10:00 → chiudi le finestre, spegni le luci, chiave sul vassoio bianco della TV, avvisaci quando hai finito.',
      de: 'Bis 10:00 → Fenster schließen, Licht aus, Schlüssel auf das weiße TV-Tablett, uns benachrichtigen.',
      fr: 'Avant 10h00 → fermez les fenêtres, éteignez les lumières, clé sur le plateau blanc de la TV, prévenez-nous.',
      sk: 'Do 10:00 → zatvorte okná, zhasnite, kľúč na biely podnos pri TV, dajte nám vedieť.',
    },
  };

  const L = {
    emergency: { en:'Emergency', it:'Emergenza', de:'Notfall',   fr:'Urgence', sk:'Núdza' },
    medical:   { en:'Medical',   it:'Medico',    de:'Medizin',   fr:'Médical', sk:'Lekárske' },
    host:      { en:'Host',      it:'Host',      de:'Gastgeber', fr:'Hôte',    sk:'Hostiteľ' },
    wifi:      { en:'Wi-Fi',     it:'Wi-Fi',     de:'Wi-Fi',     fr:'Wi-Fi',   sk:'Wi-Fi' },
    chat:      { en:'Chat',      it:'Chatta',    de:'Schreiben', fr:'Discuter', sk:'Napísať' },
    info:      { en:'Info',      it:'Info',      de:'Info',      fr:'Infos',   sk:'Info' },
    resume:    { en:'Resume',    it:'Riprendi',  de:'Fortsetzen', fr:'Reprendre', sk:'Pokračovať' },
    tldr:      { en:'In one line ·', it:'In breve ·', de:'Kurz gesagt ·', fr:'En bref ·', sk:'V skratke ·' },
    recoTitle: {
      en:'Our Mondello Favourites',
      it:'I Nostri Preferiti a Mondello',
      de:'Unsere Mondello-Favoriten',
      fr:'Nos Coups de Cœur à Mondello',
      sk:'Naše obľúbené miesta v Mondelle',
    },
    recoIntro: {
      en:'A short, hand-picked list — the spots we actually go to. Tap any card to open it in Google Maps.',
      it:'Una lista breve e selezionata — i posti dove andiamo davvero. Tocca una scheda per aprirla in Google Maps.',
      de:'Eine kurze, handverlesene Liste — die Orte, an die wir wirklich gehen. Tippen Sie auf eine Karte, um sie in Google Maps zu öffnen.',
      fr:'Une courte liste triée sur le volet — les endroits où nous allons vraiment. Touchez une carte pour l\'ouvrir dans Google Maps.',
      sk:'Krátky, ručne vybraný zoznam — miesta, kam naozaj chodíme. Kliknutím na kartu ju otvoríte v Google Mapách.',
    },
    sidebarReco: {
      en:'Recommendations', it:'Consigli', de:'Empfehlungen', fr:'Recommandations', sk:'Odporúčania',
    },
    searchPlaceholder: {
      en:'Search guide...',
      it:'Cerca nella guida...',
      de:'Anleitung durchsuchen...',
      fr:'Rechercher dans le guide...',
      sk:'Hľadať v sprievodcovi...',
    },
  };

  const LANGS = ['en','it','de','fr','sk'];

  /* ---------- Helpers ---------- */
  function langHtml(tag, className, translations, extra = '') {
    return LANGS.map((l, i) =>
      `<${tag} class="${className} lang-content ${i===0?'active':''}" data-lang="${l}" ${extra}>${translations[l]}</${tag}>`
    ).join('');
  }

  /* ---------- Main ---------- */
  function init() {

    /* ---- Weather chip ---- */
    (async function initWeather() {
      const badge = document.querySelector('.hero-badge');
      if (!badge || badge.querySelector('.weather-chip')) return;
      const CACHE = 'vs-weather-v2';
      const emoji = (c) => c === 0 ? '☀️' : c <= 3 ? '⛅' : c <= 48 ? '🌫️'
        : c <= 67 ? '🌧️' : c <= 77 ? '❄️' : c <= 82 ? '🌦️' : c <= 86 ? '🌨️' : '⛈️';
      const render = (d) => {
        const t = Math.round(d.current.temperature_2m);
        const sunset = (d.daily.sunset?.[0] || '').split('T')[1]?.slice(0, 5);
        const chip = document.createElement('span');
        chip.className = 'weather-chip';
        chip.textContent = sunset ? `${emoji(d.current.weather_code)} ${t}° · 🌅 ${sunset}` : `${emoji(d.current.weather_code)} ${t}°`;
        badge.appendChild(chip);
      };
      try {
        const raw = localStorage.getItem(CACHE);
        if (raw) {
          const { data, ts } = JSON.parse(raw);
          if (Date.now() - ts < 30 * 60 * 1000) return render(data);
        }
      } catch (_) {}
      try {
        const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.2056&longitude=13.3237&current=temperature_2m,weather_code,is_day&daily=sunset&timezone=Europe/Rome&forecast_days=1');
        if (!r.ok) return;
        const data = await r.json();
        localStorage.setItem(CACHE, JSON.stringify({ data, ts: Date.now() }));
        render(data);
      } catch (_) {}
    })();

    /* ---- Hero scroll chevron ---- */
    const hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.hero-scroll')) {
      const chev = document.createElement('div');
      chev.className = 'hero-scroll';
      chev.innerHTML = '<i class="fas fa-chevron-down"></i>';
      chev.setAttribute('aria-hidden', 'true');
      hero.appendChild(chev);
    }

    /* ---- Emergency strip (5-language labels) ---- */
    const container = document.querySelector('.container');
    if (container && !container.querySelector('.essentials-strip')) {
      const strip = document.createElement('div');
      strip.className = 'essentials-strip';
      strip.innerHTML = `
        <a href="tel:112" class="es-item es-emergency" aria-label="Call 112 emergency">
          <span class="es-icon">🚨</span>
          ${langHtml('span', 'es-label', L.emergency)}
          <span class="es-value">112</span>
        </a>
        <a href="tel:118" class="es-item" aria-label="Call 118 medical">
          <span class="es-icon">🚑</span>
          ${langHtml('span', 'es-label', L.medical)}
          <span class="es-value">118</span>
        </a>
        <a href="https://wa.me/${CONFIG.hostWhatsApp}" target="_blank" rel="noopener" class="es-item" aria-label="Message the host on WhatsApp">
          <span class="es-icon">💬</span>
          ${langHtml('span', 'es-label', L.host)}
          ${langHtml('span', 'es-value', L.chat)}
        </a>
        <a href="#essentials" class="es-item" aria-label="Wi-Fi and essential info">
          <span class="es-icon">📶</span>
          ${langHtml('span', 'es-label', L.wifi)}
          ${langHtml('span', 'es-value', L.info)}
        </a>`;
      container.insertBefore(strip, container.firstChild);
    }

    /* ---- TL;DR boxes (5-language) ---- */
    Object.entries(TLDR).forEach(([id, translations]) => {
      const body = document.querySelector('#' + id + ' .chapter-body');
      if (!body || body.querySelector('.tldr')) return;
      const box = document.createElement('div');
      box.className = 'tldr';
      box.innerHTML = `<span class="tldr-icon">✨</span><div class="tldr-body">${
        LANGS.map((l, i) =>
          `<span class="lang-content ${i===0?'active':''}" data-lang="${l}"><strong>${L.tldr[l]}</strong>${translations[l]}</span>`
        ).join('')
      }</div>`;
      body.insertBefore(box, body.firstChild);
    });

    /* ---- Recommendations chapter ---- */
    if (container && !document.getElementById('recommendations')) {
      const cardsHtml = RECOMMENDATIONS.map(r => {
        const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r.query);
        return `<a class="reco-card" href="${url}" target="_blank" rel="noopener">
          <div class="reco-emoji">${r.emoji}</div>
          <div class="reco-content">
            ${langHtml('div', 'reco-cat', r.cat)}
            <div class="reco-name">${r.name}</div>
            <div class="reco-meta"><i class="fas fa-map-marker-alt"></i>${langHtml('span', '', r.meta)}</div>
          </div>
          <i class="fas fa-arrow-right reco-arrow"></i>
        </a>`;
      }).join('');

      const section = document.createElement('div');
      section.className = 'chapter-card';
      section.id = 'recommendations';
      section.innerHTML = `
        <div class="chapter-header">
          <div class="chapter-icon">💛</div>
          ${langHtml('div', 'chapter-title', L.recoTitle)}
        </div>
        <div class="chapter-body">
          ${langHtml('p', 'reco-intro', L.recoIntro)}
          <div class="reco-grid">${cardsHtml}</div>
        </div>`;
      container.appendChild(section);

      wireAccordion(section);
    }

    /* ---- Chapter numbers + reading time ---- */
    document.querySelectorAll('.chapter-card').forEach((card, i) => {
      const header = card.querySelector('.chapter-header');
      if (!header || header.querySelector('.chapter-meta')) return;
      const body = card.querySelector('.chapter-body');
      const words = body ? (body.textContent.trim().split(/\s+/).filter(Boolean).length || 0) : 0;
      const mins = Math.max(1, Math.ceil(words / 200));
      const meta = document.createElement('div');
      meta.className = 'chapter-meta';
      meta.innerHTML = `<span class="chapter-num">${String(i + 1).padStart(2, '0')}</span><span class="reading-time">~${mins} min</span>`;
      header.appendChild(meta);
    });

    /* ---- Sidebar link for Recommendations ---- */
    const sidebarLinks = document.querySelector('.sidebar-links');
    if (sidebarLinks && !sidebarLinks.querySelector('a[href="#recommendations"]')) {
      const link = document.createElement('a');
      link.href = '#recommendations';
      link.className = 'sidebar-link';
      link.innerHTML = `<i class="fas fa-heart"></i>${langHtml('span', '', L.sidebarReco)}`;
      const checkout = sidebarLinks.querySelector('a[href="#checkout"]');
      if (checkout) sidebarLinks.insertBefore(link, checkout);
      else sidebarLinks.appendChild(link);

      link.addEventListener('click', () => {
        const sb = document.getElementById('appSidebar');
        const ov = document.getElementById('sidebarOverlay');
        if (sb) sb.classList.remove('open');
        if (ov) ov.classList.remove('open');
      });
    }

    /* ---- Dynamic language switcher (re-queries every .lang-content) ---- */
    /* This is the authoritative handler: it covers the OLD static elements
       AND the newly-injected ones (dock, sidebar, TL;DR, reco cards,
       emergency strip, resume pill, recommendation link).
       The main script's static handler is harmless — both run on click. */
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        document.querySelectorAll('.lang-content').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-lang') === lang);
        });
        /* Translate the search placeholder */
        const searchEl = document.getElementById('appSearch');
        if (searchEl && L.searchPlaceholder[lang]) {
          searchEl.placeholder = L.searchPlaceholder[lang];
        }
      });
    });

    /* ---- Resume pill ---- */
    (function initResume() {
      const KEY = 'vs-last-chapter';
      const lastId = localStorage.getItem(KEY);
      if (!lastId || lastId === 'welcome') return;
      const lastCard = document.getElementById(lastId);
      if (!lastCard) return;

      const titleEl =
        lastCard.querySelector('.chapter-title.lang-content.active') ||
        lastCard.querySelector('.chapter-title');
      const title = titleEl ? titleEl.textContent.trim().slice(0, 42) : lastId;

      const pill = document.createElement('a');
      pill.className = 'resume-pill';
      pill.href = '#' + lastId;
      pill.innerHTML = `${langHtml('span', 'resume-label', L.resume)}<span class="resume-title">${title}</span><i class="fas fa-arrow-right"></i>`;
      document.body.appendChild(pill);
      pill.addEventListener('click', () => {
        pill.classList.add('dismissed');
        setTimeout(() => pill.remove(), 500);
      });
    })();

    /* ---- Track currently-visible chapter ---- */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting && en.intersectionRatio >= 0.5) {
            try { localStorage.setItem('vs-last-chapter', en.target.id); } catch (_) {}
          }
        });
      }, { threshold: [0.5] });
      document.querySelectorAll('.chapter-card').forEach(c => io.observe(c));
    }

    /* ---- Reveal-on-scroll (desktop only) ---- */
    if ('IntersectionObserver' in window
        && window.matchMedia('(min-width: 901px)').matches
        && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealIO = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            revealIO.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });

      document.querySelectorAll('.info-card, .alert-modern, .reco-card').forEach(el => {
        el.classList.add('reveal');
        revealIO.observe(el);
      });
    }
  }

  /* ---------- Mobile accordion for injected card ---------- */
  function wireAccordion(card) {
    if (!card || window.innerWidth > 900) return;
    if (card.classList.contains('mobile-collapsed')) return;

    const header = card.querySelector('.chapter-header');
    const body = card.querySelector('.chapter-body');
    if (!header || !body) return;

    card.classList.add('mobile-collapsed');
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function open() {
      card.classList.remove('mobile-collapsed');
      header.setAttribute('aria-expanded', 'true');
      if (reduced) { body.style.height = ''; return; }
      body.style.height = '0px';
      void body.offsetHeight;
      const target = body.scrollHeight;
      if (target === 0) { body.style.height = ''; return; }
      body.style.height = target + 'px';
      let done = false;
      const settle = () => { if (done) return; done = true; body.style.height = ''; };
      body.addEventListener('transitionend', function fn(e) {
        if (e.target !== body || e.propertyName !== 'height') return;
        body.removeEventListener('transitionend', fn);
        settle();
      });
      setTimeout(settle, 650);
    }
    function close() {
      header.setAttribute('aria-expanded', 'false');
      if (reduced) { card.classList.add('mobile-collapsed'); return; }
      body.style.height = body.scrollHeight + 'px';
      void body.offsetHeight;
      card.classList.add('mobile-collapsed');
      let done = false;
      const settle = () => { if (done) return; done = true; body.style.height = ''; };
      body.addEventListener('transitionend', function fn(e) {
        if (e.target !== body || e.propertyName !== 'height') return;
        body.removeEventListener('transitionend', fn);
        settle();
      });
      setTimeout(settle, 650);
    }
    function scrollToHeader() {
      const y = card.getBoundingClientRect().top + window.pageYOffset - 110;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    header.addEventListener('click', () => {
      if (card.classList.contains('mobile-collapsed')) { open(); scrollToHeader(); }
      else { close(); scrollToHeader(); }
    });
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); header.click(); }
    });
  }

  /* ---------- Boot ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
