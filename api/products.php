<?php
// Catalogue public : seulement ce que le navigateur a besoin d'afficher.
require __DIR__ . '/../private/lib.php';

$products = [];
foreach (load_products() as $p) {
    $products[] = [
        'id' => $p['id'],
        'name' => $p['name'],
        'category' => $p['category'] ?? '',
        'price' => (int) $p['price'],
        'stock' => max(0, (int) $p['stock']),
        'max_per_order' => (int) ($p['max_per_order'] ?? 10),
        'preorder' => !empty($p['preorder']),
        'release_date' => $p['release_date'] ?? null,
        'image' => $p['image'] ?? 'assets/img/produit.svg',
        'description' => $p['description'] ?? '',
    ];
}

$config = config();
json_response([
    'shop_name' => $config['shop_name'],
    'payments_enabled' => $config['stripe_secret_key'] !== '',
    'shipping' => [
        'label' => $config['shipping_label'],
        'price' => (int) $config['shipping_price'],
        'free_from' => (int) $config['free_shipping_from'],
    ],
    'products' => $products,
]);
