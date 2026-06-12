(function () {
  const STORAGE_KEY = "infosec-notes-theme";
  const root = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return "dark";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
    updateToggleLabel(theme);
  }

  function updateToggleLabel(theme) {
    const btn = document.querySelector(".global-header .theme-toggle") || document.querySelector(".theme-toggle");
    if (!btn) return;
    const isDark = theme === "dark";
    btn.setAttribute("aria-pressed", isDark ? "true" : "false");
    btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    btn.classList.toggle("is-dark", isDark);
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function wrapTables() {
    document.querySelectorAll(".main-content table").forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains("table-wrap")) return;
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function initMobileNav() {
    const wrapper = document.querySelector(".page-wrapper");
    const sidebar = document.querySelector(".sidebar.toc");
    if (!wrapper || !sidebar) return;

    document.body.classList.add("has-toc-nav");
    wrapper.classList.add("has-toc-nav");
    sidebar.id = sidebar.id || "sidebar-nav";

    let toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "nav-toggle";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", sidebar.id);
      toggle.setAttribute("aria-label", "Open sections on this page");
      toggle.innerHTML =
        '<span class="nav-toggle-icon" aria-hidden="true">' +
        '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>' +
        '</span><span class="nav-toggle-label">Sections</span>';
      const headerActions = document.querySelector(".header-actions");
      if (headerActions) {
        headerActions.insertBefore(toggle, headerActions.firstChild);
      } else {
        document.body.appendChild(toggle);
      }
    } else {
      toggle.setAttribute("aria-label", "Open sections on this page");
      const label = toggle.querySelector(".nav-toggle-label");
      if (label) label.textContent = "Sections";
    }

    let backdrop = document.querySelector(".nav-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.className = "nav-backdrop";
      backdrop.setAttribute("aria-label", "Close sections menu");
      backdrop.hidden = true;
      document.body.appendChild(backdrop);
    }

    function setOpen(open) {
      sidebar.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-visible", open);
      backdrop.hidden = !open;
      document.body.classList.toggle("nav-menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close sections menu" : "Open sections on this page");
    }

    function closeNav() {
      setOpen(false);
    }

    toggle.addEventListener("click", function () {
      setOpen(!sidebar.classList.contains("is-open"));
    });

    backdrop.addEventListener("click", closeNav);

    sidebar.querySelectorAll('nav a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sidebar.classList.contains("is-open")) closeNav();
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) closeNav();
    });
  }

  function isPageScrollable() {
    var doc = document.documentElement;
    return doc.scrollHeight > doc.clientHeight + 1;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initAmbientParallax() {
    if (prefersReducedMotion()) return;

    var grid = document.querySelector(".site-ambient__grid");
    if (!grid) return;

    function updateParallax() {
      var y = window.scrollY || document.documentElement.scrollTop;
      grid.style.transform = "translateY(" + y * 0.06 + "px)";
    }

    window.addEventListener("scroll", updateParallax, { passive: true });
    updateParallax();
  }

  function initHeaderScroll() {
    var header = document.querySelector(".global-header");
    if (!header) return;

    var threshold = 24;

    function updateHeader() {
      var scrolled = (window.scrollY || document.documentElement.scrollTop) >= threshold;
      header.classList.toggle("is-scrolled", scrolled);
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  function initRevealTargets() {
    var heroEls = document.querySelectorAll(".site-hero [class*='site-hero__']");
    heroEls.forEach(function (el, i) {
      el.classList.add("reveal--hero");
      el.style.setProperty("--reveal-i", String(i));
    });

    var selectors = [
      ".book-card",
      ".topic-card",
      ".subtopic-card",
      ".master-section > h2",
      ".index-hero > h2",
      ".callout",
      ".roadmap",
      ".site-header",
      ".chapter-nav",
      ".diagram",
      ".figure-photo",
      ".reading-path",
      ".outline-coverage"
    ];

    selectors.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el, i) {
        if (el.classList.contains("reveal") || el.classList.contains("reveal--hero")) return;
        el.classList.add("reveal");
        el.style.setProperty("--reveal-i", String(i % 12));
      });
    });
  }

  function initScrollReveal() {
    if (prefersReducedMotion()) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  }

  function initBackToTop() {
    var btn = null;
    var threshold = 300;

    function ensureButton() {
      if (btn) return true;
      if (!isPageScrollable()) return false;

      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "back-to-top";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 19V5M5 12l7-7 7 7"/>' +
        "</svg>";
      btn.addEventListener("click", function () {
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
      document.body.appendChild(btn);
      return true;
    }

    function updateVisibility() {
      if (!ensureButton()) {
        if (btn) btn.classList.remove("is-visible");
        document.body.classList.remove("fab-stacked");
        return;
      }
      var scrolled = window.scrollY || document.documentElement.scrollTop;
      var showFab = scrolled >= threshold;
      btn.classList.toggle("is-visible", showFab);
      document.body.classList.toggle("fab-stacked", showFab);
    }

    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    window.addEventListener("load", updateVisibility);
    updateVisibility();
  }

  function initPageEnhancements() {
    updateToggleLabel(getPreferredTheme());
    const btn = document.querySelector(".global-header .theme-toggle") || document.querySelector(".theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);

    wrapTables();
    initMobileNav();
    initRevealTargets();
    initScrollReveal();
    initHeaderScroll();
    initAmbientParallax();
    initBackToTop();

    const tocLinks = document.querySelectorAll(".toc nav a[href^='#']");
    if (tocLinks.length && "IntersectionObserver" in window) {
      const sections = [];
      tocLinks.forEach(function (link) {
        const id = link.getAttribute("href").slice(1);
        const el = document.getElementById(id);
        if (el) sections.push({ id: id, el: el, link: link });
      });

      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              tocLinks.forEach(function (l) {
                l.classList.remove("active");
              });
              const match = sections.find(function (s) {
                return s.el === entry.target;
              });
              if (match) match.link.classList.add("active");
            }
          });
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
      );

      sections.forEach(function (s) {
        observer.observe(s.el);
      });
    }
  }

  applyTheme(getPreferredTheme());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (document.querySelector(".theme-toggle") || document.body.classList.contains("auth-body")) {
        initPageEnhancements();
      } else {
        document.addEventListener("site-nav-ready", initPageEnhancements, { once: true });
      }
    });
  } else {
    if (document.querySelector(".theme-toggle") || document.body.classList.contains("auth-body")) {
      initPageEnhancements();
    } else {
      document.addEventListener("site-nav-ready", initPageEnhancements, { once: true });
    }
  }
})();
