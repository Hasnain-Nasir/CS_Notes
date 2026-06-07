<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT id, username, role, display_name, is_active, created_at FROM users ORDER BY id')->fetchAll();
    json_response(['ok' => true, 'users' => $rows]);
}

$admin = require_admin();
$body = read_json_body();
$action = $body['action'] ?? 'create';

if ($action === 'create') {
    $username = sanitize_string($body['username'] ?? '', 64);
    $password = (string) ($body['password'] ?? '');
    $role = ($body['role'] ?? 'user') === 'admin' ? 'admin' : 'user';
    $displayName = sanitize_string($body['display_name'] ?? $username, 128);

    if ($username === '' || strlen($password) < 6) {
        json_response(['ok' => false, 'error' => 'Username and password (6+ chars) required'], 400);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    try {
        db()->prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)')
            ->execute([$username, $hash, $role, $displayName]);
    } catch (PDOException $e) {
        json_response(['ok' => false, 'error' => 'Username already exists'], 409);
    }
    audit_log((int) $admin['id'], 'user_create', $username . ' (' . $role . ')');
    json_response(['ok' => true]);
}

if ($action === 'toggle') {
    $id = (int) ($body['id'] ?? 0);
    $active = !empty($body['is_active']) ? 1 : 0;
    if ($id === (int) $admin['id']) {
        json_response(['ok' => false, 'error' => 'Cannot deactivate yourself'], 400);
    }
    db()->prepare('UPDATE users SET is_active = ? WHERE id = ?')->execute([$active, $id]);
    audit_log((int) $admin['id'], 'user_toggle', "id={$id} active={$active}");
    json_response(['ok' => true]);
}

if ($action === 'reset_password') {
    $id = (int) ($body['id'] ?? 0);
    $password = (string) ($body['password'] ?? '');
    if (strlen($password) < 6) {
        json_response(['ok' => false, 'error' => 'Password must be 6+ characters'], 400);
    }
    $hash = password_hash($password, PASSWORD_DEFAULT);
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $id]);
    audit_log((int) $admin['id'], 'password_reset', "id={$id}");
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Unknown action'], 400);
