/* ============================================
   TUSHAR — Portfolio interactions
   ============================================ */

(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#nav-menu");
  const menuLinks = menu.querySelectorAll("a");
  const modal = document.querySelector("#project-modal");
  const modalVideo = document.querySelector("#modal-video");
  const modalPlayer = document.querySelector(".modal-player");
  const modalPlaceholder = document.querySelector("#modal-placeholder");
  const modalTitle = document.querySelector("#modal-title");
  const modalCategory = document.querySelector("#modal-category");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header treatment */
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobile menu */
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  /* Smooth scroll with sticky-header offset */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      const offset = header.offsetHeight + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* Scroll reveal */
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion) {
    reveals.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Keep a designed poster until a local video actually loads */
  const wrapOf = (video) => video.closest(".player, .project-media");

  const markMissing = (video) => {
    video.dataset.missing = "true";
    const wrap = wrapOf(video);
    if (wrap) wrap.classList.remove("is-ready");
  };

  const markReady = (video) => {
    video.dataset.missing = "false";
    const wrap = wrapOf(video);
    if (wrap) wrap.classList.add("is-ready");
  };

  document.querySelectorAll("video[src]").forEach((video) => {
    video.addEventListener("error", () => markMissing(video));
    video.addEventListener("loadeddata", () => markReady(video));
  });

  modalVideo.addEventListener("error", () => markMissing(modalVideo));
  modalVideo.addEventListener("loadeddata", () => {
    markReady(modalVideo);
    if (!modal.hidden && !reduceMotion) {
      const playPromise = modalVideo.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  });

  /* Muted hover preview on project cards (never with sound) */
  const projectCards = document.querySelectorAll(".project-card");

  const playPreview = (video) => {
    if (reduceMotion || video.dataset.missing === "true") return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  };

  projectCards.forEach((card) => {
    const video = card.querySelector("video");
    const trigger = card.querySelector(".project-hit");

    card.addEventListener("mouseenter", () => playPreview(video));
    card.addEventListener("mouseleave", () => {
      video.pause();
      try {
        video.currentTime = 0;
      } catch (err) {
        /* Ignore if the local file is not present yet */
      }
    });

    trigger.addEventListener("click", () => {
      openModal(card.dataset.title, card.dataset.category, card.dataset.video);
    });
  });

  /* Lightbox */
  let lastFocus = null;

  function openModal(title, category, src) {
    lastFocus = document.activeElement;
    modalTitle.textContent = title;
    modalCategory.textContent = category;
    modalPlaceholder.textContent = src;
    modalPlayer.classList.remove("is-ready");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.poster = "images/poster.svg";
    modalVideo.src = src;
    modalVideo.muted = true;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalPlayer.classList.remove("is-ready");
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!modal.hidden) closeModal();
      if (toggle.getAttribute("aria-expanded") === "true") setMenu(false);
    }
  });
})();
