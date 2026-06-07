(function () {
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

  function buildWidget() {
    if (document.getElementById("nain-chat-widget")) return;

    var root = document.createElement("div");
    root.id = "nain-chat-widget";
    root.className = "nain-chat-widget";
    root.innerHTML =
      '<button type="button" class="nain-chat-toggle" aria-expanded="false" aria-controls="nain-chat-panel">' +
      'Nigga Bot</button>' +
      '<div id="nain-chat-panel" class="nain-chat-panel">' +
      '<header class="nain-chat-header">' +
      '<div><strong>Nigga Bot</strong><span class="nain-chat-sub">Notes assistant</span></div>' +
      '<button type="button" class="nain-chat-close" aria-label="Close chat">&times;</button>' +
      '</header>' +
      '<div class="nain-chat-login-gate">' +
      '<p>You dumb ass niga login first</p>' +
      '</div>' +
      '<div class="nain-chat-messages" role="log" aria-live="polite" hidden></div>' +
      '<form class="nain-chat-form" hidden>' +
      '<input type="text" name="message" placeholder="Ask anything..." autocomplete="off" maxlength="4000">' +
      '<button type="submit" aria-label="Send">Send</button>' +
      '</form></div>';
    document.body.appendChild(root);

    var toggle = root.querySelector(".nain-chat-toggle");
    var panel = root.querySelector(".nain-chat-panel");
    var closeBtn = root.querySelector(".nain-chat-close");
    var messagesEl = root.querySelector(".nain-chat-messages");
    var form = root.querySelector(".nain-chat-form");
    var input = form.querySelector("input");
    var gate = root.querySelector(".nain-chat-login-gate");
    var isOpen = false;
    var sending = false;

    function setOpen(open) {
      isOpen = !!open;
      panel.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (isOpen && window.NotesAuth && window.NotesAuth.isLoggedIn()) {
        loadHistory();
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
        messagesEl.hidden = false;
        form.hidden = false;
        input.disabled = false;
      } else {
        gate.hidden = false;
        messagesEl.hidden = true;
        form.hidden = true;
        input.disabled = true;
        messagesEl.innerHTML = "";
      }
    }

    function appendMessage(role, content) {
      var div = document.createElement("div");
      div.className = "nain-chat-msg nain-chat-msg--" + role;
      div.innerHTML = renderMarkdown(content);
      messagesEl.appendChild(div);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function loadHistory() {
      fetch("/api/chat/history.php", { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (!d.ok) return;
          messagesEl.innerHTML = "";
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
      sending = true;
      input.value = "";
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildWidget);
  } else {
    buildWidget();
  }
})();
