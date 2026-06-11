<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->prepare(
        'SELECT r.id, r.user_id, r.status, r.requested_at, u.username
         FROM password_reset_requests r
         INNER JOIN users u ON u.id = r.user_id
         WHERE r.status = ?
         ORDER BY r.requested_at ASC'
    );
    $stmt->execute(['pending']);
    $rows = $stmt->fetchAll();

    json_response(['ok' => true, 'requests' => $rows]);
}

$admin = require_admin();
$body = read_json_body();
$action = $body['action'] ?? '';

if ($action === 'resolve') {
    $id = (int) ($body['id'] ?? 0);
    $password = (string) ($body['new_password'] ?? '');

    if ($id <= 0 || strlen($password) < 6) {
        json_response(['ok' => false, 'error' => 'Valid request and password (6+ chars) required'], 400);
    }

    $stmt = db()->prepare(
        'SELECT r.id, r.user_id, u.username
         FROM password_reset_requests r
         INNER JOIN users u ON u.id = r.user_id
         WHERE r.id = ? AND r.status = ?
         LIMIT 1'
    );
    $stmt->execute([$id, 'pending']);
    $request = $stmt->fetch();

    if (!$request) {
        json_response(['ok' => false, 'error' => 'Request not found'], 404);
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        ->execute([$hash, (int) $request['user_id']]);
    db()->prepare(
        'UPDATE password_reset_requests SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ?'
    )->execute(['resolved', (int) $admin['id'], $id]);

    audit_log(
        (int) $admin['id'],
        'password_request_resolve',
        $request['username'] . ' (request #' . $id . ')'
    );

    json_response(['ok' => true]);
}

if ($action === 'dismiss') {
    $id = (int) ($body['id'] ?? 0);
    if ($id <= 0) {
        json_response(['ok' => false, 'error' => 'Valid request required'], 400);
    }

    $stmt = db()->prepare('UPDATE password_reset_requests SET status = ?, resolved_at = NOW(), resolved_by = ? WHERE id = ? AND status = ?');
    $stmt->execute(['dismissed', (int) $admin['id'], $id, 'pending']);

    if ($stmt->rowCount() === 0) {
        json_response(['ok' => false, 'error' => 'Request not found'], 404);
    }

    audit_log((int) $admin['id'], 'password_request_dismiss', 'id=' . $id);
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Unknown action'], 400);
