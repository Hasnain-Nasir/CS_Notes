<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/rag.php';
require_once dirname(__DIR__, 2) . '/includes/llm.php';
require_once dirname(__DIR__, 2) . '/includes/backup.php';

$user = require_login();
$body = read_json_body();
$message = sanitize_string($body['message'] ?? '', 4000);
$pageUrl = sanitize_string($body['page_url'] ?? '', 512);

if ($message === '') {
    json_response(['ok' => false, 'error' => 'Message required'], 400);
}

$pdo = db();

$pdo->prepare('INSERT INTO chat_messages (user_id, role, content, page_url) VALUES (?, ?, ?, ?)')
    ->execute([$user['id'], 'user', $message, $pageUrl ?: null]);
backup_append_chat((int) $user['id'], 'user', $message, $pageUrl ?: null);

$memStmt = $pdo->prepare('SELECT memory_text FROM user_memories WHERE user_id = ? ORDER BY created_at DESC LIMIT 10');
$memStmt->execute([$user['id']]);
$memories = $memStmt->fetchAll();

$histStmt = $pdo->prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 20');
$histStmt->execute([$user['id']]);
$history = array_reverse($histStmt->fetchAll());

$context = search_content($message, $pageUrl, 5);
$currentPage = get_page_content($pageUrl);
if ($currentPage && empty($context)) {
    $context[] = [
        'path' => $currentPage['path'] ?? '',
        'title' => $currentPage['title'] ?? '',
        'headings' => $currentPage['headings'] ?? [],
        'excerpt' => mb_substr($currentPage['full_text'] ?? '', 0, 1500),
    ];
}

$extraCtx = guess_paper_context($message);
$systemPrompt = build_system_prompt($context, $memories, $pageUrl);
if ($extraCtx) {
    $systemPrompt .= "\n\nPast paper / guess paper data:\n" . $extraCtx;
}

$messages = [];
foreach ($history as $h) {
    $messages[] = ['role' => $h['role'], 'content' => $h['content']];
}

try {
    $reply = llm_chat($messages, $systemPrompt);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 502);
}

if ($reply === '') {
    $reply = 'No response from API — ask admin to check API keys in dashboard.';
}

$pdo->prepare('INSERT INTO chat_messages (user_id, role, content, page_url) VALUES (?, ?, ?, ?)')
    ->execute([$user['id'], 'assistant', $reply, $pageUrl ?: null]);
backup_append_chat((int) $user['id'], 'assistant', $reply, $pageUrl ?: null);

json_response([
    'ok' => true,
    'reply' => $reply,
    'sources' => array_map(fn($c) => ['title' => $c['title'], 'path' => $c['path']], $context),
]);
