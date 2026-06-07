<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$user = require_login();
$limit = min(50, max(1, (int) ($_GET['limit'] ?? 30)));

$stmt = db()->prepare('SELECT role, content, page_url, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
$stmt->bindValue(1, $user['id'], PDO::PARAM_INT);
$stmt->bindValue(2, $limit, PDO::PARAM_INT);
$stmt->execute();
$rows = array_reverse($stmt->fetchAll());

json_response(['ok' => true, 'messages' => $rows]);
