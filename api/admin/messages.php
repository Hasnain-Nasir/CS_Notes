<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = read_json_body();
    $action = $body['action'] ?? '';

    if ($action === 'delete_user_chat') {
        $userId = (int) ($body['user_id'] ?? 0);
        if ($userId <= 0) {
            json_response(['ok' => false, 'error' => 'User ID required'], 400);
        }
        $check = db()->prepare('SELECT id FROM users WHERE id = ? LIMIT 1');
        $check->execute([$userId]);
        if (!$check->fetch()) {
            json_response(['ok' => false, 'error' => 'User not found'], 404);
        }
        $stmt = db()->prepare('DELETE FROM chat_messages WHERE user_id = ?');
        $stmt->execute([$userId]);
        audit_log((int) $admin['id'], 'chat_delete', "user={$userId}");
        json_response(['ok' => true, 'deleted' => $stmt->rowCount()]);
    }

    json_response(['ok' => false, 'error' => 'Unknown action'], 400);
}

$userId = (int) ($_GET['user_id'] ?? 0);
$limit = min(500, max(1, (int) ($_GET['limit'] ?? 200)));

try {
    if ($userId > 0) {
        $stmt = db()->prepare(
            'SELECT cm.id, cm.user_id, u.username, cm.role,
                    LEFT(cm.content, 2000) AS content,
                    cm.page_url, cm.created_at
             FROM chat_messages cm
             JOIN users u ON u.id = cm.user_id
             WHERE cm.user_id = ?
             ORDER BY cm.created_at ASC
             LIMIT ' . $limit
        );
        $stmt->execute([$userId]);
        json_response(['ok' => true, 'chats' => $stmt->fetchAll()]);
    }

    $usersStmt = db()->query(
        'SELECT u.id, u.username, u.display_name, COUNT(cm.id) AS message_count,
                MAX(cm.created_at) AS last_chat
         FROM users u
         JOIN chat_messages cm ON cm.user_id = u.id
         GROUP BY u.id, u.username, u.display_name
         ORDER BY last_chat DESC'
    );

    json_response(['ok' => true, 'users' => $usersStmt->fetchAll(), 'chats' => []]);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'Could not load chats: ' . $e->getMessage()], 500);
}
