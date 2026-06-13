<?php
require_once __DIR__ . '/includes/layout.php';
admin_header('Overview', 'overview');

$pdo = db();
$stats = [
    'users' => (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn(),
    'chats_today' => (int) $pdo->query("SELECT COUNT(DISTINCT user_id) FROM chat_messages WHERE DATE(created_at) = CURDATE()")->fetchColumn(),
    'memories' => (int) $pdo->query('SELECT COUNT(*) FROM user_memories')->fetchColumn(),
    'api_keys' => (int) $pdo->query('SELECT COUNT(*) FROM api_keys WHERE is_active = 1')->fetchColumn(),
    'papers' => (int) $pdo->query('SELECT COUNT(*) FROM past_papers')->fetchColumn(),
];
?>
<div class="admin-cards">
  <div class="admin-stat-card"><span>Users</span><strong><?= $stats['users'] ?></strong></div>
  <div class="admin-stat-card"><span>Chats today</span><strong><?= $stats['chats_today'] ?></strong></div>
  <div class="admin-stat-card"><span>Memories</span><strong><?= $stats['memories'] ?></strong></div>
  <div class="admin-stat-card"><span>Active API keys</span><strong><?= $stats['api_keys'] ?></strong></div>
  <div class="admin-stat-card"><span>Past papers</span><strong><?= $stats['papers'] ?></strong></div>
</div>
<?php admin_footer(); ?>
