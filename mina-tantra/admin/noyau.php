<?php
/* ---------------------------------------------------------------------------
   Chez Eva — administration : les fonctions communes
   ---------------------------------------------------------------------------
   Mot de passe, session, jeton anti-falsification, lecture et ecriture des
   fiches, reception et redimensionnement des photos.
--------------------------------------------------------------------------- */
declare(strict_types=1);

const RACINE        = __DIR__ . '/..';
const FICHIER_FICHES = RACINE . '/data/masseuses.json';
const FICHIER_CONFIG = RACINE . '/data/config.json';
const DOSSIER_PHOTOS = RACINE . '/photos/masseuses';
const LARGEUR_MAX    = 1200;          // les photos sont reduites a cette taille
const POIDS_MAX      = 12582912;      // 12 Mo acceptes en entree, avant reduction

/* ------------------------------- Session --------------------------------- */

function demarrer_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    session_set_cookie_params([
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

function connexion(string $clair): ?string
{
    if (($reste = attente_restante()) > 0) {
        return "Trop d'essais. Réessayez dans $reste secondes.";
    }
    $c = config();
    if (!password_verify($clair, (string) ($c['motdepasse'] ?? ''))) {
        $c['echecs'] = (int) ($c['echecs'] ?? 0) + 1;
        $c['dernier_echec'] = time();
        ecrire_config($c);
        return 'Mot de passe incorrect.';
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
    return ['erreur' => null, 'chemin' => 'photos/masseuses/' . $nom];
}

/** Supprime une photo du disque, en refusant tout chemin sortant du dossier. */
function supprimer_photo(string $chemin): void
{
    if (!str_starts_with($chemin, 'photos/masseuses/') || str_contains($chemin, '..')) {
        return;
    }
    $absolu = realpath(RACINE . '/' . $chemin);
    $dossier = realpath(DOSSIER_PHOTOS);
    if ($absolu && $dossier && str_starts_with($absolu, $dossier)) {
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
