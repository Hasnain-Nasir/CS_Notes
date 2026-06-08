<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/backup.php';
$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = (int) ($_GET['user_id'] ?? 0);

    $sql = 'SELECT um.id, um.user_id, u.username, um.memory_text, um.source, um.created_at
            FROM user_memories um JOIN users u ON u.id = um.user_id';
    $params = [];
    if ($userId > 0) {
        $sql .= ' WHERE um.user_id = ?';
        $params[] = $userId;
    }
    $sql .= ' ORDER BY um.created_at DESC LIMIT 500';

    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    json_response(['ok' => true, 'memories' => $stmt->fetchAll()]);
}

$body = read_json_body();
$action = $body['action'] ?? 'save';

if ($action === 'save') {
    $userId = (int) ($body['user_id'] ?? 0);
    $memoryText = sanitize_string($body['memory_text'] ?? '', 1000);
    $id = (int) ($body['id'] ?? 0);

    if ($userId <= 0) {
        json_response(['ok' => false, 'error' => 'User ID required'], 400);
    }
    if ($memoryText === '') {
        json_response(['ok' => false, 'error' => 'Memory text required'], 400);
    }

    $check = db()->prepare('SELECT id FROM users WHERE id = ? LIMIT 1');
    $check->execute([$userId]);
    if (!$check->fetch()) {
        json_response(['ok' => false, 'error' => 'User not found'], 404);
    }

    if ($id > 0) {
        db()->prepare('UPDATE user_memories SET user_id = ?, memory_text = ?, source = ? WHERE id = ?')
            ->execute([$userId, $memoryText, 'admin', $id]);
    } else {
        db()->prepare('INSERT INTO user_memories (user_id, memory_text, source) VALUES (?, ?, ?)')
            ->execute([$userId, $memoryText, 'admin']);
        backup_append_memory($userId, $memoryText);
    }

    audit_log((int) $admin['id'], 'memory_save', "user={$userId}");
    json_response(['ok' => true]);
}

if ($action === 'delete') {
    $id = (int) ($body['id'] ?? 0);
    if ($id <= 0) {
        json_response(['ok' => false, 'error' => 'Invalid ID'], 400);
    }
    db()->prepare('DELETE FROM user_memories WHERE id = ?')->execute([$id]);
    audit_log((int) $admin['id'], 'memory_delete', "id={$id}");
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Unknown action'], 400);
