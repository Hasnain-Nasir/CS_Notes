<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/llm.php';
require_admin();

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT id, label, provider, model, priority, is_active, created_at FROM api_keys ORDER BY priority, id')->fetchAll();
    json_response(['ok' => true, 'keys' => $rows]);
}

$body = read_json_body();
$action = $body['action'] ?? 'save';

if ($action === 'save') {
    $id = (int) ($body['id'] ?? 0);
    $label = sanitize_string($body['label'] ?? 'Primary', 64);
    $provider = $body['provider'] ?? 'groq';
    $allowed = ['groq', 'gemini', 'openrouter', 'together'];
    if (!in_array($provider, $allowed, true)) {
        json_response(['ok' => false, 'error' => 'Invalid provider'], 400);
    }
    $apiKey = trim((string) ($body['api_key'] ?? ''));
    $model = sanitize_string($body['model'] ?? '', 128);
    $priority = max(1, min(10, (int) ($body['priority'] ?? 1)));
    $isActive = !empty($body['is_active']) ? 1 : 0;

    if ($id > 0) {
        if ($apiKey !== '') {
            db()->prepare('UPDATE api_keys SET label=?, provider=?, api_key_encrypted=?, model=?, priority=?, is_active=? WHERE id=?')
                ->execute([$label, $provider, encrypt_value($apiKey), $model ?: null, $priority, $isActive, $id]);
        } else {
            db()->prepare('UPDATE api_keys SET label=?, provider=?, model=?, priority=?, is_active=? WHERE id=?')
                ->execute([$label, $provider, $model ?: null, $priority, $isActive, $id]);
        }
    } else {
        if ($apiKey === '') {
            json_response(['ok' => false, 'error' => 'API key required for new entry'], 400);
        }
        db()->prepare('INSERT INTO api_keys (label, provider, api_key_encrypted, model, priority, is_active) VALUES (?,?,?,?,?,?)')
            ->execute([$label, $provider, encrypt_value($apiKey), $model ?: null, $priority, $isActive]);
    }
    audit_log((int) $admin['id'], 'api_key_save', $label);
    json_response(['ok' => true]);
}

if ($action === 'delete') {
    $id = (int) ($body['id'] ?? 0);
    db()->prepare('DELETE FROM api_keys WHERE id = ?')->execute([$id]);
    audit_log((int) $admin['id'], 'api_key_delete', "id={$id}");
    json_response(['ok' => true]);
}

if ($action === 'test') {
    $id = (int) ($body['id'] ?? 0);
    $stmt = db()->prepare('SELECT provider, api_key_encrypted, model FROM api_keys WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
        json_response(['ok' => false, 'error' => 'Key not found'], 404);
    }
    $key = decrypt_value($row['api_key_encrypted']);
    $model = $row['model'] ?: default_model($row['provider']);
    try {
        $reply = llm_request($row['provider'], $key, $model, [
            ['role' => 'user', 'content' => 'Reply with exactly: OK'],
        ], 'Reply briefly.');
        json_response(['ok' => true, 'reply' => trim($reply)]);
    } catch (Throwable $e) {
        json_response(['ok' => false, 'error' => $e->getMessage()], 502);
    }
}

if ($action === 'save_search_key') {
    $key = trim((string) ($body['tavily_api_key'] ?? ''));
    $enc = encrypt_value($key);
    db()->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('tavily_api_key', ?) ON DUPLICATE KEY UPDATE setting_value = ?")
        ->execute([$enc, $enc]);
    audit_log((int) $admin['id'], 'search_key_save', 'tavily');
    json_response(['ok' => true]);
}

json_response(['ok' => false, 'error' => 'Unknown action'], 400);
