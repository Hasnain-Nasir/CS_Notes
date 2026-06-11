(function () {
  function api(path, opts) {
    opts = opts || {};
    return fetch("/api/admin/" + path, {
      method: opts.method || "GET",
      credentials: "same-origin",
      headers: opts.body instanceof FormData ? {} : { "Content-Type": "application/json" },
      body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.text().then(function (text) {
        var d = {};
        if (text) {
          try {
            d = JSON.parse(text);
          } catch (e) {
            throw new Error(r.ok ? "Invalid server response" : "Server error (" + r.status + ")");
          }
        }
        if (!r.ok || !d.ok) throw new Error(d.error || "Request failed (" + r.status + ")");
        return d;
      });
    }).catch(function (e) {
      if (e.message === "Failed to fetch") {
        throw new Error("Could not reach server — check connection or reload the page");
      }
      throw e;
    });
  }

  var logoutBtn = document.getElementById("admin-logout");
  var userBtn = document.getElementById("admin-user-btn");
  var userDropdown = document.getElementById("admin-user-dropdown");
  var userMenu = document.getElementById("admin-user-menu");

  function closeAdminUserMenu() {
    if (!userDropdown || !userBtn) return;
    userDropdown.hidden = true;
    userBtn.setAttribute("aria-expanded", "false");
  }

  if (userBtn && userDropdown) {
    userBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = userDropdown.hidden;
      userDropdown.hidden = !open;
      userBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!userMenu || userDropdown.hidden) return;
      if (!userMenu.contains(e.target)) closeAdminUserMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeAdminUserMenu();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      closeAdminUserMenu();
      fetch("/api/auth/logout.php", { method: "POST", credentials: "same-origin" }).then(function () {
        window.location.href = "/admin/login.php";
      });
    });
  }

  var chatsUsers = document.getElementById("chats-users");
  var chatsMessages = document.getElementById("chats-messages");
  var chatsToolbar = document.getElementById("chats-toolbar");
  var chatsActiveLabel = document.getElementById("chats-active-label");
  var deleteUserChatBtn = document.getElementById("delete-user-chat");
  if (chatsUsers && chatsMessages) {
    var activeChatUser = null;
    var activeChatName = "";

    function formatChatTime(ts) {
      if (!ts) return "";
      var d = new Date(ts.replace(" ", "T"));
      if (isNaN(d.getTime())) return ts;
      return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    function renderChatMessages(chats) {
      if (!chats.length) {
        chatsMessages.innerHTML = "<p class='admin-chats-empty'>No messages for this user yet.</p>";
        return;
      }
      chatsMessages.innerHTML = '<div class="admin-chat-thread">' + chats.map(function (c) {
        var side = c.role === "user" ? "out" : "in";
        return '<div class="admin-chat-bubble admin-chat-bubble--' + side + '">' +
          '<div class="admin-chat-bubble-text">' + esc(c.content) + "</div>" +
          '<div class="admin-chat-bubble-time">' + esc(formatChatTime(c.created_at)) + "</div></div>";
      }).join("") + "</div>";
      var thread = chatsMessages.querySelector(".admin-chat-thread");
      if (thread) thread.scrollTop = thread.scrollHeight;
    }

    function loadUserChat(userId, userName) {
      activeChatUser = userId;
      activeChatName = userName || "";
      if (chatsToolbar) chatsToolbar.hidden = false;
      if (chatsActiveLabel) chatsActiveLabel.textContent = activeChatName || "Chat";
      chatsUsers.querySelectorAll("[data-chat-user]").forEach(function (btn) {
        btn.classList.toggle("is-active", +btn.dataset.chatUser === userId);
      });
      chatsMessages.innerHTML = "<p class='admin-chats-empty'>Loading chat…</p>";
      api("messages.php?user_id=" + encodeURIComponent(userId)).then(function (d) {
        renderChatMessages(d.chats || []);
      }).catch(function (e) {
        chatsMessages.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>";
      });
    }

    function deleteActiveChat() {
      if (!activeChatUser) return;
      if (!confirm("Delete all chat messages for " + (activeChatName || "this user") + "? This cannot be undone.")) return;
      api("messages.php", { method: "POST", body: { action: "delete_user_chat", user_id: activeChatUser } })
        .then(function () {
          activeChatUser = null;
          activeChatName = "";
          if (chatsToolbar) chatsToolbar.hidden = true;
          loadChatUsers();
        })
        .catch(function (e) { alert(e.message); });
    }

    if (deleteUserChatBtn) {
      deleteUserChatBtn.addEventListener("click", deleteActiveChat);
    }

    function loadChatUsers() {
      api("messages.php").then(function (d) {
        var users = d.users || [];
        if (!users.length) {
          chatsUsers.innerHTML = "";
          chatsMessages.innerHTML = "<p class='admin-chats-empty'>No chats yet.</p>";
          return;
        }
        chatsUsers.innerHTML = users.map(function (u) {
          var name = u.display_name || u.username;
          return '<button type="button" class="admin-chat-user' + (activeChatUser === u.id ? " is-active" : "") +
            '" data-chat-user="' + u.id + '">' + esc(name) + "</button>";
        }).join("");
        chatsUsers.querySelectorAll("[data-chat-user]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            loadUserChat(+btn.dataset.chatUser, btn.textContent.trim());
          });
        });
        if (!activeChatUser || !users.some(function (u) { return u.id === activeChatUser; })) {
          var first = users[0];
          loadUserChat(first.id, first.display_name || first.username);
        }
      }).catch(function (e) {
        chatsMessages.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>";
      });
    }

    loadChatUsers();
  }

  var memList = document.getElementById("memories-list");
  var addMemory = document.getElementById("add-memory-form");
  if (memList) {
    function loadMemories() {
      var uid = document.getElementById("filter-user").value;
      var q = uid ? "?user_id=" + encodeURIComponent(uid) : "";
      api("memories.php" + q).then(function (d) {
        if (!d.memories.length) {
          memList.innerHTML = "<p>No memories yet. Add one above.</p>";
          return;
        }
        memList.innerHTML = "<table class='admin-table'><tr><th>User</th><th>Memory</th><th>Source</th><th>When</th><th></th></tr>" +
          d.memories.map(function (m) {
            return "<tr><td>" + esc(m.username) + " <span class='admin-meta'>#" + m.user_id + "</span></td><td>" + esc(m.memory_text) +
              "</td><td><span class='admin-badge'>" + esc(m.source) + "</span></td><td>" + esc(m.created_at) +
              "</td><td><button type='button' class='admin-btn-sm admin-btn-danger' data-mdel='" + m.id + "'>Delete</button></td></tr>";
          }).join("") + "</table>";
        memList.querySelectorAll("[data-mdel]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Delete this memory?")) return;
            api("memories.php", { method: "POST", body: { action: "delete", id: +btn.dataset.mdel } }).then(loadMemories);
          });
        });
      }).catch(function (e) { memList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>"; });
    }
    if (addMemory) {
      addMemory.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(addMemory);
        api("memories.php", {
          method: "POST",
          body: { action: "save", user_id: +fd.get("user_id"), memory_text: fd.get("memory_text") }
        }).then(function () { addMemory.reset(); loadMemories(); }).catch(function (err) { alert(err.message); });
      });
    }
    document.getElementById("reload-memories").addEventListener("click", loadMemories);
    loadMemories();
  }

  var usersList = document.getElementById("users-list");
  var createUser = document.getElementById("create-user-form");
  if (usersList) {
    function loadUsers() {
      api("users.php").then(function (d) {
        if (!d.users.length) {
          usersList.innerHTML = "<p>No users yet.</p>";
          return;
        }
        usersList.innerHTML = "<table class='admin-table admin-table--users'><tr><th>ID</th><th>User</th><th>Display name</th><th>Role</th><th>Status</th><th>Actions</th></tr>" +
          d.users.map(function (u) {
            return "<tr><td><span class='admin-meta'>#" + u.id + "</span></td><td><strong>" + esc(u.username) + "</strong></td><td>" + esc(u.display_name || "—") +
              "</td><td><span class='admin-badge" + (u.role === "admin" ? " admin-badge--admin" : "") + "'>" + esc(u.role) + "</span></td><td>" +
              "<span class='admin-status " + (u.is_active ? "is-active" : "is-inactive") + "'>" + (u.is_active ? "Active" : "Inactive") + "</span></td><td class='admin-actions'>" +
              "<button type='button' class='admin-btn-sm" + (u.is_active ? " admin-btn-danger" : "") + "' data-toggle='" + u.id + "' data-active='" + (u.is_active ? "0" : "1") + "'>" +
              (u.is_active ? "Deactivate" : "Activate") + "</button></td></tr>";
          }).join("") + "</table>";
        usersList.querySelectorAll("[data-toggle]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            api("users.php", { method: "POST", body: { action: "toggle", id: +btn.dataset.toggle, is_active: btn.dataset.active === "1" } }).then(loadUsers);
          });
        });
      }).catch(function (e) { usersList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>"; });
    }
    if (createUser) {
      createUser.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(createUser);
        api("users.php", {
          method: "POST",
          body: { action: "create", username: fd.get("username"), password: fd.get("password"), display_name: fd.get("display_name"), role: fd.get("role") }
        }).then(function () { createUser.reset(); loadUsers(); alert("User created"); }).catch(function (err) { alert(err.message); });
      });
    }
    loadUsers();
  }

  var pwReqList = document.getElementById("password-requests-list");
  if (pwReqList) {
    function loadPasswordRequests() {
      api("password-requests.php").then(function (d) {
        var reqs = d.requests || [];
        if (!reqs.length) {
          pwReqList.innerHTML = "<p>No pending password reset requests.</p>";
          return;
        }
        pwReqList.innerHTML = reqs.map(function (r) {
          return '<form class="admin-form admin-form--card admin-pw-request" data-req-id="' + r.id + '">' +
            '<div class="admin-pw-request-head">' +
            '<strong>' + esc(r.username) + '</strong>' +
            '<span class="admin-meta">Requested ' + esc(r.requested_at) + '</span>' +
            '</div>' +
            '<div class="admin-form-grid admin-form-grid--inline">' +
            '<label class="admin-field admin-field--grow">' +
            '<span>New password</span>' +
            '<input name="new_password" type="password" placeholder="Min 6 characters" required minlength="6">' +
            '</label>' +
            '<div class="admin-form-actions">' +
            '<button type="submit" class="admin-btn">Set password &amp; resolve</button>' +
            '<button type="button" class="admin-btn-sm admin-btn-danger" data-dismiss="' + r.id + '">Dismiss</button>' +
            '</div></div>' +
            '<p class="admin-form-error" hidden></p>' +
            '</form>';
        }).join("");

        pwReqList.querySelectorAll(".admin-pw-request").forEach(function (form) {
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            var errEl = form.querySelector(".admin-form-error");
            errEl.hidden = true;
            var fd = new FormData(form);
            api("password-requests.php", {
              method: "POST",
              body: { action: "resolve", id: +form.dataset.reqId, new_password: fd.get("new_password") }
            }).then(function () {
              loadPasswordRequests();
            }).catch(function (err) {
              errEl.textContent = err.message;
              errEl.hidden = false;
            });
          });
        });

        pwReqList.querySelectorAll("[data-dismiss]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Dismiss this request without changing the password?")) return;
            api("password-requests.php", { method: "POST", body: { action: "dismiss", id: +btn.dataset.dismiss } })
              .then(loadPasswordRequests)
              .catch(function (err) { alert(err.message); });
          });
        });
      }).catch(function (e) {
        pwReqList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>";
      });
    }
    loadPasswordRequests();
  }

  var keysList = document.getElementById("keys-list");
  var addKey = document.getElementById("add-key-form");
  if (keysList) {
    function loadKeys() {
      api("api-keys.php").then(function (d) {
        if (!d.keys.length) {
          keysList.innerHTML = "<p>No API keys yet. Add one above.</p>";
          return;
        }
        keysList.innerHTML = "<table class='admin-table admin-table--keys'><tr><th>Label</th><th>Provider</th><th>Model</th><th>Priority</th><th>Status</th><th>Actions</th></tr>" +
          d.keys.map(function (k) {
            return "<tr><td><strong>" + esc(k.label) + "</strong></td><td><span class='admin-badge admin-badge--provider'>" + esc(k.provider) + "</span></td><td class='admin-muted'>" + esc(k.model || "default") +
              "</td><td>" + k.priority + "</td><td><span class='admin-status " + (k.is_active ? "is-active" : "is-inactive") + "'>" + (k.is_active ? "Active" : "Inactive") + "</span></td><td class='admin-actions'>" +
              "<button type='button' class='admin-btn-sm' data-test='" + k.id + "'>Test</button>" +
              "<button type='button' class='admin-btn-sm admin-btn-danger' data-del='" + k.id + "'>Delete</button></td></tr>";
          }).join("") + "</table>";
        keysList.querySelectorAll("[data-test]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            btn.disabled = true;
            api("api-keys.php", { method: "POST", body: { action: "test", id: +btn.dataset.test } })
              .then(function (r) { alert("OK: " + r.reply); })
              .catch(function (e) { alert(e.message); })
              .finally(function () { btn.disabled = false; });
          });
        });
        keysList.querySelectorAll("[data-del]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Delete this key?")) return;
            api("api-keys.php", { method: "POST", body: { action: "delete", id: +btn.dataset.del } }).then(loadKeys);
          });
        });
      }).catch(function (e) { keysList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>"; });
    }
    if (addKey) {
      addKey.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(addKey);
        api("api-keys.php", {
          method: "POST",
          body: {
            action: "save",
            id: +fd.get("id"),
            label: fd.get("label"),
            provider: fd.get("provider"),
            api_key: fd.get("api_key"),
            model: fd.get("model"),
            priority: +fd.get("priority"),
            is_active: fd.get("is_active") === "on"
          }
        }).then(function () { alert("Saved"); loadKeys(); }).catch(function (e) { alert(e.message); });
      });
    }
    var searchKey = document.getElementById("search-key-form");
    if (searchKey) {
      searchKey.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(searchKey);
        api("api-keys.php", { method: "POST", body: { action: "save_search_key", tavily_api_key: fd.get("tavily_api_key") } })
          .then(function () { alert("Search key saved"); }).catch(function (err) { alert(err.message); });
      });
    }
    loadKeys();
  }

  var knowledgeForm = document.getElementById("knowledge-form");
  if (knowledgeForm) {
    api("site-knowledge.php").then(function (d) {
      document.getElementById("knowledge-json").value = JSON.stringify(d.knowledge, null, 2);
    });
    knowledgeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      try {
        var parsed = JSON.parse(document.getElementById("knowledge-json").value);
        api("site-knowledge.php", { method: "POST", body: { knowledge: parsed } }).then(function () { alert("Saved"); });
      } catch (err) { alert("Invalid JSON"); }
    });
  }

  var papersList = document.getElementById("papers-list");
  if (papersList) {
    function loadPapers() {
      fetch("/api/admin/papers/upload.php", { credentials: "same-origin" }).then(function (r) { return r.json(); }).then(function (d) {
        if (!d.ok) throw new Error(d.error);
        papersList.innerHTML = "<table class='admin-table'><tr><th>Subject</th><th>Exam</th><th>Year</th><th>File</th><th>Text len</th><th></th></tr>" +
          d.papers.map(function (p) {
            return "<tr><td>" + esc(p.subject) + "</td><td>" + p.exam_type + "</td><td>" + (p.year || "") + "</td><td>" + esc(p.file_path || "") +
              "</td><td>" + p.text_len + "</td><td><button data-pdel='" + p.id + "'>Delete</button></td></tr>";
          }).join("") + "</table>";
        papersList.querySelectorAll("[data-pdel]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            fetch("/api/admin/papers/upload.php", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "delete", id: +btn.dataset.pdel })
            }).then(function () { loadPapers(); });
          });
        });
      });
    }
    var uploadForm = document.getElementById("upload-paper-form");
    if (uploadForm) {
      uploadForm.addEventListener("submit", function (e) {
        e.preventDefault();
        fetch("/api/admin/papers/upload.php", { method: "POST", credentials: "same-origin", body: new FormData(uploadForm) })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (!d.ok) throw new Error(d.error); uploadForm.reset(); loadPapers(); alert("Uploaded"); })
          .catch(function (err) { alert(err.message); });
      });
    }
    var manualForm = document.getElementById("manual-paper-form");
    if (manualForm) {
      manualForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(manualForm);
        fetch("/api/admin/papers/upload.php", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "manual",
            subject: fd.get("subject"),
            exam_type: fd.get("exam_type"),
            year: fd.get("year"),
            extracted_text: fd.get("extracted_text")
          })
        }).then(function (r) { return r.json(); }).then(function (d) {
          if (!d.ok) throw new Error(d.error);
          manualForm.reset();
          loadPapers();
          alert("Saved");
        }).catch(function (err) { alert(err.message); });
      });
    }
    loadPapers();
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }
})();
