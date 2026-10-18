<?php
/* ---------------------------------------------------------------------------
   Chez Eva — le calendrier des rendez-vous
   ---------------------------------------------------------------------------
   Publie les rendez-vous au format iCalendar. Le telephone du salon s'abonne
   une fois a cette adresse : les nouvelles demandes apparaissent ensuite
   toutes seules dans l'agenda.

   L'adresse contient une cle secrete ; sans elle, rien n'est servi.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

/* Deux abonnements possibles : celui du salon, qui voit tout, et celui
   d'une masseuse, qui ne voit que ses heures et rien du client. */
$masseuse = (string) ($_GET['m'] ?? '');
$cle = (string) ($_GET['cle'] ?? '');

if ($masseuse !== '') {
    if (!cle_planning_valide($masseuse, $cle) || fiche($masseuse) === null) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Accès refusé.');
    }
} elseif ($cle === '' || !hash_equals(cle_agenda(), $cle)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    exit('Accès refusé.');
}

/** Les textes iCalendar echappent la virgule, le point-virgule et la barre. */
function texte_ics(string $t): string
{
    $t = str_replace(["\\", "\n", ',', ';'], ['\\\\', '\\n', '\\,', '\;'], $t);
    return trim(preg_replace('/\s+/u', ' ', $t) ?? $t);
}

/** Les dates partent en temps universel : aucun agenda ne s'y trompe. */
function date_ics(string $local): string
{
    $d = new DateTime($local, new DateTimeZone('Europe/Zurich'));
    $d->setTimezone(new DateTimeZone('UTC'));
    return $d->format('Ymd\THis\Z');
}

$salon = parametres();
$nom = (string) ($salon['nom'] ?? 'Chez Eva');
$lieu = trim((string) ($salon['adresse'] ?? '') . ' ' . (string) ($salon['codePostal'] ?? ''));

$lignes = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' . texte_ics($nom) . '//Rendez-vous//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' . texte_ics($masseuse !== ''
        ? $nom . ' — ' . (string) (fiche($masseuse)['prenom'] ?? '')
        : $nom . ' — rendez-vous'),
    'X-WR-TIMEZONE:Europe/Zurich',
    'REFRESH-INTERVAL;VALUE=DURATION:PT15M',
    'X-PUBLISHED-TTL:PT15M',
];

foreach (reservations() as $r) {
    if (($r['etat'] ?? '') === 'annule') {
        continue;   // disparait de l'agenda au prochain rafraichissement
    }
    if ($masseuse !== '' && ($r['masseuse'] ?? '') !== $masseuse) {
        continue;   // l'agenda d'une masseuse ne montre que ses heures
    }
    $attente = ($r['etat'] ?? '') === 'attente';

    /* Une masseuse voit sa prestation, jamais le client. */
    $titre = $masseuse !== ''
        ? (($r['prestation'] ?? '') !== '' ? (string) $r['prestation'] : 'Rendez-vous')
          . ($attente ? ' (à confirmer)' : '')
        : ($r['masseuse_nom'] ?? '') . ' · ' . ($r['prenom'] ?? '')
          . ($attente ? ' (à confirmer)' : '');

    $details = [];
    if (!empty($r['prestation'])) {
        $details[] = $r['prestation']
            . (($masseuse === '' && !empty($r['prix'])) ? ' — ' . $r['prix'] : '');
    }
    if ($masseuse === '' && !empty($r['telephone'])) {
        $details[] = 'Téléphone : ' . $r['telephone'];
    }
    $details[] = $attente ? 'À confirmer avec le client.' : 'Rendez-vous confirmé.';

    $lignes[] = 'BEGIN:VEVENT';
    $lignes[] = 'UID:' . ($r['id'] ?? uniqid()) . '@chez-eva';
    $lignes[] = 'DTSTAMP:' . date_ics((string) ($r['cree'] ?? 'now'));
    $lignes[] = 'SEQUENCE:' . ($attente ? '0' : '1');
    $lignes[] = 'DTSTART:' . date_ics((string) $r['debut']);
    $lignes[] = 'DTEND:' . date_ics((string) $r['fin']);
    $lignes[] = 'SUMMARY:' . texte_ics($titre);
    $lignes[] = 'DESCRIPTION:' . texte_ics(implode("\n", $details));
    if ($lieu !== '') {
        $lignes[] = 'LOCATION:' . texte_ics($lieu);
    }
    $lignes[] = 'STATUS:' . ($attente ? 'TENTATIVE' : 'CONFIRMED');
    $lignes[] = 'END:VEVENT';
}

$lignes[] = 'END:VCALENDAR';

/* La norme limite chaque ligne a 75 octets : au-dela, on la replie en
   commencant la suivante par une espace, sans couper un caractere accentue. */
function replier(string $ligne): string
{
    if (strlen($ligne) <= 73) {
        return $ligne;
    }
    $morceaux = [];
    $courant = '';
    foreach (preg_split('//u', $ligne, -1, PREG_SPLIT_NO_EMPTY) ?: [] as $lettre) {
        if (strlen($courant) + strlen($lettre) > (count($morceaux) ? 72 : 73)) {
            $morceaux[] = $courant;
            $courant = '';
        }
        $courant .= $lettre;
    }
    $morceaux[] = $courant;
    return implode("\r\n ", $morceaux);
}

$lignes = array_map('replier', $lignes);

header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: inline; filename="chez-eva.ics"');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
echo implode("\r\n", $lignes) . "\r\n";
