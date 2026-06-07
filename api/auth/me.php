<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

$user = current_user();
if (!$user) {
    json_response(['ok' => true, 'user' => null]);
}
json_response(['ok' => true, 'user' => user_public($user)]);
