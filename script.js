(() => {
  "use strict";

  const root = document.documentElement;
  const langButton = document.getElementById("lang");
  const year = document.getElementById("year");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (year) year.textContent = String(new Date().getFullYear());

  const setLanguage = (lang) => {
    root.lang = lang;
    root.dataset.lang = lang;

    document.querySelectorAll("[data-fr][data-en]").forEach((node) => {
      const value = node.dataset[lang];
      if (value) node.textContent = value;
    });

    if (langButton) {
      langButton.textContent = lang === "fr" ? "EN" : "FR";
      langButton.setAttribute("aria-label", lang === "fr" ? "View the site in English" : "Voir le site en français");
    }

    document.querySelectorAll(".carousel-btn[data-label-fr][data-label-en]").forEach((button) => {
      button.setAttribute("aria-label", button.dataset[lang === "fr" ? "labelFr" : "labelEn"]);
    });

    document.querySelectorAll(".carousel-dots button[data-slide-number]").forEach((dot) => {
      const number = dot.dataset.slideNumber;
      dot.setAttribute("aria-label", lang === "fr" ? `Afficher la diapositive ${number}` : `Show slide ${number}`);
    });

    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
      carousel.dispatchEvent(new CustomEvent("languagechange"));
    });
  };

  if (langButton) {
    langButton.addEventListener("click", () => setLanguage(root.lang === "fr" ? "en" : "fr"));
  }

  setLanguage(root.lang === "en" ? "en" : "fr");

  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
      if (event.matches) closeMenu();
    });
  }

  const revealItems = document.querySelectorAll(".reveal-section");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const previous = carousel.querySelector(".carousel-btn.prev");
    const next = carousel.querySelector(".carousel-btn.next");
    const section = carousel.closest("section");
    const dotsContainer = section?.querySelector(".carousel-dots");
    const status = section?.querySelector(".carousel-status");

    if (!slides.length || !previous || !next) return;

    let currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("active")));
    let touchStartX = 0;
    let touchStartY = 0;
    let locked = false;

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
      dot.setAttribute("aria-label", root.lang === "fr" ? `Afficher la diapositive ${index + 1}` : `Show slide ${index + 1}`);
      dot.addEventListener("click", () => showSlide(index));
      dotsContainer.appendChild(dot);
      return dot;
    });

    const showSlide = (index, announce = true) => {
      if (locked) return;
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === currentIndex;
        slide.classList.toggle("active", active);
        slide.setAttribute("aria-hidden", String(!active));
        slide.toggleAttribute("inert", !active);
      });

      dots.forEach((dot, dotIndex) => {
        if (!dot) return;
        const active = dotIndex === currentIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });

      if (announce && status) {
        status.textContent = root.lang === "fr"
          ? `Diapositive ${currentIndex + 1} sur ${slides.length}`
          : `Slide ${currentIndex + 1} of ${slides.length}`;
      }

      if (!reducedMotion.matches) {
        locked = true;
        window.setTimeout(() => { locked = false; }, 320);
      }
    };

    previous.addEventListener("click", () => showSlide(currentIndex - 1));
    next.addEventListener("click", () => showSlide(currentIndex + 1));

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(currentIndex - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(currentIndex + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        showSlide(0);
      } else if (event.key === "End") {
        event.preventDefault();
        showSlide(slides.length - 1);
      }
    });

    const track = carousel.querySelector(".carousel-track");
    if (track) {
      track.addEventListener("touchstart", (event) => {
        const touch = event.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      track.addEventListener("touchend", (event) => {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        showSlide(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
      }, { passive: true });
    }

    carousel.addEventListener("languagechange", () => showSlide(currentIndex, false));
    showSlide(currentIndex, false);
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll('.header nav a[href^="#"]')];
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.toggleAttribute("aria-current", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  }
})();
