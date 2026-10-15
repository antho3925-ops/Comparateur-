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

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
echo str_replace(
    '<script src="js/site.js"></script>',
    $injection . "\n" . '<script src="js/site.js"></script>',
    $modele
);
