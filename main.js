/* ===========================
   6D AntiGravity — JavaScript
   =========================== */

// ── Canvas fondo con partículas y líneas ──
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    const count = Math.floor((W * H) / 18000);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }

  let mouseX = W / 2, mouseY = H / 2;
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Aura alrededor del mouse
    const grd = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
    grd.addColorStop(0, 'rgba(0,245,255,0.03)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      // Atracción suave al mouse
      const dx = mouseX - p.x;
      const dy = mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250) {
        p.vx += (dx / dist) * 0.006;
        p.vy += (dy / dist) * 0.006;
      }

      // Velocidad máxima + amortiguación
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.2) { p.vx *= 0.9; p.vy *= 0.9; }

      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Dibujar partícula
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,245,255,${p.opacity})`;
      ctx.fill();
    });

    // Líneas entre partículas cercanas
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,245,255,${0.05 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// ── Cursor personalizado ──
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    fx += (e.clientX - fx) * 0.12;
    fy += (e.clientY - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
  });

  function smoothFollower() {
    requestAnimationFrame(smoothFollower);
  }
  smoothFollower();

  document.querySelectorAll('a, button, .card-3d, input, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      follower.style.width = '56px';
      follower.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      follower.style.width = '36px';
      follower.style.height = '36px';
    });
  });
})();

// ── NavBar scroll ──
(function initNav() {
  const nav = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = open ? '' : 'column';
    links.style.position = open ? '' : 'absolute';
    links.style.top = open ? '' : '72px';
    links.style.left = open ? '' : '0';
    links.style.right = open ? '' : '0';
    links.style.background = open ? '' : 'rgba(3,7,18,0.98)';
    links.style.padding = open ? '' : '16px 24px';
    links.style.borderBottom = open ? '' : '1px solid rgba(255,255,255,0.08)';
  });
})();

// ── 3D Card Tilt ──
(function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rx = ((e.clientY - cy) / (rect.height / 2)) * -8;
      const ry = ((e.clientX - cx) / (rect.width / 2)) * 8;
      el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
    });
  });
})();

// ── Parallax en el héroe ──
(function initParallax() {
  const hero = document.getElementById('hero-content');
  const cube = document.getElementById('cube-wrapper');

  document.addEventListener('mousemove', e => {
    const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

    if (hero) {
      hero.style.transform = `translate(${xPct * 8}px, ${yPct * 4}px)`;
    }
    if (cube) {
      cube.style.transform = `translate(${xPct * -18}px, ${yPct * -10}px)`;
    }
  });
})();

// ── Scroll Reveal ──
(function initReveal() {
  const targets = document.querySelectorAll(
    '.section-header, .about-card, .about-text, .skill-card, .project-card, .contact-info, .contact-form'
  );

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => observer.observe(el));
})();

// ── Contador animado ──
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current);
        if (current >= target) clearInterval(timer);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

// ── Barras de habilidades ──
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-fill');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const bar = e.target;
        bar.style.width = bar.dataset.width + '%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
})();

// ── Formulario ──
(function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span:first-child');
    const icon = form.querySelector('.btn-icon');
    btn.textContent = '¡Enviado!';
    icon.textContent = '✓';
    form.style.pointerEvents = 'none';
    form.style.opacity = '0.7';
    setTimeout(() => {
      btn.textContent = 'Enviar Mensaje';
      icon.textContent = '→';
      form.reset();
      form.style.pointerEvents = '';
      form.style.opacity = '';
    }, 3000);
  });
})();

// ── AntiGravity: partículas que flotan en el hero ──
(function initHeroParticles() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(0,245,255,${Math.random() * 0.3 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float-up ${Math.random() * 6 + 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 0;
    `;
    hero.appendChild(dot);
  }
})();

// ── Smooth active nav link ──
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    navLinks.forEach(l => {
      l.style.color = l.getAttribute('href') === `#${current}`
        ? 'var(--accent-cyan)'
        : '';
    });
  });
})();
