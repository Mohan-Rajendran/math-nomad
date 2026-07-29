<script>
(() => {
  const sectionNames = new Set(["writing", "courses", "videos", "projects"]);
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const currentSection = currentPath.split("/").filter(Boolean)[0] || "";

  if (sectionNames.has(currentSection)) {
    document.querySelectorAll(".navbar-nav .nav-link[href]").forEach((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname;
      const linkSection = linkPath.split("/").filter(Boolean)[0] || "";

      if (linkSection === currentSection) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  if (document.body.classList.contains("mn-article-page")) {
    const root = document.documentElement;
    const fontSizes = ["small", "medium", "large"];
    const safeRead = (key, fallback) => {
      try {
        return window.localStorage.getItem(key) || fallback;
      } catch {
        return fallback;
      }
    };
    const safeWrite = (key, value) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Reading preferences still work for the current page.
      }
    };
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    let fontSize = safeRead("mn-font-size", "medium");
    let theme = safeRead("mn-theme", preferredTheme);

    if (!fontSizes.includes(fontSize)) fontSize = "medium";
    if (!["light", "dark"].includes(theme)) theme = preferredTheme;

    const applyPreferences = () => {
      root.dataset.mnFontSize = fontSize;
      root.dataset.mnTheme = theme;
    };
    applyPreferences();

    const controls = document.createElement("div");
    controls.className = "mn-reader-controls";
    controls.setAttribute("aria-label", "Reading preferences");
    controls.innerHTML = `
      <button type="button" data-reader-action="smaller" aria-label="Decrease text size">A−</button>
      <button type="button" data-reader-action="larger" aria-label="Increase text size">A+</button>
      <button type="button" data-reader-action="theme" aria-label="Switch colour theme">◐</button>
      <span class="mn-reader-status" role="status" aria-live="polite"></span>
    `;

    const announce = (message) => {
      const status = controls.querySelector(".mn-reader-status");
      if (status) status.textContent = message;
    };

    controls.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-reader-action]");
      if (!button) return;
      const action = button.dataset.readerAction;

      if (action === "theme") {
        theme = theme === "dark" ? "light" : "dark";
        safeWrite("mn-theme", theme);
        applyPreferences();
        announce(`${theme === "dark" ? "Dark" : "Light"} theme`);
        return;
      }

      const currentIndex = fontSizes.indexOf(fontSize);
      const nextIndex = action === "larger"
        ? Math.min(fontSizes.length - 1, currentIndex + 1)
        : Math.max(0, currentIndex - 1);
      fontSize = fontSizes[nextIndex];
      safeWrite("mn-font-size", fontSize);
      applyPreferences();
      announce(`${fontSize[0].toUpperCase()}${fontSize.slice(1)} text`);
    });

    const search = document.querySelector("#quarto-search");
    if (search) search.before(controls);
  }

})();
</script>
