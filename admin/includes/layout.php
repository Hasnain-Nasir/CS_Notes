<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

function admin_require(): array
{
    $user = current_user();
    if (!$user) {
        header('Location: /admin/login.php?return=' . urlencode($_SERVER['REQUEST_URI']));
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
    ?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= htmlspecialchars($title) ?> — Admin</title>
  <link rel="stylesheet" href="/assets/css/notes.css">
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body class="site-body admin-body" data-nav-depth="0">
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <a class="admin-brand" href="/admin/">Notes by Nain</a>
      <p class="admin-user"><?= htmlspecialchars($user['display_name'] ?? $user['username']) ?></p>
      <nav class="admin-nav">
        <a href="/admin/" class="<?= $active === 'overview' ? 'is-active' : '' ?>">Overview</a>
        <a href="/admin/chats.php" class="<?= $active === 'chats' ? 'is-active' : '' ?>">Chats</a>
        <a href="/admin/memories.php" class="<?= $active === 'memories' ? 'is-active' : '' ?>">Memories</a>
        <a href="/admin/users.php" class="<?= $active === 'users' ? 'is-active' : '' ?>">Users</a>
        <a href="/admin/keys.php" class="<?= $active === 'keys' ? 'is-active' : '' ?>">API Keys</a>
        <a href="/admin/knowledge.php" class="<?= $active === 'knowledge' ? 'is-active' : '' ?>">Site Knowledge</a>
        <a href="/admin/papers.php" class="<?= $active === 'papers' ? 'is-active' : '' ?>">Past Papers</a>
        <a href="/admin/backups.php" class="<?= $active === 'backups' ? 'is-active' : '' ?>">Backups</a>
      </nav>
      <div class="admin-sidebar-foot">
        <a href="/index.html">View site</a>
        <button type="button" id="admin-logout">Logout</button>
      </div>
    </aside>
    <main class="admin-main">
      <h1 class="admin-page-title"><?= htmlspecialchars($title) ?></h1>
    <?php
}

function admin_footer(): void
{
    ?>
    </main>
  </div>
  <script src="/admin/admin.js"></script>
</body>
</html>
    <?php
}
