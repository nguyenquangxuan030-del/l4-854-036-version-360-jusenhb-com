(function () {
  function $(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = $('[data-hero-slide]', slider);
    var dots = $('[data-hero-dot]', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = slider.querySelector('[data-hero-prev]');
    var nextButton = slider.querySelector('[data-hero-next]');
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector('.site-search-input');
    if (!input) {
      return;
    }
    var cards = $('.searchable-card');
    var empty = document.querySelector('[data-search-empty]');

    function normalize(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function apply() {
      var query = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search') || card.textContent);
        var ok = !query || text.indexOf(query) !== -1;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    apply();
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function onScroll() {
      button.classList.toggle('show', window.scrollY > 320);
    }
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupBackTop();
  });
})();
