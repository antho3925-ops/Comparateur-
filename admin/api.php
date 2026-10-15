<?php
// Actions de l'administration : ajout, modification, suppression de produits.
require __DIR__ . '/../private/admin_lib.php';

const UPLOADS_DIR = __DIR__ . '/../uploads';
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

admin_session_start();
if (!admin_logged_in()) {
    json_response(['error' => 'Session expirée, reconnecte-toi.'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST'
    || !hash_equals(csrf_token(), (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))) {
    json_response(['error' => 'Requête refusée.'], 403);
}

$action = $_GET['action'] ?? '';
try {
    switch ($action) {
        case 'list':
            json_response(['products' => array_values(load_products())]);
        case 'save':
            json_response(['product' => save_product($_POST, $_FILES['image'] ?? null)]);
        case 'delete':
            delete_product((string) ($_POST['id'] ?? ''));
            json_response(['ok' => true]);
        default:
            json_response(['error' => 'Action inconnue.'], 400);
    }
} catch (InvalidArgumentException $e) {
    json_response(['error' => $e->getMessage()], 400);
}


function save_product(array $in, ?array $upload): array
{
    $name = trim((string) ($in['name'] ?? ''));
    if ($name === '' || mb_strlen($name) > 120) {
        throw new InvalidArgumentException('Le nom est obligatoire (120 caractères maximum).');
    }

    // Accepte « 59,90 », « 59.90 » ou « 59 ».
    $priceText = str_replace([' ', '€', ','], ['', '', '.'], (string) ($in['price'] ?? ''));
    if (!preg_match('/^\d+(\.\d{1,2})?$/', $priceText) || (float) $priceText <= 0) {
        throw new InvalidArgumentException('Prix invalide : écris par exemple 59,90.');
    }
    $price = (int) round((float) $priceText * 100);

    $stock = filter_var($in['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    if ($stock === false) {
        throw new InvalidArgumentException('Le stock doit être un nombre entier (0 ou plus).');
    }
    $maxPerOrder = filter_var($in['max_per_order'] ?? 10, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 99]]);
    if ($maxPerOrder === false) {
        throw new InvalidArgumentException('La limite par commande doit être entre 1 et 99.');
    }

    $preorder = !empty($in['preorder']);
    $releaseDate = trim((string) ($in['release_date'] ?? ''));
    if ($preorder && !DateTime::createFromFormat('!Y-m-d', $releaseDate)) {
        throw new InvalidArgumentException('Indique la date de sortie de la précommande.');
    }

    $category = mb_substr(trim((string) ($in['category'] ?? '')), 0, 40);
    $description = mb_substr(trim((string) ($in['description'] ?? '')), 0, 500);
    $newImage = $upload && $upload['error'] !== UPLOAD_ERR_NO_FILE ? store_image($upload) : null;

    return with_lock(function () use ($in, $name, $price, $stock, $maxPerOrder, $preorder, $releaseDate, $category, $description, $newImage) {
        $products = load_products();
        $id = (string) ($in['id'] ?? '');

        if ($id !== '') {
            if (!isset($products[$id])) {
                throw new InvalidArgumentException('Ce produit n\'existe plus.');
            }
            $product = $products[$id];
            // Des ventes ont pu avoir lieu pendant que le formulaire était ouvert :
            // on applique la différence saisie au stock actuel au lieu de l'écraser.
            $loaded = (int) ($in['stock_loaded'] ?? $product['stock']);
            $product['stock'] = max(0, (int) $product['stock'] + ($stock - $loaded));
            if ($newImage && str_starts_with((string) ($product['image'] ?? ''), 'uploads/')) {
                @unlink(__DIR__ . '/../' . $product['image']);
            }
        } else {
            $id = unique_id($name, $products);
            $product = ['id' => $id, 'stock' => $stock];
        }

        $product['name'] = $name;
        $product['category'] = $category;
        $product['price'] = $price;
        $product['max_per_order'] = $maxPerOrder;
        $product['preorder'] = $preorder;
        if ($preorder) {
            $product['release_date'] = $releaseDate;
        } else {
            unset($product['release_date']);
        }
        $product['featured'] = !empty($in['featured']);
        $product['description'] = $description;
        if ($newImage) {
            $product['image'] = $newImage;
        } elseif (empty($product['image'])) {
            $product['image'] = 'assets/img/produit.svg';
        }

        // Les nouveaux produits apparaissent en premier.
        $products = isset($products[$id]) ? array_replace($products, [$id => $product]) : [$id => $product] + $products;
        save_products($products);
        return $product;
    });
}

function delete_product(string $id): void
{
    with_lock(function () use ($id) {
        $products = load_products();
        if (!isset($products[$id])) {
            return;
        }
        $image = (string) ($products[$id]['image'] ?? '');
        if (str_starts_with($image, 'uploads/')) {
            @unlink(__DIR__ . '/../' . $image);
        }
        unset($products[$id]);
        save_products($products);
    });
}

function store_image(array $upload): string
{
    if ($upload['error'] === UPLOAD_ERR_INI_SIZE || $upload['error'] === UPLOAD_ERR_FORM_SIZE || $upload['size'] > MAX_IMAGE_BYTES) {
        throw new InvalidArgumentException('Image trop lourde (8 Mo maximum).');
    }
    if ($upload['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($upload['tmp_name'])) {
        throw new InvalidArgumentException('L\'envoi de l\'image a échoué, réessaie.');
    }
    // On se fie au contenu réel du fichier, jamais à son nom.
    $info = @getimagesize($upload['tmp_name']);
    $extensions = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_WEBP => 'webp', IMAGETYPE_GIF => 'gif'];
    if (!$info || !isset($extensions[$info[2]])) {
        throw new InvalidArgumentException('Format d\'image non accepté : utilise JPG, PNG ou WebP.');
    }
    if (!is_dir(UPLOADS_DIR)) {
        mkdir(UPLOADS_DIR, 0755, true);
    }
    $file = bin2hex(random_bytes(8)) . '.' . $extensions[$info[2]];
    if (!move_uploaded_file($upload['tmp_name'], UPLOADS_DIR . '/' . $file)) {
        throw new InvalidArgumentException('Impossible d\'enregistrer l\'image sur le serveur.');
    }
    return 'uploads/' . $file;
}

function unique_id(string $name, array $products): string
{
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $name) ?: ''), '-'));
    $slug = substr($slug !== '' ? $slug : 'produit', 0, 60);
    $id = $slug;
    for ($i = 2; isset($products[$id]); $i++) {
        $id = "$slug-$i";
    }
    return $id;
}
