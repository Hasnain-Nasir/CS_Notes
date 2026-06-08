<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('API Keys', 'keys');
?>
<div class="admin-section">
  <form id="add-key-form" class="admin-form admin-form--card">
    <h2>Add / update API key</h2>
    <input type="hidden" name="id" value="0">
    <div class="admin-form-grid">
      <label class="admin-field">
        <span>Label</span>
        <input name="label" placeholder="Primary" value="Primary" required>
      </label>
      <label class="admin-field">
        <span>Provider</span>
        <select name="provider">
          <option value="groq">Groq</option>
          <option value="gemini">Gemini</option>
          <option value="openrouter">OpenRouter</option>
          <option value="together">Together AI</option>
        </select>
      </label>
      <label class="admin-field">
        <span>Priority</span>
        <input name="priority" type="number" min="1" max="10" value="1">
      </label>
      <label class="admin-field admin-field--wide">
        <span>API key</span>
        <input name="api_key" type="password" placeholder="Leave blank to keep existing key" autocomplete="off">
      </label>
      <label class="admin-field admin-field--wide">
        <span>Model <small>(optional)</small></span>
        <input name="model" placeholder="e.g. llama-3.3-70b-versatile">
      </label>
      <label class="admin-field admin-field--check">
        <input type="checkbox" name="is_active" checked>
        <span>Active</span>
      </label>
    </div>
    <div class="admin-form-actions">
      <button type="submit" class="admin-btn">Save key</button>
    </div>
  </form>

  <div id="keys-list" class="admin-table-wrap"></div>

  <form id="search-key-form" class="admin-form admin-form--card admin-form--secondary">
    <h2>Tavily search key</h2>
    <p class="admin-form-hint">Used for GCUF past papers online search.</p>
    <div class="admin-form-grid">
      <label class="admin-field admin-field--wide">
        <span>Tavily API key</span>
        <input name="tavily_api_key" type="password" placeholder="Enter Tavily API key" autocomplete="off">
      </label>
    </div>
    <div class="admin-form-actions">
      <button type="submit" class="admin-btn admin-btn--secondary">Save search key</button>
    </div>
  </form>
</div>
<?php admin_footer(); ?>
