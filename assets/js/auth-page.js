(function () {
  var API = "/api";
  var card = document.getElementById("auth-card");
  var panels = document.querySelectorAll(".auth-page-panel");
  var activePanel = "login";

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

  function getReturnUrl() {
    var params = new URLSearchParams(window.location.search);
    var ret = params.get("return");
    if (ret && ret.charAt(0) === "/" && ret.indexOf("/login.html") === -1) {
      return ret;
    }
    return "/index.html";
  }

  function redirectAfterAuth(d) {
    window.location.href = d.redirect || getReturnUrl();
  }

  function showError(id, message) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  function clearErrors() {
    showError("auth-login-error", "");
    showError("auth-register-error", "");
    showError("auth-forgot-error", "");
    var success = document.getElementById("auth-forgot-success");
    if (success) success.hidden = true;
  }

  function switchPanel(name) {
    if (name === activePanel) return;
    clearErrors();
    card.setAttribute("data-transition", "out");
    window.setTimeout(function () {
      panels.forEach(function (panel) {
        var isTarget = panel.getAttribute("data-panel") === name;
        panel.hidden = !isTarget;
        panel.classList.toggle("is-active", isTarget);
      });
      activePanel = name;
      card.removeAttribute("data-transition");
      card.setAttribute("data-panel", name);
      var heading = document.querySelector('.auth-page-panel[data-panel="' + name + '"] h1');
      if (heading) heading.focus({ preventScroll: true });
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180);
  }

  document.querySelectorAll("[data-switch]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchPanel(btn.getAttribute("data-switch"));
    });
  });

  document.getElementById("auth-form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var fd = new FormData(e.target);
    var username = (fd.get("username") || "").toString().trim();
    var password = (fd.get("password") || "").toString();
    if (!username || !password) {
      showError("auth-login-error", "Username and password required");
      return;
    }
    var submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    api("/auth/login.php", { method: "POST", body: { username: username, password: password } })
      .then(function (d) {
        redirectAfterAuth(d);
      })
      .catch(function (err) {
        showError("auth-login-error", err.status === 401 ? "Invalid login credentials" : (err.message || "Network / server error"));
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  document.getElementById("auth-form-register").addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var fd = new FormData(e.target);
    var username = (fd.get("username") || "").toString().trim();
    var displayName = (fd.get("display_name") || "").toString().trim();
    var password = (fd.get("password") || "").toString();
    if (!username) {
      showError("auth-register-error", "Username required");
      return;
    }
    if (!displayName) {
      showError("auth-register-error", "Display name required");
      return;
    }
    if (displayName.length > 128) {
      showError("auth-register-error", "Display name must be 128 characters or fewer");
      return;
    }
    if (password.length < 6) {
      showError("auth-register-error", "Password too short (min 6 characters)");
      return;
    }
    var submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    api("/auth/register.php", { method: "POST", body: { username: username, display_name: displayName, password: password } })
      .then(function (d) {
        redirectAfterAuth(d);
      })
      .catch(function (err) {
        if (err.status === 409) {
          showError("auth-register-error", "Username already exists");
        } else if (err.message && err.message.indexOf("6") !== -1) {
          showError("auth-register-error", "Password too short (min 6 characters)");
        } else {
          showError("auth-register-error", err.message || "Network / server error");
        }
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  document.getElementById("auth-form-forgot").addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    var fd = new FormData(e.target);
    var username = (fd.get("username") || "").toString().trim();
    if (!username) {
      showError("auth-forgot-error", "Username required");
      return;
    }
    var submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    api("/auth/forgot-password.php", { method: "POST", body: { username: username } })
      .then(function (d) {
        var success = document.getElementById("auth-forgot-success");
        if (success) {
          success.textContent = d.message || "Request submitted.";
          success.hidden = false;
        }
        e.target.reset();
      })
      .catch(function (err) {
        showError("auth-forgot-error", err.message || "Network / server error");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  api("/auth/me.php").then(function (d) {
    if (d.user) {
      window.location.replace(getReturnUrl());
    }
  }).catch(function () { /* stay on login page */ });

  card.setAttribute("data-panel", "login");
})();
