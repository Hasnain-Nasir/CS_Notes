<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Users', 'users');
?>
<div class="admin-section">
  <form id="create-user-form" class="admin-form admin-form--card">
    <h2>Add user</h2>
    <p class="admin-form-hint">Create accounts for students who need chat access.</p>
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>Username</span>
        <input name="username" placeholder="e.g. ahmad" required>
      </label>
      <label class="admin-field">
        <span>Password</span>
        <input name="password" type="password" placeholder="Min 6 characters" required>
      </label>
      <label class="admin-field">
        <span>Display name</span>
        <input name="display_name" placeholder="Optional">
      </label>
      <label class="admin-field">
        <span>Role</span>
        <select name="role">
          <option value="user">Normal user</option>
          <option value="admin">Admin</option>
        </select>
      </label>
    </div>
    <div class="admin-form-actions">
      <button type="submit" class="admin-btn">Create user</button>
    </div>
  </form>
  <div id="users-list" class="admin-table-wrap"></div>
</div>
<?php admin_footer(); ?>
