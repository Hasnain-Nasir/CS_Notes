<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Chats', 'messages');
?>
<div class="admin-section">
  <div class="admin-toolbar">
    <label>Filter user ID <input type="number" id="filter-user" min="0" placeholder="All"></label>
    <button type="button" id="reload-chats">Reload</button>
  </div>
  <div id="chats-list" class="admin-table-wrap"></div>
</div>
<?php admin_footer(); ?>
