<?php

function backup_dir(): string
{
    $dir = app_root() . '/data/backups';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    return $dir;
}

function backup_append_chat(int $userId, string $role, string $content, ?string $pageUrl): void
{
    $dir = backup_dir() . '/chats';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $file = $dir . '/' . $userId . '.json';
    $rows = [];
    if (file_exists($file)) {
        $rows = json_decode(file_get_contents($file), true) ?: [];
    }
    $rows[] = [
        'role' => $role,
        'content' => $content,
        'page_url' => $pageUrl,
        'at' => date('c'),
    ];
    file_put_contents($file, json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function backup_append_memory(int $userId, string $memoryText): void
{
    $dir = backup_dir() . '/memories';
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $file = $dir . '/' . $userId . '.json';
    $rows = [];
    if (file_exists($file)) {
        $rows = json_decode(file_get_contents($file), true) ?: [];
    }
    $rows[] = [
        'memory_text' => $memoryText,
        'at' => date('c'),
    ];
    file_put_contents($file, json_encode($rows, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function export_all_backup(): array
{
    $pdo = db();
    return [
        'exported_at' => date('c'),
        'users' => $pdo->query('SELECT id, username, role, display_name, created_at, is_active FROM users')->fetchAll(),
        'chat_messages' => $pdo->query('SELECT * FROM chat_messages ORDER BY id')->fetchAll(),
        'user_memories' => $pdo->query('SELECT * FROM user_memories ORDER BY id')->fetchAll(),
        'past_papers' => $pdo->query('SELECT id, subject, exam_type, year, semester, file_path, created_at FROM past_papers ORDER BY id')->fetchAll(),
    ];
}
