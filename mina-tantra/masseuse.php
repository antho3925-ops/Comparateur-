<?php
/* ---------------------------------------------------------------------------
   Chez Eva — la page d'une masseuse
   ---------------------------------------------------------------------------
   Une adresse par fille : chez-eva.ch/m/mina. De quoi envoyer un lien
   direct quand on demande « qui est la ? », et de quoi laisser Google les
   referencer une par une plutot que toutes dans la meme page.

   Tout vient de sa fiche : la page ne sait rien que l'administration ne
   lui ait donne.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

$id = (string) ($_GET['m'] ?? '');
$f = fiche($id);

if ($f === null || empty($f['disponible'])) {
    http_response_code(404);
    header('Location: ./#masseuses', true, 302);
    exit;
}

/* La langue, comme sur la page d'accueil. */
$languesConnues = ['fr', 'de', 'en', 'es'];
$langue = 'fr';
if (in_array((string) ($_GET['lang'] ?? ''), $languesConnues, true)) {
    $langue = (string) $_GET['lang'];
} elseif (preg_match_all('/([a-z]{2})(?:-[A-Za-z]{2})?/',
        strtolower((string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '')), $trouves)) {
    foreach ($trouves[1] as $code) {
        if (in_array($code, $languesConnues, true)) { $langue = $code; break; }
    }
}

$salon = parametres();
$nomSalon = (string) ($salon['nom'] ?? 'Chez Eva');
$prenom = (string) ($f['prenom'] ?? '');
$presentation = (string) ($f['presentation_' . $langue] ?? '') !== ''
    ? (string) $f['presentation_' . $langue]
    : (string) ($f['presentation'] ?? '');

$photos = array_values(array_filter((array) ($f['photos'] ?? []), static function ($p): bool {
    return is_string($p) && is_file(__DIR__ . '/' . $p);
}));
$principale = (string) ($f['photo'] ?? ($photos[0] ?? ''));

/** L'adresse d'une photo, suivie de la date du fichier. */
function photo_datee(string $racine, string $rel): string
{
    $date = @filemtime(__DIR__ . '/' . $rel);
    return $racine . '/' . $rel . ($date ? '?v=' . $date : '');
}

$adresse = rtrim(adresse_site(), '/');
$lien = $adresse . '/m/' . rawurlencode($id);

$titres = [
    'fr' => ['chez' => 'au salon', 'voir' => 'Voir toutes les masseuses', 'rdv' => 'Prendre rendez-vous',
             'parle' => 'Parle', 'propose' => 'Elle propose'],
    'de' => ['chez' => 'im Salon', 'voir' => 'Alle Masseurinnen ansehen', 'rdv' => 'Termin vereinbaren',
             'parle' => 'Spricht', 'propose' => 'Sie bietet an'],
    'en' => ['chez' => 'at the parlour', 'voir' => 'See all the masseuses', 'rdv' => 'Book an appointment',
             'parle' => 'Speaks', 'propose' => 'She offers'],
    'es' => ['chez' => 'en el salón', 'voir' => 'Ver todas las masajistas', 'rdv' => 'Pedir cita',
             'parle' => 'Habla', 'propose' => 'Ofrece'],
];
$dit = $titres[$langue];

$description = trim(mb_substr(preg_replace('/\s+/u', ' ', $presentation) ?? '', 0, 160));
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($langue, ENT_QUOTES) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title><?= htmlspecialchars($prenom . ' — ' . $nomSalon, ENT_QUOTES) ?></title>
<meta name="description" content="<?= htmlspecialchars($description, ENT_QUOTES) ?>">
<link rel="canonical" href="<?= htmlspecialchars($lien, ENT_QUOTES) ?>">
<link rel="icon" href="<?= $adresse ?>/assets/favicon.ico" sizes="any">
<link rel="stylesheet" href="<?= $adresse ?>/assets/styles.css?v=<?= (int) @filemtime(__DIR__ . '/assets/styles.css') ?>">
<meta property="og:type" content="profile">
<meta property="og:title" content="<?= htmlspecialchars($prenom . ' — ' . $nomSalon, ENT_QUOTES) ?>">
<meta property="og:description" content="<?= htmlspecialchars($description, ENT_QUOTES) ?>">
<?php if ($principale !== ''): ?>
  <meta property="og:image" content="<?= htmlspecialchars(photo_datee($adresse, $principale), ENT_QUOTES) ?>">
<?php endif; ?>
<style>
  body{ background:var(--nuit); }
  .fiche-seule{ max-width:760px; margin:0 auto; padding:40px 20px 60px; }
  .fiche-seule .retour{ font-size:.72rem; letter-spacing:.18em; text-transform:uppercase;
                        color:var(--or); text-decoration:none; }
  .fiche-seule h1{ font-family:var(--nom); font-weight:400; font-size:clamp(2.4rem,9vw,3.6rem);
                   margin:18px 0 4px; }
  .fiche-seule .lieu{ font-size:.7rem; letter-spacing:.24em; text-transform:uppercase;
                      color:var(--or); margin:0 0 26px; }
  .fiche-seule img.grande{ width:100%; border-radius:16px; display:block; margin:0 0 22px; }
  .fiche-seule .texte{ font-size:1.02rem; color:var(--texte-doux); }
  .fiche-seule .vignettes{ display:grid; grid-template-columns:repeat(auto-fill,minmax(110px,1fr));
                           gap:10px; margin:22px 0; }
  .fiche-seule .vignettes img{ width:100%; height:150px; object-fit:cover; border-radius:10px; }
  .fiche-seule h2{ font-size:.68rem; letter-spacing:.2em; text-transform:uppercase;
                   color:var(--or); margin:26px 0 8px; }
  .fiche-seule .boutons{ display:flex; flex-wrap:wrap; gap:12px; margin-top:28px; }
</style>
</head>
<body>
<main class="fiche-seule">
  <a class="retour" href="<?= $adresse ?>/?lang=<?= $langue ?>#masseuses">← <?= htmlspecialchars($dit['voir'], ENT_QUOTES) ?></a>

  <h1><?= htmlspecialchars($prenom, ENT_QUOTES) ?></h1>
  <p class="lieu"><?= htmlspecialchars($nomSalon . ' · ' . $dit['chez'], ENT_QUOTES) ?></p>

  <?php if ($principale !== ''): ?>
    <img class="grande" src="<?= htmlspecialchars(photo_datee($adresse, $principale), ENT_QUOTES) ?>"
         alt="<?= htmlspecialchars($prenom, ENT_QUOTES) ?>">
  <?php endif; ?>

  <p class="texte"><?= nl2br(htmlspecialchars($presentation, ENT_QUOTES)) ?></p>

  <?php if (!empty($f['langues'])): ?>
    <h2><?= htmlspecialchars($dit['parle'], ENT_QUOTES) ?></h2>
    <p class="texte"><?= htmlspecialchars((string) $f['langues'], ENT_QUOTES) ?></p>
  <?php endif; ?>

  <?php if (!empty($f['specialites'])): ?>
    <h2><?= htmlspecialchars($dit['propose'], ENT_QUOTES) ?></h2>
    <p class="texte"><?= htmlspecialchars(implode(' · ', (array) $f['specialites']), ENT_QUOTES) ?></p>
  <?php endif; ?>

  <?php if (count($photos) > 1): ?>
    <div class="vignettes">
      <?php foreach ($photos as $photo): ?>
        <img src="<?= htmlspecialchars(photo_datee($adresse, $photo), ENT_QUOTES) ?>" loading="lazy"
             alt="<?= htmlspecialchars($prenom, ENT_QUOTES) ?>">
      <?php endforeach; ?>
    </div>
  <?php endif; ?>

  <div class="boutons">
    <a class="btn btn-plein" href="<?= $adresse ?>/?lang=<?= $langue ?>#reserver"><?= htmlspecialchars($dit['rdv'], ENT_QUOTES) ?></a>
    <a class="btn btn-vide" href="<?= $adresse ?>/?lang=<?= $langue ?>#masseuses"><?= htmlspecialchars($dit['voir'], ENT_QUOTES) ?></a>
  </div>
</main>
</body>
</html>
