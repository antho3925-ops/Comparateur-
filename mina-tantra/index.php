<?php
/* ---------------------------------------------------------------------------
   Chez Eva — page publique
   ---------------------------------------------------------------------------
   Prend la page modele.html, y injecte les fiches des masseuses telles que
   l'administration les a enregistrees, et envoie le tout au visiteur.
   Aucune base de donnees : les fiches vivent dans data/masseuses.json.
--------------------------------------------------------------------------- */
declare(strict_types=1);

$modele = @file_get_contents(__DIR__ . '/modele.html');
if ($modele === false) {
    http_response_code(500);
    exit('Page indisponible.');
}

/* Le site repond sur chez-eva.ch comme sur l'ancien domaine : les balises
   canoniques et de partage suivent l'adresse par laquelle on arrive. */
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

/* Les drapeaux HEX empechent qu'un texte de fiche puisse refermer la balise. */
$injection = '<script>window.MASSEUSES_SERVEUR = '
    . json_encode($fiches, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT)
    . ';</script>';

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
