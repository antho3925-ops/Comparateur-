<?php
// Fonctions communes aux scripts de api/.

const PRODUCTS_FILE = __DIR__ . '/products.json';
const LOCK_FILE = __DIR__ . '/products.lock';
const ORDERS_DIR = __DIR__ . '/orders';

function config(): array
{
    static $config = null;
    if ($config === null) {
        $file = __DIR__ . '/config.php';
        $config = is_file($file) ? require $file : require __DIR__ . '/config.example.php';
    }
    return $config;
}

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function load_products(): array
{
    $products = json_decode((string) file_get_contents(PRODUCTS_FILE), true);
    if (!is_array($products)) {
        throw new RuntimeException('products.json est illisible (erreur de syntaxe JSON ?)');
    }
    $byId = [];
    foreach ($products as $product) {
        $byId[$product['id']] = $product;
    }
    return $byId;
}

// Exécute $fn sous verrou exclusif : deux ventes simultanées ne peuvent pas
// écraser le stock l'une de l'autre.
function with_lock(callable $fn)
{
    $lock = fopen(LOCK_FILE, 'c');
    flock($lock, LOCK_EX);
    try {
        return $fn();
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

function save_products(array $byId): void
{
    $json = json_encode(array_values($byId), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    $tmp = PRODUCTS_FILE . '.tmp';
    file_put_contents($tmp, $json . "\n");
    rename($tmp, PRODUCTS_FILE);
}

function format_date_fr(string $isoDate): string
{
    $date = DateTime::createFromFormat('Y-m-d', $isoDate);
    return $date ? $date->format('d/m/Y') : $isoDate;
}

function format_euros(int $cents): string
{
    return number_format($cents / 100, 2, ',', ' ') . ' €';
}

// Appel à l'API Stripe sans dépendance (pas besoin de Composer sur l'hébergement).
function stripe_request(string $method, string $path, array $params = []): array
{
    $ch = curl_init('https://api.stripe.com/v1/' . $path);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_USERPWD => config()['stripe_secret_key'] . ':',
        CURLOPT_TIMEOUT => 30,
    ]);
    if ($params) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
    }
    $body = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        throw new RuntimeException('Stripe injoignable : ' . $error);
    }
    $data = json_decode($body, true);
    if ($status >= 400) {
        throw new RuntimeException('Erreur Stripe : ' . ($data['error']['message'] ?? $body));
    }
    return $data;
}
