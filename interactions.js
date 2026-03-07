/* ============================================
   Interactive Features & Animations
   Cursor particles, scroll animations, counters
   ============================================ */

(function () {
  // ---- Cursor AI Particles ----
  const cursorCanvas = document.getElementById('cursor-canvas');
  if (!cursorCanvas) return;
  const cCtx = cursorCanvas.getContext('2d');
  let cWidth, cHeight, cDpr;
  const particles = [];
  let mouseX = -1000, mouseY = -1000;
  let isMouseMoving = false;
  let mouseTimer;

  class CursorParticle {
    constructor(x, y) {
      this.x = x + (Math.random() - 0.5) * 20;
      this.y = y + (Math.random() - 0.5) * 20;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = (Math.random() - 0.5) * 1.5 - 0.5;
      this.life = 1;
      this.decay = 0.015 + Math.random() * 0.01;
      this.radius = 1 + Math.random() * 2;
      this.color = Math.random() > 0.5 ? '59, 130, 246' : '34, 211, 238';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      this.vx *= 0.98;
      this.vy *= 0.98;
    }

    draw() {
      cCtx.beginPath();
      cCtx.arc(this.x, this.y, this.radius * this.life, 0, Math.PI * 2);
      cCtx.fillStyle = `rgba(${this.color}, ${this.life * 0.6})`;
      cCtx.fill();
    }
  }

  function initCursorCanvas() {
    cDpr = Math.min(window.devicePixelRatio || 1, 2);
    cWidth = window.innerWidth;
    cHeight = window.innerHeight;
    cursorCanvas.width = cWidth * cDpr;
    cursorCanvas.height = cHeight * cDpr;
    cursorCanvas.style.width = cWidth + 'px';
    cursorCanvas.style.height = cHeight + 'px';
    cCtx.scale(cDpr, cDpr);
  }

  function animateCursorParticles() {
    cCtx.clearRect(0, 0, cWidth, cHeight);

    // Spawn particles when mouse moves
    if (isMouseMoving && particles.length < 50) {
      particles.push(new CursorParticle(mouseX, mouseY));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      } else {
        particles[i].draw();
      }
    }

    requestAnimationFrame(animateCursorParticles);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseMoving = true;
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => { isMouseMoving = false; }, 100);
  });

  initCursorCanvas();
  animateCursorParticles();

  let cursorResizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(cursorResizeTimeout);
    cursorResizeTimeout = setTimeout(initCursorCanvas, 200);
  });

  // ---- Navigation ----
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // ---- Scroll Reveal Animations ----
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.1,
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger animations within a group
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('[data-aos]')) : [];
        const index = siblings.indexOf(entry.target);
        const delay = index * 80;

        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);

        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-aos]').forEach(el => {
    revealObserver.observe(el);
  });

  // ---- Counter Animation ----
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.metric-value[data-count]');
        counters.forEach(counter => {
          animateCounter(counter);
        });
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  const heroMetrics = document.querySelector('.hero-metrics');
  if (heroMetrics) counterObserver.observe(heroMetrics);

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  // ---- Approach Timeline Scroll ----
  const approachSection = document.getElementById('approach');
  const approachLine = document.querySelector('.approach-line-fill');
  const approachSteps = document.querySelectorAll('.approach-step');

  if (approachSection && approachLine) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.3, rootMargin: '0px 0px -100px 0px' });

    approachSteps.forEach(step => stepObserver.observe(step));

    window.addEventListener('scroll', () => {
      const rect = approachSection.getBoundingClientRect();
      const sectionHeight = rect.height;
      const scrolled = -rect.top + window.innerHeight * 0.5;
      const progress = Math.max(0, Math.min(1, scrolled / sectionHeight));
      approachLine.style.height = (progress * 100) + '%';
    });
  }

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });

  // ---- Contact Form Handler ----
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Message Sent</span>';
      btn.style.background = 'linear-gradient(135deg, #3B82F6, #22D3EE)';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  // ---- Service Card Hover Glow Effect ----
  document.querySelectorAll('.service-card, .platform-card, .case-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--glow-x', x + 'px');
      card.style.setProperty('--glow-y', y + 'px');
    });
  });

  // ---- Page Load Animation ----
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.6s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
})();
