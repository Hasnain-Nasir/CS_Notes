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
        $return = $_GET['return'] ?? '/admin/';
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
  <title>Admin Login</title>
  <link rel="stylesheet" href="/assets/css/notes.css">
  <link rel="stylesheet" href="/admin/admin.css">
</head>
<body class="site-body admin-body">
  <div class="admin-login-wrap">
    <form class="admin-login-form" method="post">
      <h1>Admin Login</h1>
      <?php if ($error): ?><p class="admin-error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
      <label>Username <input type="text" name="username" required autocomplete="username"></label>
      <label>Password <input type="password" name="password" required autocomplete="current-password"></label>
      <button type="submit">Login</button>
      <a href="/index.html">Back to site</a>
    </form>
  </div>
</body>
</html>
