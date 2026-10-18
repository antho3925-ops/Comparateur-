<?php
/* ---------------------------------------------------------------------------
   Chez Eva — les jours ou le salon n'ouvre pas
   ---------------------------------------------------------------------------
   Vacances, jour ferie, imprevu : une date cochee ici ne propose plus aucun
   creneau, et le site l'annonce dans ses horaires. Une demi-journee se ferme
   aussi bien qu'une journee entiere.

   Un interrupteur separe suspend toute la reservation en ligne sans toucher
   au calendrier : le client voit alors le telephone, et rien d'autre.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const FICHIER_FERMETURES = RACINE . '/data/fermetures.json';
const MIDI               = '12:00';   // la frontiere entre matin et apres-midi
const MOMENTS_FERMETURE  = ['journee', 'matin', 'apresmidi'];

/** Ce qui est ferme, et si la reservation en ligne est suspendue. */
function fermetures(): array
{
    $vide = ['suspendue' => false, 'jours' => []];
    if (!is_readable(FICHIER_FERMETURES)) {
        return $vide;
    }
    $lu = json_decode((string) file_get_contents(FICHIER_FERMETURES), true);
    if (!is_array($lu)) {
        return $vide;
    }

    $jours = [];
    foreach (is_array($lu['jours'] ?? null) ? $lu['jours'] : [] as $j) {
        if (!is_array($j) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($j['date'] ?? ''))) {
            continue;
        }
        $moment = (string) ($j['moment'] ?? 'journee');
        $jours[(string) $j['date']] = in_array($moment, MOMENTS_FERMETURE, true) ? $moment : 'journee';
    }
    ksort($jours);

    return ['suspendue' => !empty($lu['suspendue']), 'jours' => $jours];
}

function ecrire_fermetures(array $etat): bool
{
    $jours = [];
    foreach ($etat['jours'] ?? [] as $date => $moment) {
        $jours[] = ['date' => (string) $date, 'moment' => (string) $moment];
    }
    return (bool) @file_put_contents(
        FICHIER_FERMETURES,
        json_encode(['suspendue' => !empty($etat['suspendue']), 'jours' => $jours],
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

/** Ferme une date, ou une de ses moities. */
function fermer_jour(string $date, string $moment = 'journee'): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return false;
    }
    $etat = fermetures();
    $etat['jours'][$date] = in_array($moment, MOMENTS_FERMETURE, true) ? $moment : 'journee';
    return ecrire_fermetures($etat);
}

function rouvrir_jour(string $date): bool
{
    $etat = fermetures();
    unset($etat['jours'][$date]);
    return ecrire_fermetures($etat);
}

function suspendre_reservation(bool $suspendue): bool
{
    $etat = fermetures();
    $etat['suspendue'] = $suspendue;
    return ecrire_fermetures($etat);
}

function reservation_suspendue(): bool
{
    return (bool) fermetures()['suspendue'];
}

/** Ce qui est ferme ce jour-la : 'journee', 'matin', 'apresmidi' ou ''. */
function fermeture_du_jour(string $date): string
{
    return (string) (fermetures()['jours'][$date] ?? '');
}

/**
 * Retaille une plage d'ouverture selon ce qui est ferme ce jour-la.
 * Rend null quand il ne reste rien a ouvrir.
 */
function appliquer_fermeture(?array $plage, string $date): ?array
{
    if ($plage === null) {
        return null;
    }
    switch (fermeture_du_jour($date)) {
        case 'journee':
            return null;
        case 'matin':
            /* Le matin est ferme : on n'ouvre qu'a partir de midi. */
            return $plage[1] <= MIDI ? null : [max($plage[0], MIDI), $plage[1]];
        case 'apresmidi':
            return $plage[0] >= MIDI ? null : [$plage[0], min($plage[1], MIDI)];
        default:
            return $plage;
    }
}

/* ---------------------------- Ce qu'on en dit ---------------------------- */

const MOMENTS_DITS = ['journee' => '', 'matin' => ', le matin', 'apresmidi' => ', l’après-midi'];

/**
 * Les fermetures a venir, mises en phrases : les journees entieres qui se
 * suivent sont regroupees, « du 24 au 26 décembre ».
 */
function fermetures_annoncees(int $jours = 90): array
{
    fuseau();
    $aujourdhui = date('Y-m-d');
    $limite = date('Y-m-d', strtotime('+' . $jours . ' days'));

    $retenues = [];
    foreach (fermetures()['jours'] as $date => $moment) {
        if ($date >= $aujourdhui && $date <= $limite) {
            $retenues[$date] = $moment;
        }
    }
    if (!$retenues) {
        return [];
    }

    $phrases = [];
    $debut = null;
    $precedent = null;

    $clore = static function () use (&$phrases, &$debut, &$precedent): void {
        if ($debut === null) {
            return;
        }
        $phrases[] = $debut === $precedent
            ? 'Fermé le ' . date_francaise($debut, false)
            : 'Fermé du ' . date_francaise($debut, false) . ' au ' . date_francaise($precedent, false);
        $debut = null;
    };

    foreach ($retenues as $date => $moment) {
        if ($moment !== 'journee') {
            $clore();
            $phrases[] = 'Fermé le ' . date_francaise($date, false) . MOMENTS_DITS[$moment];
            $precedent = null;
            continue;
        }
        if ($debut !== null && $precedent !== null
            && date('Y-m-d', strtotime($precedent . ' +1 day')) === $date) {
            $precedent = $date;
            continue;
        }
        $clore();
        $debut = $date;
        $precedent = $date;
    }
    $clore();

    return $phrases;
}

/** Les rendez-vous deja pris un jour donne : de quoi prevenir avant de fermer. */
function rendez_vous_du_jour(string $date): array
{
    return array_values(array_filter(reservations_triees(), static function (array $r) use ($date): bool {
        return substr((string) ($r['debut'] ?? ''), 0, 10) === $date
            && in_array((string) ($r['etat'] ?? ''), ['attente', 'confirme'], true);
    }));
}
