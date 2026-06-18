(function () {
    const toggle = document.querySelector("[data-nav-toggle]");
    const panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    const backTop = document.querySelector("[data-back-top]");

    if (backTop) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 320) {
                backTop.classList.add("is-visible");
            } else {
                backTop.classList.remove("is-visible");
            }
        });

        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
        const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let index = 0;

        const show = function (nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("is-active", itemIndex === index);
            });
        };

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    const filterInput = document.querySelector("[data-filter]");
    const filterList = document.querySelector("[data-filter-list]");

    if (filterInput && filterList) {
        const items = Array.from(filterList.querySelectorAll(".movie-card"));
        filterInput.addEventListener("input", function () {
            const query = filterInput.value.trim().toLowerCase();
            items.forEach(function (item) {
                const text = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-tags"),
                    item.getAttribute("data-year")
                ].join(" ").toLowerCase();
                item.style.display = text.includes(query) ? "" : "none";
            });
        });
    }

    const searchPage = document.querySelector('[data-page="search"]');

    if (searchPage && typeof MOVIES !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const input = document.getElementById("searchInput");
        const results = document.getElementById("searchResults");
        const initial = params.get("q") || "";

        if (input) {
            input.value = initial;
        }

        const render = function (query) {
            if (!results) {
                return;
            }
            const value = query.trim().toLowerCase();
            const source = value
                ? MOVIES.filter(function (movie) {
                    return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" ").toLowerCase().includes(value);
                })
                : MOVIES.slice(0, 60);
            results.innerHTML = source.slice(0, 120).map(function (movie) {
                return [
                    '<article class="movie-card">',
                    '<a class="poster" href="./' + movie.url + '">',
                    '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                    '</a>',
                    '<div class="card-body">',
                    '<div class="meta-line"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                    '<h2><a href="./' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
                    '<p>' + escapeHtml(movie.oneLine) + '</p>',
                    '<div class="tag-row">' + movie.tags.split(" ").slice(0, 3).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");
        };

        render(initial);

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    }
})();

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setupMoviePlayer(source) {
    const video = document.getElementById("movie-player");
    const start = document.getElementById("player-start");

    if (!video || !start || !source) {
        return;
    }

    let bound = false;

    const bind = function () {
        if (bound) {
            return;
        }
        bound = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };

    const play = function () {
        bind();
        start.classList.add("is-hidden");
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    };

    start.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
}
