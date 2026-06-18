function initializePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video) {
    return;
  }

  var shell = video.closest('.video-shell');
  var overlay = shell ? shell.querySelector('.play-overlay') : null;
  var hls = null;
  var loaded = false;
  var pendingPlay = false;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function playVideo() {
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showOverlay();
      });
    }
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', function () {
        if (pendingPlay) {
          playVideo();
        }
      }, { once: true });
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          playVideo();
        }
      });
      return;
    }
    video.src = sourceUrl;
  }

  function startPlayback() {
    pendingPlay = true;
    hideOverlay();
    loadSource();
    if (video.readyState > 0) {
      playVideo();
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', showOverlay);
}
