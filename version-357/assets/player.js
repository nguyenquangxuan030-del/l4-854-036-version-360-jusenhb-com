(() => {
  const video = document.querySelector("[data-video-player]");
  const cover = document.querySelector("[data-watch-cover]");

  if (!video || !cover) {
    return;
  }

  const source = video.getAttribute("data-stream");
  let ready = false;
  let hls = null;

  const bind = () => {
    if (ready || !source) {
      return;
    }

    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    video.src = source;
  };

  const start = () => {
    bind();
    cover.classList.add("hidden");
    video.controls = true;
    const attempt = video.play();

    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => {});
    }
  };

  cover.addEventListener("click", start);

  video.addEventListener("click", () => {
    if (!ready) {
      start();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
})();
