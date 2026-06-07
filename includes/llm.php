<?php

function load_site_knowledge(): array
{
    $path = app_root() . '/data/site-knowledge.json';
    if (!file_exists($path)) {
        return [];
    }
    $data = json_decode(file_get_contents($path), true);
    return is_array($data) ? $data : [];
}

function build_system_prompt(array $contextChunks, array $memories, ?string $pageUrl): string
{
    $knowledge = load_site_knowledge();
    $bot = $knowledge['bot'] ?? [];
    $owner = $knowledge['owner'] ?? [];
    $friends = $knowledge['friends'] ?? [];
    $teachers = $knowledge['teachers'] ?? [];
    $gcuf = $knowledge['gcuf'] ?? [];

    $name = $bot['name'] ?? 'Nigga Bot';
    $lines = [];
    $lines[] = "You are {$name}, the funny AI assistant for Notes by Nain (notesbynain.xo.je).";
    $lines[] = 'Personality: dost jaisa, mazakiya, Roman Urdu + English mix (e.g. "yar", "scene ye hai", "short ma bataun").';
    $lines[] = 'You may use casual slang including mild profanity when it fits the vibe — stay friendly, never hateful.';
    $lines[] = 'PRIMARY JOB: help students with course notes on this site. Guide them to the right pages/sections with markdown links.';
    $lines[] = 'When notes are long, summarize briefly in chat and link to the full page.';
    $lines[] = 'Stay mainly content-related. Off-topic? mazak se wapas notes par lao.';
    $lines[] = 'Refuse harmful/illegal requests politely in your style.';
    $lines[] = 'Use relative markdown links like [Waterfall Model](/software-engineering/topics/02-sdlc-and-process-models/02-02-classical-waterfall.html).';

    if (!empty($owner)) {
        $lines[] = 'Site owner: ' . json_encode($owner, JSON_UNESCAPED_UNICODE);
    }
    if (!empty($friends)) {
        $lines[] = 'Owner friends (light inside jokes OK): ' . json_encode($friends, JSON_UNESCAPED_UNICODE);
    }
    if (!empty($teachers)) {
        $lines[] = 'GCUF teachers (respectful but funny mazak OK): ' . json_encode($teachers, JSON_UNESCAPED_UNICODE);
    }
    if (!empty($gcuf)) {
        $lines[] = 'GCUF context: ' . json_encode($gcuf, JSON_UNESCAPED_UNICODE);
    }
    $lines[] = 'Past papers section: /index.html#past-papers — some uploaded in DB, some searchable online.';
    $lines[] = 'For guess paper requests: analyze repeated topics from past papers data provided in context.';

    if ($pageUrl) {
        $lines[] = "User is currently on page: {$pageUrl}";
    }

    if (!empty($memories)) {
        $lines[] = 'Things you remember about this user:';
        foreach ($memories as $m) {
            $lines[] = '- ' . $m['memory_text'];
        }
    }

    if (!empty($contextChunks)) {
        $lines[] = 'Relevant site content (use for accurate answers):';
        foreach ($contextChunks as $chunk) {
            $lines[] = '---';
            $lines[] = 'Page: ' . ($chunk['title'] ?? '') . ' (' . ($chunk['path'] ?? '') . ')';
            if (!empty($chunk['headings'])) {
                $lines[] = 'Headings: ' . implode(', ', $chunk['headings']);
            }
            $lines[] = $chunk['excerpt'] ?? ($chunk['full_text'] ?? '');
        }
    }

    return implode("\n", $lines);
}

function get_active_api_keys(): array
{
    $stmt = db()->query('SELECT id, label, provider, api_key_encrypted, model, priority FROM api_keys WHERE is_active = 1 ORDER BY priority ASC, id ASC');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $row['api_key'] = decrypt_value($row['api_key_encrypted']);
        unset($row['api_key_encrypted']);
    }
    return $rows;
}

function default_model(string $provider): string
{
    return match ($provider) {
        'groq' => 'llama-3.3-70b-versatile',
        'gemini' => 'gemini-2.0-flash',
        'openrouter' => 'meta-llama/llama-3.3-70b-instruct:free',
        'together' => 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        default => 'llama-3.3-70b-versatile',
    };
}

function llm_chat(array $messages, ?string $systemPrompt = null): string
{
    $keys = get_active_api_keys();
    if (empty($keys)) {
        throw new RuntimeException('No API keys configured. Admin must add keys in dashboard.');
    }

    $lastError = '';
    foreach ($keys as $key) {
        try {
            $model = $key['model'] ?: default_model($key['provider']);
            return llm_request($key['provider'], $key['api_key'], $model, $messages, $systemPrompt);
        } catch (Throwable $e) {
            $lastError = $e->getMessage();
            continue;
        }
    }
    throw new RuntimeException('All API keys failed: ' . $lastError);
}

function llm_request(string $provider, string $apiKey, string $model, array $messages, ?string $systemPrompt): string
{
    if ($systemPrompt) {
        array_unshift($messages, ['role' => 'system', 'content' => $systemPrompt]);
    }

    return match ($provider) {
        'groq' => llm_groq($apiKey, $model, $messages),
        'gemini' => llm_gemini($apiKey, $model, $messages),
        'openrouter' => llm_openrouter($apiKey, $model, $messages),
        'together' => llm_together($apiKey, $model, $messages),
        default => throw new RuntimeException("Unknown provider: {$provider}"),
    };
}

function http_post_json(string $url, array $headers, array $body): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($body),
        CURLOPT_TIMEOUT => 60,
    ]);
    $response = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        throw new RuntimeException('HTTP error: ' . $err);
    }
    $data = json_decode($response, true);
    if ($code >= 400) {
        $msg = is_array($data) ? ($data['error']['message'] ?? json_encode($data)) : $response;
        throw new RuntimeException("API {$code}: {$msg}");
    }
    return is_array($data) ? $data : [];
}

function llm_groq(string $apiKey, string $model, array $messages): string
{
    $data = http_post_json('https://api.groq.com/openai/v1/chat/completions', [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ], [
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.8,
        'max_tokens' => 1500,
    ]);
    return $data['choices'][0]['message']['content'] ?? '';
}

function llm_gemini(string $apiKey, string $model, array $messages): string
{
    $contents = [];
    $system = '';
    foreach ($messages as $m) {
        if ($m['role'] === 'system') {
            $system = $m['content'];
            continue;
        }
        $contents[] = [
            'role' => $m['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $m['content']]],
        ];
    }
    $body = ['contents' => $contents];
    if ($system) {
        $body['systemInstruction'] = ['parts' => [['text' => $system]]];
    }
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/' . urlencode($model) . ':generateContent?key=' . urlencode($apiKey);
    $data = http_post_json($url, ['Content-Type: application/json'], $body);
    return $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
}

function llm_openrouter(string $apiKey, string $model, array $messages): string
{
    $data = http_post_json('https://openrouter.ai/api/v1/chat/completions', [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ], [
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.8,
        'max_tokens' => 1500,
    ]);
    return $data['choices'][0]['message']['content'] ?? '';
}

function llm_together(string $apiKey, string $model, array $messages): string
{
    $data = http_post_json('https://api.together.xyz/v1/chat/completions', [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ], [
        'model' => $model,
        'messages' => $messages,
        'temperature' => 0.8,
        'max_tokens' => 1500,
    ]);
    return $data['choices'][0]['message']['content'] ?? '';
}

function extract_memories(int $userId, array $recentMessages): void
{
    if (count($recentMessages) < 4) {
        return;
    }

    $conv = '';
    foreach ($recentMessages as $m) {
        $conv .= strtoupper($m['role']) . ': ' . $m['content'] . "\n";
    }

    try {
        $result = llm_chat([
            ['role' => 'user', 'content' => "From this chat, extract 0-2 short facts worth remembering about the user (name, subject, exam prep, preferences). Return JSON array of strings only, or [] if nothing.\n\n" . $conv],
        ], 'You output only valid JSON arrays of strings. No markdown.');

        $result = trim($result);
        if (str_starts_with($result, '```')) {
            $result = preg_replace('/^```(?:json)?\s*|\s*```$/', '', $result);
        }
        $facts = json_decode($result, true);
        if (!is_array($facts)) {
            return;
        }

        $pdo = db();
        foreach ($facts as $fact) {
            $fact = sanitize_string((string) $fact, 500);
            if ($fact === '') {
                continue;
            }
            $check = $pdo->prepare('SELECT id FROM user_memories WHERE user_id = ? AND memory_text = ? LIMIT 1');
            $check->execute([$userId, $fact]);
            if ($check->fetch()) {
                continue;
            }
            $pdo->prepare('INSERT INTO user_memories (user_id, memory_text, source) VALUES (?, ?, ?)')
                ->execute([$userId, $fact, 'auto']);
            backup_append_memory($userId, $fact);
        }
    } catch (Throwable $e) {
        // memory extraction is best-effort
    }
}

function tavily_search(string $query): array
{
    $key = app_config()['search']['tavily_api_key'] ?? '';
    if ($key === '') {
        $stmt = db()->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'tavily_api_key' LIMIT 1");
        $stmt->execute();
        $row = $stmt->fetch();
        if ($row) {
            $key = decrypt_value($row['setting_value']);
        }
    }
    if ($key === '') {
        return [];
    }

    try {
        $data = http_post_json('https://api.tavily.com/search', [
            'Content-Type: application/json',
        ], [
            'api_key' => $key,
            'query' => $query,
            'max_results' => 5,
        ]);
        return $data['results'] ?? [];
    } catch (Throwable $e) {
        return [];
    }
}

function get_past_papers_context(?string $subject): string
{
    $pdo = db();
    if ($subject) {
        $stmt = $pdo->prepare('SELECT subject, exam_type, year, extracted_text FROM past_papers WHERE subject LIKE ? ORDER BY year DESC LIMIT 5');
        $stmt->execute(['%' . $subject . '%']);
    } else {
        $stmt = $pdo->query('SELECT subject, exam_type, year, extracted_text FROM past_papers ORDER BY created_at DESC LIMIT 10');
    }
    $rows = $stmt->fetchAll();
    if (empty($rows)) {
        return '';
    }
    $out = "Uploaded past papers in database:\n";
    foreach ($rows as $r) {
        $text = mb_substr($r['extracted_text'] ?? '', 0, 2000);
        $out .= "- {$r['subject']} ({$r['exam_type']}, {$r['year']}): {$text}\n";
    }
    return $out;
}

function guess_paper_context(string $message): string
{
    $lower = strtolower($message);
    if (!preg_match('/guess|past\s*paper|gcuf|paper|exam|mid|final/', $lower)) {
        return '';
    }

    $subject = '';
    $subjects = ['software engineering', 'information security', 'linear algebra', 'coa', 'computer organization', 'civics', 'management', 'technical writing'];
    foreach ($subjects as $s) {
        if (str_contains($lower, $s)) {
            $subject = $s;
            break;
        }
    }

    $ctx = get_past_papers_context($subject);
    $search = tavily_search('GCUF past paper ' . ($subject ?: 'computer science') . ' midterm final');
    if (!empty($search)) {
        $ctx .= "\nOnline search results:\n";
        foreach ($search as $r) {
            $ctx .= '- ' . ($r['title'] ?? '') . ': ' . ($r['content'] ?? '') . ' [' . ($r['url'] ?? '') . "]\n";
        }
    }
    return $ctx;
}
