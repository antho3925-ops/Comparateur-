<?php
/* ---------------------------------------------------------------------------
   Chez Eva — le battement de coeur
   ---------------------------------------------------------------------------
   Une page minuscule qu'un surveillant exterieur interroge toutes les cinq
   minutes. Elle repond « OK » quand le site tourne vraiment : PHP repond,
   les donnees se lisent, la page publique est en place.

   Un site ne peut pas prevenir qu'il est tombe : c'est au surveillant, qui
   vit ailleurs, de s'en apercevoir. Cette page lui donne de quoi juger.
--------------------------------------------------------------------------- */
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

$soucis = [];

if (!is_readable(__DIR__ . '/modele.html')) {
    $soucis[] = 'page publique introuvable';
}
if (!is_readable(__DIR__ . '/data/parametres.json')) {
    $soucis[] = 'reglages illisibles';
}
if (!is_writable(__DIR__ . '/data')) {
    $soucis[] = 'dossier data non inscriptible';
}

if ($soucis) {
    http_response_code(500);
    echo "PANNE\n" . implode("\n", $soucis) . "\n";
    exit;
}

echo "OK\n";
