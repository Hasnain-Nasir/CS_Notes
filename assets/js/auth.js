(function () {
  var API = "/api";
  var currentUser = null;
  var listeners = [];

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
        if (!r.ok && r.status !== 401) {
          throw new Error((d && d.error) || "Request failed");
        }
        return d;
      });
    });
  }

  function checkSession() {
    return api("/auth/me.php").then(function (d) {
      currentUser = d.user || null;
      emit();
      return currentUser;
    }).catch(function () {
      currentUser = null;
      emit();
      return null;
    });
  }

  function login(username, password) {
    return api("/auth/login.php", {
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

  function logout() {
    return api("/auth/logout.php", { method: "POST" }).then(function () {
      currentUser = null;
      emit();
      document.dispatchEvent(new CustomEvent("auth-logout"));
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
    if (!btn) return;
    if (user) {
      btn.textContent = user.display_name || user.username;
      btn.setAttribute("aria-label", "Logout");
      btn.title = "Click to logout";
      btn.onclick = function () {
        logout();
      };
    } else {
      btn.textContent = "Login";
      btn.setAttribute("aria-label", "Login");
      btn.title = "Login to chat";
      btn.onclick = function () {
        openLoginModal();
      };
    }
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
      '<p class="auth-modal-sub">Sign in to chat with Nigga Bot.</p>' +
      '<form id="auth-login-form">' +
      '<label>Username <input name="username" autocomplete="username" required></label>' +
      '<label>Password <input name="password" type="password" autocomplete="current-password" required></label>' +
      '<p class="auth-error" hidden></p>' +
      '<button type="submit">Login</button>' +
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
        errEl.textContent = err.message || "Login failed";
        errEl.hidden = false;
      });
    });
  }

  function openLoginModal() {
    ensureLoginModal();
    document.getElementById("auth-modal").hidden = false;
  }

  function closeLoginModal() {
    var m = document.getElementById("auth-modal");
    if (m) m.hidden = true;
  }

  window.NotesAuth = {
    checkSession: checkSession,
    login: login,
    logout: logout,
    onAuthChange: onAuthChange,
    isLoggedIn: isLoggedIn,
    getUser: getUser,
    openLoginModal: openLoginModal,
    closeLoginModal: closeLoginModal
  };

  document.addEventListener("site-nav-ready", function () {
    updateHeaderAuth(currentUser);
    checkSession();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkSession);
  } else {
    checkSession();
  }
})();
