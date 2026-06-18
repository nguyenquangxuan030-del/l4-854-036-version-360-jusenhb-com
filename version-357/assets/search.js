(() => {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const results = document.querySelector("[data-search-results]");
  const empty = document.querySelector("[data-search-empty]");

  if (!form || !input || !results || !window.SEARCH_MOVIES) {
    return;
  }

  const renderCard = (movie) => {
    const tags = movie.tags.slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

    return `
        <article class="movie-card movie-card-small" data-title="${escapeHtml(movie.title)}" data-region="${escapeHtml(movie.region)}" data-type="${escapeHtml(movie.type)}" data-tags="${escapeHtml(movie.tags.join(" "))}" data-year="${movie.year}">
          <a class="poster-link" href="${movie.url}" aria-label="${escapeHtml(movie.title)}">
            <span class="poster-wrap">
              <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
              <span class="poster-shade"></span>
              <span class="year-badge">${movie.year}</span>
              <span class="poster-intro">${escapeHtml(movie.oneLine)}</span>
            </span>
            <span class="movie-info">
              <strong>${escapeHtml(movie.title)}</strong>
              <span class="movie-meta"><em>${escapeHtml(movie.region)}</em><em>${escapeHtml(movie.type)}</em></span>
              <span class="tag-row">${tags}</span>
            </span>
          </a>
        </article>`;
  };

  const runSearch = (keyword) => {
    const value = keyword.trim().toLowerCase();

    if (!value) {
      results.innerHTML = "";
      if (empty) {
        empty.textContent = "输入关键词开始搜索";
        empty.style.display = "block";
      }
      return;
    }

    const matched = window.SEARCH_MOVIES.filter((movie) => {
      const haystack = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.oneLine,
        movie.tags.join(" ")
      ].join(" ").toLowerCase();

      return haystack.includes(value);
    });

    results.innerHTML = matched.map(renderCard).join("\\n");

    if (empty) {
      empty.textContent = matched.length ? "" : "未找到相关影片";
      empty.style.display = matched.length ? "none" : "block";
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url.toString());
    runSearch(query);
  });

  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  input.value = initial;
  runSearch(initial);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
