<?php
// Reçoit le panier, vérifie prix et stock côté serveur, puis crée une page de
// paiement Stripe Checkout (carte bancaire, Apple Pay, Google Pay).
require __DIR__ . '/../private/lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Méthode non autorisée'], 405);
}

$config = config();
if ($config['stripe_secret_key'] === '') {
    json_response(['error' => "Le paiement en ligne n'est pas encore activé. Revenez très bientôt !"], 503);
}

$input = json_decode((string) file_get_contents('php://input'), true);
$items = $input['items'] ?? null;
if (!is_array($items) || !$items) {
    json_response(['error' => 'Votre panier est vide.'], 400);
}

$products = load_products();
$lineItems = [];
$cart = [];
$preorderNotes = [];
$subtotal = 0;

foreach ($items as $item) {
    $id = (string) ($item['id'] ?? '');
    $qty = (int) ($item['qty'] ?? 0);
    $product = $products[$id] ?? null;

    if (!$product || $qty < 1 || isset($cart[$id])) {
        json_response(['error' => 'Panier invalide, rechargez la page.'], 400);
    }
    $max = (int) ($product['max_per_order'] ?? 10);
    if ($qty > $max) {
        json_response(['error' => "« {$product['name']} » est limité à $max par commande."], 400);
    }
    if ($qty > (int) $product['stock']) {
        $left = max(0, (int) $product['stock']);
        $msg = $left === 0
            ? "« {$product['name']} » n'est plus disponible."
            : "Il ne reste que $left × « {$product['name']} ».";
        json_response(['error' => $msg], 409);
    }

    $name = $product['name'];
    if (!empty($product['preorder'])) {
        $date = format_date_fr($product['release_date'] ?? '');
        $name = "[Précommande] $name";
        $preorderNotes[] = "« {$product['name']} » sera expédié à sa sortie, prévue le $date.";
    }

    $lineItems[] = [
        'quantity' => $qty,
        'price_data' => [
            'currency' => 'eur',
            'unit_amount' => (int) $product['price'],
            'product_data' => array_filter([
                'name' => $name,
                'description' => $product['description'] ?? null,
            ]),
        ],
    ];
    $cart[$id] = $qty;
    $subtotal += (int) $product['price'] * $qty;
}

$freeFrom = (int) $config['free_shipping_from'];
$shippingFree = $freeFrom > 0 && $subtotal >= $freeFrom;

$params = [
    'mode' => 'payment',
    'locale' => 'fr',
    'line_items' => $lineItems,
    'success_url' => $config['site_url'] . '/succes.html?session_id={CHECKOUT_SESSION_ID}',
    'cancel_url' => $config['site_url'] . '/index.html#panier',
    'shipping_address_collection' => ['allowed_countries' => $config['shipping_countries']],
    'shipping_options' => [[
        'shipping_rate_data' => [
            'type' => 'fixed_amount',
            'display_name' => $config['shipping_label'] . ($shippingFree ? ' (offerte)' : ''),
            'fixed_amount' => [
                'amount' => $shippingFree ? 0 : (int) $config['shipping_price'],
                'currency' => 'eur',
            ],
        ],
    ]],
    'phone_number_collection' => ['enabled' => 'true'],
    // Le panier voyage avec le paiement : le webhook s'en sert pour décompter le stock.
    'metadata' => ['cart' => implode(';', array_map(
        fn($id, $qty) => "$id:$qty", array_keys($cart), $cart
    ))],
    // Le lien de paiement expire après 30 min pour ne pas bloquer un panier abandonné.
    'expires_at' => time() + 30 * 60,
];
if ($preorderNotes) {
    $params['custom_text'] = ['submit' => ['message' => implode("\n", $preorderNotes)]];
}

try {
    $session = stripe_request('POST', 'checkout/sessions', $params);
} catch (RuntimeException $e) {
    error_log($e->getMessage());
    json_response(['error' => 'Le paiement est momentanément indisponible, réessayez dans quelques minutes.'], 502);
}

json_response(['url' => $session['url']]);
