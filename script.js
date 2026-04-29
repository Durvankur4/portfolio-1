/* ═══════════════════════════════════════════
   DURVANKUR — PORTFOLIO INTERACTIONS
   Scroll reveals, parallax, counters, nav
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Scroll Progress Bar ── */
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ── 2. Navbar hide/show on scroll ── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  function handleNavbar() {
    const current = window.scrollY;
    if (current > 80 && current > lastScroll) {
      navbar.classList.add('hidden-nav');
    } else {
      navbar.classList.remove('hidden-nav');
    }
    lastScroll = current;
  }

  /* ── 3. Active nav link highlighting ── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ── Combined scroll handler ── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        handleNavbar();
        highlightNav();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── 4. Mobile nav toggle ── */
  const navToggle = document.getElementById('nav-toggle');
  const navLinksEl = document.getElementById('nav-links');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navLinksEl.classList.toggle('open');
    });
    // Close menu when clicking a link
    navLinksEl.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinksEl.classList.remove('open');
      });
    });
  }

  /* ── 5. Scroll Reveal (Intersection Observer) ── */
  const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });
  revealElements.forEach(el => revealObserver.observe(el));

  /* ── 6. Animated Counters ── */
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el, target) {
    const duration = 1500;
    const startTime = performance.now();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = current + (target >= 100 ? '+' : '+');
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  /* ── 7. Hero parallax on mouse move ── */
  const hero = document.querySelector('.hero');
  const heroPhoto = document.querySelector('.hero-photo-wrapper');
  const heroGlow = document.querySelector('.hero-glow');
  if (hero && heroPhoto) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroPhoto.style.transform = `translate(${x * 15}px, ${y * 15}px)`;
      if (heroGlow) {
        heroGlow.style.transform = `translateX(calc(-50% + ${x * 30}px))`;
      }
    });
  }

  /* ── 8. Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 9. Hero photo fallback (placeholder SVG) ── */
  const heroImg = document.getElementById('hero-photo');
  if (heroImg) {
    heroImg.addEventListener('error', () => {
      // Generate inline SVG placeholder
      const wrapper = heroImg.parentElement;
      wrapper.innerHTML = `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
          <rect width="200" height="200" fill="#1a1a1a"/>
          <circle cx="100" cy="80" r="35" fill="#333"/>
          <ellipse cx="100" cy="160" rx="50" ry="35" fill="#333"/>
          <text x="100" y="195" text-anchor="middle" fill="#555" font-size="10" font-family="Inter,sans-serif">Add your photo</text>
        </svg>`;
    });
  }

  /* ── 10. Project image fallbacks ── */
  document.querySelectorAll('.project-card-img img').forEach((img, i) => {
    img.addEventListener('error', () => {
      const colors = ['#1a1025', '#0f1a2e', '#1a0f1e', '#0e1a1a', '#1e1a0f'];
      const accents = ['#7c3aed', '#3b82f6', '#ec4899', '#06b6d4', '#f59e0b'];
      const color = colors[i % colors.length];
      const accent = accents[i % accents.length];
      img.parentElement.innerHTML = `
        <svg viewBox="0 0 380 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">
          <rect width="380" height="200" fill="${color}"/>
          <circle cx="190" cy="100" r="40" fill="${accent}" opacity="0.2"/>
          <circle cx="190" cy="100" r="20" fill="${accent}" opacity="0.4"/>
          <rect x="60" y="150" width="260" height="4" rx="2" fill="${accent}" opacity="0.15"/>
          <rect x="100" y="162" width="180" height="4" rx="2" fill="${accent}" opacity="0.1"/>
          <text x="190" y="105" text-anchor="middle" fill="${accent}" font-size="14" font-family="Bebas Neue,sans-serif" letter-spacing="2" opacity="0.6">PROJECT ${i % 5 + 1}</text>
        </svg>`;
    });
  });

  /* ── 11. Custom Cursor ── */
  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorRing = document.querySelector('.custom-cursor-ring');
  
  if (cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let dotX = mouseX;
    let dotY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function renderCursor() {
      // Smooth interpolation for the ring
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      // Fast interpolation for the dot
      dotX += (mouseX - dotX) * 0.5;
      dotY += (mouseY - dotY) * 0.5;

      cursorDot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);
    
    // Add hover states for links and buttons
    const interactables = document.querySelectorAll('a, button');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorDot.classList.add('hovered');
        cursorRing.classList.add('hovered');
      });
      el.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('hovered');
        cursorRing.classList.remove('hovered');
      });
    });
  }

});
