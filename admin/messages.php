<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Chats', 'messages');
?>
<div class="admin-section admin-chats-section">
  <div id="chats-users" class="admin-chats-users"></div>
  <div id="chats-messages" class="admin-chats-messages">
    <p class="admin-chats-empty">Select a user above to view their chat.</p>
  </div>
</div>
<?php admin_footer(); ?>
