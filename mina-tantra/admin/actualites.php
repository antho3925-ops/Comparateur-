<?php
/* ---------------------------------------------------------------------------
   Chez Eva — le carnet d'actualites
   ---------------------------------------------------------------------------
   Trois lignes de temps en temps : une nouvelle masseuse, une fermeture,
   une prestation qui arrive. Les visiteurs fideles y reviennent, et un
   site qui bouge est mieux vu des moteurs de recherche.

   Le salon ecrit en francais ; les autres langues sont facultatives, et
   le francais s'affiche tant qu'elles sont vides.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const FICHIER_ACTUALITES = RACINE . '/data/actualites.json';
const ACTUALITES_AFFICHEES = 3;

function actualites(): array
{
    if (!is_readable(FICHIER_ACTUALITES)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_ACTUALITES), true);
    if (!is_array($lu)) {
        return [];
    }
    $liste = array_values(array_filter($lu, 'is_array'));
    /* La plus recente d'abord. */
    usort($liste, static fn (array $a, array $b): int => strcmp((string) ($b['date'] ?? ''), (string) ($a['date'] ?? '')));
    return $liste;
}

function ecrire_actualites(array $liste): bool
{
    return (bool) @file_put_contents(
        FICHIER_ACTUALITES,
        json_encode($liste, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

/** Ajoute ou remplace une nouvelle. Rend null si c'est fait. */
function enregistrer_actualite(array $saisie): ?string
{
    fuseau();
    $titre = mb_substr(trim((string) ($saisie['titre'] ?? '')), 0, 90);
    $texte = mb_substr(trim((string) ($saisie['texte'] ?? '')), 0, 600);
    if ($titre === '') {
        return 'Donnez un titre à cette nouvelle.';
    }

    $date = (string) ($saisie['date'] ?? '');
    $morceaux = explode('-', $date);
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)
        || !checkdate((int) ($morceaux[1] ?? 0), (int) ($morceaux[2] ?? 0), (int) ($morceaux[0] ?? 0))) {
        $date = date('Y-m-d');
    }

    $nouvelle = [
        'id'    => (string) ($saisie['id'] ?? '') !== '' ? (string) $saisie['id'] : 'n' . bin2hex(random_bytes(5)),
        'date'  => $date,
        'titre' => $titre,
        'texte' => $texte,
    ];
    foreach (['de', 'en', 'es'] as $langue) {
        $nouvelle['titre_' . $langue] = mb_substr(trim((string) ($saisie['titre_' . $langue] ?? '')), 0, 90);
        $nouvelle['texte_' . $langue] = mb_substr(trim((string) ($saisie['texte_' . $langue] ?? '')), 0, 600);
    }

    $liste = actualites();
    $remplacee = false;
    foreach ($liste as $i => $a) {
        if ((string) ($a['id'] ?? '') === $nouvelle['id']) {
            $liste[$i] = $nouvelle;
            $remplacee = true;
        }
    }
    if (!$remplacee) {
        $liste[] = $nouvelle;
    }

    return ecrire_actualites($liste) ? null : 'Enregistrement impossible.';
}

function supprimer_actualite(string $id): bool
{
    $liste = array_values(array_filter(actualites(), static function (array $a) use ($id): bool {
        return (string) ($a['id'] ?? '') !== $id;
    }));
    return ecrire_actualites($liste);
}

/** Les quelques dernieres, telles que la page publique les recevra. */
function actualites_publiees(int $combien = ACTUALITES_AFFICHEES): array
{
    return array_slice(actualites(), 0, $combien);
}
