(function () {
  function api(path, opts) {
    opts = opts || {};
    return fetch("/api/admin/" + path, {
      method: opts.method || "GET",
      credentials: "same-origin",
      headers: opts.body instanceof FormData ? {} : { "Content-Type": "application/json" },
      body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok || !d.ok) throw new Error(d.error || "Request failed");
        return d;
      });
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

  var chatsList = document.getElementById("chats-list");
  if (chatsList) {
    function loadChats() {
      var uid = document.getElementById("filter-user").value;
      var q = uid ? "?user_id=" + encodeURIComponent(uid) : "";
      api("chats.php" + q).then(function (d) {
        chatsList.innerHTML = d.chats.map(function (c) {
          return '<div class="admin-chat-row ' + c.role + '"><span class="meta">#' + c.user_id + " " + c.username + " · " + c.created_at + "</span><p>" + esc(c.content) + "</p></div>";
        }).join("") || "<p>No chats yet.</p>";
      }).catch(function (e) { chatsList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>"; });
    }
    document.getElementById("reload-chats").addEventListener("click", loadChats);
    loadChats();
  }

  var memList = document.getElementById("memories-list");
  if (memList) {
    function loadMemories() {
      var uid = document.getElementById("filter-user").value;
      var q = uid ? "?user_id=" + encodeURIComponent(uid) : "";
      api("memories.php" + q).then(function (d) {
        memList.innerHTML = "<table class='admin-table'><tr><th>User</th><th>Memory</th><th>When</th></tr>" +
          d.memories.map(function (m) {
            return "<tr><td>" + esc(m.username) + "</td><td>" + esc(m.memory_text) + "</td><td>" + esc(m.created_at) + "</td></tr>";
          }).join("") + "</table>";
      }).catch(function (e) { memList.innerHTML = "<p class='admin-error'>" + esc(e.message) + "</p>"; });
    }
    document.getElementById("reload-memories").addEventListener("click", loadMemories);
    loadMemories();
  }

  var usersList = document.getElementById("users-list");
  var createUser = document.getElementById("create-user-form");
  if (usersList) {
    function loadUsers() {
      api("users.php").then(function (d) {
        usersList.innerHTML = "<table class='admin-table'><tr><th>ID</th><th>User</th><th>Role</th><th>Active</th><th>Actions</th></tr>" +
          d.users.map(function (u) {
            return "<tr><td>" + u.id + "</td><td>" + esc(u.username) + "</td><td>" + u.role + "</td><td>" + (u.is_active ? "Yes" : "No") +
              "</td><td><button data-toggle='" + u.id + "' data-active='" + (u.is_active ? "0" : "1") + "'>" + (u.is_active ? "Deactivate" : "Activate") + "</button></td></tr>";
          }).join("") + "</table>";
        usersList.querySelectorAll("[data-toggle]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            api("users.php", { method: "POST", body: { action: "toggle", id: +btn.dataset.toggle, is_active: btn.dataset.active === "1" } }).then(loadUsers);
          });
        });
      });
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

  var keysList = document.getElementById("keys-list");
  var addKey = document.getElementById("add-key-form");
  if (keysList) {
    function loadKeys() {
      api("api-keys.php").then(function (d) {
        keysList.innerHTML = "<table class='admin-table'><tr><th>Label</th><th>Provider</th><th>Priority</th><th>Active</th><th>Test</th><th>Delete</th></tr>" +
          d.keys.map(function (k) {
            return "<tr><td>" + esc(k.label) + "</td><td>" + k.provider + "</td><td>" + k.priority + "</td><td>" + (k.is_active ? "Yes" : "No") +
              "</td><td><button data-test='" + k.id + "'>Test</button></td><td><button data-del='" + k.id + "'>Delete</button></td></tr>";
          }).join("") + "</table>";
        keysList.querySelectorAll("[data-test]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            api("api-keys.php", { method: "POST", body: { action: "test", id: +btn.dataset.test } }).then(function (r) { alert("OK: " + r.reply); }).catch(function (e) { alert(e.message); });
          });
        });
        keysList.querySelectorAll("[data-del]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            if (!confirm("Delete this key?")) return;
            api("api-keys.php", { method: "POST", body: { action: "delete", id: +btn.dataset.del } }).then(loadKeys);
          });
        });
      });
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
