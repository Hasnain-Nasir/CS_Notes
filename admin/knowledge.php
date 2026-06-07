<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Site Knowledge', 'knowledge');
?>
<p class="admin-hint">Edit bot personality, owner info, friends, and teachers JSON.</p>
<form id="knowledge-form" class="admin-form admin-form-vertical">
  <textarea id="knowledge-json" rows="24" spellcheck="false"></textarea>
  <button type="submit">Save knowledge</button>
</form>
<?php admin_footer(); ?>
