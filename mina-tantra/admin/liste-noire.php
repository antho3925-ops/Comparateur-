<?php
/* ---------------------------------------------------------------------------
   Chez Eva — la liste noire
   ---------------------------------------------------------------------------
   Un numero qui ne se presente jamais, ou un client qu'on ne veut plus
   recevoir : il figure ici, et le site cesse d'accepter ses demandes. Il
   lit un refus neutre, qui ne lui apprend pas qu'il est bloque.

   Seul le numero est garde, reduit a ses chiffres, avec la note que le
   salon a ecrite pour s'en souvenir.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const FICHIER_LISTE_NOIRE = RACINE . '/data/liste-noire.json';

/** Un numero reduit a ses chiffres : « 079 123 45 67 » et « +41791234567 »
    doivent se reconnaitre l'un l'autre. */
function numero_nu(string $telephone): string
{
    $chiffres = preg_replace('/\D/', '', $telephone) ?? '';
    /* Un numero suisse s'ecrit aussi bien 079… que +4179… : on ne garde
       que la fin, qui ne change pas. */
    return substr($chiffres, -9);
}

function liste_noire(): array
{
    if (!is_readable(FICHIER_LISTE_NOIRE)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_LISTE_NOIRE), true);
    return is_array($lu) ? array_values(array_filter($lu, 'is_array')) : [];
}

function ecrire_liste_noire(array $liste): bool
{
    return (bool) @file_put_contents(
        FICHIER_LISTE_NOIRE,
        json_encode($liste, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

function numero_bloque(string $telephone): bool
{
    $nu = numero_nu($telephone);
    if (strlen($nu) < 6) {
        return false;
    }
    foreach (liste_noire() as $b) {
        if ((string) ($b['numero'] ?? '') === $nu) {
            return true;
        }
    }
    return false;
}

/**
 * Bloque un numero et annule ce qui etait prevu avec lui.
 * Rend ['erreur' => ...] ou ['annules' => n].
 */
function bloquer_numero(string $telephone, string $note = ''): array
{
    $nu = numero_nu($telephone);
    if (strlen($nu) < 6) {
        return ['erreur' => 'Ce numéro est trop court pour être bloqué.'];
    }
    if (numero_bloque($telephone)) {
        return ['annules' => 0, 'deja' => true];
    }

    $liste = liste_noire();
    $liste[] = [
        'numero'  => $nu,
        'affiche' => mb_substr(trim($telephone), 0, 25),
        'note'    => mb_substr(trim($note), 0, 120),
        'cree'    => date('c'),
    ];
    if (!ecrire_liste_noire($liste)) {
        return ['erreur' => 'Enregistrement impossible.'];
    }

    /* Ses rendez-vous a venir n'ont plus lieu d'etre : les creneaux se
       rouvrent tout de suite. */
    fuseau();
    $maintenant = date('Y-m-d H:i');
    $rdv = reservations();
    $annules = 0;
    foreach ($rdv as $i => $r) {
        if (numero_nu((string) ($r['telephone'] ?? '')) === $nu
            && (string) ($r['debut'] ?? '') >= $maintenant
            && (string) ($r['etat'] ?? '') !== 'annule') {
            $rdv[$i]['etat'] = 'annule';
            $rdv[$i]['annule_par_le_salon'] = true;
            $annules++;
        }
    }
    if ($annules) {
        ecrire_reservations($rdv);
    }
    return ['annules' => $annules];
}

function debloquer_numero(string $nu): bool
{
    $liste = array_values(array_filter(liste_noire(), static function (array $b) use ($nu): bool {
        return (string) ($b['numero'] ?? '') !== $nu;
    }));
    return ecrire_liste_noire($liste);
}
