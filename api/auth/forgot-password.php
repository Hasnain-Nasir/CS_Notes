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

if ($username === '') {
    json_response(['ok' => false, 'error' => 'Username required'], 400);
}

$genericMessage = 'If this account exists, an admin will be notified to reset your password.';

$stmt = db()->prepare('SELECT id FROM users WHERE username = ? AND is_active = 1 LIMIT 1');
$stmt->execute([$username]);
$user = $stmt->fetch();

if (!$user) {
    json_response(['ok' => true, 'message' => $genericMessage]);
}

$userId = (int) $user['id'];

$stmt = db()->prepare(
    'SELECT COUNT(*) FROM password_reset_requests
     WHERE user_id = ? AND requested_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
);
$stmt->execute([$userId]);
if ((int) $stmt->fetchColumn() >= 3) {
    json_response(['ok' => true, 'message' => $genericMessage]);
}

$stmt = db()->prepare(
    'SELECT id FROM password_reset_requests WHERE user_id = ? AND status = ? LIMIT 1'
);
$stmt->execute([$userId, 'pending']);
if ($stmt->fetch()) {
    json_response([
        'ok' => true,
        'message' => 'Your request is already pending. An admin will reset your password soon.',
    ]);
}

db()->prepare('INSERT INTO password_reset_requests (user_id) VALUES (?)')->execute([$userId]);

json_response([
    'ok' => true,
    'message' => 'Request submitted. An admin will reset your password soon.',
]);
