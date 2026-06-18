(function () {
    window.initMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var cover = document.getElementById(options.coverId);
        var button = document.getElementById(options.buttonId);
        var hls = null;
        var ready = false;

        if (!video || !options.streamUrl) {
            return;
        }

        function attach() {
            if (ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = options.streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(options.streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal || !hls) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                        hls = null;
                    }
                });
            } else {
                video.src = options.streamUrl;
            }
        }

        function start() {
            attach();
            video.controls = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
}());
