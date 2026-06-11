<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

function admin_require(): array
{
    $user = current_user();
    if (!$user) {
        $_SESSION['admin_return'] = $_SERVER['REQUEST_URI'];
        header('Location: /admin/login');
        exit;
    }
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        include __DIR__ . '/403.php';
        exit;
    }
    return $user;
}

function admin_header(string $title, string $active = ''): void
{
    $user = admin_require();
    $displayName = htmlspecialchars($user['display_name'] ?? $user['username']);
    $pendingPwReqs = 0;
    try {
        $pendingPwReqs = (int) db()->query(
            "SELECT COUNT(*) FROM password_reset_requests WHERE status = 'pending'"
        )->fetchColumn();
    } catch (Throwable $e) {
        $pendingPwReqs = 0;
    }
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    (function () {
      try {
        if (localStorage.getItem("infosec-notes-theme") !== "light") {
          document.documentElement.setAttribute("data-theme", "dark");
        }
      } catch (e) {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    })();
  </script>
  <title><?= htmlspecialchars($title) ?> — Admin</title>
  <link rel="stylesheet" href="/assets/css/notes.css">
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body class="admin-body">
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <a class="admin-brand" href="/admin/">Notes by Nain</a>
      <p class="admin-sidebar-label">Admin panel</p>
      <nav class="admin-nav" aria-label="Admin">
        <a href="/admin/" class="<?= $active === 'overview' ? 'is-active' : '' ?>">Overview</a>
        <a href="/admin/messages" class="<?= $active === 'messages' ? 'is-active' : '' ?>">Chats</a>
        <a href="/admin/memories" class="<?= $active === 'memories' ? 'is-active' : '' ?>">Memories</a>
        <a href="/admin/users" class="<?= $active === 'users' ? 'is-active' : '' ?>">Users</a>
        <a href="/admin/password-requests" class="<?= $active === 'password-requests' ? 'is-active' : '' ?>">
          Password requests<?php if ($pendingPwReqs > 0): ?><span class="admin-nav-badge"><?= $pendingPwReqs ?></span><?php endif; ?>
        </a>
        <a href="/admin/keys" class="<?= $active === 'keys' ? 'is-active' : '' ?>">API Keys</a>
        <a href="/admin/knowledge" class="<?= $active === 'knowledge' ? 'is-active' : '' ?>">Site Knowledge</a>
        <a href="/admin/papers" class="<?= $active === 'papers' ? 'is-active' : '' ?>">Past Papers</a>
        <a href="/admin/backups" class="<?= $active === 'backups' ? 'is-active' : '' ?>">Backups</a>
      </nav>
      <div class="admin-sidebar-foot">
        <a href="/">View site</a>
      </div>
    </aside>
    <div class="admin-content">
      <header class="admin-topbar">
        <h1 class="admin-page-title"><?= htmlspecialchars($title) ?></h1>
        <div class="admin-topbar-actions">
          <button type="button" class="theme-toggle theme-toggle--icon" aria-pressed="false" aria-label="Switch theme">
            <span class="theme-toggle-icon" aria-hidden="true">
              <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </span>
          </button>
          <div class="admin-user-menu" id="admin-user-menu">
            <button type="button" class="admin-user-btn" id="admin-user-btn" aria-expanded="false" aria-haspopup="true"><?= $displayName ?></button>
            <div class="admin-user-dropdown" id="admin-user-dropdown" hidden>
              <button type="button" id="admin-logout">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <main class="admin-main">
    <?php
}

function admin_footer(): void
{
    ?>
      </main>
    </div>
  </div>
  <script src="/assets/js/theme.js"></script>
  <script src="/admin/admin.js"></script>
</body>
</html>
    <?php
}
