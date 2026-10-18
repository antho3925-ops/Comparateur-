<?php
/* ---------------------------------------------------------------------------
   Chez Eva — la caisse et le decompte
   ---------------------------------------------------------------------------
   Ce qui a ete encaisse est note sur le rendez-vous lui-meme : un montant,
   un moyen de paiement. Le decompte rassemble ensuite la semaine, masseuse
   par masseuse, et pose les deux chiffres cote a cote : ce qui etait prevu
   d'apres les tarifs, et ce qui est reellement entre en caisse.

   La part de chaque masseuse se regle sur sa fiche : elles ne travaillent
   pas toutes aux memes conditions.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const PART_PAR_DEFAUT = 50;              // pourcentage revenant a la masseuse
const MOYENS = ['especes' => 'Espèces', 'twint' => 'Twint', 'autre' => 'Autre'];

/** Le pourcentage qui revient a la masseuse, d'apres sa fiche. */
function part_masseuse(?array $f): int
{
    $part = (int) ($f['part'] ?? PART_PAR_DEFAUT);
    return max(0, min(100, $part));
}

/** « CHF 300.– » vaut 300. Rend 0 quand il n'y a pas de chiffre. */
function montant_prix(string $texte): float
{
    $propre = preg_replace('/[^\d.,]/', '', $texte) ?? '';
    $propre = str_replace(',', '.', $propre);
    /* « 300.– » laisse un point final : on ne garde que le nombre. */
    if (preg_match('/\d+(?:\.\d{1,2})?/', $propre, $trouve)) {
        return (float) $trouve[0];
    }
    return 0.0;
}

/** Note ce qui est entre en caisse pour un rendez-vous. */
function encaisser(string $id, string $montant, string $moyen): ?string
{
    $valeur = montant_prix($montant);
    if ($valeur <= 0) {
        return 'Montant invalide.';
    }
    if (!array_key_exists($moyen, MOYENS)) {
        $moyen = 'autre';
    }

    $liste = reservations();
    $trouve = false;
    foreach ($liste as $i => $r) {
        if ((string) ($r['id'] ?? '') === $id) {
            $liste[$i]['encaisse'] = [
                'montant' => $valeur,
                'moyen'   => $moyen,
                'quand'   => date('c'),
            ];
            /* Un rendez-vous paye est un rendez-vous honore. */
            if (($liste[$i]['etat'] ?? '') === 'attente') {
                $liste[$i]['etat'] = 'confirme';
            }
            $trouve = true;
        }
    }
    if (!$trouve) {
        return 'Rendez-vous introuvable.';
    }
    return ecrire_reservations($liste) ? null : 'Enregistrement impossible.';
}

/** Efface une saisie de caisse (on s'est trompe de ligne). */
function annuler_encaissement(string $id): bool
{
    $liste = reservations();
    foreach ($liste as $i => $r) {
        if ((string) ($r['id'] ?? '') === $id) {
            unset($liste[$i]['encaisse']);
        }
    }
    return ecrire_reservations($liste);
}

/** Le lundi de la semaine qui contient cette date. */
function lundi_de(string $date): string
{
    fuseau();
    $t = strtotime($date);
    if ($t === false) {
        $t = time();
    }
    return date('Y-m-d', strtotime('monday this week', $t));
}

/**
 * Le decompte d'une periode : une ligne par masseuse, plus un total.
 * « prevu » vient des tarifs, « encaisse » de ce que le salon a saisi.
 */
function decompte(string $du, string $au): array
{
    fuseau();
    $lignes = [];

    foreach (reservations() as $r) {
        $jour = substr((string) ($r['debut'] ?? ''), 0, 10);
        if ($jour < $du || $jour > $au) {
            continue;
        }
        if ((string) ($r['etat'] ?? '') !== 'confirme') {
            continue;       /* ni les demandes en attente, ni les annulations */
        }

        $id = (string) ($r['masseuse'] ?? '');
        if (!isset($lignes[$id])) {
            $f = fiche($id);
            $lignes[$id] = [
                'prenom'    => (string) ($r['masseuse_nom'] ?? $id),
                'part'      => part_masseuse($f),
                'rdv'       => 0,
                'prevu'     => 0.0,
                'encaisse'  => 0.0,
                'especes'   => 0.0,
                'twint'     => 0.0,
                'sans_saisie' => 0,
            ];
        }

        $lignes[$id]['rdv']++;
        $lignes[$id]['prevu'] += montant_prix((string) ($r['prix'] ?? ''));

        if (isset($r['encaisse']['montant'])) {
            $montant = (float) $r['encaisse']['montant'];
            $lignes[$id]['encaisse'] += $montant;
            $moyen = (string) ($r['encaisse']['moyen'] ?? 'autre');
            if ($moyen === 'especes' || $moyen === 'twint') {
                $lignes[$id][$moyen] += $montant;
            }
        } else {
            $lignes[$id]['sans_saisie']++;
        }
    }

    /* La part de chacun se calcule sur ce qui est reellement entre. */
    foreach ($lignes as $id => $l) {
        $lignes[$id]['pour_elle'] = round($l['encaisse'] * $l['part'] / 100, 2);
        $lignes[$id]['pour_le_salon'] = round($l['encaisse'] - $lignes[$id]['pour_elle'], 2);
    }

    uasort($lignes, static fn (array $a, array $b): int => $b['encaisse'] <=> $a['encaisse']);
    return $lignes;
}

/** Un montant tel qu'on l'ecrit en Suisse. */
function francs(float $montant): string
{
    return number_format($montant, 2, '.', '’');
}

/* --------------------- Le planning d'une masseuse ----------------------- */

/**
 * La cle secrete du planning d'une masseuse : l'adresse qu'elle seule
 * connait, et qui ne montre que ses heures.
 */
function cle_planning(string $id): string
{
    $c = config();
    if (empty($c['cles_planning'][$id])) {
        $c['cles_planning'][$id] = bin2hex(random_bytes(12));
        ecrire_config($c);
    }
    return (string) $c['cles_planning'][$id];
}

function renouveler_cle_planning(string $id): string
{
    $c = config();
    $c['cles_planning'][$id] = bin2hex(random_bytes(12));
    ecrire_config($c);
    return (string) $c['cles_planning'][$id];
}

/** Vrai si cette cle est bien celle de cette masseuse. */
function cle_planning_valide(string $id, string $cle): bool
{
    $attendue = (string) (config()['cles_planning'][$id] ?? '');
    return $attendue !== '' && hash_equals($attendue, $cle);
}

/** Les rendez-vous a venir d'une masseuse, sans rien du client. */
function journees_masseuse(string $id, int $jours = 21): array
{
    fuseau();
    $aujourdhui = date('Y-m-d');
    $limite = date('Y-m-d', strtotime('+' . $jours . ' days'));

    $par_jour = [];
    foreach (reservations_triees() as $r) {
        if ((string) ($r['masseuse'] ?? '') !== $id) {
            continue;
        }
        if ((string) ($r['etat'] ?? '') === 'annule') {
            continue;
        }
        $jour = substr((string) ($r['debut'] ?? ''), 0, 10);
        if ($jour < $aujourdhui || $jour > $limite) {
            continue;
        }
        $par_jour[$jour][] = [
            'debut'      => date('H:i', (int) strtotime((string) $r['debut'])),
            'fin'        => date('H:i', (int) strtotime((string) $r['fin'])),
            'duree'      => (int) ($r['duree'] ?? 0),
            'prestation' => (string) ($r['prestation'] ?? ''),
            'attente'    => (string) ($r['etat'] ?? '') === 'attente',
        ];
    }
    return $par_jour;
}
