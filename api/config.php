<?php
/**
 * Production config — deploys with the site.
 * Override locally with api/config.local.php (optional, gitignored).
 */
return [
    'db' => [
        'host' => 'sql111.infinityfree.com',
        'port' => 3306,
        'name' => 'if0_41698176_notesbynain_db',
        'user' => 'if0_41698176',
        'pass' => 'Nk3011XXKL3UgL',
        'charset' => 'utf8mb4',
    ],
    'app' => [
        'name' => 'Notes by Nain',
        'base_url' => 'https://notesbynain.xo.je',
        'session_lifetime' => 86400 * 7,
        'secret' => 'nBn-2026-xK9mP2vL7qR4wZ8hJ3fT6yU1sA5dG0cE',
        'timezone' => 'Asia/Karachi',
    ],
    'search' => [
        'tavily_api_key' => '',
    ],
];
