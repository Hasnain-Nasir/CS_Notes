<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

$userId = (int) ($_GET['user_id'] ?? 0);
$limit = min(200, max(1, (int) ($_GET['limit'] ?? 100)));

$sql = 'SELECT cm.id, cm.user_id, u.username, cm.role, cm.content, cm.page_url, cm.created_at
        FROM chat_messages cm
        JOIN users u ON u.id = cm.user_id';
$params = [];
if ($userId > 0) {
    $sql .= ' WHERE cm.user_id = ?';
    $params[] = $userId;
}
$sql .= ' ORDER BY cm.created_at DESC LIMIT ' . $limit;

$stmt = db()->prepare($sql);
$stmt->execute($params);
json_response(['ok' => true, 'chats' => $stmt->fetchAll()]);
