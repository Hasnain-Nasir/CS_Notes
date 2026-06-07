<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Memories', 'memories');
?>
<div class="admin-toolbar">
  <label>Filter user ID <input type="number" id="filter-user" min="0" placeholder="All"></label>
  <button type="button" id="reload-memories">Reload</button>
</div>
<div id="memories-list" class="admin-table-wrap"></div>
<?php admin_footer(); ?>
