<?php

function load_content_index(): array
{
    static $index = null;
    if ($index !== null) {
        return $index;
    }
    $path = app_root() . '/data/content-index.json';
    if (!file_exists($path)) {
        $index = [];
        return $index;
    }
    $data = json_decode(file_get_contents($path), true);
    $index = is_array($data) ? $data : [];
    return $index;
}

function normalize_path(?string $path): string
{
    $path = trim((string) $path);
    $path = preg_replace('#^\./#', '', $path);
    if ($path !== '' && $path[0] !== '/') {
        $path = '/' . $path;
    }
    return $path;
}

function tokenize(string $text): array
{
    $text = strtolower($text);
    $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);
    $parts = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
    $stop = ['the', 'a', 'an', 'is', 'are', 'what', 'how', 'why', 'when', 'where', 'kya', 'ka', 'ki', 'ke', 'ko', 'se', 'me', 'ma', 'aur', 'ya', 'hai', 'hain', 'bata', 'batao'];
    return array_values(array_diff($parts, $stop));
}

function score_entry(array $entry, array $queryTokens, ?string $currentPage): float
{
    $score = 0.0;
    $hay = strtolower(
        ($entry['title'] ?? '') . ' ' .
        implode(' ', $entry['headings'] ?? []) . ' ' .
        ($entry['excerpt'] ?? '') . ' ' .
        ($entry['full_text'] ?? '')
    );

    foreach ($queryTokens as $token) {
        if (strlen($token) < 2) {
            continue;
        }
        if (str_contains($hay, $token)) {
            $score += 2.0;
        }
        if (str_contains(strtolower($entry['title'] ?? ''), $token)) {
            $score += 5.0;
        }
        foreach ($entry['headings'] ?? [] as $h) {
            if (str_contains(strtolower($h), $token)) {
                $score += 3.0;
            }
        }
    }

    if ($currentPage && normalize_path($entry['path'] ?? '') === normalize_path($currentPage)) {
        $score += 50.0;
    }

    return $score;
}

function search_content(string $query, ?string $currentPage = null, int $limit = 5): array
{
    $index = load_content_index();
    if (empty($index)) {
        return [];
    }

    $tokens = tokenize($query);
    if (empty($tokens)) {
        return [];
    }

    $scored = [];
    foreach ($index as $entry) {
        $s = score_entry($entry, $tokens, $currentPage);
        if ($s > 0) {
            $scored[] = ['score' => $s, 'entry' => $entry];
        }
    }

    usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);

    $results = [];
    foreach (array_slice($scored, 0, $limit) as $item) {
        $entry = $item['entry'];
        $results[] = [
            'path' => $entry['path'] ?? '',
            'title' => $entry['title'] ?? '',
            'headings' => array_slice($entry['headings'] ?? [], 0, 8),
            'excerpt' => mb_substr($entry['excerpt'] ?? ($entry['full_text'] ?? ''), 0, 1200),
        ];
    }
    return $results;
}

function get_page_content(?string $pagePath): ?array
{
    if (!$pagePath) {
        return null;
    }
    $norm = normalize_path($pagePath);
    foreach (load_content_index() as $entry) {
        if (normalize_path($entry['path'] ?? '') === $norm) {
            return $entry;
        }
    }
    return null;
}
