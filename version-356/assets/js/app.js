(function () {
  const body = document.body;
  const toggle = document.querySelector('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('menu-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    const activate = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 6200);
  }

  const input = document.querySelector('[data-search-input]');
  const genre = document.querySelector('[data-genre-filter]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

  const runFilter = function () {
    const keyword = input ? input.value.trim().toLowerCase() : '';
    const selectedGenre = genre ? genre.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      const haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.textContent
      ].join(' ').toLowerCase();
      const genreText = (card.getAttribute('data-genre') || '').toLowerCase();
      const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      const genreMatch = !selectedGenre || genreText.indexOf(selectedGenre) !== -1;
      card.classList.toggle('is-hidden', !(keywordMatch && genreMatch));
    });
  };

  if (input) {
    input.addEventListener('input', runFilter);
  }
  if (genre) {
    genre.addEventListener('change', runFilter);
  }

  const players = Array.from(document.querySelectorAll('[data-player]'));
  players.forEach(function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('[data-play-button]');
    let initialized = false;

    const start = function () {
      if (!video) {
        return;
      }
      const stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      shell.classList.add('is-playing');
      if (!initialized) {
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }
    shell.addEventListener('click', function (event) {
      if (event.target === video && !initialized) {
        start();
      }
    });
  });
})();
