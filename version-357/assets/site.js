(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");

  if (menuButton && panel) {
    menuButton.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
  }

  const topButton = document.querySelector("[data-scroll-top]");

  if (topButton) {
    const refreshTopButton = () => {
      topButton.classList.toggle("visible", window.scrollY > 360);
    };

    window.addEventListener("scroll", refreshTopButton, { passive: true });
    refreshTopButton();

    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === current);
      });

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === current);
      });
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(current + 1);
        start();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  document.querySelectorAll("[data-local-filter]").forEach((input) => {
    const target = document.querySelector(input.getAttribute("data-local-filter"));

    if (!target) {
      return;
    }

    const cards = Array.from(target.querySelectorAll(".movie-card"));

    input.addEventListener("input", () => {
      const keyword = input.value.trim().toLowerCase();

      cards.forEach((card) => {
        const haystack = [
          card.dataset.title || "",
          card.dataset.region || "",
          card.dataset.type || "",
          card.dataset.tags || "",
          card.dataset.year || ""
        ].join(" ").toLowerCase();

        card.style.display = haystack.includes(keyword) ? "" : "none";
      });
    });
  });
})();
