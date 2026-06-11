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
    var p = normalizePath(window.location.pathname);
    return p === "/login";
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
    var dropdown = document.getElementById("header-user-dropdown");
    var logoutBtn = document.getElementById("header-logout-btn");
    if (!btn) return;

    function closeUserMenu() {
      if (!dropdown) return;
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    function openUserMenu() {
      if (!dropdown) return;
      dropdown.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }

    if (user) {
      btn.textContent = user.display_name || user.username;
      btn.setAttribute("aria-label", "Account menu");
      btn.title = user.display_name || user.username;
      btn.onclick = function (e) {
        e.stopPropagation();
        if (dropdown && dropdown.hidden) openUserMenu();
        else closeUserMenu();
      };
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
        var btn = document.getElementById("header-login-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      var dropdown = document.getElementById("header-user-dropdown");
      if (!dropdown || dropdown.hidden) return;
      dropdown.hidden = true;
      var btn = document.getElementById("header-login-btn");
      if (btn) btn.setAttribute("aria-expanded", "false");
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
