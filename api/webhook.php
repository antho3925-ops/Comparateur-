<?php
// Stripe appelle cette adresse après chaque paiement réussi :
// on décompte le stock, on enregistre la commande et on t'envoie un e-mail.
require __DIR__ . '/../private/lib.php';

$config = config();
$payload = (string) file_get_contents('php://input');
$signature = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

if (!verify_signature($payload, $signature, $config['stripe_webhook_secret'])) {
    json_response(['error' => 'Signature invalide'], 400);
}

$event = json_decode($payload, true);
if (($event['type'] ?? '') !== 'checkout.session.completed') {
    json_response(['received' => true]);
}

$session = $event['data']['object'];
if (($session['payment_status'] ?? '') !== 'paid') {
    json_response(['received' => true]);
}

$orderFile = ORDERS_DIR . '/' . preg_replace('/[^A-Za-z0-9_]/', '', $session['id']) . '.json';

$order = with_lock(function () use ($session, $orderFile) {
    // Stripe peut renvoyer le même événement : on ne traite chaque commande qu'une fois.
    if (is_file($orderFile)) {
        return null;
    }

    $products = load_products();
    $lines = [];
    $oversold = [];
    foreach (array_filter(explode(';', $session['metadata']['cart'] ?? '')) as $entry) {
        [$id, $qty] = explode(':', $entry);
        $qty = (int) $qty;
        $product = $products[$id] ?? ['name' => $id, 'price' => 0, 'stock' => 0];
        if (isset($products[$id])) {
            $products[$id]['stock'] = (int) $products[$id]['stock'] - $qty;
            if ($products[$id]['stock'] < 0) {
                $oversold[] = $product['name'];
            }
        }
        $lines[] = [
            'id' => $id,
            'name' => $product['name'],
            'qty' => $qty,
            'unit_price' => (int) $product['price'],
            'preorder' => !empty($product['preorder']),
            'release_date' => $product['release_date'] ?? null,
        ];
    }
    save_products($products);

    $customer = $session['customer_details'] ?? [];
    $shipping = $session['collected_information']['shipping_details']
        ?? $session['shipping_details']
        ?? null;

    $order = [
        'id' => $session['id'],
        'date' => date('c'),
        'total' => (int) $session['amount_total'],
        'shipping_cost' => (int) ($session['shipping_cost']['amount_total'] ?? 0),
        'customer' => [
            'name' => $customer['name'] ?? '',
            'email' => $customer['email'] ?? '',
            'phone' => $customer['phone'] ?? '',
        ],
        'shipping' => $shipping,
        'lines' => $lines,
        'oversold' => $oversold,
    ];
    file_put_contents($orderFile, json_encode($order, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    return $order;
});

if ($order) {
    notify_owner($order, $config);
}
json_response(['received' => true]);


function verify_signature(string $payload, string $header, string $secret): bool
{
    if ($secret === '' || $header === '') {
        return false;
    }
    $timestamp = null;
    $signatures = [];
    foreach (explode(',', $header) as $part) {
        [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
        if ($key === 't') {
            $timestamp = (int) $value;
        } elseif ($key === 'v1') {
            $signatures[] = $value;
        }
    }
    // Refuse les messages de plus de 5 minutes (protection contre le rejeu).
    if (!$timestamp || abs(time() - $timestamp) > 300) {
        return false;
    }
    $expected = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
    foreach ($signatures as $signature) {
        if (hash_equals($expected, $signature)) {
            return true;
        }
    }
    return false;
}

function notify_owner(array $order, array $config): void
{
    $text = "Nouvelle commande sur {$config['shop_name']} : " . format_euros($order['total']) . "\n\n";
    if ($order['oversold']) {
        $text .= "⚠ STOCK DÉPASSÉ pour : " . implode(', ', $order['oversold'])
            . ". Contacte le client ou rembourse depuis Stripe.\n\n";
    }
    foreach ($order['lines'] as $line) {
        $text .= "- {$line['qty']} × {$line['name']}";
        if ($line['preorder']) {
            $text .= ' (PRÉCOMMANDE, sortie le ' . format_date_fr((string) $line['release_date']) . ')';
        }
        $text .= "\n";
    }
    $text .= "\nLivraison : " . format_euros($order['shipping_cost']) . "\n\n";

    $c = $order['customer'];
    $text .= "Client : {$c['name']}\nE-mail : {$c['email']}\nTéléphone : {$c['phone']}\n";
    if ($order['shipping']) {
        $a = $order['shipping']['address'] ?? [];
        $text .= "\nAdresse de livraison :\n" . ($order['shipping']['name'] ?? '') . "\n"
            . trim(($a['line1'] ?? '') . "\n" . ($a['line2'] ?? '')) . "\n"
            . ($a['postal_code'] ?? '') . ' ' . ($a['city'] ?? '') . "\n" . ($a['country'] ?? '') . "\n";
    }
    $text .= "\nRéférence Stripe : {$order['id']}\n";

    $subject = '=?UTF-8?B?' . base64_encode("Nouvelle commande – " . format_euros($order['total'])) . '?=';
    $headers = "Content-Type: text/plain; charset=UTF-8\r\nFrom: {$config['owner_email']}\r\n";
    if (!@mail($config['owner_email'], $subject, $text, $headers)) {
        error_log('Envoi de l’e-mail de commande impossible pour ' . $order['id']);
    }
}
