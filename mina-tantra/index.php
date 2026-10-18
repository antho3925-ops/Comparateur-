<?php
/* ---------------------------------------------------------------------------
   Chez Eva — page publique
   ---------------------------------------------------------------------------
   Prend la page modele.html, y injecte les fiches des masseuses telles que
   l'administration les a enregistrees, et envoie le tout au visiteur.
   Aucune base de donnees : les fiches vivent dans data/masseuses.json.
--------------------------------------------------------------------------- */
declare(strict_types=1);

/* Le recapitulatif du soir et les relances n'ont pas besoin d'une tache
   planifiee : la premiere visite venue s'en charge, quelques fois par heure
   seulement, et jamais au point de ralentir la page. */
if (is_readable(__DIR__ . '/admin/noyau.php')) {
    require_once __DIR__ . '/admin/noyau.php';
    try {
        taches_si_besoin();
    } catch (Throwable $e) {
        /* le site s'affiche, quoi qu'il arrive au courrier */
    }
}

$modele = @file_get_contents(__DIR__ . '/modele.html');
if ($modele === false) {
    http_response_code(500);
    exit('Page indisponible.');
}

/* Le site repond sur chez-eva.ch comme sur l'ancien domaine : les balises
   canoniques et de partage suivent l'adresse par laquelle on arrive. */
/* La langue demandee par l'adresse, sinon celle du navigateur : le site
   s'ouvre dans la langue du visiteur sans qu'il ait rien a faire. */
$languesConnues = ['fr', 'de', 'en', 'es'];
$langue = 'fr';
if (preg_match('/^[a-z]{2}$/', (string) ($_GET['lang'] ?? ''))
    && in_array($_GET['lang'], $languesConnues, true)) {
    $langue = (string) $_GET['lang'];
} elseif (preg_match_all('/([a-z]{2})(?:-[A-Za-z]{2})?\s*(?:;\s*q=([0-9.]+))?/',
        strtolower((string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '')), $trouves, PREG_SET_ORDER)) {
    foreach ($trouves as $t) {
        if (in_array($t[1], $languesConnues, true)) { $langue = $t[1]; break; }
    }
}

$hote = (string) ($_SERVER['HTTP_HOST'] ?? '');
if (preg_match('/^[A-Za-z0-9.-]+(:\d+)?$/', $hote)) {
    $schema = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $modele = str_replace('https://chez-eva.ch', $schema . '://' . $hote, $modele);
}

$fiches = [];
$json = __DIR__ . '/data/masseuses.json';
if (is_readable($json)) {
    $lu = json_decode((string) file_get_contents($json), true);
    if (is_array($lu)) {
        $fiches = array_values(array_filter($lu, 'is_array'));
    }
}

/* L'etat du salon : ce qui est ferme dans les trois mois, et si la
   reservation en ligne est suspendue. */
$etatSalon = ['suspendue' => false, 'fermetures' => []];
if (function_exists('fermetures_annoncees')) {
    $jours = [];
    foreach (fermetures()['jours'] as $date => $moment) {
        if ($date >= date('Y-m-d')) {
            $jours[] = ['date' => (string) $date, 'moment' => (string) $moment];
        }
    }
    $etatSalon = [
        'actualites'       => function_exists('actualites_publiees') ? actualites_publiees() : [],
        'suspendue'        => reservation_suspendue(),
        'fermetures'       => fermetures_annoncees(),   /* en francais, pour le repli */
        'fermetures_jours' => $jours,                   /* bruts : le site les met en phrases */
    ];
}

/* Une photo retouchee garde le meme nom : sans la date du fichier dans son
   adresse, le navigateur continuerait d'afficher celle qu'il garde en
   memoire -- parfois des jours. */
$versions = [];
foreach (['photos/masseuses', 'photos/salon'] as $dossier) {
    foreach (glob(__DIR__ . '/' . $dossier . '/*') ?: [] as $chemin) {
        if (is_file($chemin)) {
            $versions[$dossier . '/' . basename($chemin)] = (int) filemtime($chemin);
        }
    }
}

/* Les drapeaux HEX empechent qu'un texte de fiche puisse refermer la balise. */
$codage = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT;
$injection = '<script>window.MASSEUSES_SERVEUR = ' . json_encode($fiches, $codage) . ';'
    . 'window.SALON_ETAT = ' . json_encode($etatSalon, $codage) . ';'
    . 'window.LANGUE_SERVEUR = ' . json_encode($langue) . ';'
    . 'window.PHOTOS_VERSIONS = ' . json_encode($versions, $codage) . ';</script>';

$modele = str_replace('<html lang="fr">', '<html lang="' . $langue . '">', $modele);

$modele = str_replace(
    '<script src="js/site.js"></script>',
    $injection . "\n" . '<script src="js/site.js"></script>',
    $modele
);

/* Les navigateurs gardent longtemps les feuilles de style et les scripts en
   memoire. On accroche a leur adresse la date du fichier : apres chaque mise
   a jour l'adresse change, le navigateur telecharge la nouvelle version, et
   le visiteur n'a rien a faire. */
foreach (['assets/styles.css', 'js/contenu.js', 'js/site.js'] as $ressource) {
    $date = @filemtime(__DIR__ . '/' . $ressource);
    if ($date) {
        $modele = str_replace(
            '"' . $ressource . '"',
            '"' . $ressource . '?v=' . $date . '"',
            $modele
        );
    }
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
echo $modele;
