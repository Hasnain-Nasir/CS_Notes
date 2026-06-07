<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('API Keys', 'keys');
?>
<form id="add-key-form" class="admin-form">
  <h2>Add / update API key</h2>
  <input type="hidden" name="id" value="0">
  <div class="admin-form-row">
    <input name="label" placeholder="Label (Primary)" value="Primary">
    <select name="provider">
      <option value="groq">Groq</option>
      <option value="gemini">Gemini</option>
      <option value="openrouter">OpenRouter</option>
      <option value="together">Together AI</option>
    </select>
    <input name="api_key" type="password" placeholder="API key (leave blank to keep existing)">
    <input name="model" placeholder="Model (optional)">
    <input name="priority" type="number" min="1" max="10" value="1" style="width:4rem">
    <label><input type="checkbox" name="is_active" checked> Active</label>
    <button type="submit">Save</button>
  </div>
</form>
<div id="keys-list" class="admin-table-wrap"></div>
<hr>
<form id="search-key-form" class="admin-form">
  <h2>Tavily search key (GCUF past papers online)</h2>
  <div class="admin-form-row">
    <input name="tavily_api_key" type="password" placeholder="Tavily API key">
    <button type="submit">Save search key</button>
  </div>
</form>
<?php admin_footer(); ?>
