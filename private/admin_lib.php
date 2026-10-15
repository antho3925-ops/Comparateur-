<?php
// Connexion à l'espace administrateur.
require_once __DIR__ . '/lib.php';

const ATTEMPTS_FILE = __DIR__ . '/login_attempts.json';
const MAX_ATTEMPTS = 5;
const ATTEMPTS_WINDOW = 15 * 60;

function admin_session_start(): void
{
    $https = ($_SERVER['HTTPS'] ?? '') !== '' && $_SERVER['HTTPS'] !== 'off';
    session_name('pokestocks_admin');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function admin_password(): string
{
    return (string) (config()['admin_password'] ?? '');
}

function admin_logged_in(): bool
{
    return !empty($_SESSION['admin']);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

// Limite les essais de mot de passe : 5 erreurs en 15 minutes bloquent l'adresse IP.
function login_blocked(string $ip): bool
{
    $attempts = read_attempts();
    $entry = $attempts[$ip] ?? null;
    return $entry && $entry['count'] >= MAX_ATTEMPTS && time() - $entry['first'] < ATTEMPTS_WINDOW;
}

function record_failed_login(string $ip): void
{
    $attempts = read_attempts();
    $entry = $attempts[$ip] ?? null;
    if (!$entry || time() - $entry['first'] >= ATTEMPTS_WINDOW) {
        $entry = ['count' => 0, 'first' => time()];
    }
    $entry['count']++;
    $attempts[$ip] = $entry;
    file_put_contents(ATTEMPTS_FILE, json_encode($attempts), LOCK_EX);
}

function clear_failed_logins(string $ip): void
{
    $attempts = read_attempts();
    unset($attempts[$ip]);
    file_put_contents(ATTEMPTS_FILE, json_encode($attempts), LOCK_EX);
}

function read_attempts(): array
{
    if (!is_file(ATTEMPTS_FILE)) {
        return [];
    }
    $data = json_decode((string) file_get_contents(ATTEMPTS_FILE), true);
    if (!is_array($data)) {
        return [];
    }
    // Oublie les entrées expirées pour que le fichier ne grossisse pas.
    return array_filter($data, fn($e) => time() - ($e['first'] ?? 0) < ATTEMPTS_WINDOW);
}

function attempt_login(string $password): ?string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'inconnue';
    if (login_blocked($ip)) {
        return 'Trop de tentatives. Réessaie dans 15 minutes.';
    }
    $expected = admin_password();
    if ($expected === '' || !hash_equals($expected, $password)) {
        record_failed_login($ip);
        sleep(1);
        return 'Mot de passe incorrect.';
    }
    clear_failed_logins($ip);
    session_regenerate_id(true);
    $_SESSION['admin'] = true;
    return null;
}
