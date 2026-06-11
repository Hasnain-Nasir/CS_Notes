<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Password requests', 'password-requests');
?>
<div class="admin-section">
  <p class="admin-form-hint">Users submit reset requests from the login page. Set a new password here to resolve each request.</p>
  <div id="password-requests-list" class="admin-table-wrap"></div>
</div>
<?php admin_footer(); ?>
