(() => {
  "use strict";

  const root = document.documentElement;
  const langButton = document.getElementById("lang");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  const setLanguage = (lang) => {
    root.lang = lang;
    root.dataset.lang = lang;

    document.querySelectorAll("[data-fr][data-en]").forEach((node) => {
      const value = node.dataset[lang];
      if (value) node.textContent = value;
    });

    if (langButton) {
      langButton.textContent = lang === "fr" ? "EN" : "FR";
      langButton.setAttribute(
        "aria-label",
        lang === "fr" ? "View the site in English" : "Voir le site en français"
      );
    }

    document.querySelectorAll(".carousel-btn[data-label-fr][data-label-en]").forEach((button) => {
      button.setAttribute("aria-label", button.dataset[`label${lang === "fr" ? "Fr" : "En"}`]);
    });

    document.querySelectorAll(".carousel-dots button[data-slide-number]").forEach((dot) => {
      const number = dot.dataset.slideNumber;
      dot.setAttribute(
        "aria-label",
        lang === "fr" ? `Afficher la diapositive ${number}` : `Show slide ${number}`
      );
    });
  };

  if (langButton) {
    langButton.addEventListener("click", () => {
      setLanguage(root.lang === "fr" ? "en" : "fr");
    });
  }

  setLanguage(root.lang === "en" ? "en" : "fr");

  const revealItems = document.querySelectorAll(".reveal-section");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const previous = carousel.querySelector(".carousel-btn.prev");
    const next = carousel.querySelector(".carousel-btn.next");
    const dotsContainer = carousel.parentElement?.querySelector(".carousel-dots");

    if (!slides.length || !previous || !next) return;

    let currentIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("active"))
    );
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");

    const dots = slides.map((slide, index) => {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${index + 1} / ${slides.length}`);

      if (!dotsContainer) return null;

      const dot = document.createElement("button");
      dot.type = "button";
      dot.dataset.slideNumber = String(index + 1);
      dot.setAttribute(
        "aria-label",
        root.lang === "fr"
          ? `Afficher la diapositive ${index + 1}`
          : `Show slide ${index + 1}`
      );
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const showSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentIndex;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", String(!active));

        slide.querySelectorAll("a, button, input, select, textarea").forEach((item) => {
          item.tabIndex = active ? 0 : -1;
        });
      });

      dots.forEach((dot, dotIndex) => {
        if (!dot) return;
        const active = dotIndex === currentIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
    };

    previous.addEventListener("click", () => showSlide(currentIndex - 1));
    next.addEventListener("click", () => showSlide(currentIndex + 1));

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(currentIndex - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(currentIndex + 1);
      }
    });

    const track = carousel.querySelector(".carousel-track");
    if (track) {
      track.addEventListener(
        "touchstart",
        (event) => {
          const touch = event.changedTouches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
        },
        { passive: true }
      );

      track.addEventListener(
        "touchend",
        (event) => {
          const touch = event.changedTouches[0];
          const deltaX = touch.clientX - touchStartX;
          const deltaY = touch.clientY - touchStartY;

          if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
          showSlide(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
        },
        { passive: true }
      );
    }

    showSlide(currentIndex);
  });
})();
