(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var button = qs(".menu-toggle");
        var panel = qs(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
            } else {
                panel.setAttribute("hidden", "");
            }
            button.setAttribute("aria-expanded", String(open));
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initLocalFilter() {
        qsa("[data-local-filter]").forEach(function (form) {
            var input = qs("input", form);
            var cards = qsa("[data-card]");
            if (!input || !cards.length) {
                return;
            }
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
                    card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
                });
            });
        });
    }

    function getQuery() {
        return new URLSearchParams(window.location.search).get("q") || "";
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card" data-card>',
            '    <a class="poster-link" href="./' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-play">播放</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <h3><a href="./' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <div class="card-tags">',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '        </div>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '    </div>',
            '</article>'
        ].join("\n");
    }

    function renderSearch() {
        var container = qs("[data-search-results]");
        var heading = qs("[data-search-heading]");
        var form = qs("[data-search-page-form]");
        if (!container || !window.SEARCH_INDEX) {
            return;
        }
        var input = form ? qs("input", form) : null;
        var initial = getQuery();
        if (input) {
            input.value = initial;
        }

        function run(query) {
            var q = (query || "").trim().toLowerCase();
            if (!q) {
                if (heading) {
                    heading.textContent = "精选影片";
                }
                container.innerHTML = window.SEARCH_INDEX.slice(0, 36).map(movieCard).join("\n");
                return;
            }
            var terms = q.split(/\s+/).filter(Boolean);
            var results = window.SEARCH_INDEX.filter(function (movie) {
                var text = movie.searchText.toLowerCase();
                return terms.every(function (term) {
                    return text.indexOf(term) !== -1;
                });
            }).slice(0, 120);
            if (heading) {
                heading.textContent = results.length ? "搜索结果" : "暂无匹配内容";
            }
            container.innerHTML = results.length ? results.map(movieCard).join("\n") : '<div class="content-card"><h2>暂无匹配内容</h2><p>可以尝试更换影片名称、地区、年份、类型或题材关键词。</p></div>';
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var value = input ? input.value.trim() : "";
                var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
                window.history.replaceState({}, "", url);
                run(value);
            });
        }
        run(initial);
    }

    window.initPlayer = function (source) {
        var video = qs("#movie-player");
        var mask = qs(".play-mask");
        if (!video || !source) {
            return;
        }
        var hls = null;

        function hideMask() {
            if (mask) {
                mask.classList.add("is-hidden");
            }
        }

        function attach() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute("data-ready", "1");
        }

        function play() {
            attach();
            hideMask();
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (mask) {
            mask.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", hideMask);
        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initLocalFilter();
        renderSearch();
    });
})();
