<?php
/* ---------------------------------------------------------------------------
   Chez Eva — annuler son rendez-vous
   ---------------------------------------------------------------------------
   Le site ne connait du client que son prenom et son numero : il ne peut
   rien lui envoyer. Le lien d'annulation lui est donc montre a l'ecran
   juste apres sa demande, et il porte une cle que lui seul possede.

   Sans cette cle, cette page ne dit rien et ne fait rien.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

/* Les quelques phrases de cette page, dans les langues du site. */
const PHRASES = [
    'fr' => [
        'titre' => 'Annuler votre rendez-vous',
        'introuvable' => 'Ce lien ne correspond à aucun rendez-vous. Il a peut-être déjà été annulé.',
        'passe' => 'Ce rendez-vous est passé.',
        'deja' => 'Ce rendez-vous est déjà annulé. Vous n’avez rien à faire.',
        'question' => 'Voulez-vous annuler ce rendez-vous ?',
        'bouton' => 'Oui, annuler',
        'garder' => 'Non, le garder',
        'fait' => 'C’est annulé. Le créneau est de nouveau libre. Merci de nous avoir prévenus.',
        'retour' => 'Retour au site',
        'appel' => 'Un empêchement de dernière minute ? Appelez-nous :',
        'jours' => ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        'mois' => ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet',
                   'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    ],
    'de' => [
        'titre' => 'Ihren Termin absagen',
        'introuvable' => 'Zu diesem Link gehört kein Termin. Vielleicht wurde er bereits abgesagt.',
        'passe' => 'Dieser Termin liegt in der Vergangenheit.',
        'deja' => 'Dieser Termin ist bereits abgesagt. Sie müssen nichts tun.',
        'question' => 'Möchten Sie diesen Termin absagen?',
        'bouton' => 'Ja, absagen',
        'garder' => 'Nein, behalten',
        'fait' => 'Abgesagt. Die Zeit ist wieder frei. Danke für die Nachricht.',
        'retour' => 'Zurück zur Seite',
        'appel' => 'Kurzfristig verhindert? Rufen Sie uns an:',
        'jours' => ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
        'mois' => ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli',
                   'August', 'September', 'Oktober', 'November', 'Dezember'],
    ],
    'en' => [
        'titre' => 'Cancel your appointment',
        'introuvable' => 'This link matches no appointment. It may already have been cancelled.',
        'passe' => 'This appointment is in the past.',
        'deja' => 'This appointment is already cancelled. There is nothing to do.',
        'question' => 'Do you want to cancel this appointment?',
        'bouton' => 'Yes, cancel it',
        'garder' => 'No, keep it',
        'fait' => 'Cancelled. The time is free again. Thank you for letting us know.',
        'retour' => 'Back to the site',
        'appel' => 'Something came up at the last minute? Call us:',
        'jours' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        'mois' => ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                   'August', 'September', 'October', 'November', 'December'],
    ],
    'es' => [
        'titre' => 'Anular su cita',
        'introuvable' => 'Este enlace no corresponde a ninguna cita. Quizá ya se haya anulado.',
        'passe' => 'Esta cita ya ha pasado.',
        'deja' => 'Esta cita ya está anulada. No tiene que hacer nada.',
        'question' => '¿Desea anular esta cita?',
        'bouton' => 'Sí, anular',
        'garder' => 'No, mantenerla',
        'fait' => 'Anulada. La hora vuelve a estar libre. Gracias por avisarnos.',
        'retour' => 'Volver al sitio',
        'appel' => '¿Un imprevisto de última hora? Llámenos:',
        'jours' => ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
        'mois' => ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
                   'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
    ],
];

$langue = (string) ($_GET['lang'] ?? $_POST['lang'] ?? '');
if (!isset(PHRASES[$langue])) {
    $langue = 'fr';
}
$dit = PHRASES[$langue];

/** La date du rendez-vous, dans la langue de la page. */
function quand(string $debut, array $dit): string
{
    $t = (int) strtotime($debut);
    return $dit['jours'][(int) date('N', $t) - 1] . ' ' . (int) date('j', $t)
         . ' ' . $dit['mois'][(int) date('n', $t) - 1] . ', ' . date('H:i', $t);
}

/* Le rendez-vous vise, et seulement si la cle correspond. */
$id  = (string) ($_GET['r'] ?? $_POST['r'] ?? '');
$cle = (string) ($_GET['cle'] ?? $_POST['cle'] ?? '');

$rdv = null;
$position = null;
foreach (reservations() as $i => $r) {
    if ((string) ($r['id'] ?? '') === $id
        && ($r['cle'] ?? '') !== ''
        && hash_equals((string) $r['cle'], $cle)) {
        $rdv = $r;
        $position = $i;
    }
}

$message = null;
$aAnnuler = false;

if ($rdv === null) {
    $message = $dit['introuvable'];
} elseif (($rdv['etat'] ?? '') === 'annule') {
    $message = $dit['deja'];
} elseif (strtotime((string) ($rdv['debut'] ?? '')) < time()) {
    $message = $dit['passe'];
} elseif (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $liste = reservations();
    $liste[$position]['etat'] = 'annule';
    $liste[$position]['annule_par_le_client'] = true;
    if (ecrire_reservations($liste)) {
        $message = $dit['fait'];
        try {
            alerte_annulation($liste[$position]);
        } catch (Throwable $e) {
            /* le creneau est libere : le courriel n'est qu'un confort */
        }
    } else {
        $message = $dit['introuvable'];
    }
} else {
    $aAnnuler = true;
}

$salon = parametres();
$tel = (string) ($salon['telephone'] ?? '');
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($langue, ENT_QUOTES) ?>">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title><?= htmlspecialchars($dit['titre'], ENT_QUOTES) ?></title>
<link rel="icon" href="assets/favicon.ico" sizes="any">
<style>
 body{ margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
       background:#120b12; color:#efe6e2; padding:24px; line-height:1.65;
       font:16px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; }
 .carte{ max-width:460px; width:100%; background:#1b1018; border:1px solid rgba(201,162,39,.24);
         border-radius:18px; padding:32px 26px; text-align:center; }
 h1{ font-weight:500; font-size:1.3rem; margin:0 0 18px; color:#e6c766; }
 .quand{ font-size:1.15rem; margin:0 0 6px; }
 .quoi{ color:#b9a9a6; font-size:.94rem; margin:0 0 22px; }
 .actions{ display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }
 .btn{ display:inline-block; padding:13px 24px; border-radius:999px; cursor:pointer;
       border:1px solid #c9a227; background:transparent; color:#e6c766;
       font:inherit; font-size:.8rem; letter-spacing:.14em; text-transform:uppercase;
       text-decoration:none; }
 .btn.plein{ background:#c9a227; color:#1a1208; font-weight:600; }
 .note{ color:#b9a9a6; font-size:.9rem; margin-top:22px; }
 a{ color:#e6c766; }
</style>
</head>
<body>
<div class="carte">
  <h1><?= htmlspecialchars($dit['titre'], ENT_QUOTES) ?></h1>

  <?php if ($aAnnuler): ?>
    <p class="quand"><strong><?= htmlspecialchars(quand((string) $rdv['debut'], $dit), ENT_QUOTES) ?></strong></p>
    <p class="quoi"><?= htmlspecialchars((string) ($rdv['masseuse_nom'] ?? ''), ENT_QUOTES) ?>
       <?= !empty($rdv['prestation']) ? ' · ' . htmlspecialchars((string) $rdv['prestation'], ENT_QUOTES) : '' ?></p>
    <p><?= htmlspecialchars($dit['question'], ENT_QUOTES) ?></p>
    <form method="post" class="actions">
      <input type="hidden" name="r" value="<?= htmlspecialchars($id, ENT_QUOTES) ?>">
      <input type="hidden" name="cle" value="<?= htmlspecialchars($cle, ENT_QUOTES) ?>">
      <input type="hidden" name="lang" value="<?= htmlspecialchars($langue, ENT_QUOTES) ?>">
      <button class="btn plein" type="submit"><?= htmlspecialchars($dit['bouton'], ENT_QUOTES) ?></button>
      <a class="btn" href="./"><?= htmlspecialchars($dit['garder'], ENT_QUOTES) ?></a>
    </form>
  <?php else: ?>
    <p><?= htmlspecialchars((string) $message, ENT_QUOTES) ?></p>
    <div class="actions"><a class="btn" href="./"><?= htmlspecialchars($dit['retour'], ENT_QUOTES) ?></a></div>
  <?php endif; ?>

  <?php if ($tel !== ''): ?>
    <p class="note"><?= htmlspecialchars($dit['appel'], ENT_QUOTES) ?><br>
      <a href="tel:<?= htmlspecialchars(preg_replace('/[^\d+]/', '', $tel) ?? '', ENT_QUOTES) ?>">
        <?= htmlspecialchars($tel, ENT_QUOTES) ?></a></p>
  <?php endif; ?>
</div>
</body>
</html>
