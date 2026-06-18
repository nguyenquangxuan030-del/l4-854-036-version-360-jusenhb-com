(function () {
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }

    function $all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = $('[data-menu-toggle]');
        var nav = $('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = $('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = $all('[data-hero-slide]', slider);
        var dots = $all('[data-hero-dot]', slider);
        var prev = $('[data-hero-prev]', slider);
        var next = $('[data-hero-next]', slider);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFiltering() {
        var input = $('[data-filter-input]');
        var grid = $('[data-card-grid]');
        if (!input || !grid) {
            return;
        }
        var cards = $all('[data-search]', grid);
        var count = $('[data-result-count]');
        var empty = $('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        function applyFilter(value) {
            var terms = normalize(value).split(/\s+/).filter(Boolean);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute('data-search'));
                var matched = terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible + ' 部影片';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (query) {
            input.value = query;
        }
        applyFilter(input.value);
        input.addEventListener('input', function () {
            applyFilter(input.value);
        });

        $all('[data-quick-filter]').forEach(function (button) {
            button.addEventListener('click', function () {
                input.value = button.getAttribute('data-quick-filter') || '';
                applyFilter(input.value);
                input.focus();
            });
        });
    }

    function setupPlayers() {
        $all('.player-stage').forEach(function (stage) {
            var video = $('video', stage);
            var button = $('[data-play-button]', stage);
            var message = $('[data-player-message]', stage);
            var source = stage.getAttribute('data-m3u8');
            var hlsInstance = null;
            var initialized = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.hidden = false;
            }

            function playVideo() {
                if (!video || !source) {
                    showMessage('播放源暂不可用。');
                    return;
                }

                if (!initialized) {
                    initialized = true;
                    if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                            if (!data || !data.fatal) {
                                return;
                            }
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                hlsInstance.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                hlsInstance.recoverMediaError();
                            } else {
                                hlsInstance.destroy();
                                showMessage('当前播放环境暂时无法加载该影片。');
                            }
                        });
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else {
                        showMessage('当前浏览器不支持 HLS 播放，请使用 Safari、Edge 或 Chrome 新版本访问。');
                        initialized = false;
                        return;
                    }
                }

                if (button) {
                    button.classList.add('is-hidden');
                }
                video.play().catch(function () {
                    showMessage('浏览器阻止了自动播放，请再次点击播放器开始。');
                });
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            if (video) {
                video.addEventListener('play', function () {
                    if (button) {
                        button.classList.add('is-hidden');
                    }
                });
            }
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    function setupBackToTop() {
        var button = $('[data-back-to-top]');
        if (!button) {
            return;
        }
        function update() {
            button.classList.toggle('is-visible', window.scrollY > 360);
        }
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFiltering();
        setupPlayers();
        setupBackToTop();
    });
}());
