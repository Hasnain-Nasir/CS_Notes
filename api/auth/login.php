<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

header('Access-Control-Allow-Credentials: true');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    exit;
}

$body = read_json_body();
$username = sanitize_string($body['username'] ?? $_POST['username'] ?? '', 64);
$password = (string) ($body['password'] ?? $_POST['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'Username and password required'], 400);
}

$user = auth_login($username, $password);
if (!$user) {
    json_response(['ok' => false, 'error' => 'Invalid credentials'], 401);
}

json_response([
    'ok' => true,
    'user' => user_public($user),
    'redirect' => '/index.html',
]);
