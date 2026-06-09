(function(){
  // Language switcher
  const langBtns = document.querySelectorAll('.lang-btn');
  const langContents = document.querySelectorAll('.lang-content');
  function setLanguage(lang){
    langContents.forEach(c => c.classList.remove('active'));
    document.querySelectorAll(`.lang-content[data-lang="${lang}"]`).forEach(c => c.classList.add('active'));
    langBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));
    localStorage.setItem('guide_lang', lang);
  }
  langBtns.forEach(btn => btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang'))));
  const savedLang = localStorage.getItem('guide_lang');
  setLanguage(savedLang && savedLang !== 'en' ? savedLang : 'en');

  // Theme toggle
  const themeToggle = document.getElementById('themeToggle');
  if(localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  if(themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i> <span>Dark</span>' : '<i class="fas fa-sun"></i> <span>Light</span>';
    });
    if(localStorage.getItem('theme') === 'dark') themeToggle.innerHTML = '<i class="fas fa-moon"></i> <span>Dark</span>';
  }

  // Mobile hamburger
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if(hamburger) hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));

  // Scroll to top button
  const scrollBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => scrollBtn.style.display = window.scrollY > 300 ? 'flex' : 'none');
  scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Intersection Observer for fade‑in (elements already visible – optional)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.chapter-card, .info-card, .alert-modern').forEach(el => {
    el.style.transition = 'opacity 0.5s ease, transform 0.4s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    observer.observe(el);
  });
})();
