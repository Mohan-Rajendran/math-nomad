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

    const iframe = document.querySelector(".mn-sandbox-iframe");
    const loading = document.querySelector(".mn-sandbox-loading");
    if (iframe && loading) {
      let fallbackTimer;
      const markLoaded = () => {
        loading.classList.add("is-hidden");
        iframe.classList.add("is-loaded");
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      };

      iframe.addEventListener("load", markLoaded, { once: true });
      fallbackTimer = window.setTimeout(markLoaded, 12000);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialise, { once: true });
  } else {
    initialise();
  }
})();
