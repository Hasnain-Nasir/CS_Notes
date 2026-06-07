<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';

auth_logout();
json_response(['ok' => true]);
