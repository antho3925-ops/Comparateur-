<?php
/* ---------------------------------------------------------------------------
   Chez Eva — prise de rendez-vous
   ---------------------------------------------------------------------------
   Deux services, appeles par le formulaire du site :
     ?action=creneaux  — les heures encore libres pour une masseuse, un jour
                         et une duree ;
     action=reserver   — enregistre une demande, en attente de confirmation.

   Tout est verifie ici : le client peut envoyer ce qu'il veut, seul le
   serveur decide si un creneau est reellement libre.
--------------------------------------------------------------------------- */
declare(strict_types=1);
require __DIR__ . '/admin/noyau.php';
fuseau();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const FICHIER_LIMITES = RACINE . '/data/limites.json';
const DEMANDES_PAR_JOUR = 8;      // par visiteur
const ATTENTES_PAR_NUMERO = 3;    // demandes non confirmees pour un meme numero

function repondre(array $donnees, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($donnees, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Compte les demandes recentes d'un meme visiteur, sans conserver son adresse. */
function trop_de_demandes(): bool
{
    $empreinte = substr(hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|chez-eva'), 0, 16);
    $table = [];
    if (is_readable(FICHIER_LIMITES)) {
        $lu = json_decode((string) file_get_contents(FICHIER_LIMITES), true);
        if (is_array($lu)) {
            $table = $lu;
        }
    }
    $limite = time() - 86400;
    foreach ($table as $k => $dates) {
        $table[$k] = array_values(array_filter((array) $dates, static fn ($d) => (int) $d > $limite));
        if (!$table[$k]) {
            unset($table[$k]);
        }
    }
    $compte = count($table[$empreinte] ?? []);
    $table[$empreinte][] = time();
    @file_put_contents(FICHIER_LIMITES, json_encode($table), LOCK_EX);
    return $compte >= DEMANDES_PAR_JOUR;
}

/* ------------------------------ Les creneaux ------------------------------ */

if (($_GET['action'] ?? '') === 'creneaux') {
    repondre([
        'creneaux' => creneaux_libres(
            (string) ($_GET['masseuse'] ?? ''),
            (string) ($_GET['date'] ?? ''),
            (int) ($_GET['duree'] ?? 0)
        ),
    ]);
}

/* ------------------------------ La demande -------------------------------- */

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || ($_POST['action'] ?? '') !== 'reserver') {
    repondre(['ok' => false, 'erreur' => 'Requete inattendue.'], 400);
}

/* Champ invisible rempli uniquement par les robots. */
if (trim((string) ($_POST['site'] ?? '')) !== '') {
    repondre(['ok' => true, 'message' => 'Demande enregistrée.']);
}

$masseuse   = (string) ($_POST['masseuse'] ?? '');
$date       = (string) ($_POST['date'] ?? '');
$heure      = (string) ($_POST['heure'] ?? '');
$duree      = (int) ($_POST['duree'] ?? 0);
$prestation = mb_substr(trim((string) ($_POST['prestation'] ?? '')), 0, 80);
$prix       = mb_substr(trim((string) ($_POST['prix'] ?? '')), 0, 20);
$prenom     = mb_substr(trim((string) ($_POST['prenom'] ?? '')), 0, 40);
$telephone  = mb_substr(trim((string) ($_POST['telephone'] ?? '')), 0, 25);

if ($prenom === '' || mb_strlen($prenom) < 2) {
    repondre(['ok' => false, 'erreur' => 'Merci d’indiquer un prénom.'], 422);
}
if (strlen(preg_replace('/\D/', '', $telephone) ?? '') < 9) {
    repondre(['ok' => false, 'erreur' => 'Le numéro de téléphone semble incomplet.'], 422);
}
if (!preg_match('/^\d{2}:\d{2}$/', $heure)) {
    repondre(['ok' => false, 'erreur' => 'Créneau invalide.'], 422);
}

$fiche = fiche($masseuse);
if ($fiche === null) {
    repondre(['ok' => false, 'erreur' => 'Cette masseuse n’est pas disponible.'], 422);
}

/* Le creneau demande doit figurer parmi ceux que le serveur juge libres :
   c'est ce qui empeche de reserver la nuit, trop tot, ou par-dessus un autre. */
if (!in_array($heure, creneaux_libres($masseuse, $date, $duree), true)) {
    repondre(['ok' => false, 'erreur' => 'Ce créneau vient d’être pris. Choisissez-en un autre.'], 409);
}

$liste = reservations();

$enAttente = 0;
foreach ($liste as $r) {
    if (($r['etat'] ?? '') === 'attente'
        && preg_replace('/\D/', '', (string) ($r['telephone'] ?? '')) === preg_replace('/\D/', '', $telephone)) {
        $enAttente++;
    }
}
if ($enAttente >= ATTENTES_PAR_NUMERO) {
    repondre(['ok' => false, 'erreur' => 'Vous avez déjà plusieurs demandes en attente. Appelez-nous.'], 429);
}

if (trop_de_demandes()) {
    repondre(['ok' => false, 'erreur' => 'Trop de demandes depuis cet appareil. Appelez-nous.'], 429);
}

$debut = (int) strtotime($date . ' ' . $heure);
$liste[] = [
    'id'           => 'r' . bin2hex(random_bytes(6)),
    'cree'         => date('c'),
    'masseuse'     => $masseuse,
    'masseuse_nom' => (string) ($fiche['prenom'] ?? ''),
    'prestation'   => $prestation !== '' ? $prestation : 'À définir',
    'prix'         => $prix,
    'duree'        => $duree,
    'debut'        => date('Y-m-d H:i', $debut),
    'fin'          => date('Y-m-d H:i', $debut + $duree * 60),
    'prenom'       => $prenom,
    'telephone'    => $telephone,
    'etat'         => 'attente',
];

if (!ecrire_reservations($liste)) {
    repondre(['ok' => false, 'erreur' => 'Enregistrement impossible. Appelez-nous.'], 500);
}

repondre([
    'ok' => true,
    'message' => 'Demande enregistrée. Nous vous rappelons rapidement pour confirmer.',
]);
