<?php
/* ---------------------------------------------------------------------------
   Chez Eva — administration : les fonctions communes
   ---------------------------------------------------------------------------
   Mot de passe, session, jeton anti-falsification, lecture et ecriture des
   fiches, reception et redimensionnement des photos.
--------------------------------------------------------------------------- */
declare(strict_types=1);

/* Le site demande PHP 7.4 au minimum. Sur plus ancien, mieux vaut une
   phrase lisible qu'une page blanche. */
if (PHP_VERSION_ID < 70400) {
    header('Content-Type: text/plain; charset=utf-8');
    exit("Ce site demande PHP 7.4 ou plus récent. Votre hébergement est en "
        . PHP_VERSION . " : changez la version de PHP dans son panneau de configuration.");
}

const RACINE        = __DIR__ . '/..';
const FICHIER_FICHES = RACINE . '/data/masseuses.json';
const FICHIER_CONFIG = RACINE . '/data/config.json';
const DOSSIER_PHOTOS = RACINE . '/photos/masseuses';
const LARGEUR_MAX    = 1200;          // les photos sont reduites a cette taille
const POIDS_MAX      = 12582912;      // 12 Mo acceptes en entree, avant reduction
const DUREE_SESSION  = 2592000;       // un mois : l'application reste ouverte

/* ------------------------------- Session --------------------------------- */

function demarrer_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    /* Posee sur l'ecran d'accueil du telephone, l'administration doit se
       rouvrir sans redemander le mot de passe a chaque fois : la session
       tient un mois. */
    @ini_set('session.gc_maxlifetime', (string) DUREE_SESSION);
    session_set_cookie_params([
        'lifetime' => DUREE_SESSION,
        'httponly' => true,
        'samesite' => 'Lax',
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    ]);
    session_name('chezeva_admin');
    session_start();
}

/* ------------------------------ Configuration ---------------------------- */

function config(): array
{
    if (!is_readable(FICHIER_CONFIG)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_CONFIG), true);
    return is_array($lu) ? $lu : [];
}

function ecrire_config(array $config): bool
{
    return (bool) @file_put_contents(
        FICHIER_CONFIG,
        json_encode($config, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
        LOCK_EX
    );
}

/** Le nom d'utilisateur attendu a la connexion. */
function utilisateur(): string
{
    $u = trim((string) (config()['utilisateur'] ?? ''));
    return $u !== '' ? $u : 'eva';
}

function definir_utilisateur(string $nom): ?string
{
    $nom = trim($nom);
    if ($nom === '' || mb_strlen($nom) < 2) {
        return "Le nom d'utilisateur doit faire au moins 2 caractères.";
    }
    $c = config();
    $c['utilisateur'] = $nom;
    return ecrire_config($c) ? null : "Impossible d'écrire data/config.json (droits du dossier).";
}

function mot_de_passe_defini(): bool
{
    $c = config();
    return isset($c['motdepasse']) && is_string($c['motdepasse']) && $c['motdepasse'] !== '';
}

function definir_mot_de_passe(string $clair): ?string
{
    if (mb_strlen($clair) < 8) {
        return 'Le mot de passe doit faire au moins 8 caractères.';
    }
    $c = config();
    $c['motdepasse'] = password_hash($clair, PASSWORD_DEFAULT);
    $c['cree'] = date('c');
    return ecrire_config($c) ? null : "Impossible d'écrire data/config.json (droits du dossier).";
}

/* -------------------------------- Connexion ------------------------------- */

function est_connecte(): bool
{
    demarrer_session();
    return !empty($_SESSION['connecte']);
}

function exiger_connexion(): void
{
    if (!est_connecte()) {
        header('Location: index.php?p=connexion');
        exit;
    }
}

/** Freine les essais successifs : au-dela de 5 echecs, une minute d'attente. */
function attente_restante(): int
{
    $c = config();
    $echecs = (int) ($c['echecs'] ?? 0);
    $dernier = (int) ($c['dernier_echec'] ?? 0);
    if ($echecs < 5) {
        return 0;
    }
    return max(0, 60 - (time() - $dernier));
}

function connexion(string $nom, string $clair): ?string
{
    if (($reste = attente_restante()) > 0) {
        return "Trop d'essais. Réessayez dans $reste secondes.";
    }
    $c = config();
    $bonNom = hash_equals(mb_strtolower(utilisateur()), mb_strtolower(trim($nom)));
    if (!$bonNom || !password_verify($clair, (string) ($c['motdepasse'] ?? ''))) {
        $c['echecs'] = (int) ($c['echecs'] ?? 0) + 1;
        $c['dernier_echec'] = time();
        ecrire_config($c);
        return 'Identifiants incorrects.';
    }
    $c['echecs'] = 0;
    ecrire_config($c);
    demarrer_session();
    session_regenerate_id(true);
    $_SESSION['connecte'] = true;
    return null;
}

function deconnexion(): void
{
    demarrer_session();
    $_SESSION = [];
    session_destroy();
}

/* ---------------------- Jeton anti-falsification (CSRF) ------------------- */

function jeton(): string
{
    demarrer_session();
    if (empty($_SESSION['jeton'])) {
        $_SESSION['jeton'] = bin2hex(random_bytes(16));
    }
    return $_SESSION['jeton'];
}

function verifier_jeton(): void
{
    demarrer_session();
    $envoye = (string) ($_POST['jeton'] ?? '');
    if ($envoye === '' || !hash_equals((string) ($_SESSION['jeton'] ?? ''), $envoye)) {
        http_response_code(400);
        exit('Formulaire expiré. Revenez en arrière et recommencez.');
    }
}

/* --------------------------------- Fiches --------------------------------- */

function fiches(): array
{
    if (!is_readable(FICHIER_FICHES)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_FICHES), true);
    return is_array($lu) ? array_values(array_filter($lu, 'is_array')) : [];
}

function ecrire_fiches(array $fiches): bool
{
    return (bool) @file_put_contents(
        FICHIER_FICHES,
        json_encode(array_values($fiches), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

function fiche(string $id): ?array
{
    foreach (fiches() as $f) {
        if (($f['id'] ?? '') === $id) {
            return $f;
        }
    }
    return null;
}

/** Transforme un prenom en identifiant utilisable dans un nom de fichier. */
function identifiant(string $texte, array $pris = []): string
{
    $sans_accent = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $texte);
    $base = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', (string) $sans_accent));
    $base = trim((string) $base, '-');
    if ($base === '') {
        $base = 'fiche';
    }
    $id = $base;
    $n = 2;
    while (in_array($id, $pris, true)) {
        $id = $base . '-' . $n++;
    }
    return $id;
}

/* --------------------------------- Photos --------------------------------- */

function dossier_photos_pret(): bool
{
    if (!is_dir(DOSSIER_PHOTOS)) {
        @mkdir(DOSSIER_PHOTOS, 0775, true);
    }
    return is_dir(DOSSIER_PHOTOS) && is_writable(DOSSIER_PHOTOS);
}

/**
 * Verifie une photo envoyee, la reduit et l'enregistre en JPEG.
 * Renvoie le chemin relatif au site, ou un message d'erreur.
 */
function enregistrer_photo(array $envoi, string $id): array
{
    if (($envoi['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return ['erreur' => null, 'chemin' => null];
    }
    if ($envoi['error'] !== UPLOAD_ERR_OK) {
        return ['erreur' => 'Envoi interrompu (fichier trop lourd ?).', 'chemin' => null];
    }
    if (($envoi['size'] ?? 0) > POIDS_MAX) {
        return ['erreur' => 'Photo trop lourde (12 Mo maximum).', 'chemin' => null];
    }
    if (!is_uploaded_file($envoi['tmp_name'])) {
        return ['erreur' => 'Envoi invalide.', 'chemin' => null];
    }

    $info = @getimagesize($envoi['tmp_name']);
    $types = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP];
    if ($info === false || !in_array($info[2], $types, true)) {
        return ['erreur' => 'Seules les photos JPEG, PNG ou WEBP sont acceptées.', 'chemin' => null];
    }

    if (!dossier_photos_pret()) {
        return ['erreur' => 'Le dossier photos/masseuses n\'est pas accessible en écriture.', 'chemin' => null];
    }

    $nom = $id . '-' . substr(bin2hex(random_bytes(4)), 0, 6) . '.jpg';
    $destination = DOSSIER_PHOTOS . '/' . $nom;

    if (function_exists('imagecreatefromstring')) {
        $source = @imagecreatefromstring((string) file_get_contents($envoi['tmp_name']));
        if ($source === false) {
            return ['erreur' => 'Photo illisible.', 'chemin' => null];
        }
        $l = imagesx($source);
        $h = imagesy($source);
        $ratio = min(1, LARGEUR_MAX / max($l, $h));
        $nl = max(1, (int) round($l * $ratio));
        $nh = max(1, (int) round($h * $ratio));
        $reduite = imagecreatetruecolor($nl, $nh);
        imagefill($reduite, 0, 0, imagecolorallocate($reduite, 255, 255, 255));
        imagecopyresampled($reduite, $source, 0, 0, 0, 0, $nl, $nh, $l, $h);
        poser_filigrane($reduite);
        $ok = imagejpeg($reduite, $destination, 85);
        imagedestroy($source);
        imagedestroy($reduite);
        if (!$ok) {
            return ['erreur' => 'Enregistrement de la photo impossible.', 'chemin' => null];
        }
    } else {
        /* Serveur sans bibliotheque d'images : on garde le fichier tel quel. */
        if (!move_uploaded_file($envoi['tmp_name'], $destination)) {
            return ['erreur' => 'Enregistrement de la photo impossible.', 'chemin' => null];
        }
    }

    @chmod($destination, 0664);
    /* Elle porte deja sa marque : la passe sur les anciennes photos doit
       la laisser tranquille. */
    noter_photo_marquee('photos/masseuses/' . $nom);
    return ['erreur' => null, 'chemin' => 'photos/masseuses/' . $nom];
}

/**
 * Efface tout ce qui reste d'une masseuse sur le serveur : ses photos, y
 * compris celles qui ne figurent plus dans sa fiche, et la cle de son
 * planning. Les rendez-vous, eux, restent : ils tiennent la comptabilite
 * du salon, et ne portent que son prenom.
 *
 * Rend ce qui a ete fait, pour pouvoir le dire.
 */
function effacer_masseuse(string $id): array
{
    $photos = 0;
    foreach (glob(DOSSIER_PHOTOS . '/' . $id . '-*') ?: [] as $fichier) {
        if (is_file($fichier) && @unlink($fichier)) {
            $photos++;
        }
    }

    $c = config();
    if (isset($c['cles_planning'][$id])) {
        unset($c['cles_planning'][$id]);
        ecrire_config($c);
    }

    $aVenir = 0;
    $maintenant = date('Y-m-d H:i');
    foreach (reservations() as $r) {
        if (($r['masseuse'] ?? '') === $id
            && (string) ($r['debut'] ?? '') >= $maintenant
            && (string) ($r['etat'] ?? '') !== 'annule') {
            $aVenir++;
        }
    }

    return ['photos' => $photos, 'a_venir' => $aVenir];
}

/** Supprime une photo du disque, en refusant tout chemin sortant du dossier. */
function supprimer_photo(string $chemin): void
{
    /* strpos plutot que str_starts_with : le site tourne ainsi sur un
       hebergement reste en PHP 7, sans rien perdre en surete. */
    if (strpos($chemin, 'photos/masseuses/') !== 0 || strpos($chemin, '..') !== false) {
        return;
    }
    $absolu = realpath(RACINE . '/' . $chemin);
    $dossier = realpath(DOSSIER_PHOTOS);
    if ($absolu && $dossier && strpos($absolu, $dossier) === 0) {
        @unlink($absolu);
    }
}

/** Place occupée par le site, pour surveiller le quota de l'hebergement. */
function espace_utilise(): int
{
    $total = 0;
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator(RACINE, FilesystemIterator::SKIP_DOTS)
    );
    foreach ($it as $f) {
        if ($f->isFile()) {
            $total += $f->getSize();
        }
    }
    return $total;
}

function proteger(string $texte): string
{
    return htmlspecialchars($texte, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/* ===========================================================================
   LES RENDEZ-VOUS
   ===========================================================================
   Pas de base de donnees : les demandes vivent dans data/reservations.json,
   que seul le serveur lit. Chaque rendez-vous occupe un creneau pour une
   masseuse donnee, et attend d'etre confirme par le salon.
========================================================================== */

const FICHIER_RESERVATIONS = RACINE . '/data/reservations.json';
const FICHIER_PARAMETRES   = RACINE . '/data/parametres.json';
const PAS_MINUTES          = 15;   // les rendez-vous commencent tous les quarts d'heure
const DELAI_MINIMUM_HEURES = 2;    // on ne reserve pas pour dans dix minutes
const JOURS_RESERVABLES    = 30;   // on ne reserve pas pour dans six mois
const DUREES_ADMISES       = [30, 40, 45, 60, 90, 120];
const RETENTION_JOURS      = 30;   // au-dela, les coordonnees du client sont effacees
const CABINES              = 2;    // le salon ne peut recevoir que deux clients a la fois

function fuseau(): void
{
    date_default_timezone_set('Europe/Zurich');
}

function reservations(): array
{
    if (!is_readable(FICHIER_RESERVATIONS)) {
        return [];
    }
    $lu = json_decode((string) file_get_contents(FICHIER_RESERVATIONS), true);
    return is_array($lu) ? array_values(array_filter($lu, 'is_array')) : [];
}

/**
 * Enregistre la liste, en oubliant au passage les rendez-vous trop anciens :
 * garder le numero de telephone d'un client des mois durant n'a aucun interet.
 */
function ecrire_reservations(array $liste): bool
{
    fuseau();
    $limite = date('Y-m-d', strtotime('-' . RETENTION_JOURS . ' days'));
    $gardees = array_values(array_filter($liste, static function (array $r) use ($limite): bool {
        return substr((string) ($r['debut'] ?? ''), 0, 10) >= $limite;
    }));

    return (bool) @file_put_contents(
        FICHIER_RESERVATIONS,
        json_encode($gardees, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n",
        LOCK_EX
    );
}

/**
 * Les reglages tires de data/contenu.js au moment de fabriquer le paquet :
 * nom et adresse du salon, heures d'ouverture. Le site reste ainsi pilote
 * par un seul fichier, meme pour la partie serveur.
 */
function parametres(): array
{
    static $cache = null;
    if ($cache !== null) {
        return $cache;
    }
    $cache = [];
    if (is_readable(FICHIER_PARAMETRES)) {
        $lu = json_decode((string) file_get_contents(FICHIER_PARAMETRES), true);
        if (is_array($lu)) {
            $cache = $lu;
        }
    }
    return $cache;
}

/** Les heures d'ouverture du jour demande, ou null si le salon est ferme. */
function horaires_du_jour(string $date): ?array
{
    $defaut = ['09:00', '22:00'];
    $table = parametres()['horaires'] ?? [];
    if (!is_array($table) || !$table) {
        return appliquer_fermeture($defaut, $date);
    }

    $jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    $nom = $jours[(int) date('N', (int) strtotime($date)) - 1];
    if (!array_key_exists($nom, $table)) {
        return appliquer_fermeture($defaut, $date);
    }
    $plage = $table[$nom];
    $plage = (is_array($plage) && count($plage) === 2) ? $plage : null;

    /* Une date fermee, en entier ou pour une demi-journee, retaille la plage. */
    return appliquer_fermeture($plage, $date);
}

/** Vrai si la masseuse travaille ce jour-la, d'apres sa fiche. */
function masseuse_presente(array $f, string $date): bool
{
    if (empty($f['disponible'])) {
        return false;
    }
    if (!empty($f['debut']) && $date < (string) $f['debut']) {
        return false;
    }
    if (!empty($f['fin']) && $date > (string) $f['fin']) {
        return false;
    }
    return true;
}

/**
 * Les debuts de rendez-vous encore libres, pour une masseuse, un jour et une
 * duree. Tient compte des heures d'ouverture, des rendez-vous deja pris et du
 * delai minimum avant le premier creneau.
 */
function creneaux_libres(string $masseuse, string $date, int $duree): array
{
    fuseau();

    if (reservation_suspendue()) {
        return [];
    }
    if (!in_array($duree, DUREES_ADMISES, true)) {
        return [];
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return [];
    }
    $aujourdhui = date('Y-m-d');
    if ($date < $aujourdhui || $date > date('Y-m-d', strtotime('+' . JOURS_RESERVABLES . ' days'))) {
        return [];
    }

    $fiche = fiche($masseuse);
    if ($fiche === null || !masseuse_presente($fiche, $date)) {
        return [];
    }

    $plage = horaires_du_jour($date);
    if ($plage === null) {
        return [];
    }

    $ouverture = (int) strtotime($date . ' ' . $plage[0]);
    $fermeture = (int) strtotime($date . ' ' . $plage[1]);
    $plancher  = time() + DELAI_MINIMUM_HEURES * 3600;

    /* Les rendez-vous du jour : ceux de cette masseuse, qu'elle ne peut pas
       cumuler, et tous les autres, qui occupent une cabine. */
    $siens = [];
    $toutes = [];
    foreach (reservations() as $r) {
        if (($r['etat'] ?? '') === 'annule') {
            continue;
        }
        if (substr((string) ($r['debut'] ?? ''), 0, 10) !== $date) {
            continue;
        }
        $creneau = [(int) strtotime((string) $r['debut']), (int) strtotime((string) $r['fin'])];
        $toutes[] = $creneau;
        if (($r['masseuse'] ?? '') === $masseuse) {
            $siens[] = $creneau;
        }
    }

    $chevauche = static function (int $debut, int $fin, array $creneaux): int {
        $n = 0;
        foreach ($creneaux as [$d, $f]) {
            if ($debut < $f && $fin > $d) {
                $n++;
            }
        }
        return $n;
    };

    /* Un rendez-vous peut commencer jusqu'a l'heure de fermeture : le dernier
       de la journee se termine donc apres, comme au salon. */
    $libres = [];
    for ($t = $ouverture; $t <= $fermeture; $t += PAS_MINUTES * 60) {
        if ($t < $plancher) {
            continue;
        }
        $fin = $t + $duree * 60;

        /* Elle ne peut pas etre a deux endroits, et le salon n'a que
           CABINES cabines : au-dela, le creneau n'est plus proposable. */
        if ($chevauche($t, $fin, $siens) > 0) {
            continue;
        }
        if ($chevauche($t, $fin, $toutes) >= CABINES) {
            continue;
        }
        $libres[] = date('H:i', $t);
    }
    return $libres;
}

/** La cle secrete du calendrier, creee au premier besoin. */
function cle_agenda(): string
{
    $c = config();
    if (empty($c['cle_agenda'])) {
        $c['cle_agenda'] = bin2hex(random_bytes(16));
        ecrire_config($c);
    }
    return (string) $c['cle_agenda'];
}

function renouveler_cle_agenda(): string
{
    $c = config();
    $c['cle_agenda'] = bin2hex(random_bytes(16));
    ecrire_config($c);
    return (string) $c['cle_agenda'];
}

/** L'adresse du site, telle que le navigateur y accede. */
function adresse_site(): string
{
    $hote = (string) ($_SERVER['HTTP_HOST'] ?? 'chez-eva.ch');
    $schema = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    return $schema . '://' . $hote;
}

/** Combien de demandes attendent une reponse. */
function demandes_en_attente(): int
{
    return count(array_filter(reservations(), static fn (array $r): bool => ($r['etat'] ?? '') === 'attente'));
}

/**
 * Pose un rendez-vous depuis l'administration : un client qui a telephone,
 * ou simplement une plage ou la masseuse n'est pas disponible.
 *
 * Le salon sait ce qu'il fait : un chevauchement est signale, jamais refuse.
 * Rend ['erreur' => ...] si la saisie ne tient pas debout, sinon
 * ['avertissement' => ...|null] une fois le rendez-vous enregistre.
 */
function poser_rendez_vous(array $saisie): array
{
    fuseau();

    $masseuse = (string) ($saisie['masseuse'] ?? '');
    $date     = (string) ($saisie['date'] ?? '');
    $heure    = (string) ($saisie['heure'] ?? '');
    $duree    = (int) ($saisie['duree'] ?? 0);

    $fiche = fiche($masseuse);
    if ($fiche === null) {
        return ['erreur' => 'Choisissez une masseuse.'];
    }
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        return ['erreur' => 'Date invalide.'];
    }
    if (!preg_match('/^\d{2}:\d{2}$/', $heure)) {
        return ['erreur' => 'Heure invalide.'];
    }
    if (!in_array($duree, DUREES_ADMISES, true)) {
        return ['erreur' => 'Durée invalide.'];
    }

    $debut = (int) strtotime($date . ' ' . $heure);
    $fin   = $debut + $duree * 60;

    $verrou = verrou_reservations();

    /* Ce qui occupe deja ce moment-la : elle d'abord, les cabines ensuite. */
    $elle = 0;
    $cabines = 0;
    foreach (reservations() as $r) {
        if (($r['etat'] ?? '') === 'annule') {
            continue;
        }
        $d = (int) strtotime((string) ($r['debut'] ?? ''));
        $f = (int) strtotime((string) ($r['fin'] ?? ''));
        if ($debut < $f && $fin > $d) {
            $cabines++;
            if (($r['masseuse'] ?? '') === $masseuse) {
                $elle++;
            }
        }
    }

    $prenom = mb_substr(trim((string) ($saisie['prenom'] ?? '')), 0, 40);
    $liste = reservations();
    $liste[] = [
        'id'           => 'r' . bin2hex(random_bytes(6)),
        'cree'         => date('c'),
        'masseuse'     => $masseuse,
        'masseuse_nom' => (string) ($fiche['prenom'] ?? ''),
        'prestation'   => mb_substr(trim((string) ($saisie['prestation'] ?? '')), 0, 80),
        'prix'         => mb_substr(trim((string) ($saisie['prix'] ?? '')), 0, 20),
        'duree'        => $duree,
        'debut'        => date('Y-m-d H:i', $debut),
        'fin'          => date('Y-m-d H:i', $fin),
        'prenom'       => $prenom !== '' ? $prenom : 'Occupée',
        'telephone'    => mb_substr(trim((string) ($saisie['telephone'] ?? '')), 0, 25),
        'etat'         => 'confirme',
        'pose_par_le_salon' => true,
    ];

    if (!ecrire_reservations($liste)) {
        return ['erreur' => 'Enregistrement impossible : vérifiez les droits du dossier data/.'];
    }

    $avertissements = [];
    if ($elle > 0) {
        $avertissements[] = (string) ($fiche['prenom'] ?? 'Elle')
            . ' a déjà ' . ($elle > 1 ? $elle . ' rendez-vous' : 'un rendez-vous') . ' à ce moment-là';
    }
    if ($cabines >= CABINES) {
        $avertissements[] = 'les ' . CABINES . ' cabines étaient déjà prises';
    }
    if (horaires_du_jour($date) === null) {
        $avertissements[] = 'le salon est annoncé fermé ce jour-là';
    }

    return ['avertissement' => $avertissements
        ? 'Rendez-vous posé, mais attention : ' . implode(', ', $avertissements) . '.'
        : null];
}

/**
 * Prend le verrou des rendez-vous. Deux clients qui valident la meme
 * seconde liraient sinon le meme planning, verraient tous deux le creneau
 * libre, et l'ecriraient l'un apres l'autre : deux personnes sur la meme
 * heure. Le second attend desormais que le premier ait fini, et se voit
 * refuser le creneau devenu pris.
 *
 * PHP relache le verrou tout seul a la fin de la page, meme en cas
 * d'arret brutal : rien ne peut rester bloque.
 */
function verrou_reservations()
{
    $fichier = @fopen(RACINE . '/data/verrou-reservations', 'c');
    if ($fichier === false) {
        return null;        /* sans verrou, le site marche quand meme */
    }
    @flock($fichier, LOCK_EX);
    return $fichier;
}

/** Les rendez-vous tries par date, les plus proches d'abord. */
function reservations_triees(): array
{
    $liste = reservations();
    usort($liste, static fn (array $a, array $b): int => strcmp((string) ($a['debut'] ?? ''), (string) ($b['debut'] ?? '')));
    return $liste;
}

/* Les alertes par courriel vivent dans leur propre fichier : elles se
   servent de tout ce qui precede. */
require __DIR__ . '/alertes.php';

/* Les jours de fermeture : ils se servent des dates mises en francais
   par le module precedent. */
require __DIR__ . '/fermetures.php';

/* La sauvegarde : elle met data/ et photos/ dans une archive. */
require __DIR__ . '/sauvegarde.php';

/* La liste d'attente : ceux qui veulent etre rappeles si une place se libere. */
require __DIR__ . '/attente.php';

/* La caisse et le decompte de fin de semaine. */
require __DIR__ . '/comptes.php';

/* Le filigrane pose sur les photos. */
require __DIR__ . '/filigrane.php';

/* Les numeros que le site n'accepte plus. */
require __DIR__ . '/liste-noire.php';

/* Le carnet d'actualites du salon. */
require __DIR__ . '/actualites.php';
