(function () {
  var BOOKS = [
    { id: "home", label: "Home", title: "Home", path: "" },
    { id: "infosec", label: "Info Sec", title: "Information Security", path: "info-sec" },
    { id: "se", label: "Software Eng.", title: "Software Engineering", path: "software-engineering" },
    { id: "coa", label: "Comp Org & ASM", title: "Computer Organization and Assembly Language", path: "coa" },
    { id: "la", label: "Linear Algebra", title: "Linear Algebra", path: "linear-algebra" },
    { id: "tbw", label: "Tech & Bus. Writing", title: "Technical and Business Writing", path: "technical-writing" },
    { id: "civics", label: "Civics", title: "Civics and Community Engagement", path: "civics" },
    { id: "mgmt", label: "Management", title: "Introduction to Management", path: "management" }
  ];

  var FOOTER_INFOSEC = [
    { label: "Introduction to InfoSec", soon: true },
    { label: "Authentication Models", soon: true },
    { label: "Protection Models", soon: true },
    { label: "Cryptography & Hashing", soon: true },
    { label: "Intrusion Detection", soon: true },
    { label: "All Info Sec Topics", path: "info-sec" }
  ];

  var FOOTER_SE = [
    { label: "Intro to Software Engineering", path: "software-engineering/topics/01-introduction-and-fundamentals" },
    { label: "SDLC & Process Models", path: "software-engineering/topics/02-sdlc-and-process-models" },
    { label: "Classical Waterfall Model", path: "software-engineering/topics/02-sdlc-and-process-models/02-02-classical-waterfall" },
    { label: "Agile Software Development", path: "software-engineering/topics/02-sdlc-and-process-models/02-11-agile" },
    { label: "Spiral Model", path: "software-engineering/topics/02-sdlc-and-process-models/02-05-spiral" },
    { label: "Process Model Comparison", path: "software-engineering/topics/02-sdlc-and-process-models/02-16-comparison" },
    { label: "All SE Topics", path: "software-engineering" }
  ];

  var FOOTER_SITE = [
    { label: "Home", path: "" },
    { label: "Past Papers", path: "/#past-papers" },
    { label: "Software Engineering", path: "software-engineering" },
    { label: "Information Security", path: "info-sec" },
    { label: "Linear Algebra", path: "linear-algebra" },
    { label: "Computer Org. & Assembly", path: "coa" }
  ];

  function navHref(prefix, path) {
    if (!path) return prefix || "/";
    if (path.charAt(0) === "/") return path;
    return prefix + path;
  }

  function normalizeNavBook(book) {
    if (!book || book === "home") return book;
    return book.replace(/\/index\.html$/, "").replace(/\.html$/, "");
  }

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
    brand.href = navHref(prefix, "");
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
      a.href = navHref(prefix, book.path);
      a.textContent = book.label;
      if (book.title) a.setAttribute("title", book.title);
      if (book.id === "home" && depth === 0) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });

    var actions = document.createElement("div");
    actions.className = "global-header-actions";

    var userMenu = document.createElement("div");
    userMenu.className = "header-user-menu";
    userMenu.id = "header-user-menu";

    var loginBtn = document.createElement("button");
    loginBtn.type = "button";
    loginBtn.className = "header-login-btn";
    loginBtn.id = "header-login-btn";
    loginBtn.textContent = "Login";
    loginBtn.setAttribute("aria-label", "Login");
    loginBtn.setAttribute("aria-expanded", "false");
    loginBtn.setAttribute("aria-haspopup", "true");

    var userDropdown = document.createElement("div");
    userDropdown.className = "header-user-dropdown";
    userDropdown.id = "header-user-dropdown";
    userDropdown.hidden = true;
    var menuBtn = document.createElement("button");
    menuBtn.type = "button";
    menuBtn.className = "header-user-caret";
    menuBtn.id = "header-user-caret";
    menuBtn.hidden = true;
    menuBtn.setAttribute("aria-label", "Account menu");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.innerHTML = "&#9662;";

    userDropdown.innerHTML =
      '<button type="button" class="header-logout-btn" id="header-logout-btn">Logout</button>';

    userMenu.appendChild(loginBtn);
    userMenu.appendChild(menuBtn);
    userMenu.appendChild(userDropdown);

    var themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle theme-toggle--icon";
    themeBtn.setAttribute("aria-pressed", "false");
    themeBtn.innerHTML =
      '<span class="theme-toggle-icon" aria-hidden="true">' +
      '<svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
      '<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      "</span>";

    actions.appendChild(userMenu);
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
        return navHref(prefix, item.path);
      })
    );
    grid.appendChild(
      buildFooterColumn("Information Security", FOOTER_INFOSEC, function (item) {
        return navHref(prefix, item.path);
      })
    );
    grid.appendChild(
      buildFooterColumn("Site", FOOTER_SITE, function (item) {
        return navHref(prefix, item.path);
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

    var currentBook = normalizeNavBook(document.body.getAttribute("data-nav-book"));
    if (currentBook === "home" || (depth === 0 && !currentBook)) {
      var homeLink = nav.querySelector('a[href="' + navHref(prefix, "") + '"]');
      if (homeLink && depth === 0) homeLink.setAttribute("aria-current", "page");
    } else if (currentBook) {
      nav.querySelectorAll("a").forEach(function (a) {
        a.removeAttribute("aria-current");
      });
      var bookPath = navHref(prefix, currentBook);
      var active = nav.querySelector('a[href="' + bookPath + '"]');
      if (active) active.setAttribute("aria-current", "page");
    }

    syncGlobalHeaderHeight();
    window.addEventListener("resize", syncGlobalHeaderHeight);
  }

  window.__notesInitSiteNav = initSiteNav;
})();
/* Bundled below: notes-auth.js + notes-chat.js (InfinityFree blocks separate loads) */
(function () {
  var API = "/api";
  var AUTH_PAGE = "/login";
  var AUTH_RETURN_KEY = "notes_auth_return";
  var currentUser = null;
  var listeners = [];
  var gateApplied = false;

  function normalizePath(path) {
    if (!path || path.charAt(0) !== "/") return "/";
    return path
      .replace(/\/index\.html(?=($|[?#]))/g, "/")
      .replace(/\.html(?=($|[?#]))/g, "")
      .replace(/\/+$/, "") || "/";
  }

  function isAuthPage() {
    return normalizePath(window.location.pathname) === "/login";
  }

  function redirectToLogin() {
    if (isAuthPage()) return;
    var returnPath = normalizePath(
      window.location.pathname + window.location.search + window.location.hash
    );
    try {
      sessionStorage.setItem(AUTH_RETURN_KEY, returnPath);
    } catch (e) {}
    window.location.replace(AUTH_PAGE);
  }

  function applySiteGate(user) {
    if (!document.body.classList.contains("site-body")) return;
    if (isAuthPage()) return;
    if (!user && !gateApplied) {
      gateApplied = true;
      redirectToLogin();
    }
  }

  function emit() {
    listeners.forEach(function (fn) { fn(currentUser); });
    updateHeaderAuth(currentUser);
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || "GET",
      credentials: "same-origin",
      headers: opts.body ? { "Content-Type": "application/json" } : {},
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) {
          var err = new Error((d && d.error) || "Request failed");
          err.status = r.status;
          throw err;
        }
        return d;
      });
    });
  }

  function checkSession() {
    return api("/auth/me").then(function (d) {
      currentUser = d.user || null;
      emit();
      applySiteGate(currentUser);
      return currentUser;
    }).catch(function () {
      currentUser = null;
      emit();
      applySiteGate(null);
      return null;
    });
  }

  function login(username, password) {
    return api("/auth/login", {
      method: "POST",
      body: { username: username, password: password }
    }).then(function (d) {
      currentUser = d.user;
      emit();
      if (d.redirect) {
        window.location.href = d.redirect;
        return d;
      }
      closeLoginModal();
      document.dispatchEvent(new CustomEvent("auth-login", { detail: d.user }));
      return d;
    });
  }

  function register(username, password, displayName) {
    return api("/auth/register", {
      method: "POST",
      body: { username: username, password: password, display_name: displayName }
    }).then(function (d) {
      currentUser = d.user;
      emit();
      if (d.redirect) {
        window.location.href = d.redirect;
      }
      return d;
    });
  }

  function forgotPassword(username) {
    return api("/auth/forgot-password", {
      method: "POST",
      body: { username: username }
    });
  }

  function logout() {
    return api("/auth/logout", { method: "POST" }).then(function () {
      currentUser = null;
      emit();
      document.dispatchEvent(new CustomEvent("auth-logout"));
      if (document.body.classList.contains("site-body") && !isAuthPage()) {
        redirectToLogin();
      }
    });
  }

  function onAuthChange(fn) {
    listeners.push(fn);
    fn(currentUser);
  }

  function isLoggedIn() {
    return !!currentUser;
  }

  function getUser() {
    return currentUser;
  }

  function updateHeaderAuth(user) {
    var btn = document.getElementById("header-login-btn");
    var caret = document.getElementById("header-user-caret");
    var dropdown = document.getElementById("header-user-dropdown");
    var logoutBtn = document.getElementById("header-logout-btn");
    if (!btn) return;

    function closeUserMenu() {
      if (!dropdown) return;
      dropdown.hidden = true;
      if (caret) caret.setAttribute("aria-expanded", "false");
    }

    function openUserMenu() {
      if (!dropdown) return;
      dropdown.hidden = false;
      if (caret) caret.setAttribute("aria-expanded", "true");
    }

    if (user) {
      var label = user.display_name || user.username;
      btn.textContent = label;
      btn.title = label;
      if (caret) caret.hidden = false;

      if (user.role === "admin") {
        btn.setAttribute("aria-label", "Open admin dashboard");
        btn.onclick = function () {
          window.location.href = "/admin/";
        };
      } else {
        btn.setAttribute("aria-label", "Account");
        btn.onclick = function (e) {
          e.stopPropagation();
          if (dropdown && dropdown.hidden) openUserMenu();
          else closeUserMenu();
        };
      }

      if (caret && !caret.dataset.bound) {
        caret.dataset.bound = "1";
        caret.addEventListener("click", function (e) {
          e.stopPropagation();
          if (dropdown && dropdown.hidden) openUserMenu();
          else closeUserMenu();
        });
      }

      if (logoutBtn && !logoutBtn.dataset.bound) {
        logoutBtn.dataset.bound = "1";
        logoutBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          closeUserMenu();
          logout();
        });
      }
    } else {
      closeUserMenu();
      if (caret) caret.hidden = true;
      btn.textContent = "Login";
      btn.setAttribute("aria-label", "Login");
      btn.title = "Sign in";
      btn.onclick = function () {
        redirectToLogin();
      };
    }
  }

  function initUserMenuDismiss() {
    document.addEventListener("click", function (e) {
      var menu = document.getElementById("header-user-menu");
      var dropdown = document.getElementById("header-user-dropdown");
      if (!menu || !dropdown || dropdown.hidden) return;
      if (!menu.contains(e.target)) {
        dropdown.hidden = true;
        var caretBtn = document.getElementById("header-user-caret");
        if (caretBtn) caretBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var dropdown = document.getElementById("header-user-dropdown");
      if (!dropdown || dropdown.hidden) return;
      dropdown.hidden = true;
      var caretBtn = document.getElementById("header-user-caret");
      if (caretBtn) caretBtn.setAttribute("aria-expanded", "false");
    });
  }

  function ensureLoginModal() {
    if (document.getElementById("auth-modal")) return;

    var overlay = document.createElement("div");
    overlay.id = "auth-modal";
    overlay.className = "auth-modal";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="auth-modal-panel" role="dialog" aria-labelledby="auth-modal-title">' +
      '<button type="button" class="auth-modal-close" aria-label="Close">&times;</button>' +
      '<h2 id="auth-modal-title">Login</h2>' +
      '<p class="auth-modal-sub">Sign in to continue.</p>' +
      '<form id="auth-login-form">' +
      '<label>Username <input name="username" autocomplete="username" required></label>' +
      '<label>Password <input name="password" type="password" autocomplete="current-password" required></label>' +
      '<p class="auth-error" hidden></p>' +
      '<button type="submit">Sign in</button>' +
      '</form></div>';
    document.body.appendChild(overlay);

    overlay.querySelector(".auth-modal-close").addEventListener("click", closeLoginModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLoginModal();
    });
    overlay.querySelector("#auth-login-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var errEl = overlay.querySelector(".auth-error");
      errEl.hidden = true;
      login(fd.get("username"), fd.get("password")).catch(function (err) {
        errEl.textContent = err.status === 401 ? "Invalid login credentials" : (err.message || "Login failed");
        errEl.hidden = false;
      });
    });
  }

  function openLoginModal() {
    redirectToLogin();
  }

  function closeLoginModal() {
    var m = document.getElementById("auth-modal");
    if (m) m.hidden = true;
  }

  window.NotesAuth = {
    checkSession: checkSession,
    login: login,
    register: register,
    forgotPassword: forgotPassword,
    logout: logout,
    onAuthChange: onAuthChange,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    openLoginModal: openLoginModal,
    closeLoginModal: closeLoginModal,
    redirectIfNotLoggedIn: applySiteGate
  };

  document.addEventListener("site-nav-ready", function () {
    initUserMenuDismiss();
    updateHeaderAuth(currentUser);
    checkSession();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSession);
  } else {
    checkSession();
  }
})();
(function () {
  var DEFAULT_UI = {
    name: "notes-bot",
    tagline: "Notes assistant terminal",
    login_gate: "Login required. Use the Login button in the header."
  };

  function escHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderMarkdown(text) {
    var html = escHtml(text);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\n/g, "<br>");
    return html;
  }

  function getPageUrl() {
    return window.location.pathname + window.location.search;
  }

  function loadBotUi() {
    return fetch("/data/site-knowledge.json", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var bot = (data && data.bot) || {};
        return {
          name: bot.name || DEFAULT_UI.name,
          tagline: bot.tagline || DEFAULT_UI.tagline,
          login_gate: DEFAULT_UI.login_gate
        };
      })
      .catch(function () {
        return DEFAULT_UI;
      });
  }

  function buildWidget(ui) {
    if (document.getElementById("nain-chat-widget")) return;

    var botSlug = (ui.name || "notes-bot").toLowerCase().replace(/\s+/g, "-");

    var root = document.createElement("div");
    root.id = "nain-chat-widget";
    root.className = "nain-chat-widget nain-term-widget";
    root.innerHTML =
      '<button type="button" class="nain-term-toggle" aria-expanded="false" aria-controls="nain-chat-panel" aria-label="Open terminal">' +
      '<span class="nain-term-toggle-icon" aria-hidden="true">&gt;_</span></button>' +
      '<div id="nain-chat-panel" class="nain-term-panel">' +
      '<div class="nain-term-titlebar">' +
      '<span class="nain-term-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
      '<span class="nain-term-title">' + escHtml(ui.name) + " — terminal</span>" +
      '<button type="button" class="nain-term-close" aria-label="Close terminal">&times;</button>' +
      "</div>" +
      '<div class="nain-term-screen" role="log" aria-live="polite">' +
      '<div class="nain-term-login-gate"><span class="nain-term-prompt">!</span> ' +
      escHtml(ui.login_gate) + "</div>" +
      '<div class="nain-term-log" hidden></div>' +
      "</div>" +
      '<form class="nain-term-inputline" hidden autocomplete="off">' +
      '<span class="nain-term-prompt" data-term-prompt>guest@nain:~$</span>' +
      '<input type="text" name="message" aria-label="Terminal input" autocomplete="off" maxlength="4000" spellcheck="false">' +
      '<button type="submit" class="nain-term-send" aria-label="Send message" title="Send">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9z"/></svg>' +
      "</button></form></div>";
    document.body.appendChild(root);

    var toggle = root.querySelector(".nain-term-toggle");
    var panel = root.querySelector(".nain-term-panel");
    var closeBtn = root.querySelector(".nain-term-close");
    var logEl = root.querySelector(".nain-term-log");
    var form = root.querySelector(".nain-term-inputline");
    var input = form.querySelector("input");
    var gate = root.querySelector(".nain-term-login-gate");
    var promptEl = root.querySelector("[data-term-prompt]");
    var sendBtn = root.querySelector(".nain-term-send");
    var isOpen = false;
    var sending = false;
    var typingTimer = null;

    function getClearKey() {
      var user = window.NotesAuth && window.NotesAuth.getUser();
      return user ? "nain-term-cleared-" + user.id : null;
    }

    function isTerminalCleared() {
      var key = getClearKey();
      return !!(key && sessionStorage.getItem(key) === "1");
    }

    function setTerminalCleared(cleared) {
      var key = getClearKey();
      if (!key) return;
      if (cleared) sessionStorage.setItem(key, "1");
      else sessionStorage.removeItem(key);
    }

    function setOpen(open) {
      isOpen = !!open;
      panel.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen && window.NotesAuth && window.NotesAuth.isLoggedIn()) {
        loadHistory();
        input.focus();
      }
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!isOpen);
    });

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    });

    document.addEventListener("click", function (e) {
      if (!isOpen) return;
      if (!root.contains(e.target)) setOpen(false);
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    function updateAuthUI(user) {
      if (user) {
        gate.hidden = true;
        logEl.hidden = false;
        form.hidden = false;
        input.disabled = false;
        promptEl.textContent = (user.username || "user") + "@nain:~$";
      } else {
        gate.hidden = false;
        logEl.hidden = true;
        form.hidden = true;
        input.disabled = true;
        logEl.innerHTML = "";
        promptEl.textContent = "guest@nain:~$";
      }
    }

    function appendMessage(role, content, instant) {
      var line = document.createElement("div");
      line.className = "nain-term-line nain-term-line--" + role;
      if (role === "user") {
        line.innerHTML =
          '<span class="nain-term-prompt">' + escHtml(promptEl.textContent) + "</span> " +
          renderMarkdown(content);
      } else if (role === "assistant") {
        line.innerHTML =
          '<span class="nain-term-prompt">' + escHtml(botSlug) + "&gt;</span> " +
          renderMarkdown(content);
      } else {
        line.innerHTML = renderMarkdown(content);
      }
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
      if (instant) return Promise.resolve();
      return Promise.resolve();
    }

    function appendMessageTyping(role, content) {
      return new Promise(function (resolve) {
        if (typingTimer) clearTimeout(typingTimer);

        var line = document.createElement("div");
        line.className = "nain-term-line nain-term-line--" + role;
        var promptSpan = document.createElement("span");
        promptSpan.className = "nain-term-prompt";
        promptSpan.textContent = role === "user" ? promptEl.textContent : botSlug + ">";
        var textWrap = document.createElement("span");
        textWrap.className = "nain-term-typed";
        var cursor = document.createElement("span");
        cursor.className = "nain-term-cursor";
        cursor.setAttribute("aria-hidden", "true");
        cursor.textContent = "\u2588";

        line.appendChild(promptSpan);
        line.appendChild(document.createTextNode(" "));
        line.appendChild(textWrap);
        line.appendChild(cursor);
        logEl.appendChild(line);

        var i = 0;
        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function finish() {
          textWrap.innerHTML = renderMarkdown(content);
          if (cursor.parentNode) cursor.remove();
          logEl.scrollTop = logEl.scrollHeight;
          resolve();
        }

        if (reduceMotion) {
          finish();
          return;
        }

        function step() {
          if (i < content.length) {
            textWrap.textContent = content.slice(0, i + 1);
            i += 1;
            logEl.scrollTop = logEl.scrollHeight;
            typingTimer = setTimeout(step, 12 + Math.random() * 18);
          } else {
            typingTimer = null;
            finish();
          }
        }

        step();
      });
    }

    function loadHistory() {
      if (isTerminalCleared()) {
        logEl.innerHTML = "";
        return;
      }
      fetch("/api/chat/history", { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) return;
          logEl.innerHTML = "";
          d.messages.forEach(function (m) {
            appendMessage(m.role, m.content, true);
          });
        })
        .catch(function () {});
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!window.NotesAuth || !window.NotesAuth.isLoggedIn()) {
        gate.hidden = false;
        return;
      }
      var text = input.value.trim();
      if (!text || sending) return;
      input.value = "";

      if (text.toLowerCase() === "clear") {
        setTerminalCleared(true);
        logEl.innerHTML = "";
        return;
      }

      setTerminalCleared(false);
      sending = true;
      if (sendBtn) sendBtn.disabled = true;

      appendMessageTyping("user", text).then(function () {
        return fetch("/api/chat/send", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, page_url: getPageUrl() })
        });
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) throw new Error(d.error || "Failed");
          return appendMessageTyping("assistant", d.reply);
        })
        .catch(function (err) {
          return appendMessageTyping("assistant", "Error: " + (err.message || "Something went wrong"));
        })
        .finally(function () {
          sending = false;
          if (sendBtn) sendBtn.disabled = false;
          input.focus();
        });
    });

    function bindAuth() {
      if (!window.NotesAuth) return;
      window.NotesAuth.onAuthChange(updateAuthUI);
      document.addEventListener("auth-login", function () {
        updateAuthUI(window.NotesAuth.getUser());
        if (isOpen) loadHistory();
      });
      document.addEventListener("auth-logout", function () {
        updateAuthUI(null);
      });
    }

    bindAuth();
    document.addEventListener("DOMContentLoaded", bindAuth);
  }

  function init() {
    loadBotUi().then(buildWidget);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(function () {
  function bootNotesApp() {
    if (document.body.classList.contains("site-body") && window.__notesInitSiteNav) {
      window.__notesInitSiteNav();
    }
    document.dispatchEvent(new CustomEvent("site-nav-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootNotesApp);
  } else {
    bootNotesApp();
  }
})();
