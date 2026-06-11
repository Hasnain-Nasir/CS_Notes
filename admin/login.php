<?php
require_once __DIR__ . '/includes/layout.php';

if (current_user() && current_user()['role'] === 'admin') {
    header('Location: /admin/');
    exit;
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $user = auth_login($username, $password);
    if ($user && $user['role'] === 'admin') {
        $return = $_SESSION['admin_return'] ?? '/admin/';
        unset($_SESSION['admin_return']);
        header('Location: ' . $return);
        exit;
    }
    $error = 'Invalid admin credentials';
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
  <title>Admin Login</title>
  <link rel="stylesheet" href="/assets/css/notes.css">
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body class="admin-body">
  <div class="admin-login-wrap">
    <form class="admin-login-form" method="post">
      <div class="admin-login-head">
        <h1>Admin Login</h1>
        <button type="button" class="theme-toggle theme-toggle--icon" aria-pressed="false" aria-label="Switch theme">
          <span class="theme-toggle-icon" aria-hidden="true">
            <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
            <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </span>
        </button>
      </div>
      <?php if ($error): ?><p class="admin-error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
      <label>Username <input type="text" name="username" required autocomplete="username"></label>
      <label>Password <input type="password" name="password" required autocomplete="current-password"></label>
      <button type="submit">Login</button>
      <a href="/">Back to site</a>
    </form>
  </div>
  <script src="/assets/js/theme.js"></script>
</body>
</html>
