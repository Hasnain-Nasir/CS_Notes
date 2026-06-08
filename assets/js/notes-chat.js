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
    var p = window.location.pathname;
    if (p.endsWith("/")) p += "index.html";
    return p;
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
    var isOpen = false;
    var sending = false;

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

    function appendMessage(role, content) {
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
    }

    function loadHistory() {
      fetch("/api/chat/history.php", { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) return;
          logEl.innerHTML = "";
          d.messages.forEach(function (m) {
            appendMessage(m.role, m.content);
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
        logEl.innerHTML = "";
        return;
      }

      sending = true;
      appendMessage("user", text);

      fetch("/api/chat/send.php", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, page_url: getPageUrl() })
      })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) throw new Error(d.error || "Failed");
          appendMessage("assistant", d.reply);
        })
        .catch(function (err) {
          appendMessage("assistant", "Error: " + (err.message || "Something went wrong"));
        })
        .finally(function () {
          sending = false;
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
