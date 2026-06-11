<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$body = read_json_body();
$username = sanitize_string($body['username'] ?? '', 64);
$displayName = sanitize_string($body['display_name'] ?? '', 128);
$password = (string) ($body['password'] ?? '');

if ($displayName === '') {
    json_response(['ok' => false, 'error' => 'Display name required'], 400);
}

if ($username === '' || strlen($password) < 6) {
    json_response(['ok' => false, 'error' => 'Username and password (6+ chars) required'], 400);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
try {
    db()->prepare('INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)')
        ->execute([$username, $hash, 'user', $displayName]);
} catch (PDOException $e) {
    json_response(['ok' => false, 'error' => 'Username already exists'], 409);
}

$user = auth_login($username, $password);
if (!$user) {
    json_response(['ok' => false, 'error' => 'Registration failed'], 500);
}

json_response([
    'ok' => true,
    'user' => user_public($user),
    'redirect' => '/',
]);
