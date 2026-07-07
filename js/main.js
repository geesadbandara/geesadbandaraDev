(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  const root = document.documentElement;

  const updateThemeLabel = () => {
    const isLight = root.getAttribute("data-theme") === "light";
    themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  };

  updateThemeLabel();

  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeLabel();
  });

  // Tilt-on-hover for bento/timeline/project cards and the hero photo
  const tiltCards = document.querySelectorAll(".tilt-card");

  if (!prefersReducedMotion) {
    tiltCards.forEach((card) => {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tilt-x", `${px * 14}deg`);
        card.style.setProperty("--tilt-y", `${py * -14}deg`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  // Ambient cursor glow
  const cursorGlow = document.getElementById("cursor-glow");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (cursorGlow && canHover && !prefersReducedMotion) {
    document.addEventListener("mousemove", (event) => {
      cursorGlow.style.setProperty("--cx", `${event.clientX}px`);
      cursorGlow.style.setProperty("--cy", `${event.clientY}px`);
      cursorGlow.classList.add("is-active");
    });

    document.addEventListener("mouseleave", () => {
      cursorGlow.classList.remove("is-active");
    });
  }

  // Animated stat counters
  const statNumbers = document.querySelectorAll(".stat-number");

  const animateCount = (el) => {
    const target = Number(el.dataset.countTo);

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
    setTimeout(() => { el.textContent = target; }, duration + 150);
  };

  const statObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach((el) => statObserver.observe(el));

  // Mobile nav toggle
  const nav = document.getElementById("top-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-link");

  const closeNav = () => {
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target)) closeNav();
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll("main section[id]");
  const navLinkByHref = new Map(
    Array.from(navLinks).map((link) => [link.getAttribute("href"), link])
  );

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkByHref.get(`#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => spyObserver.observe(section));

  // Scroll-reveal
  const revealTargets = document.querySelectorAll(".reveal");

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }
})();
