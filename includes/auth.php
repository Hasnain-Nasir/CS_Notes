<?php

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    static $cached = null;
    if ($cached !== null && (int) $cached['id'] === (int) $_SESSION['user_id']) {
        return $cached;
    }
    $stmt = db()->prepare('SELECT id, username, role, display_name, is_active FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int) $_SESSION['user_id']]);
    $user = $stmt->fetch();
    if (!$user || !(int) $user['is_active']) {
        auth_logout();
        return null;
    }
    $cached = $user;
    return $user;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        json_response(['ok' => false, 'error' => 'Not authenticated'], 401);
    }
    return $user;
}

function require_admin(): array
{
    $user = require_login();
    if ($user['role'] !== 'admin') {
        json_response(['ok' => false, 'error' => 'Forbidden'], 403);
    }
    return $user;
}

function auth_login(string $username, string $password): ?array
{
    $stmt = db()->prepare('SELECT id, username, password_hash, role, display_name, is_active FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user || !(int) $user['is_active']) {
        return null;
    }
    if (!password_verify($password, $user['password_hash'])) {
        return null;
    }
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $user['id'];
    unset($user['password_hash']);
    return $user;
}

function auth_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function audit_log(int $adminId, string $action, ?string $details = null): void
{
    try {
        db()->prepare('INSERT INTO admin_audit_log (admin_id, action, details) VALUES (?, ?, ?)')
            ->execute([$adminId, $action, $details]);
    } catch (Throwable $e) {
        // non-fatal
    }
}

function user_public(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'display_name' => $user['display_name'] ?? $user['username'],
    ];
}
