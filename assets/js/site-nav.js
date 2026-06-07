(function () {
  var BOOKS = [
    { id: "home", label: "Home", title: "Home", path: "index.html" },
    { id: "infosec", label: "Info Sec", title: "Information Security", path: "info-sec/index.html" },
    { id: "se", label: "Software Eng.", title: "Software Engineering", path: "software-engineering/index.html" },
    { id: "coa", label: "Comp Org & ASM", title: "Computer Organization and Assembly Language", path: "coa/index.html" },
    { id: "la", label: "Linear Algebra", title: "Linear Algebra", path: "linear-algebra/index.html" },
    { id: "tbw", label: "Tech & Bus. Writing", title: "Technical and Business Writing", path: "technical-writing/index.html" },
    { id: "civics", label: "Civics", title: "Civics and Community Engagement", path: "civics/index.html" },
    { id: "mgmt", label: "Management", title: "Introduction to Management", path: "management/index.html" }
  ];

  var FOOTER_INFOSEC = [
    { label: "Introduction to InfoSec", soon: true },
    { label: "Authentication Models", soon: true },
    { label: "Protection Models", soon: true },
    { label: "Cryptography & Hashing", soon: true },
    { label: "Intrusion Detection", soon: true },
    { label: "All Info Sec Topics", path: "info-sec/index.html" }
  ];

  var FOOTER_SE = [
    { label: "Intro to Software Engineering", path: "software-engineering/topics/01-introduction-and-fundamentals/index.html" },
    { label: "SDLC & Process Models", path: "software-engineering/topics/02-sdlc-and-process-models/index.html" },
    { label: "Classical Waterfall Model", path: "software-engineering/topics/02-sdlc-and-process-models/02-02-classical-waterfall.html" },
    { label: "Agile Software Development", path: "software-engineering/topics/02-sdlc-and-process-models/02-11-agile.html" },
    { label: "Spiral Model", path: "software-engineering/topics/02-sdlc-and-process-models/02-05-spiral.html" },
    { label: "Process Model Comparison", path: "software-engineering/topics/02-sdlc-and-process-models/02-16-comparison.html" },
    { label: "All SE Topics", path: "software-engineering/index.html" }
  ];

  var FOOTER_SITE = [
    { label: "Home", path: "index.html" },
    { label: "Past Papers", path: "index.html#past-papers" },
    { label: "Software Engineering", path: "software-engineering/index.html" },
    { label: "Information Security", path: "info-sec/index.html" },
    { label: "Linear Algebra", path: "linear-algebra/index.html" },
    { label: "Computer Org. & Assembly", path: "coa/index.html" }
  ];

  function getDepth() {
    var d = document.body.getAttribute("data-nav-depth");
    return d === "1" || d === "2" || d === "3" ? parseInt(d, 10) : 0;
  }

  function rootPrefix(depth) {
    if (depth === 3) return "../../../";
    if (depth === 2) return "../../";
    if (depth === 1) return "../";
    return "";
  }

  function infoSecTopicPrefix(depth) {
    if (depth === 2) return "";
    if (depth === 1) return "topics/";
    return "info-sec/topics/";
  }

  function buildHeader(prefix, depth) {
    var header = document.createElement("header");
    header.className = "global-header";
    header.setAttribute("role", "banner");

    var inner = document.createElement("div");
    inner.className = "global-header-inner";

    var brand = document.createElement("a");
    brand.className = "global-brand";
    brand.href = prefix + "index.html";
    brand.setAttribute("aria-label", "Notes By Nain");
    brand.innerHTML =
      '<span class="global-brand-text" aria-hidden="true">' +
      '<span class="global-brand-word">Notes</span>' +
      '<span class="global-brand-by">by</span>' +
      '<span class="global-brand-name">' +
      '<span class="global-brand-letter" style="--i:0">N</span>' +
      '<span class="global-brand-letter" style="--i:1">a</span>' +
      '<span class="global-brand-letter" style="--i:2">i</span>' +
      '<span class="global-brand-letter" style="--i:3">n</span>' +
      "</span></span>";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-nav-toggle site-nav-toggle--icon";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "global-nav");
    toggle.setAttribute("aria-label", "Open site menu");
    toggle.innerHTML =
      '<span class="nav-toggle-icon" aria-hidden="true">' +
      '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>' +
      "</span>";

    var nav = document.createElement("nav");
    nav.className = "global-nav";
    nav.id = "global-nav";
    nav.setAttribute("aria-label", "Site");

    BOOKS.forEach(function (book) {
      var a = document.createElement("a");
      a.href = prefix + book.path;
      a.textContent = book.label;
      if (book.title) a.setAttribute("title", book.title);
      if (book.id === "home" && depth === 0) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });

    var actions = document.createElement("div");
    actions.className = "global-header-actions";

    var loginBtn = document.createElement("button");
    loginBtn.type = "button";
    loginBtn.className = "header-login-btn";
    loginBtn.id = "header-login-btn";
    loginBtn.textContent = "Login";
    loginBtn.setAttribute("aria-label", "Login");

    var themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle theme-toggle--icon";
    themeBtn.setAttribute("aria-pressed", "false");
    themeBtn.innerHTML =
      '<span class="theme-toggle-icon" aria-hidden="true">' +
      '<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
      '<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      "</span>";

    actions.appendChild(loginBtn);
    actions.appendChild(themeBtn);
    actions.appendChild(toggle);
    inner.appendChild(brand);
    inner.appendChild(nav);
    inner.appendChild(actions);
    header.appendChild(inner);

    var backdrop = document.createElement("button");
    backdrop.type = "button";
    backdrop.className = "site-nav-backdrop";
    backdrop.setAttribute("aria-label", "Close site menu");
    backdrop.hidden = true;

    header.appendChild(backdrop);
    return header;
  }

  function buildFooterColumn(title, items, hrefForItem) {
    var col = document.createElement("div");
    col.className = "global-footer-col";

    var heading = document.createElement("h3");
    heading.textContent = title;
    col.appendChild(heading);

    var list = document.createElement("ul");
    items.forEach(function (item) {
      var li = document.createElement("li");
      if (item.soon) {
        var soon = document.createElement("span");
        soon.className = "footer-soon";
        soon.textContent = item.label;
        li.appendChild(soon);
      } else {
        var link = document.createElement("a");
        link.href = hrefForItem(item);
        link.textContent = item.label;
        li.appendChild(link);
      }
      list.appendChild(li);
    });
    col.appendChild(list);
    return col;
  }

  function buildFooter(prefix, depth) {
    var footer = document.createElement("footer");
    footer.className = "global-footer";
    footer.setAttribute("role", "contentinfo");

    var inner = document.createElement("div");
    inner.className = "global-footer-inner";

    var grid = document.createElement("div");
    grid.className = "global-footer-grid";

    grid.appendChild(
      buildFooterColumn("Software Engineering", FOOTER_SE, function (item) {
        return prefix + item.path;
      })
    );
    grid.appendChild(
      buildFooterColumn("Information Security", FOOTER_INFOSEC, function (item) {
        return prefix + item.path;
      })
    );
    grid.appendChild(
      buildFooterColumn("Site", FOOTER_SITE, function (item) {
        return prefix + item.path;
      })
    );

    inner.appendChild(grid);

    var bottom = document.createElement("div");
    bottom.className = "global-footer-bottom";
    bottom.innerHTML =
      '<p>&copy; ' +
      new Date().getFullYear() +
      " Hasnain Nasir. All rights reserved.</p>";

    inner.appendChild(bottom);
    footer.appendChild(inner);
    return footer;
  }

  function syncGlobalHeaderHeight() {
    var header = document.querySelector(".global-header");
    if (!header) return;
    var h = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--global-header-height", h + "px");
  }

  function initSiteNav() {
    if (!document.body.classList.contains("site-body")) return;

    var depth = getDepth();
    var prefix = rootPrefix(depth);

    var header = buildHeader(prefix, depth);
    var footer = buildFooter(prefix, depth);

    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(footer);

    var toggle = header.querySelector(".site-nav-toggle");
    var nav = header.querySelector(".global-nav");
    var backdrop = header.querySelector(".site-nav-backdrop");

    function setMenuOpen(open) {
      nav.classList.toggle("is-open", open);
      backdrop.classList.toggle("is-visible", open);
      backdrop.hidden = !open;
      document.body.classList.toggle("site-menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close site menu" : "Open site menu");
    }

    toggle.addEventListener("click", function () {
      setMenuOpen(!nav.classList.contains("is-open"));
    });

    backdrop.addEventListener("click", function () {
      setMenuOpen(false);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenuOpen(false);
    });

    window.matchMedia("(min-width: 901px)").addEventListener("change", function (e) {
      if (e.matches) setMenuOpen(false);
    });

    var currentBook = document.body.getAttribute("data-nav-book");
    if (currentBook === "home" || (depth === 0 && !currentBook)) {
      var homeLink = nav.querySelector('a[href="' + prefix + 'index.html"]');
      if (homeLink && depth === 0) homeLink.setAttribute("aria-current", "page");
    } else if (currentBook) {
      nav.querySelectorAll("a").forEach(function (a) {
        a.removeAttribute("aria-current");
      });
      var bookPath = prefix + currentBook;
      var active = nav.querySelector('a[href="' + bookPath + '"]');
      if (active) active.setAttribute("aria-current", "page");
    }

    syncGlobalHeaderHeight();
    window.addEventListener("resize", syncGlobalHeaderHeight);
    injectChatScripts(prefix);
    document.dispatchEvent(new CustomEvent("site-nav-ready"));
  }

  function injectChatScripts(prefix) {
    if (document.querySelector("[data-nain-chat-loaded]")) return;
    var marker = document.createElement("meta");
    marker.setAttribute("data-nain-chat-loaded", "1");
    document.head.appendChild(marker);
    ["auth.js", "chatbot.js"].forEach(function (file) {
      var s = document.createElement("script");
      s.src = prefix + "assets/js/" + file + "?v=2";
      s.defer = true;
      document.head.appendChild(s);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteNav);
  } else {
    initSiteNav();
  }
})();
