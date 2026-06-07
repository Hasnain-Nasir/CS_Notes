<?php

function app_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $local = dirname(__DIR__) . '/api/config.local.php';
    $production = dirname(__DIR__) . '/api/config.php';
    if (file_exists($local)) {
        $config = require $local;
    } elseif (file_exists($production)) {
        $config = require $production;
    } else {
        throw new RuntimeException('Missing api/config.php');
    }
    return $config;
}

function app_root(): string
{
    return dirname(__DIR__);
}

function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function sanitize_string(?string $value, int $max = 5000): string
{
    $value = trim((string) $value);
    if (strlen($value) > $max) {
        $value = substr($value, 0, $max);
    }
    return $value;
}

function app_secret(): string
{
    $app = app_config()['app'] ?? [];
    return $app['secret'] ?? $app['encryption_key'] ?? 'fallback-secret-change-me';
}

function encrypt_value(string $plain): string
{
    $key = hash('sha256', app_secret(), true);
    $iv = random_bytes(16);
    $cipher = openssl_encrypt($plain, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return base64_encode($iv . $cipher);
}

function decrypt_value(string $encoded): string
{
    $key = hash('sha256', app_secret(), true);
    $data = base64_decode($encoded, true);
    if ($data === false || strlen($data) < 17) {
        return '';
    }
    $iv = substr($data, 0, 16);
    $cipher = substr($data, 16);
    $plain = openssl_decrypt($cipher, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    return $plain === false ? '' : $plain;
}

function base_url(): string
{
    $cfg = app_config()['app']['base_url'] ?? '';
    if ($cfg !== '') {
        return rtrim($cfg, '/');
    }
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $scheme . '://' . $host;
}

function api_path_prefix(): string
{
    // Detect depth from script path for relative API calls from nested pages
    return '/api';
}
