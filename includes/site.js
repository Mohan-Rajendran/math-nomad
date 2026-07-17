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

})();
</script>
