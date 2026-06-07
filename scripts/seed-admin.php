<?php
/**
 * CLI: php scripts/seed-admin.php [username] [password]
 * Creates or updates the first admin user.
 */
require_once dirname(__DIR__) . '/includes/helpers.php';
require_once dirname(__DIR__) . '/includes/db.php';

$username = $argv[1] ?? 'admin';
$password = $argv[2] ?? 'ChangeMe123!';

if (strlen($password) < 8) {
    fwrite(STDERR, "Password must be at least 8 characters.\n");
    exit(1);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$pdo = db();

$stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
$stmt->execute([$username]);
$existing = $stmt->fetch();

if ($existing) {
    $pdo->prepare('UPDATE users SET password_hash = ?, role = ?, is_active = 1 WHERE id = ?')
        ->execute([$hash, 'admin', $existing['id']]);
    echo "Updated admin user: {$username}\n";
} else {
    $pdo->prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)')
        ->execute([$username, $hash, 'admin', 'Hasnain Nasir']);
    echo "Created admin user: {$username}\n";
}

echo "Done.\n";
