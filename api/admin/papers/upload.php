<?php
require_once dirname(__DIR__, 2) . '/includes/bootstrap.php';
require_once dirname(__DIR__, 2) . '/includes/backup.php';
require_admin();

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $rows = db()->query('SELECT id, subject, exam_type, year, semester, file_path, LENGTH(extracted_text) AS text_len, created_at FROM past_papers ORDER BY created_at DESC')->fetchAll();
    json_response(['ok' => true, 'papers' => $rows]);
}

$action = $_POST['action'] ?? (read_json_body()['action'] ?? 'upload');

if ($action === 'delete') {
    $body = read_json_body();
    $id = (int) ($body['id'] ?? 0);
    $stmt = db()->prepare('SELECT file_path FROM past_papers WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if ($row && !empty($row['file_path'])) {
        $fp = app_root() . '/' . ltrim($row['file_path'], '/');
        if (is_file($fp)) {
            unlink($fp);
        }
    }
    db()->prepare('DELETE FROM past_papers WHERE id = ?')->execute([$id]);
    audit_log((int) $admin['id'], 'paper_delete', "id={$id}");
    json_response(['ok' => true]);
}

if ($action === 'manual') {
    $body = read_json_body();
    $subject = sanitize_string($body['subject'] ?? '', 128);
    $examType = in_array($body['exam_type'] ?? '', ['midterm', 'final', 'other'], true) ? $body['exam_type'] : 'final';
    $year = (int) ($body['year'] ?? 0) ?: null;
    $text = sanitize_string($body['extracted_text'] ?? '', 50000);
    if ($subject === '' || $text === '') {
        json_response(['ok' => false, 'error' => 'Subject and text required'], 400);
    }
    db()->prepare('INSERT INTO past_papers (subject, exam_type, year, extracted_text) VALUES (?,?,?,?)')
        ->execute([$subject, $examType, $year, $text]);
    audit_log((int) $admin['id'], 'paper_manual', $subject);
    json_response(['ok' => true]);
}

// File upload
$subject = sanitize_string($_POST['subject'] ?? '', 128);
$examType = in_array($_POST['exam_type'] ?? '', ['midterm', 'final', 'other'], true) ? $_POST['exam_type'] : 'final';
$year = (int) ($_POST['year'] ?? 0) ?: null;
$semester = sanitize_string($_POST['semester'] ?? '', 32);

if ($subject === '') {
    json_response(['ok' => false, 'error' => 'Subject required'], 400);
}

if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    json_response(['ok' => false, 'error' => 'File upload failed'], 400);
}

$uploadDir = app_root() . '/past-papers/' . preg_replace('/[^a-z0-9\-]/i', '-', strtolower($subject));
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$orig = basename($_FILES['file']['name']);
$ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
$allowed = ['pdf', 'txt', 'jpg', 'jpeg', 'png', 'webp'];
if (!in_array($ext, $allowed, true)) {
    json_response(['ok' => false, 'error' => 'Allowed: pdf, txt, jpg, png, webp'], 400);
}

$filename = date('Ymd-His') . '-' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $orig);
$dest = $uploadDir . '/' . $filename;
if (!move_uploaded_file($_FILES['file']['tmp_name'], $dest)) {
    json_response(['ok' => false, 'error' => 'Could not save file'], 500);
}

$relPath = 'past-papers/' . basename($uploadDir) . '/' . $filename;
$extracted = '';

if ($ext === 'txt') {
    $extracted = file_get_contents($dest) ?: '';
} elseif ($ext === 'pdf') {
    $extracted = extract_pdf_text($dest);
}

db()->prepare('INSERT INTO past_papers (subject, exam_type, year, semester, file_path, extracted_text) VALUES (?,?,?,?,?,?)')
    ->execute([$subject, $examType, $year, $semester ?: null, $relPath, $extracted ?: '[Upload OK — add text manually if PDF parse empty]']);
audit_log((int) $admin['id'], 'paper_upload', $subject);
json_response(['ok' => true, 'path' => $relPath]);

function extract_pdf_text(string $path): string
{
    $raw = file_get_contents($path);
    if ($raw === false) {
        return '';
    }
    // Basic PDF text extraction from stream objects
    if (preg_match_all('/stream\s*(.*?)\s*endstream/s', $raw, $matches)) {
        $text = '';
        foreach ($matches[1] as $stream) {
            $decoded = @gzuncompress($stream);
            if ($decoded === false) {
                $decoded = $stream;
            }
            if (preg_match_all('/\(([^()\\\\]*(?:\\\\.[^()\\\\]*)*)\)/s', $decoded, $tm)) {
                foreach ($tm[1] as $t) {
                    $text .= str_replace(['\\n', '\\r', '\\t'], ["\n", "\r", "\t"], $t) . ' ';
                }
            }
            if (preg_match_all('/\[((?:[^\[\]\\\\]|\\\\.)*)\]/s', $decoded, $am)) {
                foreach ($am[1] as $a) {
                    if (preg_match_all('/\(([^()]*)\)/', $a, $pm)) {
                        $text .= implode(' ', $pm[1]) . ' ';
                    }
                }
            }
        }
        $text = preg_replace('/\s+/', ' ', $text);
        return trim(mb_substr($text, 0, 50000));
    }
    return '';
}
