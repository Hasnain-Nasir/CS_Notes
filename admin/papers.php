<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Past Papers', 'papers');
?>
<form id="upload-paper-form" class="admin-form" enctype="multipart/form-data">
  <h2>Upload past paper</h2>
  <div class="admin-form-row">
    <input name="subject" placeholder="Subject" required>
    <select name="exam_type"><option value="midterm">Midterm</option><option value="final" selected>Final</option><option value="other">Other</option></select>
    <input name="year" type="number" placeholder="Year" min="2000" max="2030">
    <input name="semester" placeholder="Semester">
    <input name="file" type="file" accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" required>
    <button type="submit">Upload</button>
  </div>
</form>
<form id="manual-paper-form" class="admin-form">
  <h2>Add questions manually</h2>
  <div class="admin-form-row admin-form-vertical">
    <input name="subject" placeholder="Subject" required>
    <select name="exam_type"><option value="midterm">Midterm</option><option value="final" selected>Final</option></select>
    <input name="year" type="number" placeholder="Year">
    <textarea name="extracted_text" rows="6" placeholder="Paste past paper questions here..." required></textarea>
    <button type="submit">Save text</button>
  </div>
</form>
<div id="papers-list" class="admin-table-wrap"></div>
<?php admin_footer(); ?>
