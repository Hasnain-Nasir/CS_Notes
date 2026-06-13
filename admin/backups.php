<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Backups', 'backups');
?>
<p class="admin-hint">MySQL is the source of truth. JSON backups are also written on each chat/memory save.</p>
<p><a class="admin-btn" href="/api/admin/export-backup.php">Download full JSON backup</a></p>
<?php admin_footer(); ?>
