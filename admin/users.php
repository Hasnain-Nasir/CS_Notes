<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Users', 'users');
?>
<form id="create-user-form" class="admin-form">
  <h2>Add user</h2>
  <div class="admin-form-row">
    <input name="username" placeholder="Username" required>
    <input name="password" type="password" placeholder="Password (6+)" required>
    <input name="display_name" placeholder="Display name">
    <select name="role">
      <option value="user">Normal user</option>
      <option value="admin">Admin</option>
    </select>
    <button type="submit">Create</button>
  </div>
</form>
<div id="users-list" class="admin-table-wrap"></div>
<?php admin_footer(); ?>
