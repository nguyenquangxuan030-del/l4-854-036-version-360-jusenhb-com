(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = all('[data-hero-slide]', hero);
        var dots = all('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('is-active', idx === active);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('is-active', idx === active);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                play();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                play();
            });
        }
        show(0);
        play();
    }

    function setupFilters() {
        all('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-year-filter]');
            var type = scope.querySelector('[data-type-filter]');
            var cards = all('.movie-card, .rank-row', scope);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            all('[data-query-fill]', scope).forEach(function (field) {
                field.value = query;
            });
            if (input && query && !input.value) {
                input.value = query;
            }

            function apply() {
                var q = normalize(input ? input.value : '');
                var y = year ? String(year.value || '') : '';
                var t = type ? String(type.value || '') : '';
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search') || card.textContent);
                    var matchQuery = !q || text.indexOf(q) !== -1;
                    var matchYear = !y || String(card.getAttribute('data-year') || '') === y;
                    var matchType = !t || String(card.getAttribute('data-type') || '') === t;
                    card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchType));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
            }
            if (year) {
                year.addEventListener('change', apply);
            }
            if (type) {
                type.addEventListener('change', apply);
            }
            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
