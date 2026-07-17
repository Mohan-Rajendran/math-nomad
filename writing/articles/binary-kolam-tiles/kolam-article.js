(() => {
  "use strict";

  const initialise = () => {
    if (!document.body.classList.contains("mn-kolam-page")) return;

    let progress = document.querySelector(".mn-reading-progress");
    if (!progress) {
      progress = document.createElement("div");
      progress.className = "mn-reading-progress";
      progress.setAttribute("aria-hidden", "true");
      progress.innerHTML = "<span></span>";
      document.body.prepend(progress);
    }

    const progressBar = progress.querySelector("span");
    let progressFrame = 0;

    const updateProgress = () => {
      progressFrame = 0;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = documentHeight > 0
        ? Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100))
        : 0;
      progressBar.style.width = `${percentage}%`;
    };

    const requestProgressUpdate = () => {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate, { passive: true });

    const tocLinks = Array.from(document.querySelectorAll(".toc a[href^='#'], .mobile-toc a[href^='#']"));
    const sections = Array.from(document.querySelectorAll(".article-section[id]"));

    const markCurrentSection = (id) => {
      tocLinks.forEach((link) => {
        const isCurrent = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    if ("IntersectionObserver" in window && sections.length) {
      const visibleSections = new Map();
      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.set(entry.target.id, entry.boundingClientRect.top);
          else visibleSections.delete(entry.target.id);
        });

        const current = [...visibleSections.entries()]
          .sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))[0];
        if (current) markCurrentSection(current[0]);
      }, { rootMargin: "-18% 0px -68% 0px", threshold: [0, 0.01] });

      sections.forEach((section) => sectionObserver.observe(section));
      markCurrentSection(sections[0].id);
    }

    const iframe = document.querySelector(".mn-sandbox-iframe");
    const loading = document.querySelector(".mn-sandbox-loading");
    const fullScreenPuzzle = window.matchMedia("(max-width: 600px), (hover: none) and (pointer: coarse)");
    let fallbackTimer;

    const startEmbed = () => {
      if (!iframe || !loading || fullScreenPuzzle.matches || iframe.hasAttribute("src")) return;

      const source = iframe.dataset.src;
      if (!source) return;

      const markLoaded = () => {
        loading.classList.remove("is-slow");
        loading.classList.add("is-hidden");
        iframe.classList.add("is-loaded");
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      };

      iframe.addEventListener("load", markLoaded, { once: true });
      iframe.src = source;
      fallbackTimer = window.setTimeout(() => {
        if (iframe.classList.contains("is-loaded")) return;
        loading.classList.add("is-slow");
        loading.innerHTML = [
          '<span class="loading-tile" aria-hidden="true">1010</span>',
          '<span>The embedded puzzle is taking longer than expected.</span>',
          '<a href="https://lab.mathnomad.in/square-kolam-tile-challenge/" target="_blank" rel="noreferrer">Open it full screen instead ↗</a>'
        ].join("");
      }, 12000);
    };

    let embedObserver;
    const queueEmbed = () => {
      if (!iframe || iframe.hasAttribute("src") || fullScreenPuzzle.matches) return;

      if ("IntersectionObserver" in window) {
        if (!embedObserver) {
          embedObserver = new IntersectionObserver((entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            startEmbed();
            if (iframe.hasAttribute("src")) embedObserver.disconnect();
          }, { rootMargin: "600px 0px" });
          embedObserver.observe(iframe);
        }
      } else {
        startEmbed();
      }
    };

    queueEmbed();
    if (fullScreenPuzzle.addEventListener) fullScreenPuzzle.addEventListener("change", queueEmbed);
    else fullScreenPuzzle.addListener(queueEmbed);

    const feedback = document.querySelector(".citation-feedback");
    const copyButtons = Array.from(document.querySelectorAll("[data-copy-target]"));
    const resetTimers = new WeakMap();

    copyButtons.forEach((button) => {
      button.dataset.defaultLabel = button.textContent.trim();
    });

    const resetButton = (button) => {
      const timer = resetTimers.get(button);
      if (timer) window.clearTimeout(timer);
      button.textContent = button.dataset.defaultLabel;
      resetTimers.delete(button);
    };

    const copyText = async (value) => {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(value);
          return;
        } catch (_error) {
          // Some browsers expose Clipboard API but deny it. Try the fallback.
        }
      }

      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("Copy command failed");
    };

    copyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const source = document.querySelector(button.dataset.copyTarget);
        if (!source || !feedback) return;

        copyButtons.forEach(resetButton);

        try {
          await copyText(source.textContent.trim());
          button.textContent = "Copied";
          feedback.textContent = button.dataset.copyTarget === "#bibtex-citation"
            ? "BibTeX copied."
            : "Citation copied.";
        } catch (_error) {
          if (button.dataset.copyTarget === "#bibtex-citation") {
            source.hidden = false;
            source.setAttribute("tabindex", "-1");
            source.focus();
            feedback.textContent = "Copy failed. The BibTeX is now shown for manual selection.";
          } else {
            feedback.textContent = "Copy failed. Select the citation above instead.";
          }
        }

        const timer = window.setTimeout(() => {
          feedback.textContent = "";
          resetButton(button);
        }, 3200);
        resetTimers.set(button, timer);
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
