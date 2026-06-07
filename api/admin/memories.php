<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

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
