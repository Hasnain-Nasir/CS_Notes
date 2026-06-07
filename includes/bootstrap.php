<?php

require_once __DIR__ . '/helpers.php';

$config = app_config();

ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.use_strict_mode', '1');

if (!empty($config['app']['timezone'])) {
    date_default_timezone_set($config['app']['timezone']);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('X-Content-Type-Options: nosniff');

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth.php';
