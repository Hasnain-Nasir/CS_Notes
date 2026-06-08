<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

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
