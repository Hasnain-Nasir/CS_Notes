<?php
/**
 * Build searchable content index from HTML lecture pages.
 * CLI: php scripts/build-content-index.php
 */
$root = dirname(__DIR__);

function strip_html_text(string $html): string
{
    $html = preg_replace('/<script\b[^>]*>.*?<\/script>/is', '', $html);
    $html = preg_replace('/<style\b[^>]*>.*?<\/style>/is', '', $html);
    $text = strip_tags($html);
    $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

function extract_headings(string $html): array
{
    preg_match_all('/<h[1-6][^>]*>(.*?)<\/h[1-6]>/is', $html, $m);
    $headings = [];
    foreach ($m[1] as $h) {
        $t = trim(strip_tags($h));
        if ($t !== '') {
            $headings[] = $t;
        }
    }
    return $headings;
}

function extract_title(string $html): string
{
    if (preg_match('/<title>(.*?)<\/title>/is', $html, $m)) {
        return trim(html_entity_decode(strip_tags($m[1]), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }
    return '';
}

function extract_h1(string $html): string
{
    if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $m)) {
        return trim(strip_tags($m[1]));
    }
    return '';
}

function web_path(string $absPath, string $root): string
{
    $rel = str_replace('\\', '/', substr($absPath, strlen($root)));
    return $rel;
}

$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS)
);

$index = [];
foreach ($iterator as $file) {
    if (!$file->isFile() || $file->getExtension() !== 'html') {
        continue;
    }
    $path = $file->getPathname();
    if (str_contains($path, '/admin/') || str_contains($path, '/api/')) {
        continue;
    }
    if (str_ends_with($path, '/_template.html')) {
        continue;
    }

    $html = file_get_contents($path);
    if ($html === false) {
        continue;
    }

    $webPath = web_path($path, $root);
    $text = strip_html_text($html);
    if (strlen($text) < 30) {
        continue;
    }

    $title = extract_h1($html) ?: extract_title($html);
    $index[] = [
        'path' => $webPath,
        'title' => $title,
        'headings' => extract_headings($html),
        'excerpt' => mb_substr($text, 0, 400),
        'full_text' => mb_substr($text, 0, 8000),
    ];
}

usort($index, fn($a, $b) => strcmp($a['path'], $b['path']));

$outDir = $root . '/data';
if (!is_dir($outDir)) {
    mkdir($outDir, 0755, true);
}
$outFile = $outDir . '/content-index.json';
file_put_contents($outFile, json_encode($index, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

echo 'Indexed ' . count($index) . " pages -> {$outFile}\n";
