<?php
require __DIR__ . '/../private/admin_lib.php';

admin_session_start();
header('X-Frame-Options: DENY');
header('Cache-Control: no-store');

$error = null;
if (isset($_GET['logout'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: ./');
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    $error = attempt_login((string) $_POST['password']);
    if ($error === null) {
        header('Location: ./');
        exit;
    }
}
$configured = mb_strlen(admin_password()) >= 12;
$shop = htmlspecialchars(config()['shop_name']);
?>
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Administration – <?= $shop ?></title>
  <link rel="stylesheet" href="../assets/style.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin">
<?php if (!admin_logged_in()): ?>
  <main class="login">
    <div class="logo">POKESTOCKS</div>
    <h1>Administration</h1>
    <?php if (!$configured): ?>
      <p class="notice">L'administration est fermée : définis un mot de passe d'au moins 12 caractères
        dans <code>private/config.php</code> (ligne <code>'admin_password'</code>).</p>
    <?php else: ?>
      <form method="post">
        <label>Mot de passe
          <input type="password" name="password" autocomplete="current-password" required autofocus>
        </label>
        <?php if ($error): ?><p class="error"><?= htmlspecialchars($error) ?></p><?php endif; ?>
        <button class="button block">Se connecter</button>
      </form>
    <?php endif; ?>
  </main>
<?php else: ?>
  <header class="admin-bar">
    <div class="logo small-logo">POKESTOCKS</div>
    <nav>
      <a href="../" target="_blank">Voir la boutique ↗</a>
      <a href="?logout=1">Déconnexion</a>
    </nav>
  </header>

  <main class="admin-main">
    <div class="admin-head">
      <h1>Produits</h1>
      <button class="button" id="new-product">+ Ajouter un produit</button>
    </div>
    <p class="error" id="list-error" role="alert"></p>
    <div class="table-wrap">
      <table class="products-table">
        <thead>
          <tr><th>Produit</th><th>Prix</th><th>Stock</th><th>Type</th><th></th></tr>
        </thead>
        <tbody id="product-rows"><tr><td colspan="5">Chargement…</td></tr></tbody>
      </table>
    </div>
  </main>

  <dialog id="editor">
    <form id="product-form" method="dialog">
      <h2 id="editor-title">Nouveau produit</h2>
      <input type="hidden" name="id">
      <input type="hidden" name="stock_loaded">

      <div class="image-field">
        <img id="image-preview" src="../assets/img/produit.svg" alt="">
        <label class="button ghost">Choisir une photo
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" hidden>
        </label>
      </div>

      <label>Nom du produit *
        <input name="name" maxlength="120" required placeholder="Display 36 boosters – …">
      </label>
      <div class="row">
        <label>Prix (€) *
          <input name="price" inputmode="decimal" required placeholder="59,90">
        </label>
        <label>Stock *
          <input name="stock" type="number" min="0" step="1" required value="0">
        </label>
      </div>

      <label class="check">
        <input type="checkbox" name="preorder" value="1"> C'est une précommande
      </label>
      <label id="release-field" hidden>Date de sortie *
        <input name="release_date" type="date">
      </label>

      <details>
        <summary>Options</summary>
        <div class="row">
          <label>Catégorie
            <input name="category" maxlength="40" list="categories" placeholder="Displays">
            <datalist id="categories"></datalist>
          </label>
          <label>Limite par commande
            <input name="max_per_order" type="number" min="1" max="99" value="5">
          </label>
        </div>
        <label>Description
          <textarea name="description" maxlength="500" rows="3"></textarea>
        </label>
        <label class="check">
          <input type="checkbox" name="featured" value="1"> Afficher dans « Meilleures ventes »
        </label>
      </details>

      <p class="error" id="form-error" role="alert"></p>
      <div class="actions">
        <button type="button" class="button ghost" id="cancel">Annuler</button>
        <button type="submit" class="button" id="save">Enregistrer</button>
      </div>
    </form>
  </dialog>

  <script>window.CSRF = <?= json_encode(csrf_token()) ?>;</script>
  <script src="admin.js"></script>
<?php endif; ?>
</body>
</html>
