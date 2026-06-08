<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Memories', 'memories');
?>
<div class="admin-section">
  <form id="add-memory-form" class="admin-form admin-form--card">
    <h2>Add memory for chatbot</h2>
    <p class="admin-form-hint">These details help the bot be more friendly with each user. Add them manually — nothing is auto-saved from chats.</p>
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>User ID</span>
        <input type="number" name="user_id" min="1" required placeholder="e.g. 1">
      </label>
      <label class="admin-field admin-field--wide">
        <span>Memory</span>
        <input type="text" name="memory_text" required maxlength="1000" placeholder="e.g. User is preparing for Linear Algebra final">
      </label>
    </div>
    <div class="admin-form-actions">
      <button type="submit" class="admin-btn">Add memory</button>
    </div>
  </form>
  <div class="admin-toolbar">
    <label>Filter user ID <input type="number" id="filter-user" min="0" placeholder="All"></label>
    <button type="button" id="reload-memories" class="admin-btn">Reload</button>
  </div>
  <div id="memories-list" class="admin-table-wrap"></div>
</div>
<?php admin_footer(); ?>
