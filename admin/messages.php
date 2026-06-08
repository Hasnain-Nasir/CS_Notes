<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Chats', 'messages');
?>
<div class="admin-section admin-chats-section">
  <div id="chats-users" class="admin-chats-users"></div>
  <div class="admin-chats-toolbar" id="chats-toolbar" hidden>
    <span id="chats-active-label" class="admin-chats-label"></span>
    <button type="button" id="delete-user-chat" class="admin-btn-sm admin-btn-danger">Delete chat</button>
  </div>
  <div id="chats-messages" class="admin-chats-messages">
    <p class="admin-chats-empty">Select a user above to view their chat.</p>
  </div>
</div>
<?php admin_footer(); ?>
