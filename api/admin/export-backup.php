<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/backup.php';
require_admin();

header('Content-Type: application/json; charset=utf-8');
header('Content-Disposition: attachment; filename="notesbynain-backup-' . date('Y-m-d') . '.json"');
echo json_encode(export_all_backup(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
