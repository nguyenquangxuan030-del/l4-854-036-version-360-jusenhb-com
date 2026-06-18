(() => {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  const setHeader = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };

  setHeader();
  window.addEventListener('scroll', setHeader, { passive: true });

  if (navToggle && mobileNav && header) {
    navToggle.addEventListener('click', () => {
      const open = !mobileNav.classList.contains('is-open');
      mobileNav.classList.toggle('is-open', open);
      header.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  document.querySelectorAll('.hero-carousel').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
    };

    const play = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    if (prev) prev.addEventListener('click', () => { show(current - 1); play(); });
    if (next) next.addEventListener('click', () => { show(current + 1); play(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); play(); }));
    show(0);
    play();
  });

  document.querySelectorAll('.catalog-panel').forEach((panel) => {
    const input = panel.querySelector('.movie-search');
    const chips = Array.from(panel.querySelectorAll('.filter-chip'));
    const cards = Array.from(panel.querySelectorAll('.movie-card'));
    let active = 'all';

    const update = () => {
      const query = input ? input.value.trim().toLowerCase() : '';
      cards.forEach((card) => {
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';
        const matchedText = !query || text.includes(query);
        const matchedCategory = active === 'all' || category === active;
        card.classList.toggle('is-hidden', !(matchedText && matchedCategory));
      });
    };

    if (input) input.addEventListener('input', update);
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        active = chip.getAttribute('data-filter') || 'all';
        chips.forEach((item) => item.classList.toggle('is-active', item === chip));
        update();
      });
    });
  });

  document.querySelectorAll('.player-shell').forEach((shell) => {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.video-overlay');
    const stream = shell.getAttribute('data-stream');
    let hls = null;
    let ready = false;

    const attach = () => {
      if (!video || !stream || ready) return;
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    const start = () => {
      if (!video) return;
      attach();
      if (button) button.classList.add('is-hidden');
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    };

    if (button) button.addEventListener('click', start);
    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) start();
      });
      video.addEventListener('play', () => {
        if (button) button.classList.add('is-hidden');
      });
    }

    shell.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        start();
      }
    });

    shell.addEventListener('destroy', () => {
      if (hls) hls.destroy();
    });
  });
})();
