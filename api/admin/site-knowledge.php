<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $path = app_root() . '/data/site-knowledge.json';
    $data = file_exists($path) ? json_decode(file_get_contents($path), true) : [];
    json_response(['ok' => true, 'knowledge' => $data]);
}

$admin = require_admin();
$body = read_json_body();
$knowledge = $body['knowledge'] ?? null;
if (!is_array($knowledge)) {
    json_response(['ok' => false, 'error' => 'Invalid knowledge JSON'], 400);
}

$path = app_root() . '/data/site-knowledge.json';
$dir = dirname($path);
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}
file_put_contents($path, json_encode($knowledge, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
audit_log((int) $admin['id'], 'site_knowledge_save', '');
json_response(['ok' => true]);
