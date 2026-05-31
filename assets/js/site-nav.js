(function () {
  var BOOKS = [
    { id: "home", label: "Home", path: "index.html" },
    { id: "infosec", label: "Information Security", path: "info-sec/index.html" },
    { id: "se", label: "Software Engineering", path: "software-engineering/index.html" }
  ];

  var FOOTER_INFOSEC = [
    { label: "Intro to InfoSec", file: "01-introduction-to-info-sec.html" },
    { label: "Authentication Models", file: "02-authentication-models.html" },
    { label: "Advanced Cryptography", file: "05-advanced-cryptography.html" },
    { label: "Hashing & Signatures", file: "06-hashing-and-digital-signatures.html" },
    { label: "Intrusion Detection", file: "08-intrusion-detection-and-response.html" }
  ];

  var FOOTER_SE = [
    { label: "SDLC & Process Models", hash: "" },
    { label: "Requirements Engineering", hash: "" },
    { label: "Software Design", hash: "" },
    { label: "Software Testing", hash: "" },
    { label: "All SE Topics", file: null, bookIndex: true }
  ];

  function getDepth() {
    var d = document.body.getAttribute("data-nav-depth");
    return d === "1" || d === "2" ? parseInt(d, 10) : 0;
  }

  function rootPrefix(depth) {
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
    brand.textContent = "Hasnain's Notes";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-nav-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "global-nav");
    toggle.setAttribute("aria-label", "Open site menu");
    toggle.innerHTML =
      '<span class="nav-toggle-icon" aria-hidden="true">' +
      '<span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>' +
      '</span><span class="nav-toggle-label">Menu</span>';

    var nav = document.createElement("nav");
    nav.className = "global-nav";
    nav.id = "global-nav";
    nav.setAttribute("aria-label", "Site");

    BOOKS.forEach(function (book) {
      var a = document.createElement("a");
      a.href = prefix + book.path;
      a.textContent = book.label;
      if (book.id === "home" && depth === 0) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });

    var actions = document.createElement("div");
    actions.className = "global-header-actions";

    var themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle";
    themeBtn.setAttribute("aria-pressed", "false");
    themeBtn.innerHTML = '<span class="theme-toggle-label">Dark mode</span>';

    actions.appendChild(themeBtn);
    inner.appendChild(brand);
    inner.appendChild(toggle);
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

  function buildFooter(prefix, depth) {
    var footer = document.createElement("footer");
    footer.className = "global-footer";
    footer.setAttribute("role", "contentinfo");

    var inner = document.createElement("div");
    inner.className = "global-footer-inner";

    var grid = document.createElement("div");
    grid.className = "global-footer-grid";

    var colBooks = document.createElement("div");
    colBooks.className = "global-footer-col";
    colBooks.innerHTML = "<h3>Books</h3>";
    var booksList = document.createElement("ul");
    BOOKS.forEach(function (book) {
      if (book.id === "home") return;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = prefix + book.path;
      a.textContent = book.label;
      li.appendChild(a);
      booksList.appendChild(li);
    });
    colBooks.appendChild(booksList);

    var colInfo = document.createElement("div");
    colInfo.className = "global-footer-col";
    colInfo.innerHTML = "<h3>Information Security</h3>";
    var infoList = document.createElement("ul");
    var topicBase = prefix + infoSecTopicPrefix(depth);
    FOOTER_INFOSEC.forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = topicBase + item.file;
      a.textContent = item.label;
      li.appendChild(a);
      infoList.appendChild(li);
    });
    colInfo.appendChild(infoList);

    var colSe = document.createElement("div");
    colSe.className = "global-footer-col";
    colSe.innerHTML = "<h3>Software Engineering</h3>";
    var seList = document.createElement("ul");
    FOOTER_SE.forEach(function (item) {
      var li = document.createElement("li");
      if (item.bookIndex) {
        var a = document.createElement("a");
        a.href = prefix + "software-engineering/index.html";
        a.textContent = item.label;
        li.appendChild(a);
      } else {
        var span = document.createElement("span");
        span.className = "footer-soon";
        span.textContent = item.label;
        li.appendChild(span);
      }
      seList.appendChild(li);
    });
    colSe.appendChild(seList);

    grid.appendChild(colBooks);
    grid.appendChild(colInfo);
    grid.appendChild(colSe);

    var bottom = document.createElement("div");
    bottom.className = "global-footer-bottom";
    bottom.innerHTML =
      '<p>&copy; ' +
      new Date().getFullYear() +
      " Hasnain Nasir. All rights reserved.</p>" +
      '<nav class="global-footer-nav" aria-label="Footer">' +
      '<a href="' +
      prefix +
      'index.html">Home</a>' +
      '<a href="' +
      prefix +
      'info-sec/index.html">Information Security</a>' +
      '<a href="' +
      prefix +
      'software-engineering/index.html">Software Engineering</a>' +
      "</nav>";

    inner.appendChild(grid);
    inner.appendChild(bottom);
    footer.appendChild(inner);
    return footer;
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteNav);
  } else {
    initSiteNav();
  }
})();
